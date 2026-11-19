"""Execution pipeline orchestrating fetch, snapshot, normalization, change detection, and logging."""
from datetime import datetime, timezone
import hashlib
import json
import logging
import os
from pathlib import Path
from typing import List, Optional
import uuid

from sqlalchemy.orm import Session

from jobradar.adapters.factory import get_adapter
from jobradar.compliance.compliance import (
    CompliantHttpClient,
    RateLimitedError,
    RobotsDisallowedError,
    SourceBlockedError,
)
from jobradar.core.config import AppSettings, SourceConfig, load_settings
from jobradar.core.detector import ChangeDetector
from jobradar.core.models import NormalizedListing, RawListingRecord
from jobradar.core.normalizer import normalize_record
from jobradar.db.models import (
    ChangeEventModel,
    ErrorModel,
    ListingModel,
    RunModel,
    SnapshotModel,
    SourceModel,
    utc_now,
)

logger = logging.getLogger("jobradar.pipeline")


def ensure_source_record(session: Session, source_cfg: SourceConfig) -> SourceModel:
    """Ensure SourceModel exists in SQLite database, updating metadata."""
    src = session.query(SourceModel).filter(SourceModel.id == source_cfg.id).first()
    if not src:
        src = SourceModel(
            id=source_cfg.id,
            name=source_cfg.name,
            type=source_cfg.type,
            base_url=source_cfg.base_url,
            refresh_interval_minutes=source_cfg.refresh_interval_minutes,
            status="active",
        )
        src.config = source_cfg.model_dump()
        session.add(src)
        session.flush()
    return src


def save_snapshot(
    snapshot_dir: str,
    source_id: str,
    run_id: str,
    raw_payload: str,
    http_status: int,
    session: Session,
) -> SnapshotModel:
    """Save raw response snapshot to disk and persist metadata in SQLite."""
    os.makedirs(snapshot_dir, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    file_ext = "json" if raw_payload.strip().startswith(("{", "[")) else "html"
    filename = f"{source_id}_{timestamp}_{run_id[:8]}.{file_ext}"
    filepath = Path(snapshot_dir) / filename

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(raw_payload)

    payload_hash = hashlib.sha256(raw_payload.encode("utf-8")).hexdigest()

    snapshot = SnapshotModel(
        run_id=run_id,
        source_id=source_id,
        raw_payload_path=str(filepath),
        sha256=payload_hash,
        http_status=http_status,
        fetched_at=utc_now(),
    )
    session.add(snapshot)
    session.flush()
    return snapshot


def write_run_log_file(run_data: dict, output_dir: str = "docs/run_logs") -> str:
    """Save auto-generated per-run JSON log."""
    os.makedirs(output_dir, exist_ok=True)
    log_path = Path(output_dir) / f"{run_data['run_id']}.json"
    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(run_data, f, indent=2, default=str)
    return str(log_path)


class RunPipeline:
    """Full execution pipeline for a source crawl run."""

    def __init__(self, settings: Optional[AppSettings] = None):
        self.settings = settings or load_settings()
        self.http_client = CompliantHttpClient(
            user_agent=self.settings.user_agent,
            timeout=self.settings.request_timeout,
            delay_seconds=self.settings.default_request_delay,
            max_requests=self.settings.max_requests_per_run,
        )

    def execute_run(
        self,
        session: Session,
        source_cfg: SourceConfig,
        mode: str = "live",
        fixture_payload: Optional[str] = None,
    ) -> RunModel:
        """Run single source pipeline with strict compliance and change detection."""
        run_id = str(uuid.uuid4())
        started_at = utc_now()
        source = ensure_source_record(session, source_cfg)

        source.last_attempted_at = started_at
        session.commit()

        run = RunModel(
            run_id=run_id,
            source_id=source_cfg.id,
            mode=mode,
            status="running",
            started_at=started_at,
            source_url=source_cfg.base_url,
            http_status=None,
            parsed_count=0,
            failed_count=0,
            new_count=0,
            updated_count=0,
            removed_count=0,
            duplicate_count=0,
            warnings_json="[]",
        )
        session.add(run)
        session.commit()

        warnings: List[str] = []
        adapter = get_adapter(source_cfg, self.http_client if mode == "live" else None)

        try:
            # 1. Fetch raw payload
            raw_text, status_code, fetched_url = adapter.fetch(fixture_content=fixture_payload)
            run.http_status = status_code
            run.source_url = fetched_url
            source.last_http_status = status_code

            # Handle 404 or other non-200 HTTP statuses
            if status_code == 404 or status_code >= 500:
                error_msg = f"HTTP {status_code} encountered from {fetched_url}"
                source.status = "unknown"
                run.status = "failed"
                run.error_message = error_msg
                run.finished_at = utc_now()
                err = ErrorModel(
                    run_id=run.run_id,
                    source_id=source.id,
                    error_type="http_error",
                    message=error_msg,
                    occurred_at=utc_now(),
                )
                session.add(err)
                session.commit()
                self._record_and_save_log(run, warnings)
                return run

            # 2. Save raw snapshot
            save_snapshot(
                snapshot_dir=self.settings.snapshot_dir,
                source_id=source_cfg.id,
                run_id=run_id,
                raw_payload=raw_text,
                http_status=status_code,
                session=session,
            )

            # 3. Parse raw content
            parsed_records = adapter.parse(raw_text)
            valid_records, validation_failed = adapter.validate(parsed_records)
            filtered_records = adapter.filter_by_keywords(valid_records)

            run.parsed_count = len(filtered_records)
            run.failed_count = validation_failed

            # Check parser failure conditions:
            # e.g., previously had active listings and suddenly 0 items from non-empty payload,
            # or validation fails for > 50% of items, or selector returned nothing
            active_count_before = (
                session.query(ListingModel)
                .filter(ListingModel.source_id == source.id, ListingModel.status == "active")
                .count()
            )

            is_parser_failure = False
            fail_reason = ""

            if active_count_before > 0 and len(parsed_records) == 0 and len(raw_text.strip()) > 50:
                is_parser_failure = True
                fail_reason = f"Zero items extracted where {active_count_before} active items previously existed (possible selector breakage)"
            elif len(parsed_records) > 0 and (validation_failed / len(parsed_records)) > 0.5:
                is_parser_failure = True
                fail_reason = f"Over 50% of extracted items failed schema validation ({validation_failed}/{len(parsed_records)})"

            if is_parser_failure:
                warnings.append(fail_reason)
                run.status = "parser_failure"
                run.error_message = fail_reason
                source.status = "failing"
                
                # Record error and change_event(parser_failure)
                err = ErrorModel(
                    run_id=run.run_id,
                    source_id=source.id,
                    error_type="parser_failure",
                    message=fail_reason,
                    occurred_at=utc_now(),
                )
                session.add(err)

                # Record ChangeEvent(parser_failure)
                dummy_listing = session.query(ListingModel).filter(ListingModel.source_id == source.id).first()
                target_entity = dummy_listing.entity_id if dummy_listing else f"{source.id}:parser_failure"
                target_title = dummy_listing.title if dummy_listing else source.name
                target_company = dummy_listing.company if dummy_listing else source.name

                pf_event = ChangeEventModel(
                    entity_id=target_entity,
                    listing_title=target_title,
                    company=target_company,
                    change_category="parser_failure",
                    field="parser",
                    before_value=None,
                    after_value=fail_reason,
                    run_id=run.run_id,
                    detected_at=utc_now(),
                    review_status="pending",
                    source_url=fetched_url,
                )
                session.add(pf_event)
                run.finished_at = utc_now()
                session.commit()
                self._record_and_save_log(run, warnings)
                return run

            # 4. Normalize records
            normalized_list: List[NormalizedListing] = [
                normalize_record(r, source_cfg.id) for r in filtered_records
            ]

            # 5. Detect changes
            detector = ChangeDetector(
                session=session,
                consecutive_misses_threshold=self.settings.consecutive_misses_for_removal,
            )
            detection_res = detector.process_run(source, run, normalized_list)

            # 6. Update counts and source status
            run.new_count = detection_res.new_count
            run.updated_count = detection_res.updated_count
            run.removed_count = detection_res.removed_count
            run.duplicate_count = detection_res.duplicate_count
            run.status = "success"
            run.finished_at = utc_now()

            source.status = "active"
            source.last_successful_at = run.finished_at
            source.parsed_count = run.parsed_count
            source.failed_count = run.failed_count
            source.duplicate_count = run.duplicate_count

            session.commit()

            try:
                from jobradar.core.frontend_mapper import sync_to_frontend
                sync_to_frontend(session)
            except Exception as sync_err:
                logger.debug("Frontend sync deferred: %s", sync_err)

        except RateLimitedError as rle:
            error_msg = str(rle)
            logger.error("Rate limit hit: %s", error_msg)
            warnings.append(error_msg)
            source.status = "rate_limited"
            run.status = "rate_limited"
            run.error_message = error_msg
            run.finished_at = utc_now()
            err = ErrorModel(
                run_id=run.run_id,
                source_id=source.id,
                error_type="rate_limited",
                message=error_msg,
                occurred_at=utc_now(),
            )
            session.add(err)
            session.commit()

        except SourceBlockedError as sbe:
            error_msg = str(sbe)
            logger.error("Source blocked (403): %s", error_msg)
            warnings.append(error_msg)
            source.status = "blocked"
            run.status = "blocked"
            run.error_message = error_msg
            run.finished_at = utc_now()
            err = ErrorModel(
                run_id=run.run_id,
                source_id=source.id,
                error_type="blocked",
                message=error_msg,
                occurred_at=utc_now(),
            )
            session.add(err)
            session.commit()

        except RobotsDisallowedError as rde:
            error_msg = str(rde)
            logger.error("Robots exclusion: %s", error_msg)
            warnings.append(error_msg)
            source.status = "blocked"
            run.status = "blocked"
            run.error_message = error_msg
            run.finished_at = utc_now()
            err = ErrorModel(
                run_id=run.run_id,
                source_id=source.id,
                error_type="robots_disallowed",
                message=error_msg,
                occurred_at=utc_now(),
            )
            session.add(err)
            session.commit()

        except Exception as exc:
            error_msg = f"Unexpected crawl failure: {type(exc).__name__}: {str(exc)}"
            logger.exception(error_msg)
            warnings.append(error_msg)
            source.status = "unknown"
            run.status = "failed"
            run.error_message = error_msg
            run.finished_at = utc_now()
            err = ErrorModel(
                run_id=run.run_id,
                source_id=source.id,
                error_type="crawl_error",
                message=error_msg,
                occurred_at=utc_now(),
            )
            session.add(err)
            session.commit()

        finally:
            self._record_and_save_log(run, warnings)

        return run

    def _record_and_save_log(self, run: RunModel, warnings: List[str]):
        """Persist JSON log of the run to docs/run_logs."""
        run.warnings = warnings
        log_payload = {
            "run_id": run.run_id,
            "source_id": run.source_id,
            "mode": run.mode,
            "status": run.status,
            "started_at": run.started_at.isoformat() if run.started_at else None,
            "finished_at": run.finished_at.isoformat() if run.finished_at else None,
            "source_url": run.source_url,
            "http_status": run.http_status,
            "parsed_count": run.parsed_count,
            "failed_count": run.failed_count,
            "new_count": run.new_count,
            "updated_count": run.updated_count,
            "removed_count": run.removed_count,
            "duplicate_count": run.duplicate_count,
            "warnings": warnings,
            "error_message": run.error_message,
        }
        write_run_log_file(log_payload)
