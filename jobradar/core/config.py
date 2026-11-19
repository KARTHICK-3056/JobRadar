"""Configuration loader for JobRadar."""
from pathlib import Path
from typing import Any, Dict, List, Optional
import os
import yaml
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class SourceConfig(BaseModel):
    id: str
    name: str
    type: str  # greenhouse, lever, html
    base_url: str
    board_token: Optional[str] = None
    company: Optional[str] = None
    refresh_interval_minutes: int = 60
    enabled: bool = True
    mentor_approved: bool = True
    selectors: Optional[Dict[str, str]] = None
    filter_keywords: Optional[Dict[str, Any]] = None


class AppSettings(BaseModel):
    database_url: str = "sqlite:///jobradar.db"
    user_agent: str = "JobRadarBot/1.0 (student project; contact: student@university.edu)"
    request_timeout: int = 15
    default_request_delay: float = 2.0
    max_requests_per_run: int = 10
    max_pages_per_run: int = 5
    consecutive_misses_for_removal: int = 2
    stale_threshold_multiplier: float = 2.0
    cors_origins: List[str] = Field(default_factory=lambda: ["*"])
    snapshot_dir: str = "snapshots"
    fixture_dir: str = "fixtures"
    sources: List[SourceConfig] = Field(default_factory=list)


def load_settings(base_path: Optional[Path] = None) -> AppSettings:
    """Load configuration from settings.yaml, sources.yaml, and env vars."""
    root = base_path or BASE_DIR
    settings_path = root / "config" / "settings.yaml"
    sources_path = root / "config" / "sources.yaml"

    data: Dict[str, Any] = {}
    if settings_path.exists():
        with open(settings_path, "r", encoding="utf-8") as f:
            loaded = yaml.safe_load(f)
            if loaded:
                data.update(loaded)

    sources_list: List[Dict[str, Any]] = []
    if sources_path.exists():
        with open(sources_path, "r", encoding="utf-8") as f:
            s_loaded = yaml.safe_load(f)
            if s_loaded and "sources" in s_loaded:
                sources_list = s_loaded["sources"]

    # Environment variable overrides
    if os.getenv("DATABASE_URL"):
        data["database_url"] = os.getenv("DATABASE_URL")
    if os.getenv("USER_AGENT"):
        data["user_agent"] = os.getenv("USER_AGENT")
    if os.getenv("REQUEST_TIMEOUT"):
        data["request_timeout"] = int(os.getenv("REQUEST_TIMEOUT"))
    if os.getenv("DEFAULT_REQUEST_DELAY"):
        data["default_request_delay"] = float(os.getenv("DEFAULT_REQUEST_DELAY"))
    if os.getenv("CONSECUTIVE_MISSES_FOR_REMOVAL"):
        data["consecutive_misses_for_removal"] = int(os.getenv("CONSECUTIVE_MISSES_FOR_REMOVAL"))

    data["sources"] = [SourceConfig(**s) for s in sources_list]
    return AppSettings(**data)
