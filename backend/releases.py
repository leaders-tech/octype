"""Look up the latest Octype release on GitHub and keep it in a small in-memory cache.

Edit this file when the release source, the cached fields, or the fallback behavior changes.
Copy the cache pattern here when you add another small read-only lookup of an outside API.
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any

import aiohttp

from backend.config import Settings

LOGGER = logging.getLogger("backend.releases")
FETCH_TIMEOUT = aiohttp.ClientTimeout(total=6)


def release_from_github(payload: dict[str, Any], page_url: str) -> dict[str, Any]:
    """Turn a GitHub "latest release" payload into the small shape the site needs."""
    tag = str(payload.get("tag_name") or "").strip()
    dmg = next(
        (asset for asset in payload.get("assets") or [] if str(asset.get("name", "")).lower().endswith(".dmg")),
        None,
    )
    return {
        "version": tag.removeprefix("v") or None,
        "published_at": payload.get("published_at"),
        "page_url": payload.get("html_url") or page_url,
        "dmg_url": dmg.get("browser_download_url") if dmg else None,
        "dmg_size": dmg.get("size") if dmg else None,
        "source": "github",
    }


def fallback_release(page_url: str) -> dict[str, Any]:
    return {"version": None, "published_at": None, "page_url": page_url, "dmg_url": None, "dmg_size": None, "source": "fallback"}


class ReleaseCache:
    """Remembers the last good answer so GitHub is asked at most once per cache window."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.value: dict[str, Any] | None = None
        self.fetched_at = 0.0
        self.lock = asyncio.Lock()

    async def get(self, session: aiohttp.ClientSession) -> dict[str, Any]:
        async with self.lock:
            if self.value is not None and time.monotonic() - self.fetched_at < self.settings.release_cache_seconds:
                return self.value
            try:
                self.value = await self.fetch(session)
                self.fetched_at = time.monotonic()
                LOGGER.info("Latest release is %s (%s).", self.value["version"], self.value["dmg_url"])
            except (aiohttp.ClientError, TimeoutError, ValueError) as error:
                LOGGER.warning("Could not load the latest release from GitHub: %r", error)
                if self.value is not None:
                    return self.value
                return fallback_release(self.settings.release_page_url)
            return self.value

    async def fetch(self, session: aiohttp.ClientSession) -> dict[str, Any]:
        url = f"{self.settings.github_api_url.rstrip('/')}/repos/{self.settings.release_repo}/releases/latest"
        headers = {"Accept": "application/vnd.github+json", "User-Agent": "octype-site"}
        async with session.get(url, headers=headers, timeout=FETCH_TIMEOUT) as response:
            if response.status != 200:
                raise ValueError(f"GitHub answered {response.status} for {url}")
            payload = await response.json()
        if not isinstance(payload, dict):
            raise ValueError("GitHub returned an unexpected release payload.")
        return release_from_github(payload, self.settings.release_page_url)
