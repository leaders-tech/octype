"""Provide shared backend test fixtures for the aiohttp test app.

Edit this file when many backend tests need the same fixture or helper.
Copy fixture patterns here when you add another shared backend test helper.
"""

from __future__ import annotations

import pytest
from aiohttp.test_utils import TestClient

from backend.config import Settings
from backend.main import create_app


@pytest.fixture
def test_settings() -> Settings:
    return Settings(
        mode="test",
        host="127.0.0.1",
        port=8081,
        frontend_origin="http://127.0.0.1:5101",
        # Tests never talk to the real GitHub: this port is closed unless a test starts a fake server.
        github_api_url="http://127.0.0.1:9",
    )


@pytest.fixture
async def app(test_settings: Settings):
    return create_app(test_settings)


@pytest.fixture
async def client(aiohttp_client, app) -> TestClient:
    return await aiohttp_client(app)
