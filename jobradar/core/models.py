"""Pydantic v2 models for data exchange, validation, and API responses."""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class RawListingRecord(BaseModel):
    """Raw record extracted by adapter before normalization."""
    native_id: Optional[str] = None
    title: str
    company: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    deadline: Optional[str] = None
    canonical_url: str
    source_url: str
    source_updated_at: Optional[datetime] = None
    raw_snippet: Optional[str] = None


class NormalizedListing(BaseModel):
    """Normalized listing record with computed content_hash."""
    entity_id: str
    source_id: str
    title: str
    company: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    deadline: Optional[str] = None
    canonical_url: str
    source_url: str
    source_updated_at: Optional[datetime] = None
    content_hash: str
    fields: Dict[str, Any] = Field(default_factory=dict)


class ListingVersionResponse(BaseModel):
    """Version detail within listing."""
    model_config = ConfigDict(from_attributes=True)

    version_no: int
    run_id: str
    detected_at: datetime
    content_hash: str
    fields: Dict[str, Any]


class ListingResponse(BaseModel):
    """Listing summary response matching API contract."""
    model_config = ConfigDict(from_attributes=True)

    entity_id: str
    source_id: str
    title: str
    company: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    deadline: Optional[str] = None
    canonical_url: str
    source_url: str
    detected_at: datetime
    source_updated_at: Optional[datetime] = None
    first_seen: datetime
    last_seen: datetime
    content_hash: str
    status: str
    last_change_category: Optional[str] = None


class ListingDetailResponse(ListingResponse):
    """Listing response including version history."""
    versions: List[ListingVersionResponse] = Field(default_factory=list)


class PaginatedListings(BaseModel):
    items: List[ListingResponse]
    total: int


class ChangeEventResponse(BaseModel):
    """Change event matching exact API contract."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    entity_id: str
    listing_title: str
    company: str
    change_category: str
    field: Optional[str] = None
    before_value: Optional[str] = None
    after_value: Optional[str] = None
    run_id: str
    detected_at: datetime
    review_status: str
    source_url: Optional[str] = None


class PaginatedChangeEvents(BaseModel):
    items: List[ChangeEventResponse]
    total: int


class ReviewActionRequest(BaseModel):
    action: str  # verify or dismiss


class SourceResponse(BaseModel):
    """Source response matching GET /api/sources."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    type: str
    base_url: str
    status: str
    last_attempted_at: Optional[datetime] = None
    last_successful_at: Optional[datetime] = None
    last_http_status: Optional[int] = None
    parsed_count: int = 0
    failed_count: int = 0
    duplicate_count: int = 0
    warnings: List[str] = Field(default_factory=list)
    next_run_at: Optional[datetime] = None
    refresh_interval_minutes: int = 60


class RunResponse(BaseModel):
    """Run execution response matching GET /api/runs."""
    model_config = ConfigDict(from_attributes=True)

    run_id: str
    source_id: str
    mode: str
    status: str
    started_at: datetime
    finished_at: Optional[datetime] = None
    source_url: str
    http_status: Optional[int] = None
    parsed_count: int = 0
    failed_count: int = 0
    new_count: int = 0
    updated_count: int = 0
    removed_count: int = 0
    duplicate_count: int = 0
    warnings: List[str] = Field(default_factory=list)
    error_message: Optional[str] = None


class PaginatedRuns(BaseModel):
    items: List[RunResponse]
    total: int


class RefreshRequest(BaseModel):
    source_id: Optional[str] = None
    mode: Optional[str] = "live"


class ActivityPoint(BaseModel):
    date: str
    added: int
    edited: int
    removed: int


class SummaryResponse(BaseModel):
    """Summary dashboard response matching GET /api/summary."""
    active_listings: int
    new_today: int
    edited_today: int
    removed_confirmed: int
    open_reviews: int
    sources_healthy: int
    sources_total: int
    last_attempted_at: Optional[datetime] = None
    last_successful_at: Optional[datetime] = None
    is_stale: bool
    stale_threshold_minutes: int
    activity: List[ActivityPoint] = Field(default_factory=list)


class TrackerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    entity_id: str
    status: str
    notes: Optional[str] = None
    updated_at: datetime


class TrackerUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None


class TestCaseResult(BaseModel):
    id: str
    name: str
    expected: str
    actual: str
    passed: bool


class MetricsResponse(BaseModel):
    cases: List[TestCaseResult] = Field(default_factory=list)
    false_alert_rate: float = 0.0
    total_cases: int = 0
