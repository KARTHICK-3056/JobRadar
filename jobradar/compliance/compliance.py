"""Compliance and ethical web crawling layer for JobRadar.

Strictly enforces:
- robots.txt compliance via urllib.robotparser
- Descriptive student User-Agent
- Explicit timeout and polite request delays (>=2s)
- Request rate-limiting (max requests / max pages per run)
- Exponential backoff with jitter on transient errors (5xx, timeouts)
- Hard stop on 403 (blocked) and 429 (rate-limited) honoring Retry-After
- Never bypassing CAPTCHAs, logins, or anti-bot controls
"""
import logging
import random
import time
from typing import Dict, Optional
import urllib.parse
import urllib.robotparser
import requests

logger = logging.getLogger("jobradar.compliance")


class ComplianceError(Exception):
    """Base class for compliance and ethical crawling exceptions."""
    pass


class RobotsDisallowedError(ComplianceError):
    """Raised when robots.txt forbids crawling the requested URL."""
    pass


class SourceBlockedError(ComplianceError):
    """Raised when an HTTP 403 Forbidden is encountered."""
    def __init__(self, message: str = "Source returned HTTP 403 Forbidden"):
        super().__init__(message)


class RateLimitedError(ComplianceError):
    """Raised when an HTTP 429 Too Many Requests is encountered."""
    def __init__(self, retry_after: Optional[int] = None, message: str = "Source returned HTTP 429 Too Many Requests"):
        self.retry_after = retry_after
        super().__init__(f"{message} (Retry-After: {retry_after}s)" if retry_after else message)


class MaxRequestsExceededError(ComplianceError):
    """Raised when a run exceeds max allowed requests."""
    pass


class RobotsChecker:
    """Manages and caches robots.txt rules."""
    def __init__(self, user_agent: str):
        self.user_agent = user_agent
        self._cache: Dict[str, urllib.robotparser.RobotFileParser] = {}

    def get_robots_url(self, target_url: str) -> str:
        parsed = urllib.parse.urlparse(target_url)
        return f"{parsed.scheme}://{parsed.netloc}/robots.txt"

    def is_allowed(self, target_url: str, session: Optional[requests.Session] = None) -> bool:
        """Check if target_url can be fetched according to robots.txt."""
        parsed = urllib.parse.urlparse(target_url)
        origin = f"{parsed.scheme}://{parsed.netloc}"
        
        if origin not in self._cache:
            robots_url = self.get_robots_url(target_url)
            rp = urllib.robotparser.RobotFileParser()
            rp.set_url(robots_url)
            try:
                # Fetch robots.txt with polite timeout
                resp = (session or requests).get(
                    robots_url,
                    headers={"User-Agent": self.user_agent},
                    timeout=10,
                )
                if resp.status_code in (200, 304):
                    rp.parse(resp.text.splitlines())
                    logger.info("Parsed robots.txt from %s: successfully loaded", robots_url)
                elif resp.status_code in (401, 403):
                    logger.warning("Robots.txt at %s returned %d: disallowing crawl", robots_url, resp.status_code)
                    rp.disallow_all = True
                else:
                    logger.info("Robots.txt at %s returned status %d: allowing crawl by default", robots_url, resp.status_code)
                    rp.allow_all = True
            except Exception as exc:
                logger.warning("Could not fetch %s (%s); defaulting to allow", robots_url, exc)
                rp.allow_all = True
            self._cache[origin] = rp

        parser = self._cache[origin]
        allowed = parser.can_fetch(self.user_agent, target_url)
        logger.info(
            "Robots.txt check for '%s' with User-Agent '%s': %s",
            target_url,
            self.user_agent,
            "ALLOWED" if allowed else "DISALLOWED",
        )
        return allowed


class CompliantHttpClient:
    """HTTP client adhering to polite rate limits, exponential backoff, and robots exclusion."""

    def __init__(
        self,
        user_agent: str,
        timeout: int = 15,
        delay_seconds: float = 2.0,
        max_requests: int = 10,
        max_retries: int = 3,
        backoff_factor: float = 1.5,
    ):
        self.user_agent = user_agent
        self.timeout = timeout
        self.delay_seconds = delay_seconds
        self.max_requests = max_requests
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor

        self.robots_checker = RobotsChecker(user_agent)
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": self.user_agent})
        self.request_count = 0
        self.last_request_time: Optional[float] = None

    def _enforce_delay(self):
        """Enforce polite configurable delay between requests."""
        if self.last_request_time is not None and self.delay_seconds > 0:
            elapsed = time.time() - self.last_request_time
            if elapsed < self.delay_seconds:
                sleep_needed = self.delay_seconds - elapsed
                logger.debug("Polite rate delay: sleeping for %.2fs", sleep_needed)
                time.sleep(sleep_needed)

    def _parse_retry_after(self, response: requests.Response) -> Optional[int]:
        header = response.headers.get("Retry-After")
        if not header:
            return None
        try:
            return int(header)
        except ValueError:
            return 60  # Default fallback if HTTP-date or non-integer

    def get(self, url: str, check_robots: bool = True, **kwargs) -> requests.Response:
        """Perform compliant GET request with retries, jitter, and safety stops."""
        if self.request_count >= self.max_requests:
            logger.error("Max requests per run (%d) reached.", self.max_requests)
            raise MaxRequestsExceededError(f"Exceeded max requests per run ({self.max_requests})")

        if check_robots:
            if not self.robots_checker.is_allowed(url, session=self.session):
                logger.error("Crawling disallowed by robots.txt for URL: %s", url)
                raise RobotsDisallowedError(f"Robots.txt disallows crawling {url}")

        attempt = 0
        headers = kwargs.pop("headers", {})
        merged_headers = {"User-Agent": self.user_agent}
        merged_headers.update(headers)

        while True:
            attempt += 1
            self._enforce_delay()
            self.request_count += 1
            self.last_request_time = time.time()

            try:
                logger.info("Compliant GET (attempt %d/%d): %s", attempt, self.max_retries + 1, url)
                response = self.session.get(
                    url,
                    headers=merged_headers,
                    timeout=kwargs.pop("timeout", self.timeout),
                    **kwargs,
                )

                # Hard Stop on Rate Limit or Block
                if response.status_code == 429:
                    retry_after = self._parse_retry_after(response)
                    logger.error("Received HTTP 429 Too Many Requests from %s. Halting source crawl.", url)
                    raise RateLimitedError(retry_after=retry_after)

                if response.status_code == 403:
                    logger.error("Received HTTP 403 Forbidden from %s. Halting source crawl.", url)
                    raise SourceBlockedError(f"HTTP 403 Forbidden from {url}")

                # Retry on Transient Server Errors (5xx)
                if response.status_code in (500, 502, 503, 504):
                    if attempt <= self.max_retries:
                        backoff = (self.backoff_factor ** attempt) + random.uniform(0.1, 0.8)
                        logger.warning(
                            "Transient HTTP %d from %s. Backing off for %.2fs before retry.",
                            response.status_code,
                            url,
                            backoff,
                        )
                        time.sleep(backoff)
                        continue

                return response

            except (requests.Timeout, requests.ConnectionError) as exc:
                if attempt <= self.max_retries:
                    backoff = (self.backoff_factor ** attempt) + random.uniform(0.1, 0.8)
                    logger.warning(
                        "Network error (%s) requesting %s. Backing off for %.2fs before retry.",
                        type(exc).__name__,
                        url,
                        backoff,
                    )
                    time.sleep(backoff)
                    continue
                logger.error("Max retries exceeded for %s due to %s", url, exc)
                raise
