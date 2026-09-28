"""Handle the JSON endpoints: health check and the latest Octype release.

Edit this file when app endpoints change.
Copy the route pattern here when you add another endpoint.
"""

from __future__ import annotations

from aiohttp import web

from backend.http.json_api import ok


async def health(request: web.Request) -> web.Response:
    return ok({"status": "ok"})


async def latest_release(request: web.Request) -> web.Response:
    release = await request.app["releases"].get(request.app["http_session"])
    return ok({"release": release})


def setup_api_routes(app: web.Application) -> None:
    app.router.add_get("/api/health", health)
    app.router.add_post("/api/release/latest", latest_release)
