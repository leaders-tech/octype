"""Build and run the backend aiohttp application.

Edit this file when startup, cleanup, or top-level route setup changes.
Do not copy this file. Change it when the whole backend app boot flow changes.
"""

from __future__ import annotations

import logging

import aiohttp
from aiohttp import web

from backend.config import Settings, load_settings
from backend.http.middleware import cors_middleware, error_middleware, request_logging_middleware
from backend.http.routes import setup_api_routes
from backend.logging_config import configure_logging
from backend.releases import ReleaseCache

LOGGER = logging.getLogger("backend.app")


async def on_startup(app: web.Application) -> None:
    settings: Settings = app["settings"]
    LOGGER.info(
        "Starting backend mode=%s host=%s port=%s frontend=%s release_repo=%s debug_logs=%s",
        settings.mode,
        settings.host,
        settings.port,
        settings.frontend_origin,
        settings.release_repo,
        settings.debug_logs,
    )
    app["http_session"] = aiohttp.ClientSession()
    LOGGER.info("Backend startup finished.")


async def on_cleanup(app: web.Application) -> None:
    session = app.get("http_session")
    if session is not None:
        await session.close()
        LOGGER.info("HTTP client session closed.")


def create_app(settings: Settings | None = None) -> web.Application:
    resolved_settings = settings or load_settings()
    configure_logging(resolved_settings)
    app = web.Application(middlewares=[request_logging_middleware, error_middleware, cors_middleware])
    app["settings"] = resolved_settings
    app["releases"] = ReleaseCache(resolved_settings)

    setup_api_routes(app)

    app.on_startup.append(on_startup)
    app.on_cleanup.append(on_cleanup)
    return app


def run() -> None:
    settings = load_settings()
    web.run_app(create_app(settings), host=settings.host, port=settings.port)


if __name__ == "__main__":
    run()
