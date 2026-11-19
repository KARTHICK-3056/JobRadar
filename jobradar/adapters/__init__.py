"""Adapters package and factory."""
from typing import Optional
from jobradar.adapters.base import BaseAdapter, make_snippet, sanitize_text
from jobradar.adapters.greenhouse import GreenhouseAdapter
from jobradar.adapters.lever import LeverAdapter
from jobradar.adapters.html import HtmlAdapter, SelectorMismatchError
from jobradar.compliance.compliance import CompliantHttpClient
from jobradar.core.config import SourceConfig


def get_adapter(source_config: SourceConfig, http_client: Optional[CompliantHttpClient] = None) -> BaseAdapter:
    """Factory creating appropriate adapter for source configuration."""
    adapter_type = source_config.type.lower()
    if adapter_type == "greenhouse":
        return GreenhouseAdapter(source_config, http_client)
    elif adapter_type == "lever":
        return LeverAdapter(source_config, http_client)
    elif adapter_type == "html":
        return HtmlAdapter(source_config, http_client)
    else:
        raise ValueError(f"Unsupported source adapter type: '{source_config.type}'")


__all__ = [
    "BaseAdapter",
    "GreenhouseAdapter",
    "LeverAdapter",
    "HtmlAdapter",
    "SelectorMismatchError",
    "get_adapter",
    "make_snippet",
    "sanitize_text",
]
