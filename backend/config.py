"""Load backend settings from .env and keep them in one Settings object.

Edit this file when env variables, ports, or dev/prod defaults change.
Do not copy this file. Change it when the app configuration model changes.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parent.parent
DEFAULT_RELEASE_REPO = "levbern/Octype"
DEFAULT_GITHUB_API_URL = "https://api.github.com"


@dataclass(slots=True)
class Settings:
    mode: str
    host: str
    port: int
    frontend_origin: str
    debug_logs: bool = True
    release_repo: str = DEFAULT_RELEASE_REPO
    github_api_url: str = DEFAULT_GITHUB_API_URL
    release_cache_seconds: int = 10 * 60

    @property
    def allowed_origins(self) -> set[str]:
        origins = {self.frontend_origin.rstrip("/")}
        if self.mode != "prod":
            origins.add(f"http://{self.host}:{self.port}")
            parsed = urlsplit(self.frontend_origin)
            if parsed.hostname == "127.0.0.1":
                origins.add(urlunsplit((parsed.scheme, f"localhost:{parsed.port}", parsed.path, parsed.query, parsed.fragment)).rstrip("/"))
            if parsed.hostname == "localhost":
                origins.add(urlunsplit((parsed.scheme, f"127.0.0.1:{parsed.port}", parsed.path, parsed.query, parsed.fragment)).rstrip("/"))
        return origins

    @property
    def release_page_url(self) -> str:
        return f"https://github.com/{self.release_repo}/releases/latest"


def load_settings() -> Settings:
    load_dotenv(ROOT_DIR / ".env")
    mode = os.getenv("APP_MODE", "dev").strip().lower()
    host = os.getenv("APP_HOST", "localhost").strip()
    port = int(os.getenv("APP_PORT", "3101"))
    frontend_public_host = os.getenv("FRONTEND_PUBLIC_HOST", "localhost").strip()
    frontend_port = os.getenv("FRONTEND_PORT", "5101").strip()
    frontend_origin = os.getenv("FRONTEND_ORIGIN", f"http://{frontend_public_host}:{frontend_port}").rstrip("/")
    debug_logs = parse_bool_env(os.getenv("APP_DEBUG_LOGS"), default=mode != "prod")
    release_repo = os.getenv("RELEASE_REPO", DEFAULT_RELEASE_REPO).strip() or DEFAULT_RELEASE_REPO
    return Settings(
        mode=mode,
        host=host,
        port=port,
        frontend_origin=frontend_origin,
        debug_logs=debug_logs,
        release_repo=release_repo,
    )


def parse_bool_env(value: str | None, *, default: bool) -> bool:
    if value is None or value.strip() == "":
        return default
    normalized = value.strip().lower()
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    raise ValueError(f"Expected a boolean env value, got {value!r}. Use 1 or 0.")
