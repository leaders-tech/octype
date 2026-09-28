# Backend Agent Notes

- This backend is for students, so code should be obvious on first reading.
- Use `aiohttp`, plain functions, and small modules.
- The backend has no database. It serves `/api/health` and `/api/release/latest` (see `backend/releases.py`).
- Outside HTTP calls go through the shared `aiohttp.ClientSession` in `app["http_session"]`, with a timeout and a
  cached fallback so the page never breaks when the outside service is down.
- Return only the shared JSON envelope shape.
- Keep production same-origin for this template. Do not add cross-origin production CORS unless the architecture changes.
- Keep browser-facing JSON endpoints as POST routes in this template unless the user explicitly changes that rule.
- Keep browser-facing JSON endpoints under `/api/...` and keep websocket at `/ws` unless the user explicitly changes the routing model.
- In Docker/tlfpaas, keep the backend listening on `0.0.0.0:8081`.
- If persistent data is ever needed, keep it under `/data` with a named volume (see `docs/tlfpaas-autodeploy.md`).
- Keep `backend/Dockerfile` final runtime stage non-root with `USER app`; do not add Compose `user:` to solve runtime
  permissions.
- Hidden backend agent commands:
  - `make aback`, `make aback-once`, `make astop`
  - `make apost API_PATH=/api/... BODY='{}'`
  - `make ahealth`
- Hidden backend agent runtime reads `.agent.env`.
- Do not introduce ORM, DI, pydantic, or generic service layers.
- Add backend tests for each new endpoint and error path that matters. Tests must never call the real GitHub API.
- After every change, run `uv run pytest` and make sure all tests pass before calling the task done.
- Do not skip or delete a failing test — fix the code or update the test to match the new correct behavior.
- If a backend change affects browser behavior, make sure frontend/e2e coverage exists too.
- Start each backend source file with a short simple-English docstring that says what the file does, when to edit it, and whether it can be copied for a similar backend feature.
- Normal backend growth pattern:
  - add or update a small helper module in `backend/`;
  - add or update the route handler file;
  - register the route in `setup_*_routes`;
  - add backend tests;
  - add frontend and e2e coverage if the browser flow changed.
- Add a new backend file when the new block is a different feature group or a different route group.
- Extend an existing backend file only when the new function clearly belongs to the same small topic.
- Add backend Python packages with `uv add` for runtime deps and `uv add --dev` for dev-only deps.
