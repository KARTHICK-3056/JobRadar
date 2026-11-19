"""Base adapter interface and common parsing utilities."""
from abc import ABC, abstractmethod
from datetime import datetime
import logging
import re
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urljoin

from jobradar.compliance.compliance import CompliantHttpClient
from jobradar.core.config import SourceConfig
from jobradar.core.models import RawListingRecord

logger = logging.getLogger("jobradar.adapters")


def sanitize_text(text: Optional[str]) -> Optional[str]:
    """Strip extraneous whitespace and sensitive recruiter contacts."""
    if not text:
        return None
    # Remove email addresses and phone numbers to guarantee privacy compliance
    text = re.sub(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "[REDACTED_EMAIL]", text)
    text = re.sub(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b", "[REDACTED_PHONE]", text)
    cleaned = " ".join(text.split()).strip()
    return cleaned if cleaned else None


def make_snippet(content: Optional[str], max_length: int = 250) -> Optional[str]:
    """Create short non-sensitive preview snippet without republishing full page."""
    cleaned = sanitize_text(content)
    if not cleaned:
        return None
    if len(cleaned) <= max_length:
        return cleaned
    return cleaned[:max_length].rstrip() + "..."


class BaseAdapter(ABC):
    """Abstract base adapter for all job source types."""

    def __init__(self, source_config: SourceConfig, http_client: Optional[CompliantHttpClient] = None):
        self.config = source_config
        self.http_client = http_client

    @property
    def source_id(self) -> str:
        return self.config.id

    @property
    def source_name(self) -> str:
        return self.config.name

    @abstractmethod
    def fetch(self, fixture_content: Optional[str] = None) -> Tuple[str, int, str]:
        """Fetch raw content from source or replay fixture.
        
        Returns:
            Tuple of (raw_payload_text, http_status_code, fetched_url)
        """
        pass

    @abstractmethod
    def parse(self, raw_content: str) -> List[RawListingRecord]:
        """Parse raw content into raw listing records."""
        pass

    def validate(self, records: List[RawListingRecord]) -> Tuple[List[RawListingRecord], int]:
        """Validate parsed records against minimal required fields.
        
        Returns (valid_records, failed_count).
        """
        valid: List[RawListingRecord] = []
        failed = 0
        for rec in records:
            # Title, Company, and canonical_url are strictly required
            if not rec.title or not rec.company or not rec.canonical_url:
                logger.warning("Record failed validation (missing title/company/url): %s", rec)
                failed += 1
                continue
            valid.append(rec)
        return valid, failed

    def filter_by_keywords(self, records: List[RawListingRecord]) -> List[RawListingRecord]:
        """Optionally filter records for internships/entry-level roles if configured."""
        kw_cfg = self.config.filter_keywords
        if not kw_cfg or not kw_cfg.get("enabled", False):
            return records

        keywords = [k.lower() for k in kw_cfg.get("keywords", [])]
        if not keywords:
            return records

        filtered: List[RawListingRecord] = []
        for rec in records:
            haystack = f"{rec.title} {rec.job_type or ''} {rec.raw_snippet or ''}".lower()
            if any(k in haystack for k in keywords):
                filtered.append(rec)
        return filtered

    def fetch_and_extract(self, fixture_content: Optional[str] = None) -> Tuple[List[RawListingRecord], int, str, int, int]:
        """Orchestrate fetch -> parse -> validate -> filter.
        
        Returns:
            Tuple of (valid_records, http_status, fetched_url, raw_count, failed_count)
        """
        raw_text, status, url = self.fetch(fixture_content=fixture_content)
        parsed = self.parse(raw_text)
        valid, failed_count = self.validate(parsed)
        filtered = self.filter_by_keywords(valid)
        return filtered, status, url, len(parsed), failed_count
