"""Adapters package and factory."""
from jobradar.adapters.base import BaseAdapter, make_snippet, sanitize_text
from jobradar.adapters.greenhouse import GreenhouseAdapter
from jobradar.adapters.lever import LeverAdapter
from jobradar.adapters.html import HtmlAdapter, SelectorMismatchError
from jobradar.adapters.factory import get_adapter

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
