"""HTML CSS selector career page adapter using BeautifulSoup4 and lxml."""
from datetime import datetime
import hashlib
import logging
from typing import List, Optional, Tuple
from urllib.parse import urljoin
from bs4 import BeautifulSoup

from jobradar.adapters.base import BaseAdapter, make_snippet, sanitize_text
from jobradar.core.models import RawListingRecord

logger = logging.getLogger("jobradar.adapters.html")


class SelectorMismatchError(Exception):
    """Raised when configured selectors fail to extract items from HTML."""
    pass


class HtmlAdapter(BaseAdapter):
    """Scrapes permitted career page using configurable CSS selectors."""

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
            logger.warning("Empty HTML response received")
            return []

        soup = BeautifulSoup(raw_content, "lxml")
        selectors = self.config.selectors or {}
        item_sel = selectors.get("item_list", "li")
        items = soup.select(item_sel)

        if not items:
            logger.warning("Selector '%s' returned 0 items from HTML body", item_sel)
            # Signal selector mismatch / empty extraction
            return []

        records: List[RawListingRecord] = []
        company_fallback = self.config.name

        for item in items:
            title_sel = selectors.get("title")
            company_sel = selectors.get("company")
            location_sel = selectors.get("location")
            type_sel = selectors.get("job_type")
            link_sel = selectors.get("link")
            deadline_sel = selectors.get("deadline")

            # Extract title
            title_elem = item.select_one(title_sel) if title_sel else None
            title = sanitize_text(title_elem.get_text()) if title_elem else None
            if not title:
                continue

            # Extract link
            link_elem = item.select_one(link_sel) if link_sel else title_elem
            href = link_elem.get("href") if link_elem and link_elem.has_attr("href") else None
            if not href:
                continue
            canonical_url = urljoin(self.config.base_url, href)

            # Extract company
            company_elem = item.select_one(company_sel) if company_sel else None
            company = sanitize_text(company_elem.get_text()) if company_elem else company_fallback

            # Extract location
            loc_elem = item.select_one(location_sel) if location_sel else None
            location = sanitize_text(loc_elem.get_text()) if loc_elem else None

            # Extract job type
            type_elem = item.select_one(type_sel) if type_sel else None
            job_type = sanitize_text(type_elem.get_text()) if type_elem else None

            # Extract deadline (if present, else NULL)
            deadline_elem = item.select_one(deadline_sel) if deadline_sel else None
            deadline = sanitize_text(deadline_elem.get_text()) if deadline_elem else None

            snippet = make_snippet(item.get_text())

            # Native id from URL hash or path
            native_id = hashlib.sha256(canonical_url.encode("utf-8")).hexdigest()[:16]

            rec = RawListingRecord(
                native_id=native_id,
                title=title,
                company=company,
                location=location,
                job_type=job_type,
                deadline=deadline,
                canonical_url=canonical_url,
                source_url=canonical_url,
                source_updated_at=None,
                raw_snippet=snippet,
            )
            records.append(rec)

        return records
