"""Greenhouse Job Board API adapter."""
from datetime import datetime
import json
import logging
from typing import List, Optional, Tuple
from bs4 import BeautifulSoup
from dateutil import parser as date_parser

from jobradar.adapters.base import BaseAdapter, make_snippet, sanitize_text
from jobradar.core.models import RawListingRecord

logger = logging.getLogger("jobradar.adapters.greenhouse")


class GreenhouseAdapter(BaseAdapter):
    """Adapter for Greenhouse public boards API."""

    def fetch(self, fixture_content: Optional[str] = None) -> Tuple[str, int, str]:
        if fixture_content is not None:
            return fixture_content, 200, self.config.base_url

        if not self.http_client:
            raise RuntimeError("CompliantHttpClient is required for live fetch")

        url = self.config.base_url
        resp = self.http_client.get(url, check_robots=True)
        return resp.text, resp.status_code, url

    def parse(self, raw_content: str) -> List[RawListingRecord]:
        if not raw_content or not raw_content.strip():
            logger.warning("Empty Greenhouse response received")
            return []

        try:
            data = json.loads(raw_content)
        except json.JSONDecodeError as exc:
            logger.error("Failed to decode JSON from Greenhouse payload: %s", exc)
            return []

        jobs = data.get("jobs", [])
        if not isinstance(jobs, list):
            logger.warning("Unexpected Greenhouse payload structure: 'jobs' is not a list")
            return []

        records: List[RawListingRecord] = []
        company_name = self.config.name.split("(")[0].strip()

        for item in jobs:
            if not isinstance(item, dict):
                continue

            native_id = str(item.get("id")) if item.get("id") is not None else None
            title = sanitize_text(item.get("title"))
            if not title:
                continue

            loc_obj = item.get("location")
            location_val = None
            if isinstance(loc_obj, dict):
                location_val = sanitize_text(loc_obj.get("name"))
            elif isinstance(loc_obj, str):
                location_val = sanitize_text(loc_obj)

            abs_url = item.get("absolute_url")
            if not abs_url:
                continue

            # Parse updated_at
            updated_at = None
            raw_updated = item.get("updated_at")
            if raw_updated:
                try:
                    updated_at = date_parser.parse(raw_updated)
                except Exception:
                    pass

            # Snippet extraction from HTML content
            snippet = None
            content_html = item.get("content")
            if content_html:
                soup = BeautifulSoup(content_html, "html.parser")
                snippet = make_snippet(soup.get_text())

            rec = RawListingRecord(
                native_id=native_id,
                title=title,
                company=company_name,
                location=location_val,
                job_type=None,  # Never invent: Greenhouse API does not have a dedicated job_type field
                deadline=None,  # Never invent: Greenhouse API does not supply deadline
                canonical_url=abs_url,
                source_url=abs_url,
                source_updated_at=updated_at,
                raw_snippet=snippet,
            )
            records.append(rec)

        return records
