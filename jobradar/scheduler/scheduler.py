"""APScheduler background job scheduler and refresh simulator."""
from datetime import datetime, timezone
import logging
from pathlib import Path
from typing import List, Optional
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from jobradar.core.config import AppSettings, load_settings
from jobradar.core.pipeline import RunPipeline
from jobradar.db.engine import SessionLocal
from jobradar.db.models import RunModel, SourceModel, utc_now

logger = logging.getLogger("jobradar.scheduler")


class JobRadarScheduler:
    """Manages periodic source crawling and refresh simulation."""

    def __init__(self, settings: Optional[AppSettings] = None):
        self.settings = settings or load_settings()
        self.scheduler = BackgroundScheduler()
        self.pipeline = RunPipeline(self.settings)

    def _execute_source_job(self, source_id: str):
        """Job function executed on schedule for a source."""
        logger.info("Scheduler triggering periodic run for source '%s'", source_id)
        source_cfg = next((s for s in self.settings.sources if s.id == source_id), None)
        if not source_cfg or not source_cfg.enabled:
            logger.warning("Source '%s' not found in config or is disabled", source_id)
            return

        session = SessionLocal()
        try:
            run = self.pipeline.execute_run(session, source_cfg, mode="live")
            logger.info("Scheduled run completed for %s: status=%s, parsed=%d", source_id, run.status, run.parsed_count)
            # Update next_run_at in DB
            src_record = session.query(SourceModel).filter(SourceModel.id == source_id).first()
            if src_record:
                job = self.scheduler.get_job(f"source_{source_id}")
                if job and job.next_run_time:
                    src_record.next_run_at = job.next_run_time
                session.commit()
        except Exception as exc:
            logger.exception("Error executing scheduled run for source '%s': %s", source_id, exc)
        finally:
            session.close()

    def schedule_all(self):
        """Register APScheduler interval triggers for all configured sources."""
        session = SessionLocal()
        try:
            for source_cfg in self.settings.sources:
                if not source_cfg.enabled:
                    continue

                minutes = source_cfg.refresh_interval_minutes
                job_id = f"source_{source_cfg.id}"

                self.scheduler.add_job(
                    func=self._execute_source_job,
                    args=[source_cfg.id],
                    trigger=IntervalTrigger(minutes=minutes),
                    id=job_id,
                    name=f"Crawl {source_cfg.name}",
                    replace_existing=True,
                )
                logger.info("Scheduled %s every %d minutes", source_cfg.name, minutes)

                # Store next_run_at in source record
                src_record = session.query(SourceModel).filter(SourceModel.id == source_cfg.id).first()
                if src_record:
                    job = self.scheduler.get_job(job_id)
                    if job and job.next_run_time:
                        src_record.next_run_at = job.next_run_time
            session.commit()
        finally:
            session.close()

    def start(self):
        """Start scheduler background thread."""
        self.schedule_all()
        if not self.scheduler.running:
            self.scheduler.start()
            logger.info("APScheduler started successfully")

    def stop(self):
        """Stop scheduler."""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("APScheduler stopped")

    def simulate_refresh_cycles(
        self,
        source_id: str = "greenhouse_figma",
        fixture_dir: Optional[Path] = None,
    ) -> List[RunModel]:
        """Feed successive fixture versions (v1, v2, v3) demonstrating 3 refresh cycles."""
        fdir = fixture_dir or (Path(__file__).resolve().parent.parent.parent / "fixtures")
        source_cfg = next((s for s in self.settings.sources if s.id == source_id), None)
        if not source_cfg:
            raise ValueError(f"Source '{source_id}' not found in configuration")

        cycle_files = [
            fdir / "greenhouse_v1.json",
            fdir / "greenhouse_v2.json",
            fdir / "greenhouse_v3.json",
        ]

        runs: List[RunModel] = []
        session = SessionLocal()
        try:
            for idx, cfile in enumerate(cycle_files, start=1):
                if not cfile.exists():
                    logger.warning("Fixture file not found: %s", cfile)
                    continue

                payload = cfile.read_text(encoding="utf-8")
                logger.info("=== Simulating Refresh Cycle %d/3 for %s ===", idx, source_id)
                run = self.pipeline.execute_run(
                    session=session,
                    source_cfg=source_cfg,
                    mode="fixture",
                    fixture_payload=payload,
                )
                runs.append(run)
                logger.info(
                    "Cycle %d Results: New=%d, Updated=%d, Removed=%d, Duplicate=%d",
                    idx,
                    run.new_count,
                    run.updated_count,
                    run.removed_count,
                    run.duplicate_count,
                )
            return runs
        finally:
            session.close()
