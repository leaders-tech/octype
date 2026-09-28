"""Test the health endpoint and the cached latest-release endpoint.

Edit this file when the release payload, cache, or fallback behavior changes.
Copy a test pattern here when you add another endpoint that reads an outside API.
"""

from __future__ import annotations

from dataclasses import replace

from aiohttp import web

from backend.main import create_app
from backend.releases import release_from_github

GITHUB_PAYLOAD = {
    "tag_name": "v1.2.0",
    "html_url": "https://github.com/levbern/Octype/releases/tag/v1.2.0",
    "published_at": "2026-09-25T12:24:27Z",
    "assets": [
        {"name": "notes.txt", "browser_download_url": "https://example.com/notes.txt", "size": 10},
        {"name": "Octype-1.2.0.dmg", "browser_download_url": "https://example.com/Octype-1.2.0.dmg", "size": 8116224},
    ],
}


async def start_fake_github(aiohttp_server, status: int = 200):
    calls: list[str] = []

    async def latest(request: web.Request) -> web.Response:
        calls.append(request.path)
        if status != 200:
            return web.json_response({"message": "Not Found"}, status=status)
        return web.json_response(GITHUB_PAYLOAD)

    fake = web.Application()
    fake.router.add_get("/repos/levbern/Octype/releases/latest", latest)
    server = await aiohttp_server(fake)
    return server, calls


async def test_health(client) -> None:
    response = await client.get("/api/health")
    assert response.status == 200
    assert await response.json() == {"ok": True, "data": {"status": "ok"}}


def test_release_from_github_picks_the_dmg() -> None:
    release = release_from_github(GITHUB_PAYLOAD, "https://github.com/levbern/Octype/releases/latest")
    assert release == {
        "version": "1.2.0",
        "published_at": "2026-09-25T12:24:27Z",
        "page_url": "https://github.com/levbern/Octype/releases/tag/v1.2.0",
        "dmg_url": "https://example.com/Octype-1.2.0.dmg",
        "dmg_size": 8116224,
        "source": "github",
    }


async def test_latest_release_is_fetched_once_and_cached(aiohttp_client, aiohttp_server, test_settings) -> None:
    server, calls = await start_fake_github(aiohttp_server)
    client = await aiohttp_client(create_app(replace(test_settings, github_api_url=str(server.make_url("")))))

    first = await (await client.post("/api/release/latest", json={})).json()
    second = await (await client.post("/api/release/latest", json={})).json()

    assert first["ok"] is True
    assert first["data"]["release"]["version"] == "1.2.0"
    assert first["data"]["release"]["dmg_url"] == "https://example.com/Octype-1.2.0.dmg"
    assert second == first
    assert len(calls) == 1


async def test_latest_release_falls_back_when_github_fails(aiohttp_client, aiohttp_server, test_settings) -> None:
    server, _calls = await start_fake_github(aiohttp_server, status=404)
    client = await aiohttp_client(create_app(replace(test_settings, github_api_url=str(server.make_url("")))))

    response = await client.post("/api/release/latest", json={})
    payload = await response.json()

    assert response.status == 200
    assert payload["data"]["release"] == {
        "version": None,
        "published_at": None,
        "page_url": "https://github.com/levbern/Octype/releases/latest",
        "dmg_url": None,
        "dmg_size": None,
        "source": "fallback",
    }


async def test_latest_release_falls_back_when_github_is_unreachable(client) -> None:
    response = await client.post("/api/release/latest", json={})
    payload = await response.json()
    assert payload["data"]["release"]["source"] == "fallback"
