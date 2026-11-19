"""API test suite covering all FastAPI endpoints and CORS."""
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from jobradar.api.app import app
from jobradar.db.engine import get_db
from jobradar.db.models import (
    Base,
    ChangeEventModel,
    ListingModel,
    ListingVersionModel,
    RunModel,
    SourceModel,
    TrackerModel,
    utc_now,
)

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


@pytest.fixture
def client_with_db():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, expire_on_commit=False, bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    # Seed test data
    session = TestingSessionLocal()
    now = utc_now()

    source = SourceModel(
        id="gh_figma",
        name="Figma",
        type="greenhouse",
        base_url="https://boards-api.greenhouse.io/v1/boards/figma/jobs",
        status="active",
        refresh_interval_minutes=60,
    )
    session.add(source)

    run = RunModel(
        run_id="run-test-01",
        source_id="gh_figma",
        mode="fixture",
        status="success",
        source_url="https://boards-api.greenhouse.io/v1/boards/figma/jobs",
        parsed_count=2,
        new_count=2,
    )
    session.add(run)

    listing = ListingModel(
        entity_id="gh_figma:101",
        source_id="gh_figma",
        title="Software Engineering Intern",
        company="Figma",
        location="San Francisco, CA",
        job_type="Internship",
        deadline=None,
        canonical_url="https://boards.greenhouse.io/figma/jobs/101",
        source_url="https://boards.greenhouse.io/figma/jobs/101",
        detected_at=now,
        first_seen=now,
        last_seen=now,
        content_hash="abc123hash",
        status="active",
        last_change_category="added",
    )
    session.add(listing)

    v1 = ListingVersionModel(
        entity_id="gh_figma:101",
        version_no=1,
        run_id="run-test-01",
        detected_at=now,
        content_hash="abc123hash",
        title="Software Engineering Intern",
        company="Figma",
        location="San Francisco, CA",
        job_type="Internship",
        deadline=None,
    )
    v1.fields = {"title": "Software Engineering Intern", "company": "Figma"}
    session.add(v1)

    chg = ChangeEventModel(
        id=1,
        entity_id="gh_figma:101",
        listing_title="Software Engineering Intern",
        company="Figma",
        change_category="added",
        field=None,
        before_value=None,
        after_value=None,
        run_id="run-test-01",
        detected_at=now,
        review_status="pending",
        source_url="https://boards.greenhouse.io/figma/jobs/101",
    )
    session.add(chg)
    session.commit()
    session.close()

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def test_cors_headers(client_with_db):
    """Test CORS headers for Lovable frontend integration."""
    resp = client_with_db.get(
        "/api/summary",
        headers={"Origin": "https://lovable.dev"},
    )
    assert resp.status_code == 200
    assert "access-control-allow-origin" in resp.headers


def test_get_summary(client_with_db):
    resp = client_with_db.get("/api/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert "active_listings" in data
    assert "new_today" in data
    assert "edited_today" in data
    assert "removed_confirmed" in data
    assert "open_reviews" in data
    assert "sources_healthy" in data
    assert "sources_total" in data
    assert "is_stale" in data
    assert "stale_threshold_minutes" in data
    assert "activity" in data
    assert isinstance(data["activity"], list)


def test_get_listings_and_filter(client_with_db):
    resp = client_with_db.get("/api/listings?company=Figma")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1
    assert data["items"][0]["company"] == "Figma"


def test_get_listing_detail_and_versions(client_with_db):
    resp = client_with_db.get("/api/listings/gh_figma:101")
    assert resp.status_code == 200
    data = resp.json()
    assert data["entity_id"] == "gh_figma:101"
    assert "versions" in data
    assert len(data["versions"]) >= 1
    assert data["versions"][0]["version_no"] == 1


def test_get_listing_not_found(client_with_db):
    resp = client_with_db.get("/api/listings/non_existent")
    assert resp.status_code == 404


def test_get_changes_and_review(client_with_db):
    resp = client_with_db.get("/api/changes?review_status=pending")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    event_id = data["items"][0]["id"]

    # Verify action
    rev_resp = client_with_db.post(f"/api/changes/{event_id}/review", json={"action": "verify"})
    assert rev_resp.status_code == 200
    assert rev_resp.json()["review_status"] == "verified"

    # Dismiss action
    rev_resp2 = client_with_db.post(f"/api/changes/{event_id}/review", json={"action": "dismiss"})
    assert rev_resp2.status_code == 200
    assert rev_resp2.json()["review_status"] == "dismissed"


def test_get_sources(client_with_db):
    resp = client_with_db.get("/api/sources")
    assert resp.status_code == 200
    sources = resp.json()
    assert isinstance(sources, list)
    assert len(sources) >= 1
    assert "refresh_interval_minutes" in sources[0]
    assert "warnings" in sources[0]


def test_get_runs(client_with_db):
    resp = client_with_db.get("/api/runs")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert data["items"][0]["run_id"] == "run-test-01"


def test_tracker_get_and_put(client_with_db):
    # Update tracker
    put_resp = client_with_db.put(
        "/api/tracker/gh_figma:101",
        json={"status": "interviewing", "notes": "Passed first round screen!"},
    )
    assert put_resp.status_code == 200
    tracker = put_resp.json()
    assert tracker["status"] == "interviewing"
    assert tracker["notes"] == "Passed first round screen!"

    # Get tracker
    get_resp = client_with_db.get("/api/tracker")
    assert get_resp.status_code == 200
    items = get_resp.json()
    assert len(items) >= 1
    assert items[0]["entity_id"] == "gh_figma:101"


def test_get_metrics(client_with_db):
    resp = client_with_db.get("/api/metrics")
    assert resp.status_code == 200
    data = resp.json()
    assert "cases" in data
    assert "false_alert_rate" in data
    assert "total_cases" in data


def test_get_frontend_jobs_and_companies(client_with_db):
    resp = client_with_db.get("/api/jobs")
    assert resp.status_code == 200
    jobs = resp.json()
    assert isinstance(jobs, list)
    assert len(jobs) >= 1
    assert "Engineering Intern" in jobs[0]["title"]
    assert jobs[0]["companyId"] == "figma"

    resp_c = client_with_db.get("/api/companies")
    assert resp_c.status_code == 200
    companies = resp_c.json()
    assert isinstance(companies, list)
    assert len(companies) >= 1
    assert any(c["id"] == "figma" for c in companies)

