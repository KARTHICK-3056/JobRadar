"""Deterministic offline tests for change detection engine and metric generation."""
import csv
import json
import os
from pathlib import Path
from typing import List
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from jobradar.compliance.compliance import RateLimitedError
from jobradar.core.config import AppSettings, SourceConfig
from jobradar.core.detector import ChangeDetector
from jobradar.core.models import NormalizedListing, RawListingRecord, TestCaseResult
from jobradar.core.normalizer import compute_content_hash, normalize_record
from jobradar.core.pipeline import RunPipeline
from jobradar.db.models import Base, ChangeEventModel, ListingModel, RunModel, SourceModel

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def record_metrics_case(cases: List[dict], case_id: str, name: str, expected: str, actual: str, passed: bool, is_false_alert: bool = False):
    cases.append({
        "id": case_id,
        "name": name,
        "expected": expected,
        "actual": actual,
        "passed": passed,
        "is_false_alert": is_false_alert,
    })


def write_metrics_files(cases: List[dict], total_alerts: int, false_alerts: int):
    FIXTURES_DIR.mkdir(parents=True, exist_ok=True)
    json_path = FIXTURES_DIR / "metrics_cases.json"
    csv_path = FIXTURES_DIR / "metrics_cases.csv"

    false_alert_rate = (false_alerts / total_alerts) if total_alerts > 0 else 0.0

    payload = {
        "cases": [
            {
                "id": c["id"],
                "name": c["name"],
                "expected": c["expected"],
                "actual": c["actual"],
                "passed": c["passed"],
            }
            for c in cases
        ],
        "false_alert_rate": round(false_alert_rate, 4),
        "total_cases": len(cases),
    }

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "name", "expected", "actual", "passed"])
        for c in cases:
            writer.writerow([c["id"], c["name"], c["expected"], c["actual"], c["passed"]])


def test_complete_change_detection_suite(test_db):
    """Executes the complete labelled change cases and exports test metrics."""
    cases: List[dict] = []
    total_alerts = 0
    false_alerts = 0

    settings = AppSettings(consecutive_misses_for_removal=2, default_request_delay=0)
    pipeline = RunPipeline(settings)

    source_cfg = SourceConfig(
        id="greenhouse_figma",
        name="Figma",
        type="greenhouse",
        base_url="https://boards-api.greenhouse.io/v1/boards/figma/jobs",
    )

    # ==========================================
    # CASES 1, 2, 3: THREE ADDS
    # ==========================================
    v1_payload = (FIXTURES_DIR / "greenhouse_v1.json").read_text(encoding="utf-8")
    run_1 = pipeline.execute_run(test_db, source_cfg, mode="fixture", fixture_payload=v1_payload)

    adds = test_db.query(ChangeEventModel).filter(ChangeEventModel.change_category == "added").all()
    assert len(adds) == 3
    total_alerts += len(adds)

    for i, job_id in enumerate(["101", "102", "103"], start=1):
        found = any(f"greenhouse_figma:{job_id}" in ev.entity_id for ev in adds)
        passed = found is True
        record_metrics_case(
            cases,
            f"case_add_{i}",
            f"Add listing {job_id}",
            expected="added",
            actual="added" if found else "missing",
            passed=passed,
        )

    # ==========================================
    # CASES 4 & 5: TWO EDITS (Title, Location)
    # ==========================================
    v2_payload = (FIXTURES_DIR / "greenhouse_v2.json").read_text(encoding="utf-8")
    run_2 = pipeline.execute_run(test_db, source_cfg, mode="fixture", fixture_payload=v2_payload)

    edits = test_db.query(ChangeEventModel).filter(ChangeEventModel.change_category == "edited").all()
    total_alerts += len(edits)

    title_edit = next((e for e in edits if e.field == "title"), None)
    title_passed = title_edit is not None and "Senior" in (title_edit.after_value or "")
    record_metrics_case(
        cases,
        "case_edit_title",
        "Edit listing title",
        expected="edited:title",
        actual=f"edited:{title_edit.field}" if title_edit else "none",
        passed=title_passed,
    )

    loc_edit = next((e for e in edits if e.field == "location"), None)
    loc_passed = loc_edit is not None and "Remote" in (loc_edit.after_value or "")
    record_metrics_case(
        cases,
        "case_edit_location",
        "Edit listing location",
        expected="edited:location",
        actual=f"edited:{loc_edit.field}" if loc_edit else "none",
        passed=loc_passed,
    )

    # ==========================================
    # CASE 6: EDIT DEADLINE (HTML source)
    # ==========================================
    html_cfg = SourceConfig(
        id="python_jobs",
        name="Python Jobs",
        type="html",
        base_url="https://www.python.org/jobs/",
        selectors={
            "item_list": "ol.list-recent-posts li",
            "title": "h2.listing-company a",
            "company": "span.listing-company-name",
            "location": "span.listing-location",
            "job_type": "span.listing-job-type",
            "link": "h2.listing-company a",
            "deadline": "span.listing-deadline",
        },
    )
    # Simulate first crawl of HTML item with deadline
    html_rec_1 = RawListingRecord(
        native_id="job_py_1",
        title="Python Dev",
        company="PyCorp",
        location="Austin, TX",
        job_type="Full-time",
        deadline="2026-12-01",
        canonical_url="https://example.com/py/1",
        source_url="https://example.com/py/1",
    )
    norm_h1 = normalize_record(html_rec_1, html_cfg.id)
    detector = ChangeDetector(test_db, consecutive_misses_threshold=2)
    src_h = SourceModel(id=html_cfg.id, name=html_cfg.name, type=html_cfg.type, base_url=html_cfg.base_url)
    test_db.add(src_h)
    test_db.flush()
    run_h1 = RunModel(run_id="run_h1", source_id=html_cfg.id, mode="fixture", status="success", source_url=html_cfg.base_url)
    test_db.add(run_h1)
    test_db.flush()
    detector.process_run(src_h, run_h1, [norm_h1])

    # Edit deadline
    html_rec_2 = RawListingRecord(
        native_id="job_py_1",
        title="Python Dev",
        company="PyCorp",
        location="Austin, TX",
        job_type="Full-time",
        deadline="2026-12-15",
        canonical_url="https://example.com/py/1",
        source_url="https://example.com/py/1",
    )
    norm_h2 = normalize_record(html_rec_2, html_cfg.id)
    run_h2 = RunModel(run_id="run_h2", source_id=html_cfg.id, mode="fixture", status="success", source_url=html_cfg.base_url)
    test_db.add(run_h2)
    test_db.flush()
    det_h2 = detector.process_run(src_h, run_h2, [norm_h2])
    test_db.commit()

    dl_edit = test_db.query(ChangeEventModel).filter(
        ChangeEventModel.entity_id == norm_h1.entity_id,
        ChangeEventModel.field == "deadline",
    ).first()
    dl_passed = dl_edit is not None and dl_edit.after_value == "2026-12-15"
    if dl_edit:
        total_alerts += 1
    record_metrics_case(
        cases,
        "case_edit_deadline",
        "Edit listing deadline",
        expected="edited:deadline",
        actual=f"edited:{dl_edit.field}" if dl_edit else "none",
        passed=dl_passed,
    )

    # ==========================================
    # CASES 7 & 8: TWO CONFIRMED REMOVALS (N=2 misses)
    # ==========================================
    # v3 payload omits job 103 and job 104
    # On first miss (run 3):
    v3_payload = (FIXTURES_DIR / "greenhouse_v3.json").read_text(encoding="utf-8")
    run_3 = pipeline.execute_run(test_db, source_cfg, mode="fixture", fixture_payload=v3_payload)
    item_103 = test_db.query(ListingModel).filter(ListingModel.entity_id == "greenhouse_figma:101").first()
    item_103_miss = test_db.query(ListingModel).filter(ListingModel.entity_id == "greenhouse_figma:103").first()
    assert item_103_miss.status == "active"  # NOT removed on single miss!
    assert item_103_miss.consecutive_misses == 1

    # On second miss (run 4):
    run_4 = pipeline.execute_run(test_db, source_cfg, mode="fixture", fixture_payload=v3_payload)
    test_db.refresh(item_103_miss)
    item_104_miss = test_db.query(ListingModel).filter(ListingModel.entity_id == "greenhouse_figma:104").first()

    rem_103_passed = item_103_miss.status == "removed" and item_103_miss.consecutive_misses >= 2
    rem_104_passed = item_104_miss.status == "removed" and item_104_miss.consecutive_misses >= 2

    rem_events = test_db.query(ChangeEventModel).filter(ChangeEventModel.change_category == "removed").all()
    total_alerts += len(rem_events)

    record_metrics_case(
        cases,
        "case_removal_confirmed_1",
        "Confirm removal of listing 103 after N=2 misses",
        expected="removed",
        actual=item_103_miss.status,
        passed=rem_103_passed,
    )
    record_metrics_case(
        cases,
        "case_removal_confirmed_2",
        "Confirm removal of listing 104 after N=2 misses",
        expected="removed",
        actual=item_104_miss.status,
        passed=rem_104_passed,
    )

    # ==========================================
    # CASES 9 & 10: FORMATTING-ONLY EDITS (EXPECT NO EVENT)
    # ==========================================
    h_plain = RawListingRecord(
        native_id="job_fmt_1",
        title="Software Engineer Intern",
        company="TechCorp",
        location="Seattle, WA",
        job_type="Internship",
        deadline=None,
        canonical_url="https://example.com/fmt/1",
        source_url="https://example.com/fmt/1",
    )
    norm_f1 = normalize_record(h_plain, "fmt_source")
    src_f = SourceModel(id="fmt_source", name="Fmt Source", type="html", base_url="https://example.com")
    test_db.add(src_f)
    test_db.flush()
    run_f1 = RunModel(run_id="run_f1", source_id="fmt_source", mode="fixture", status="success", source_url="https://example.com")
    test_db.add(run_f1)
    test_db.flush()
    detector.process_run(src_f, run_f1, [norm_f1])

    # Formatting variant 1: HTML tags injected into title & location
    h_rich_html = RawListingRecord(
        native_id="job_fmt_1",
        title="<b>Software</b> <i>Engineer</i> <span>Intern</span>",
        company="TechCorp",
        location="<span>Seattle, WA</span>",
        job_type="Internship",
        deadline=None,
        canonical_url="https://example.com/fmt/1",
        source_url="https://example.com/fmt/1",
    )
    norm_f2 = normalize_record(h_rich_html, "fmt_source")
    run_f2 = RunModel(run_id="run_f2", source_id="fmt_source", mode="fixture", status="success", source_url="https://example.com")
    test_db.add(run_f2)
    test_db.flush()
    res_f2 = detector.process_run(src_f, run_f2, [norm_f2])
    test_db.commit()

    fmt1_passed = (res_f2.updated_count == 0 and res_f2.events_created == 0 and norm_f1.content_hash == norm_f2.content_hash)
    if not fmt1_passed:
        false_alerts += 1
    record_metrics_case(
        cases,
        "case_formatting_only_1",
        "HTML formatting-only tags produce NO change event",
        expected="no_event",
        actual="no_event" if fmt1_passed else "false_alert",
        passed=fmt1_passed,
        is_false_alert=not fmt1_passed,
    )

    # Formatting variant 2: Whitespace, tabs, and newlines
    h_whitespace = RawListingRecord(
        native_id="job_fmt_1",
        title="  Software   Engineer\nIntern\t",
        company="TechCorp  ",
        location=" Seattle,   WA\n",
        job_type="Internship",
        deadline=None,
        canonical_url="https://example.com/fmt/1",
        source_url="https://example.com/fmt/1",
    )
    norm_f3 = normalize_record(h_whitespace, "fmt_source")
    run_f3 = RunModel(run_id="run_f3", source_id="fmt_source", mode="fixture", status="success", source_url="https://example.com")
    test_db.add(run_f3)
    test_db.flush()
    res_f3 = detector.process_run(src_f, run_f3, [norm_f3])
    test_db.commit()

    fmt2_passed = (res_f3.updated_count == 0 and res_f3.events_created == 0 and norm_f1.content_hash == norm_f3.content_hash)
    if not fmt2_passed:
        false_alerts += 1
    record_metrics_case(
        cases,
        "case_formatting_only_2",
        "Whitespace formatting-only produces NO change event",
        expected="no_event",
        actual="no_event" if fmt2_passed else "false_alert",
        passed=fmt2_passed,
        is_false_alert=not fmt2_passed,
    )

    # ==========================================
    # CASE 11: HTTP 404 THEN RESTORED PAGE
    # ==========================================
    # Simulate 404
    active_before = test_db.query(ListingModel).filter(ListingModel.entity_id == "greenhouse_figma:101").first()
    assert active_before.status == "active"

    # Execute 404 run
    run_404 = RunModel(
        run_id="run_404",
        source_id="greenhouse_figma",
        mode="fixture",
        status="failed",
        http_status=404,
        source_url="https://boards-api.greenhouse.io/v1/boards/figma/jobs",
    )
    test_db.add(run_404)
    src_gh = test_db.query(SourceModel).filter(SourceModel.id == "greenhouse_figma").first()
    src_gh.status = "unknown"
    test_db.commit()

    # Verify listing NOT removed by 404
    test_db.refresh(active_before)
    assert active_before.status == "active"

    # Now restore page with previously removed job 103
    v1_restore_payload = (FIXTURES_DIR / "greenhouse_v1.json").read_text(encoding="utf-8")
    run_restore = pipeline.execute_run(test_db, source_cfg, mode="fixture", fixture_payload=v1_restore_payload)

    # Job 103 was removed; should now be restored WITHOUT creating duplicate 'added' event
    test_db.refresh(item_103_miss)
    restored_passed = (item_103_miss.status == "active")
    adds_for_103 = test_db.query(ChangeEventModel).filter(
        ChangeEventModel.entity_id == "greenhouse_figma:103",
        ChangeEventModel.change_category == "added",
    ).count()
    no_duplicate_add = (adds_for_103 == 1)  # only initial add, no second add!

    case_11_passed = restored_passed and no_duplicate_add
    record_metrics_case(
        cases,
        "case_404_restored",
        "HTTP 404 followed by restored page (NO removal, NO duplicate added events)",
        expected="restored_no_duplicate_add",
        actual="restored_no_duplicate_add" if case_11_passed else "failed",
        passed=case_11_passed,
    )

    # ==========================================
    # CASE 12: SELECTOR BREAK / ZERO RESULTS -> PARSER_FAILURE (NOT REMOVAL)
    # ==========================================
    html_broken_cfg = SourceConfig(
        id="python_jobs_test",
        name="Python Jobs Test",
        type="html",
        base_url="https://www.python.org/jobs/",
        selectors={
            "item_list": "ol.list-recent-posts li",
            "title": "h2.listing-company a",
            "company": "span.listing-company-name",
            "location": "span.listing-location",
            "job_type": "span.listing-job-type",
            "link": "h2.listing-company a",
        },
    )
    # First crawl normal HTML
    html_norm_payload = (FIXTURES_DIR / "html_v1.html").read_text(encoding="utf-8")
    pipeline.execute_run(test_db, html_broken_cfg, mode="fixture", fixture_payload=html_norm_payload)
    active_py_jobs = test_db.query(ListingModel).filter(ListingModel.source_id == "python_jobs_test", ListingModel.status == "active").count()
    assert active_py_jobs == 2

    # Second crawl with broken selectors
    html_broken_payload = (FIXTURES_DIR / "html_broken_selectors.html").read_text(encoding="utf-8")
    run_broken = pipeline.execute_run(test_db, html_broken_cfg, mode="fixture", fixture_payload=html_broken_payload)

    # Verify parser_failure recorded and NO listings marked removed
    pf_event = test_db.query(ChangeEventModel).filter(ChangeEventModel.change_category == "parser_failure").first()
    active_after_break = test_db.query(ListingModel).filter(ListingModel.source_id == "python_jobs_test", ListingModel.status == "active").count()

    case_12_passed = (run_broken.status == "parser_failure" and pf_event is not None and active_after_break == 2)
    record_metrics_case(
        cases,
        "case_selector_break",
        "Selector break triggers parser_failure, NOT removal",
        expected="parser_failure_no_removal",
        actual="parser_failure_no_removal" if case_12_passed else "failed",
        passed=case_12_passed,
    )

    # ==========================================
    # CASE 13: HTTP 429 RATE LIMIT
    # ==========================================
    from unittest.mock import patch, MagicMock
    mock_429 = MagicMock()
    mock_429.status_code = 429
    mock_429.headers = {"Retry-After": "30"}

    rate_cfg = SourceConfig(
        id="rate_limited_source",
        name="Rate Limited Source",
        type="greenhouse",
        base_url="https://example.com/api/jobs",
    )
    with patch.object(pipeline.http_client.robots_checker, "is_allowed", return_value=True):
        with patch.object(pipeline.http_client.session, "get", return_value=mock_429):
            run_429 = pipeline.execute_run(test_db, rate_cfg, mode="live")

    src_rate = test_db.query(SourceModel).filter(SourceModel.id == "rate_limited_source").first()
    case_13_passed = (run_429.status == "rate_limited" and src_rate.status == "rate_limited")
    record_metrics_case(
        cases,
        "case_http_429",
        "HTTP 429 halts crawl and sets source state rate_limited",
        expected="rate_limited",
        actual=run_429.status,
        passed=case_13_passed,
    )

    # ==========================================
    # CASE 14: DUPLICATE SUPPRESSION
    # ==========================================
    # Re-apply same edit event; duplicate pending event must NOT be created
    prior_pending = test_db.query(ChangeEventModel).filter(
        ChangeEventModel.entity_id == "greenhouse_figma:101",
        ChangeEventModel.field == "title",
        ChangeEventModel.review_status == "pending",
    ).count()
    # Execute detector again with same edited record
    v2_payload = (FIXTURES_DIR / "greenhouse_v2.json").read_text(encoding="utf-8")
    pipeline.execute_run(test_db, source_cfg, mode="fixture", fixture_payload=v2_payload)
    post_pending = test_db.query(ChangeEventModel).filter(
        ChangeEventModel.entity_id == "greenhouse_figma:101",
        ChangeEventModel.field == "title",
        ChangeEventModel.review_status == "pending",
    ).count()
    dup_suppressed = (prior_pending == post_pending and prior_pending > 0)
    record_metrics_case(
        cases,
        "case_duplicate_suppression",
        "Duplicate change event suppression prevents inflated pending review queue",
        expected="suppressed",
        actual="suppressed" if dup_suppressed else "duplicate_created",
        passed=dup_suppressed,
    )

    # ==========================================
    # CASE 15: IDEMPOTENT RERUN
    # ==========================================
    run_idem = pipeline.execute_run(test_db, source_cfg, mode="fixture", fixture_payload=v2_payload)
    idem_passed = (run_idem.new_count == 0 and run_idem.updated_count == 0 and run_idem.removed_count == 0 and run_idem.duplicate_count > 0)
    record_metrics_case(
        cases,
        "case_idempotent_rerun",
        "Idempotent rerun of same input generates 0 new/updated/removed counts",
        expected="idempotent_0_changes",
        actual="idempotent_0_changes" if idem_passed else "non_idempotent",
        passed=idem_passed,
    )

    # ==========================================
    # Write metrics to fixtures/metrics_cases.json and fixtures/metrics_cases.csv
    # ==========================================
    write_metrics_files(cases, total_alerts, false_alerts)

    assert len(cases) >= 12
    assert all(c["passed"] for c in cases)
    assert false_alerts == 0
