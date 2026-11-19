"""On-demand live scraper for cities and locations across verified public boards."""
import hashlib
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import uuid

import requests
from sqlalchemy.orm import Session

from jobradar.core.config import load_settings
from jobradar.core.frontend_mapper import sync_to_frontend
from jobradar.core.normalizer import compute_content_hash
from jobradar.db.models import ListingModel, RunModel, SnapshotModel, SourceModel, utc_now

logger = logging.getLogger("jobradar.live_scraper")

USER_AGENT = "JobRadarBot/1.0 (student project; contact: student@university.edu)"

LIVE_SOURCES: List[Dict[str, Any]] = [
    {
        "id": "greenhouse_fourkites",
        "name": "FourKites",
        "type": "greenhouse",
        "url": "https://boards-api.greenhouse.io/v1/boards/fourkites/jobs?content=true",
        "cities": ["chennai", "tamil nadu", "remote, india"],
    },
    {
        "id": "lever_paytm",
        "name": "Paytm",
        "type": "lever",
        "url": "https://api.lever.co/v0/postings/paytm?mode=json",
        "cities": [
            "chennai",
            "coimbatore",
            "vellore",
            "tamil nadu",
            "bengaluru",
            "bangalore",
            "pune",
            "mumbai",
            "delhi",
            "noida",
            "gurgaon",
            "ahmedabad",
            "hyderabad",
            "chandigarh",
            "lucknow",
            "india",
        ],
    },
    {
        "id": "lever_meesho",
        "name": "Meesho",
        "type": "lever",
        "url": "https://api.lever.co/v0/postings/meesho?mode=json",
        "cities": ["bengaluru", "bangalore", "karnataka", "india"],
    },
    {
        "id": "greenhouse_groww",
        "name": "Groww",
        "type": "greenhouse",
        "url": "https://boards-api.greenhouse.io/v1/boards/groww/jobs?content=true",
        "cities": ["bengaluru", "bangalore", "india"],
    },
]


def scrape_jobs_for_location(location: str, session: Session) -> Dict[str, Any]:
    """Crawl real career APIs on the web for a requested city (e.g. Chennai)."""
    loc_clean = location.strip().lower()
    now = utc_now()
    scraped_count = 0
    new_count = 0
    matching_listings = []

    # Filter sources relevant to this location or check all Indian sources
    sources_to_scrape = [
        s for s in LIVE_SOURCES
        if loc_clean == "india" or any(loc_clean in c for c in s["cities"]) or any(c in loc_clean for c in s["cities"])
    ]
    if not sources_to_scrape:
        sources_to_scrape = LIVE_SOURCES

    headers = {"User-Agent": USER_AGENT, "Accept": "application/json"}
    snapshot_dir = Path("snapshots")
    snapshot_dir.mkdir(parents=True, exist_ok=True)

    for src in sources_to_scrape:
        src_id = src["id"]
        company_name = src["name"]
        url = src["url"]

        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code != 200:
                continue

            raw_text = resp.text
            # Save raw snapshot
            ts_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            snap_file = snapshot_dir / f"{src_id}_{ts_str}_live.json"
            snap_file.write_text(raw_text, encoding="utf-8")

            payload = resp.json()
            raw_jobs = payload if isinstance(payload, list) else payload.get("jobs", [])

            # Ensure source model exists
            source_rec = session.query(SourceModel).filter(SourceModel.id == src_id).first()
            if not source_rec:
                source_rec = SourceModel(
                    id=src_id,
                    name=company_name,
                    type=src["type"],
                    base_url=url,
                    refresh_interval_minutes=60,
                    status="active",
                )
                session.add(source_rec)
                session.flush()

            for item in raw_jobs:
                if src["type"] == "greenhouse":
                    native_id = str(item.get("id"))
                    title = item.get("title", "").strip()
                    loc_name = (item.get("location", {}) or {}).get("name", "").strip() or "India"
                    job_url = item.get("absolute_url") or url
                    snippet = item.get("content", "")[:300] if item.get("content") else ""
                else:
                    native_id = str(item.get("id"))
                    title = item.get("text", "").strip()
                    cats = item.get("categories", {}) or {}
                    loc_name = cats.get("location", "").strip() or "India"
                    job_url = item.get("hostedUrl") or url
                    snippet = item.get("descriptionPlain", "")[:300] if item.get("descriptionPlain") else ""

                if not title:
                    continue

                entity_id = f"{src_id}:{native_id}"
                c_hash = compute_content_hash({
                    "title": title,
                    "company": company_name,
                    "location": loc_name,
                    "job_type": None,
                    "deadline": None,
                })

                existing = session.query(ListingModel).filter(ListingModel.entity_id == entity_id).first()
                if not existing:
                    new_listing = ListingModel(
                        entity_id=entity_id,
                        source_id=src_id,
                        title=title,
                        company=company_name,
                        location=loc_name,
                        canonical_url=job_url,
                        source_url=url,
                        detected_at=now,
                        first_seen=now,
                        last_seen=now,
                        content_hash=c_hash,
                        status="active",
                        consecutive_misses=0,
                        last_change_category="added",
                        snippet=snippet,
                    )
                    session.add(new_listing)
                    new_count += 1
                else:
                    existing.last_seen = now
                    existing.status = "active"

                scraped_count += 1
                if loc_clean in loc_name.lower() or (loc_clean == "india" and "india" in loc_name.lower()):
                    matching_listings.append({
                        "entity_id": entity_id,
                        "title": title,
                        "company": company_name,
                        "location": loc_name,
                        "url": job_url,
                    })

            source_rec.last_successful_at = now
            source_rec.last_attempted_at = now
            source_rec.status = "active"
            session.commit()

        except Exception as exc:
            logger.exception("Error live scraping %s: %s", src_id, exc)
            continue

    # Sync to frontend
    try:
        sync_to_frontend(session)
    except Exception as sync_exc:
        logger.debug("Live sync error: %s", sync_exc)

    return {
        "location": location,
        "scraped_count": scraped_count,
        "new_count": new_count,
        "matching_count": len(matching_listings),
        "matches": matching_listings[:15],
    }
