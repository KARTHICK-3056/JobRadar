"""Tests for Greenhouse, Lever, and HTML source adapters."""
from pathlib import Path
from jobradar.adapters.greenhouse import GreenhouseAdapter
from jobradar.adapters.lever import LeverAdapter
from jobradar.adapters.html import HtmlAdapter
from jobradar.core.config import SourceConfig

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


def test_greenhouse_adapter_parse():
    cfg = SourceConfig(
        id="gh_figma",
        name="Figma",
        type="greenhouse",
        base_url="https://boards-api.greenhouse.io/v1/boards/figma/jobs",
    )
    adapter = GreenhouseAdapter(cfg)
    payload = (FIXTURES_DIR / "greenhouse_v1.json").read_text(encoding="utf-8")
    records = adapter.parse(payload)

    assert len(records) == 3
    assert records[0].title == "Software Engineering Intern"
    assert records[0].native_id == "101"
    assert records[0].company == "Figma"
    assert records[0].location == "San Francisco, CA"
    assert records[0].deadline is None  # Null never invented


def test_lever_adapter_parse():
    cfg = SourceConfig(
        id="lever_spotify",
        name="Spotify",
        type="lever",
        base_url="https://api.lever.co/v0/postings/spotify?mode=json",
    )
    adapter = LeverAdapter(cfg)
    payload = (FIXTURES_DIR / "lever_v1.json").read_text(encoding="utf-8")
    records = adapter.parse(payload)

    assert len(records) == 2
    assert records[0].title == "Machine Learning Intern"
    assert records[0].native_id == "lev-201"
    assert records[0].company == "Spotify"
    assert records[0].location == "Boston, MA"
    assert records[0].job_type == "Internship"
    assert records[0].deadline is None


def test_html_adapter_parse():
    cfg = SourceConfig(
        id="python_jobs",
        name="Python Software Foundation",
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
    adapter = HtmlAdapter(cfg)
    payload = (FIXTURES_DIR / "html_v1.html").read_text(encoding="utf-8")
    records = adapter.parse(payload)

    assert len(records) == 2
    assert records[0].title == "Junior Python Developer"
    assert records[0].company == "Acme Robotics"
    assert records[0].location == "Austin, TX"
    assert records[0].job_type == "Full-time"


def test_keyword_filtering():
    cfg = SourceConfig(
        id="gh_figma",
        name="Figma",
        type="greenhouse",
        base_url="https://boards-api.greenhouse.io/v1/boards/figma/jobs",
        filter_keywords={
            "enabled": True,
            "keywords": ["design"],
        },
    )
    adapter = GreenhouseAdapter(cfg)
    payload = (FIXTURES_DIR / "greenhouse_v1.json").read_text(encoding="utf-8")
    records = adapter.parse(payload)
    valid, _ = adapter.validate(records)
    filtered = adapter.filter_by_keywords(valid)

    assert len(filtered) == 1
    assert filtered[0].title == "Product Design Intern"
