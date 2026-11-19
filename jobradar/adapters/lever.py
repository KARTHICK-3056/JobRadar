"""Lever Postings API adapter."""
from datetime import datetime, timezone
import json
import logging
from typing import List, Optional, Tuple
from dateutil import parser as date_parser

from jobradar.adapters.base import BaseAdapter, make_snippet, sanitize_text
from jobradar.core.models import RawListingRecord

logger = logging.getLogger("jobradar.adapters.lever")


class LeverAdapter(BaseAdapter):
    """Adapter for Lever public postings API."""

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
            logger.warning("Empty Lever response received")
            return []

        try:
            data = json.loads(raw_content)
        except json.JSONDecodeError as exc:
            logger.error("Failed to decode JSON from Lever payload: %s", exc)
            return []

        if not isinstance(data, list):
            logger.warning("Unexpected Lever payload structure: expected list, got %s", type(data))
            return []

        records: List[RawListingRecord] = []
        company_name = self.config.name.split("(")[0].strip()

        for item in data:
            if not isinstance(item, dict):
                continue

            native_id = str(item.get("id")) if item.get("id") is not None else None
            title = sanitize_text(item.get("text"))
            if not title:
                continue

            categories = item.get("categories") or {}
            location_val = None
            job_type_val = None

            if isinstance(categories, dict):
                location_val = sanitize_text(categories.get("location"))
                job_type_val = sanitize_text(categories.get("commitment"))

            hosted_url = item.get("hostedUrl")
            if not hosted_url:
                continue

            # Parse createdAt timestamp (milliseconds)
            created_at = None
            raw_ts = item.get("createdAt")
            if raw_ts and isinstance(raw_ts, (int, float)):
                try:
                    created_at = datetime.fromtimestamp(raw_ts / 1000.0, tz=timezone.utc)
                except Exception:
                    pass

            snippet = make_snippet(item.get("descriptionPlain") or item.get("additionalPlain"))

            rec = RawListingRecord(
                native_id=native_id,
                title=title,
                company=company_name,
                location=location_val,
                job_type=job_type_val,
                deadline=None,  # Never invent: Lever API does not supply deadline
                canonical_url=hosted_url,
                source_url=hosted_url,
                source_updated_at=created_at,
                raw_snippet=snippet,
            )
            records.append(rec)

        return records
