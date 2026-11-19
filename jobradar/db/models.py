"""SQLAlchemy models for JobRadar."""
from datetime import datetime, timezone
import json
from typing import Any, List, Optional
from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    Text,
    Index,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def utc_now() -> datetime:
    """Return current UTC datetime."""
    return datetime.now(timezone.utc)


class SourceModel(Base):
    """Data source configuration and health tracking."""
    __tablename__ = "sources"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # greenhouse, lever, html
    base_url = Column(String, nullable=False)
    config_json = Column(Text, default="{}")
    status = Column(String, default="active", nullable=False)  # active, blocked, rate_limited, unknown, stale, failing
    last_attempted_at = Column(DateTime(timezone=True), nullable=True)
    last_successful_at = Column(DateTime(timezone=True), nullable=True)
    last_http_status = Column(Integer, nullable=True)
    parsed_count = Column(Integer, default=0, nullable=False)
    failed_count = Column(Integer, default=0, nullable=False)
    duplicate_count = Column(Integer, default=0, nullable=False)
    warnings_json = Column(Text, default="[]", nullable=False)
    refresh_interval_minutes = Column(Integer, default=60, nullable=False)
    next_run_at = Column(DateTime(timezone=True), nullable=True)

    runs = relationship("RunModel", back_populates="source", cascade="all, delete-orphan")
    listings = relationship("ListingModel", back_populates="source", cascade="all, delete-orphan")

    @property
    def warnings(self) -> List[str]:
        try:
            return json.loads(self.warnings_json or "[]")
        except Exception:
            return []

    @warnings.setter
    def warnings(self, val: List[str]):
        self.warnings_json = json.dumps(val or [])

    @property
    def config(self) -> dict:
        try:
            return json.loads(self.config_json or "{}")
        except Exception:
            return {}

    @config.setter
    def config(self, val: dict):
        self.config_json = json.dumps(val or {})


class RunModel(Base):
    """Execution run record for observability and auditing."""
    __tablename__ = "runs"

    run_id = Column(String, primary_key=True)
    source_id = Column(String, ForeignKey("sources.id"), nullable=False, index=True)
    mode = Column(String, default="live", nullable=False)  # live, fixture
    status = Column(String, nullable=False)  # success, partial_failure, failed, blocked, rate_limited, parser_failure
    started_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    source_url = Column(String, nullable=False)
    http_status = Column(Integer, nullable=True)
    parsed_count = Column(Integer, default=0, nullable=False)
    failed_count = Column(Integer, default=0, nullable=False)
    new_count = Column(Integer, default=0, nullable=False)
    updated_count = Column(Integer, default=0, nullable=False)
    removed_count = Column(Integer, default=0, nullable=False)
    duplicate_count = Column(Integer, default=0, nullable=False)
    warnings_json = Column(Text, default="[]", nullable=False)
    error_message = Column(Text, nullable=True)

    source = relationship("SourceModel", back_populates="runs")
    snapshots = relationship("SnapshotModel", back_populates="run", cascade="all, delete-orphan")
    change_events = relationship("ChangeEventModel", back_populates="run")

    @property
    def warnings(self) -> List[str]:
        try:
            return json.loads(self.warnings_json or "[]")
        except Exception:
            return []

    @warnings.setter
    def warnings(self, val: List[str]):
        self.warnings_json = json.dumps(val or [])


class SnapshotModel(Base):
    """Raw payload snapshot archive for reproducible replaying and auditing."""
    __tablename__ = "snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String, ForeignKey("runs.run_id"), nullable=False, index=True)
    source_id = Column(String, ForeignKey("sources.id"), nullable=False, index=True)
    raw_payload_path = Column(String, nullable=False)
    sha256 = Column(String, nullable=False)
    http_status = Column(Integer, nullable=False)
    fetched_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    run = relationship("RunModel", back_populates="snapshots")


class ListingModel(Base):
    """Core job listing entity with lifecycle state tracking."""
    __tablename__ = "listings"

    entity_id = Column(String, primary_key=True)
    source_id = Column(String, ForeignKey("sources.id"), nullable=False, index=True)
    title = Column(String, nullable=False, index=True)
    company = Column(String, nullable=False, index=True)
    location = Column(String, nullable=True, index=True)
    job_type = Column(String, nullable=True, index=True)
    deadline = Column(String, nullable=True)
    canonical_url = Column(String, nullable=False)
    source_url = Column(String, nullable=False)
    detected_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    source_updated_at = Column(DateTime(timezone=True), nullable=True)
    first_seen = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    last_seen = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    content_hash = Column(String, nullable=False, index=True)
    status = Column(String, default="active", nullable=False, index=True)  # active, removed, unknown
    last_change_category = Column(String, nullable=True)  # added, edited, unchanged, removed, restored
    consecutive_misses = Column(Integer, default=0, nullable=False)

    source = relationship("SourceModel", back_populates="listings")
    versions = relationship("ListingVersionModel", back_populates="listing", cascade="all, delete-orphan", order_by="ListingVersionModel.version_no.desc()")
    change_events = relationship("ChangeEventModel", back_populates="listing", cascade="all, delete-orphan")
    tracker = relationship("TrackerModel", back_populates="listing", uselist=False, cascade="all, delete-orphan")


class ListingVersionModel(Base):
    """Historical version archive of a job listing."""
    __tablename__ = "listing_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_id = Column(String, ForeignKey("listings.entity_id"), nullable=False, index=True)
    version_no = Column(Integer, nullable=False)
    run_id = Column(String, ForeignKey("runs.run_id"), nullable=False)
    detected_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    content_hash = Column(String, nullable=False)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=True)
    job_type = Column(String, nullable=True)
    deadline = Column(String, nullable=True)
    fields_json = Column(Text, default="{}", nullable=False)

    listing = relationship("ListingModel", back_populates="versions")

    __table_args__ = (
        UniqueConstraint("entity_id", "version_no", name="uq_entity_version"),
    )

    @property
    def fields(self) -> dict:
        try:
            return json.loads(self.fields_json or "{}")
        except Exception:
            return {}

    @fields.setter
    def fields(self, val: dict):
        self.fields_json = json.dumps(val or {})


class ChangeEventModel(Base):
    """Field-level change events detected across runs."""
    __tablename__ = "change_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_id = Column(String, ForeignKey("listings.entity_id"), nullable=False, index=True)
    listing_title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    change_category = Column(String, nullable=False, index=True)  # added, edited, removed, restored, parser_failure
    field = Column(String, nullable=True)  # title, location, deadline, status, etc.
    before_value = Column(Text, nullable=True)
    after_value = Column(Text, nullable=True)
    run_id = Column(String, ForeignKey("runs.run_id"), nullable=False, index=True)
    detected_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    review_status = Column(String, default="pending", nullable=False, index=True)  # pending, verified, dismissed
    source_url = Column(String, nullable=True)

    listing = relationship("ListingModel", back_populates="change_events")
    run = relationship("RunModel", back_populates="change_events")

    __table_args__ = (
        Index("ix_change_events_suppression", "entity_id", "change_category", "field", "review_status"),
    )


class ErrorModel(Base):
    """System and crawl errors encountered."""
    __tablename__ = "errors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String, ForeignKey("runs.run_id"), nullable=True, index=True)
    source_id = Column(String, ForeignKey("sources.id"), nullable=True, index=True)
    error_type = Column(String, nullable=False)  # http_error, timeout, parser_failure, robots_disallowed, validation_error
    message = Column(Text, nullable=False)
    details_json = Column(Text, nullable=True)
    occurred_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)


class TrackerModel(Base):
    """Student application tracker personal notes and stage."""
    __tablename__ = "tracker"

    entity_id = Column(String, ForeignKey("listings.entity_id"), primary_key=True)
    status = Column(String, default="interested", nullable=False)  # interested, applied, interviewing, offer, rejected, archived
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    listing = relationship("ListingModel", back_populates="tracker")
