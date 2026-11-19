"""Tests for normalization, hashing, and null retention."""
from jobradar.core.models import RawListingRecord
from jobradar.core.normalizer import (
    compute_content_hash,
    generate_entity_id,
    normalize_record,
    normalize_string,
    normalize_whitespace,
    strip_html_tags,
)


def test_strip_html_tags_and_whitespace():
    """Verify HTML markup is stripped and whitespace is collapsed."""
    html_input = "  <div><b>Software</b>   <span>Engineer</span> <p>Intern</p></div>  "
    cleaned = strip_html_tags(html_input)
    assert "<" not in cleaned
    assert ">" not in cleaned
    collapsed = normalize_whitespace(cleaned)
    assert collapsed == "Software Engineer Intern"


def test_formatting_only_edits_produce_identical_content_hash():
    """Formatting-only changes MUST NOT change the hash."""
    fields_plain = {
        "title": "Software Engineering Intern",
        "company": "Acme Corp",
        "location": "San Francisco, CA",
        "job_type": "Internship",
        "deadline": None,
    }

    fields_html_rich = {
        "title": "  <b>Software</b> <i>Engineering</i>   Intern  ",
        "company": " Acme Corp\n",
        "location": " San Francisco,   CA\t",
        "job_type": "<span>Internship</span>",
        "deadline": None,
    }

    hash_plain = compute_content_hash(fields_plain)
    hash_rich = compute_content_hash(fields_html_rich)

    assert hash_plain == hash_rich, "Formatting changes altered the content hash!"


def test_field_value_change_produces_different_content_hash():
    """Real substantive changes MUST change the hash."""
    fields_1 = {
        "title": "Software Engineering Intern",
        "company": "Acme Corp",
        "location": "San Francisco, CA",
        "job_type": "Internship",
        "deadline": None,
    }

    fields_2 = {
        "title": "Senior Software Engineering Intern",
        "company": "Acme Corp",
        "location": "San Francisco, CA",
        "job_type": "Internship",
        "deadline": None,
    }

    assert compute_content_hash(fields_1) != compute_content_hash(fields_2)


def test_null_never_invented():
    """Missing fields remain None/NULL, never fabricated or given default strings."""
    raw = RawListingRecord(
        native_id="job_999",
        title="Python Intern",
        company="Startup Inc",
        location=None,
        job_type=None,
        deadline=None,
        canonical_url="https://startup.com/jobs/999",
        source_url="https://startup.com/jobs/999",
    )
    norm = normalize_record(raw, "test_source")
    assert norm.location is None
    assert norm.job_type is None
    assert norm.deadline is None
    assert norm.fields["location"] is None
    assert norm.fields["deadline"] is None
