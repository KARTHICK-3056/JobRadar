"""Tests for compliance, ethics, robots.txt, rate limiting, and redaction."""
import pytest
from unittest.mock import MagicMock, patch
import requests

from jobradar.adapters.base import make_snippet, sanitize_text
from jobradar.compliance.compliance import (
    CompliantHttpClient,
    MaxRequestsExceededError,
    RateLimitedError,
    RobotsChecker,
    RobotsDisallowedError,
    SourceBlockedError,
)


def test_sensitive_data_redaction():
    """Verify recruiter personal contacts (emails, phones) are sanitized."""
    text_with_contacts = "Contact recruiter at recruiter.jane@company.com or call +1 (555) 234-5678 for details."
    sanitized = sanitize_text(text_with_contacts)
    assert "[REDACTED_EMAIL]" in sanitized
    assert "[REDACTED_PHONE]" in sanitized
    assert "recruiter.jane@company.com" not in sanitized
    assert "555" not in sanitized


def test_snippet_generation_does_not_republish_full_page():
    """Verify snippet length limit prevents full-page republication."""
    long_desc = "This is a great student internship program. " * 30
    snippet = make_snippet(long_desc, max_length=100)
    assert len(snippet) <= 103  # 100 + "..."
    assert snippet.endswith("...")


def test_robots_txt_allow_and_disallow():
    """Verify robots.txt checker obeys allow/disallow rules."""
    checker = RobotsChecker("JobRadarBot/1.0")

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.text = """
User-agent: *
Disallow: /private/
Allow: /jobs/
"""
    with patch("requests.get", return_value=mock_resp):
        allowed = checker.is_allowed("https://example.com/jobs/software-engineer")
        disallowed = checker.is_allowed("https://example.com/private/admin")
        assert allowed is True
        assert disallowed is False


def test_http_429_stops_source_and_parses_retry_after():
    """Verify HTTP 429 raises RateLimitedError and extracts Retry-After header."""
    client = CompliantHttpClient(user_agent="JobRadarBot/1.0", delay_seconds=0)

    mock_resp = MagicMock()
    mock_resp.status_code = 429
    mock_resp.headers = {"Retry-After": "45"}

    with patch.object(client.robots_checker, "is_allowed", return_value=True):
        with patch.object(client.session, "get", return_value=mock_resp):
            with pytest.raises(RateLimitedError) as exc_info:
                client.get("https://api.example.com/jobs")
            assert exc_info.value.retry_after == 45


def test_http_403_raises_source_blocked():
    """Verify HTTP 403 halts crawl without bypassing anti-bot controls."""
    client = CompliantHttpClient(user_agent="JobRadarBot/1.0", delay_seconds=0)

    mock_resp = MagicMock()
    mock_resp.status_code = 403

    with patch.object(client.robots_checker, "is_allowed", return_value=True):
        with patch.object(client.session, "get", return_value=mock_resp):
            with pytest.raises(SourceBlockedError):
                client.get("https://example.com/jobs")


def test_max_requests_enforcement():
    """Verify max requests per run limit is strictly enforced."""
    client = CompliantHttpClient(user_agent="JobRadarBot/1.0", delay_seconds=0, max_requests=2)

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.text = "ok"

    with patch.object(client.robots_checker, "is_allowed", return_value=True):
        with patch.object(client.session, "get", return_value=mock_resp):
            client.get("https://example.com/1")
            client.get("https://example.com/2")
            with pytest.raises(MaxRequestsExceededError):
                client.get("https://example.com/3")
