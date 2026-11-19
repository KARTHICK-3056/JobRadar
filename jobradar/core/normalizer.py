"""Field normalization and deterministic hashing engine."""
from datetime import datetime, timezone
import hashlib
import json
import re
from typing import Any, Dict, Optional
from bs4 import BeautifulSoup

from jobradar.core.models import NormalizedListing, RawListingRecord


def strip_html_tags(text: Optional[str]) -> Optional[str]:
    """Strip all HTML tags to prevent formatting-only edits from triggering alerts."""
    if not text:
        return None
    # If text contains HTML tags, parse text content out
    if "<" in text and ">" in text:
        soup = BeautifulSoup(text, "html.parser")
        text = soup.get_text(separator=" ")
    return text


def normalize_whitespace(text: Optional[str]) -> Optional[str]:
    """Trim leading/trailing whitespace and collapse internal consecutive whitespace."""
    if text is None:
        return None
    cleaned = " ".join(text.split()).strip()
    return cleaned if cleaned else None


def normalize_string(text: Optional[str], lowercase: bool = False) -> Optional[str]:
    """Full normalization: strip HTML, normalize whitespace, optional lowercase."""
    stripped = strip_html_tags(text)
    normalized = normalize_whitespace(stripped)
    if normalized is None:
        return None
    return normalized.lower() if lowercase else normalized


def compute_content_hash(fields: Dict[str, Any]) -> str:
    """Compute sha256 hash of normalized extracted fields in stable key order."""
    # Build deterministic dictionary of core fields
    canonical = {
        "title": normalize_string(fields.get("title"), lowercase=True) or "",
        "company": normalize_string(fields.get("company"), lowercase=True) or "",
        "location": normalize_string(fields.get("location"), lowercase=True) or "",
        "job_type": normalize_string(fields.get("job_type"), lowercase=True) or "",
        "deadline": normalize_string(fields.get("deadline"), lowercase=True) or "",
    }
    # Stable JSON dump with sorted keys
    serialized = json.dumps(canonical, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def generate_entity_id(source_id: str, native_id: Optional[str], canonical_url: str) -> str:
    """Generate stable entity_id: {source_id}:{native_id} or hash of canonical_url."""
    if native_id and str(native_id).strip():
        clean_native = "".join(c for c in str(native_id).strip() if c.isalnum() or c in "-_")
        return f"{source_id}:{clean_native}"
    # Hash normalized canonical URL
    norm_url = normalize_string(canonical_url, lowercase=True) or ""
    url_hash = hashlib.sha256(norm_url.encode("utf-8")).hexdigest()[:16]
    return f"{source_id}:{url_hash}"


def normalize_record(raw: RawListingRecord, source_id: str) -> NormalizedListing:
    """Normalize raw listing and calculate deterministic content hash."""
    clean_title = normalize_string(raw.title, lowercase=False) or ""
    clean_company = normalize_string(raw.company, lowercase=False) or ""
    clean_location = normalize_string(raw.location, lowercase=False)
    clean_job_type = normalize_string(raw.job_type, lowercase=False)
    clean_deadline = normalize_string(raw.deadline, lowercase=False)
    clean_url = normalize_whitespace(raw.canonical_url) or ""

    fields_dict: Dict[str, Any] = {
        "title": clean_title,
        "company": clean_company,
        "location": clean_location,
        "job_type": clean_job_type,
        "deadline": clean_deadline,
    }

    content_hash = compute_content_hash(fields_dict)
    entity_id = generate_entity_id(source_id, raw.native_id, clean_url)

    return NormalizedListing(
        entity_id=entity_id,
        source_id=source_id,
        title=clean_title,
        company=clean_company,
        location=clean_location,
        job_type=clean_job_type,
        deadline=clean_deadline,
        canonical_url=clean_url,
        source_url=raw.source_url or clean_url,
        source_updated_at=raw.source_updated_at,
        content_hash=content_hash,
        fields=fields_dict,
    )
