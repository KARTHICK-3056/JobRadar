"""Change detection engine implementing classification, versioning, and duplicate suppression."""
from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional, Set, Tuple
from sqlalchemy.orm import Session

from jobradar.core.models import NormalizedListing
from jobradar.db.models import (
    ChangeEventModel,
    ListingModel,
    ListingVersionModel,
    RunModel,
    SourceModel,
    utc_now,
)

logger = logging.getLogger("jobradar.core.detector")


class DetectionSummary:
    def __init__(self):
        self.new_count = 0
        self.updated_count = 0
        self.duplicate_count = 0
        self.removed_count = 0
        self.events_created = 0


def is_duplicate_event(
    session: Session,
    entity_id: str,
    change_category: str,
    field: Optional[str],
    before_val: Optional[str],
    after_val: Optional[str],
) -> bool:
    """Duplicate suppression: check if an identical change event is already pending/recorded."""
    q = session.query(ChangeEventModel).filter(
        ChangeEventModel.entity_id == entity_id,
        ChangeEventModel.change_category == change_category,
        ChangeEventModel.field == field,
        ChangeEventModel.before_value == before_val,
        ChangeEventModel.after_value == after_val,
        ChangeEventModel.review_status == "pending",
    )
    return q.first() is not None


class ChangeDetector:
    """Detects differences between current crawl and historical database state."""

    def __init__(self, session: Session, consecutive_misses_threshold: int = 2):
        self.session = session
        self.threshold = consecutive_misses_threshold

    def process_run(
        self,
        source: SourceModel,
        run: RunModel,
        extracted_listings: List[NormalizedListing],
    ) -> DetectionSummary:
        """Execute idempotent change detection on normalized listings."""
        summary = DetectionSummary()
        now = utc_now()

        seen_entity_ids: Set[str] = set()

        for item in extracted_listings:
            entity_id = item.entity_id
            seen_entity_ids.add(entity_id)

            existing: Optional[ListingModel] = (
                self.session.query(ListingModel)
                .filter(ListingModel.entity_id == entity_id)
                .first()
            )

            if existing is None:
                # ----------------- ADDED -----------------
                new_listing = ListingModel(
                    entity_id=entity_id,
                    source_id=source.id,
                    title=item.title,
                    company=item.company,
                    location=item.location,
                    job_type=item.job_type,
                    deadline=item.deadline,
                    canonical_url=item.canonical_url,
                    source_url=item.source_url,
                    detected_at=now,
                    source_updated_at=item.source_updated_at,
                    first_seen=now,
                    last_seen=now,
                    content_hash=item.content_hash,
                    status="active",
                    last_change_category="added",
                    consecutive_misses=0,
                )
                self.session.add(new_listing)

                # Version 1
                v1 = ListingVersionModel(
                    entity_id=entity_id,
                    version_no=1,
                    run_id=run.run_id,
                    detected_at=now,
                    content_hash=item.content_hash,
                    title=item.title,
                    company=item.company,
                    location=item.location,
                    job_type=item.job_type,
                    deadline=item.deadline,
                )
                v1.fields = item.fields
                self.session.add(v1)

                # Change event for addition
                event = ChangeEventModel(
                    entity_id=entity_id,
                    listing_title=item.title,
                    company=item.company,
                    change_category="added",
                    field=None,
                    before_value=None,
                    after_value=None,
                    run_id=run.run_id,
                    detected_at=now,
                    review_status="pending",
                    source_url=item.canonical_url,
                )
                self.session.add(event)
                summary.new_count += 1
                summary.events_created += 1

            else:
                # Listing previously known in DB
                was_removed = (existing.status == "removed")

                if was_removed:
                    # Restored listing: Reactivate without creating a duplicate "added" event
                    existing.status = "active"
                    existing.last_seen = now
                    existing.consecutive_misses = 0

                    if not is_duplicate_event(self.session, entity_id, "restored", "status", "removed", "active"):
                        restore_event = ChangeEventModel(
                            entity_id=entity_id,
                            listing_title=item.title,
                            company=item.company,
                            change_category="restored",
                            field="status",
                            before_value="removed",
                            after_value="active",
                            run_id=run.run_id,
                            detected_at=now,
                            review_status="pending",
                            source_url=item.canonical_url,
                        )
                        self.session.add(restore_event)
                        summary.events_created += 1

                if existing.content_hash == item.content_hash:
                    # ----------------- UNCHANGED / DUPLICATE -----------------
                    existing.last_seen = now
                    existing.consecutive_misses = 0
                    if not was_removed:
                        existing.last_change_category = "unchanged"
                    summary.duplicate_count += 1

                else:
                    # ----------------- EDITED -----------------
                    # Field-level comparison
                    changed_fields: List[Tuple[str, Optional[str], Optional[str]]] = []
                    
                    fields_to_check = [
                        ("title", existing.title, item.title),
                        ("company", existing.company, item.company),
                        ("location", existing.location, item.location),
                        ("job_type", existing.job_type, item.job_type),
                        ("deadline", existing.deadline, item.deadline),
                    ]

                    for f_name, before_val, after_val in fields_to_check:
                        if before_val != after_val:
                            changed_fields.append((f_name, before_val, after_val))

                    # Next version number
                    current_max_v = (
                        self.session.query(ListingVersionModel.version_no)
                        .filter(ListingVersionModel.entity_id == entity_id)
                        .order_by(ListingVersionModel.version_no.desc())
                        .first()
                    )
                    next_v = (current_max_v[0] + 1) if current_max_v else 2

                    new_version = ListingVersionModel(
                        entity_id=entity_id,
                        version_no=next_v,
                        run_id=run.run_id,
                        detected_at=now,
                        content_hash=item.content_hash,
                        title=item.title,
                        company=item.company,
                        location=item.location,
                        job_type=item.job_type,
                        deadline=item.deadline,
                    )
                    new_version.fields = item.fields
                    self.session.add(new_version)

                    # Create change event for each field change with duplicate suppression
                    for f_name, before_v, after_v in changed_fields:
                        if not is_duplicate_event(self.session, entity_id, "edited", f_name, before_v, after_v):
                            chg_event = ChangeEventModel(
                                entity_id=entity_id,
                                listing_title=item.title,
                                company=item.company,
                                change_category="edited",
                                field=f_name,
                                before_value=before_v,
                                after_value=after_v,
                                run_id=run.run_id,
                                detected_at=now,
                                review_status="pending",
                                source_url=item.canonical_url,
                            )
                            self.session.add(chg_event)
                            summary.events_created += 1

                    # Update listing entity
                    existing.title = item.title
                    existing.company = item.company
                    existing.location = item.location
                    existing.job_type = item.job_type
                    existing.deadline = item.deadline
                    existing.canonical_url = item.canonical_url
                    existing.source_url = item.source_url
                    existing.content_hash = item.content_hash
                    existing.last_seen = now
                    existing.last_change_category = "edited"
                    existing.consecutive_misses = 0
                    summary.updated_count += 1

        # ----------------- REMOVAL HANDLING -----------------
        # Check active listings in this source that were NOT seen in this successful run
        active_unseen = (
            self.session.query(ListingModel)
            .filter(
                ListingModel.source_id == source.id,
                ListingModel.status == "active",
                ~ListingModel.entity_id.in_(seen_entity_ids) if seen_entity_ids else True,
            )
            .all()
        )

        for un_item in active_unseen:
            un_item.consecutive_misses += 1
            if un_item.consecutive_misses >= self.threshold:
                un_item.status = "removed"
                un_item.last_change_category = "removed"
                
                # Create removed change event if not already suppressed
                if not is_duplicate_event(self.session, un_item.entity_id, "removed", "status", "active", "removed"):
                    rem_event = ChangeEventModel(
                        entity_id=un_item.entity_id,
                        listing_title=un_item.title,
                        company=un_item.company,
                        change_category="removed",
                        field="status",
                        before_value="active",
                        after_value="removed",
                        run_id=run.run_id,
                        detected_at=now,
                        review_status="pending",
                        source_url=un_item.canonical_url,
                    )
                    self.session.add(rem_event)
                    summary.events_created += 1
                summary.removed_count += 1

        return summary
