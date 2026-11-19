"""FastAPI API routes matching the Lovable frontend contract exactly."""
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, func, or_
from sqlalchemy.orm import Session

from jobradar.core.config import AppSettings, load_settings
from jobradar.core.models import (
    ActivityPoint,
    ChangeEventResponse,
    ListingDetailResponse,
    ListingResponse,
    ListingVersionResponse,
    MetricsResponse,
    PaginatedChangeEvents,
    PaginatedListings,
    PaginatedRuns,
    RefreshRequest,
    ReviewActionRequest,
    RunResponse,
    SourceResponse,
    SummaryResponse,
    TestCaseResult,
    TrackerResponse,
    TrackerUpdateRequest,
)
from jobradar.core.pipeline import RunPipeline
from jobradar.db.engine import get_db
from jobradar.db.models import (
    ChangeEventModel,
    ListingModel,
    ListingVersionModel,
    RunModel,
    SourceModel,
    TrackerModel,
    utc_now,
)

router = APIRouter(prefix="/api")
settings = load_settings()
pipeline = RunPipeline(settings)


@router.get("/summary", response_model=SummaryResponse)
def get_summary(db: Session = Depends(get_db)):
    """Summary dashboard metrics matching GET /api/summary."""
    now = utc_now()
    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)

    active_listings = db.query(ListingModel).filter(ListingModel.status == "active").count()
    removed_confirmed = db.query(ListingModel).filter(ListingModel.status == "removed").count()

    new_today = (
        db.query(ChangeEventModel)
        .filter(
            ChangeEventModel.change_category == "added",
            ChangeEventModel.detected_at >= today_start,
        )
        .count()
    )

    edited_today = (
        db.query(ChangeEventModel)
        .filter(
            ChangeEventModel.change_category == "edited",
            ChangeEventModel.detected_at >= today_start,
        )
        .count()
    )

    open_reviews = (
        db.query(ChangeEventModel)
        .filter(ChangeEventModel.review_status == "pending")
        .count()
    )

    sources = db.query(SourceModel).all()
    sources_total = len(settings.sources)
    sources_healthy = sum(1 for s in sources if s.status in ("active", "healthy"))

    last_attempted_at = db.query(func.max(SourceModel.last_attempted_at)).scalar()
    last_successful_at = db.query(func.max(SourceModel.last_successful_at)).scalar()

    # Determine stale status: if last successful run is older than threshold
    stale_threshold_minutes = int(
        min((s.refresh_interval_minutes for s in settings.sources), default=60)
        * settings.stale_threshold_multiplier
    )

    is_stale = False
    if last_successful_at:
        # Normalize timezone
        dt = last_successful_at if last_successful_at.tzinfo else last_successful_at.replace(tzinfo=timezone.utc)
        if (now - dt) > timedelta(minutes=stale_threshold_minutes):
            is_stale = True
    elif sources_total > 0:
        is_stale = True

    # 7-day activity series
    activity: List[ActivityPoint] = []
    for day_offset in range(6, -1, -1):
        day_date = (now - timedelta(days=day_offset)).date()
        day_start = datetime(day_date.year, day_date.month, day_date.day, tzinfo=timezone.utc)
        day_end = day_start + timedelta(days=1)

        added_cnt = (
            db.query(ChangeEventModel)
            .filter(
                ChangeEventModel.change_category == "added",
                ChangeEventModel.detected_at >= day_start,
                ChangeEventModel.detected_at < day_end,
            )
            .count()
        )
        edited_cnt = (
            db.query(ChangeEventModel)
            .filter(
                ChangeEventModel.change_category == "edited",
                ChangeEventModel.detected_at >= day_start,
                ChangeEventModel.detected_at < day_end,
            )
            .count()
        )
        removed_cnt = (
            db.query(ChangeEventModel)
            .filter(
                ChangeEventModel.change_category == "removed",
                ChangeEventModel.detected_at >= day_start,
                ChangeEventModel.detected_at < day_end,
            )
            .count()
        )
        activity.append(
            ActivityPoint(
                date=day_date.isoformat(),
                added=added_cnt,
                edited=edited_cnt,
                removed=removed_cnt,
            )
        )

    return SummaryResponse(
        active_listings=active_listings,
        new_today=new_today,
        edited_today=edited_today,
        removed_confirmed=removed_confirmed,
        open_reviews=open_reviews,
        sources_healthy=sources_healthy,
        sources_total=sources_total,
        last_attempted_at=last_attempted_at,
        last_successful_at=last_successful_at,
        is_stale=is_stale,
        stale_threshold_minutes=stale_threshold_minutes,
        activity=activity,
    )


@router.get("/listings", response_model=PaginatedListings)
def get_listings(
    q: Optional[str] = Query(None, description="Search term in title, company, or location"),
    company: Optional[str] = Query(None, description="Filter by company"),
    source: Optional[str] = Query(None, description="Filter by source ID"),
    location: Optional[str] = Query(None, description="Filter by location"),
    job_type: Optional[str] = Query(None, description="Filter by job type"),
    status: Optional[str] = Query(None, description="Filter by status (active, removed, unknown)"),
    change_category: Optional[str] = Query(None, description="Filter by last change category"),
    sort: Optional[str] = Query("detected_at_desc", description="Sorting option"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    """Retrieve filtered, sorted, and paginated job listings."""
    query = db.query(ListingModel)

    if q:
        search = f"%{q.strip()}%"
        query = query.filter(
            or_(
                ListingModel.title.ilike(search),
                ListingModel.company.ilike(search),
                ListingModel.location.ilike(search),
            )
        )
    if company:
        query = query.filter(ListingModel.company.ilike(f"%{company.strip()}%"))
    if source:
        query = query.filter(ListingModel.source_id == source)
    if location:
        query = query.filter(ListingModel.location.ilike(f"%{location.strip()}%"))
    if job_type:
        query = query.filter(ListingModel.job_type.ilike(f"%{job_type.strip()}%"))
    if status:
        query = query.filter(ListingModel.status == status)
    if change_category:
        query = query.filter(ListingModel.last_change_category == change_category)

    # Sorting
    if sort == "detected_at_asc":
        query = query.order_by(ListingModel.detected_at.asc())
    elif sort == "title_asc":
        query = query.order_by(ListingModel.title.asc())
    elif sort == "company_asc":
        query = query.order_by(ListingModel.company.asc())
    else:
        query = query.order_by(ListingModel.detected_at.desc())

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedListings(items=[ListingResponse.model_validate(i) for i in items], total=total)


@router.get("/listings/{entity_id}", response_model=ListingDetailResponse)
def get_listing_detail(entity_id: str, db: Session = Depends(get_db)):
    """Retrieve a single listing entity with all historical version records."""
    listing = db.query(ListingModel).filter(ListingModel.entity_id == entity_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")

    versions = (
        db.query(ListingVersionModel)
        .filter(ListingVersionModel.entity_id == entity_id)
        .order_by(ListingVersionModel.version_no.desc())
        .all()
    )

    ver_responses = [
        ListingVersionResponse(
            version_no=v.version_no,
            run_id=v.run_id,
            detected_at=v.detected_at,
            content_hash=v.content_hash,
            fields=v.fields,
        )
        for v in versions
    ]

    resp = ListingDetailResponse.model_validate(listing)
    resp.versions = ver_responses
    return resp


@router.get("/changes", response_model=PaginatedChangeEvents)
def get_changes(
    category: Optional[str] = Query(None, description="Filter by change category"),
    review_status: Optional[str] = Query(None, description="Filter by review status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Retrieve detected change events with optional status filtering."""
    query = db.query(ChangeEventModel)

    if category:
        query = query.filter(ChangeEventModel.change_category == category)
    if review_status:
        query = query.filter(ChangeEventModel.review_status == review_status)

    query = query.order_by(ChangeEventModel.detected_at.desc())
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedChangeEvents(
        items=[ChangeEventResponse.model_validate(i) for i in items],
        total=total,
    )


@router.post("/changes/{event_id}/review", response_model=ChangeEventResponse)
def review_change(
    event_id: int,
    body: ReviewActionRequest,
    db: Session = Depends(get_db),
):
    """Verify or dismiss a change event in review queue."""
    event = db.query(ChangeEventModel).filter(ChangeEventModel.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Change event not found")

    action = body.action.lower().strip()
    if action == "verify":
        event.review_status = "verified"
    elif action == "dismiss":
        event.review_status = "dismissed"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action: expected 'verify' or 'dismiss'",
        )

    db.commit()
    db.refresh(event)
    return ChangeEventResponse.model_validate(event)


@router.get("/sources", response_model=List[SourceResponse])
def get_sources(db: Session = Depends(get_db)):
    """List configured and registered sources matching GET /api/sources."""
    # Ensure all sources in settings exist in DB
    results: List[SourceResponse] = []
    for scfg in settings.sources:
        src = db.query(SourceModel).filter(SourceModel.id == scfg.id).first()
        if not src:
            src = SourceModel(
                id=scfg.id,
                name=scfg.name,
                type=scfg.type,
                base_url=scfg.base_url,
                refresh_interval_minutes=scfg.refresh_interval_minutes,
                status="active" if scfg.enabled else "disabled",
            )
            src.config = scfg.model_dump()
            db.add(src)
            db.flush()

        results.append(
            SourceResponse(
                id=src.id,
                name=src.name,
                type=src.type,
                base_url=src.base_url,
                status=src.status,
                last_attempted_at=src.last_attempted_at,
                last_successful_at=src.last_successful_at,
                last_http_status=src.last_http_status,
                parsed_count=src.parsed_count,
                failed_count=src.failed_count,
                duplicate_count=src.duplicate_count,
                warnings=src.warnings,
                next_run_at=src.next_run_at,
                refresh_interval_minutes=src.refresh_interval_minutes,
            )
        )
    db.commit()
    return results


@router.get("/runs", response_model=PaginatedRuns)
def get_runs(
    source_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Retrieve audit history of crawl executions."""
    query = db.query(RunModel)
    if source_id:
        query = query.filter(RunModel.source_id == source_id)

    query = query.order_by(RunModel.started_at.desc())
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedRuns(
        items=[RunResponse.model_validate(r) for r in items],
        total=total,
    )


@router.post("/refresh", response_model=RunResponse)
def trigger_refresh(
    req: RefreshRequest = RefreshRequest(),
    db: Session = Depends(get_db),
):
    """Trigger manual crawl run for a source in live or fixture mode."""
    target_id = req.source_id or (settings.sources[0].id if settings.sources else "greenhouse_figma")
    source_cfg = next((s for s in settings.sources if s.id == target_id), None)
    if not source_cfg:
        raise HTTPException(status_code=404, detail=f"Source '{target_id}' not found")

    fixture_payload = None
    mode = req.mode or "live"
    if mode == "fixture":
        fdir = Path(settings.fixture_dir)
        fname = f"{source_cfg.type}_v1.json" if source_cfg.type in ("greenhouse", "lever") else "html_v1.html"
        fpath = fdir / fname
        if fpath.exists():
            fixture_payload = fpath.read_text(encoding="utf-8")

    run = pipeline.execute_run(
        session=db,
        source_cfg=source_cfg,
        mode=mode,
        fixture_payload=fixture_payload,
    )
    return RunResponse.model_validate(run)


@router.get("/tracker", response_model=List[TrackerResponse])
def get_tracker(db: Session = Depends(get_db)):
    """Retrieve all student application tracker items."""
    items = db.query(TrackerModel).order_by(TrackerModel.updated_at.desc()).all()
    return [TrackerResponse.model_validate(i) for i in items]


@router.put("/tracker/{entity_id}", response_model=TrackerResponse)
def update_tracker(
    entity_id: str,
    req: TrackerUpdateRequest,
    db: Session = Depends(get_db),
):
    """Upsert student tracking status and personal notes for a job."""
    listing = db.query(ListingModel).filter(ListingModel.entity_id == entity_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing entity not found")

    item = db.query(TrackerModel).filter(TrackerModel.entity_id == entity_id).first()
    now = utc_now()
    if not item:
        item = TrackerModel(
            entity_id=entity_id,
            status=req.status,
            notes=req.notes,
            updated_at=now,
        )
        db.add(item)
    else:
        item.status = req.status
        item.notes = req.notes
        item.updated_at = now

    db.commit()
    db.refresh(item)
    return TrackerResponse.model_validate(item)


@router.get("/metrics", response_model=MetricsResponse)
def get_metrics():
    """Retrieve change detection verification cases and false alert rate."""
    cases_path = Path("fixtures/metrics_cases.json")
    if cases_path.exists():
        with open(cases_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return MetricsResponse(**data)

    return MetricsResponse(cases=[], false_alert_rate=0.0, total_cases=0)
