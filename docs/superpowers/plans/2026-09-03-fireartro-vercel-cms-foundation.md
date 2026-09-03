# FireArtRo Vercel CMS Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the existing CRA frontend and FastAPI API together in one Vercel project and protect `/admin` with a secure server-side session.

**Architecture:** A Vercel Python Function exposes the existing FastAPI app under `/api/*`, while the SPA fallback handles only public frontend routes. Authentication uses a bcrypt password hash from Vercel environment variables, an opaque HttpOnly cookie, MongoDB-backed expiring sessions, CSRF validation, and persistent login throttling.

**Tech Stack:** React 19, CRA/CRACO, FastAPI 0.110.1, Motor/PyMongo, bcrypt, MongoDB Atlas, Vercel Python Functions, Jest, pytest.

## Global Constraints

- Owner amendment 2026-09-03: prepare locally only; no Vercel login/link/provisioning/deployment. Vercel-build/platform checks remain documented for the later connection phase. Local API/frontend and database tests are authorized.

- Keep the existing React/FastAPI repository and deploy it as one Vercel project.
- Autosave never changes the public site; only `Publică modificările` publishes.
- No password, password hash, API key, session token, CSRF token, or Blob token may be stored in localStorage or a `REACT_APP_*` variable.
- Admin responses use `Cache-Control: no-store`.
- Production, Preview, and Development use distinct MongoDB databases.
- Preserve existing public routes and visual behavior while the foundation is introduced.

**Cross-plan order:** Complete this foundation first. Then execute Content Publishing Tasks 1-3, Admin Operations Task 1, Content Publishing Tasks 4-5, Admin Operations Tasks 2-7, and finally the Rollout plan.

---

## File structure

- `api/index.py`: Vercel ASGI entrypoint for the existing FastAPI app.
- `requirements.txt`: root dependency bridge used by Vercel's Python runtime.
- `vercel.json`: hybrid frontend/API routing, headers, and function configuration.
- `backend/auth.py`: authentication models, session repository, throttling, cookies, and CSRF dependency.
- `backend/server.py`: constructs and wires the authentication service/router.
- `backend/tests/test_auth.py`: deterministic authentication and authorization contract.
- `backend/tests/test_vercel_entrypoint.py`: import and routing smoke test.
- `frontend/src/lib/adminApi.js`: same-origin Admin session client and normalized errors.
- `frontend/src/lib/adminApi.test.js`: request credential and CSRF tests.
- `frontend/src/admin/AdminSessionContext.jsx`: session lifecycle and protected mutation helper.
- `frontend/src/admin/AdminSessionContext.test.jsx`: session restoration and expiry tests.
- `frontend/src/admin/AdminLogin.jsx`: accessible FireArtRo login screen.
- `frontend/src/admin/AdminLogin.test.jsx`: credential/error and browser-storage tests.
- `frontend/src/admin/AdminGate.jsx`: loading/login/authenticated boundary.
- `frontend/src/pages/AdminPage.jsx`: mounts the authenticated Admin workspace.
- `frontend/src/admin.css`: login and session-state presentation.

### Task 1: Make CRA and FastAPI coexist in one Vercel deployment

**Files:**
- Create: `api/index.py`
- Create: `requirements.txt`
- Create: `.python-version`
- Create: `backend/requirements-dev.txt`
- Modify: `backend/requirements.txt`
- Modify: `vercel.json`
- Test: `backend/tests/test_vercel_entrypoint.py`

**Interfaces:**
- Consumes: `backend.server.app: FastAPI`.
- Produces: an ASGI variable named `app` reachable through `/api/*`, with all non-API routes falling back to `frontend/build/index.html`.

- [ ] **Step 1: Write the failing Vercel entrypoint smoke test**

```python
import importlib


def test_vercel_entrypoint_exports_fireartro_fastapi_app(monkeypatch):
    monkeypatch.setenv("MONGO_URL", "mongodb://localhost:27017")
    monkeypatch.setenv("DB_NAME", "fireartro_test")
    module = importlib.import_module("api.index")
    assert module.app.title == "FireArtRo API"
    assert any(route.path == "/api/" for route in module.app.routes)
```

- [ ] **Step 2: Run the smoke test and verify the missing entrypoint failure**

Run: `python -m pytest backend/tests/test_vercel_entrypoint.py -q`

Expected: FAIL because `api.index` does not exist.

- [ ] **Step 3: Add the root entrypoint and Python dependency bridge**

```python
# api/index.py
from pathlib import Path
import sys

BACKEND_DIR = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from server import app  # noqa: E402,F401
```

```text
# requirements.txt
-r backend/requirements.txt
```

```text
# .python-version
3.12
```

Reduce `backend/requirements.txt` to runtime imports (`fastapi`, `uvicorn`, `python-dotenv`, `pymongo`, `motor`, `pydantic`, `email-validator`, `bcrypt`, `python-multipart`, `httpx`, and `vercel==0.10.0`). Move `pytest`, formatters, type checkers, and other development-only packages to `backend/requirements-dev.txt`. Remove unused heavy runtime packages such as `pandas`, `numpy`, `boto3`, and `emergentintegrations` so the Vercel Function remains comfortably below its bundle limit.

```text
# backend/requirements-dev.txt
-r requirements.txt
pytest>=8.0,<9
pytest-asyncio>=0.24,<1
black>=24.1,<25
isort>=5.13,<6
flake8>=7.0,<8
mypy>=1.8,<2
```

Update `vercel.json` so `/api/:path*` is resolved by the Python function before the SPA fallback, and configure `api/index.py` with a 60-second maximum duration and `backend/**` included in the function bundle. Keep the existing CRA install/build/output settings and security headers.

- [ ] **Step 4: Run the entrypoint and existing backend tests**

Run: `python -m pytest backend/tests/test_vercel_entrypoint.py backend/tests/test_blog.py backend/tests/test_quotes.py backend/tests/test_reviews.py -q`

Expected: PASS.

- [ ] **Step 5: Verify route precedence from the generated Vercel config**

Run: `npx vercel@latest build --yes`

Expected: the build contains `frontend/build` plus a Python function, and `/api/` is not resolved to `index.html`.

- [ ] **Step 6: Commit the hybrid deployment foundation**

```bash
git add api/index.py requirements.txt .python-version backend/requirements.txt backend/requirements-dev.txt vercel.json backend/tests/test_vercel_entrypoint.py
git commit -m "build: deploy frontend and api together on Vercel"
```

### Task 2: Build the MongoDB-backed Admin session service

**Files:**
- Create: `backend/auth.py`
- Create: `backend/tests/test_auth.py`

**Interfaces:**
- Consumes: an AsyncIOMotor collection-like session store, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `ADMIN_SESSION_SECRET`.
- Produces: `AuthService.login(username, password, client_ip, user_agent)`, `AuthService.authenticate(raw_token)`, `AuthService.logout(raw_token)`, `require_admin_session(request, x_csrf_token)`, and `create_auth_router(service)`.

- [ ] **Step 1: Write failing service tests with an in-memory repository**

```python
async def test_login_creates_hashed_expiring_session(auth_service, sessions):
    result = await auth_service.login("admin", "correct horse", "127.0.0.1", "pytest")
    assert result.raw_token
    assert result.csrf_token
    stored = sessions.documents[0]
    assert stored["token_hash"] != result.raw_token
    assert stored["expires_at"] > stored["created_at"]


async def test_invalid_credentials_do_not_create_session(auth_service, sessions):
    with pytest.raises(AuthError):
        await auth_service.login("admin", "wrong", "127.0.0.1", "pytest")
    assert sessions.documents == []
```

Add tests for expired sessions, revoked sessions, logout, CSRF mismatch, missing environment configuration, and throttling after five failures within ten minutes.

- [ ] **Step 2: Run the focused tests and verify missing symbols**

Run: `python -m pytest backend/tests/test_auth.py -q`

Expected: FAIL because `backend/auth.py` does not exist.

- [ ] **Step 3: Implement authentication models and service**

```python
@dataclass(frozen=True)
class IssuedSession:
    raw_token: str
    csrf_token: str
    expires_at: datetime


class AuthService:
    async def login(self, username: str, password: str, client_ip: str, user_agent: str) -> IssuedSession:
        await self.attempts.assert_allowed(client_ip)
        password_matches = bcrypt.checkpw(password.encode("utf-8"), self.password_hash.encode("utf-8"))
        if not secrets.compare_digest(username, self.username) or not password_matches:
            await self.attempts.record_failure(client_ip)
            raise AuthError("Datele de autentificare nu sunt valide.")
        await self.attempts.clear(client_ip)
        raw_token = secrets.token_urlsafe(48)
        csrf_token = secrets.token_urlsafe(32)
        expires_at = utc_now() + timedelta(hours=12)
        await self.sessions.create(hash_token(raw_token, self.session_secret), hash_token(csrf_token, self.session_secret), expires_at, user_agent)
        return IssuedSession(raw_token, csrf_token, expires_at)
```

Store only HMAC-SHA256 token hashes. Define Mongo repositories with TTL-compatible `expires_at` datetimes and a login-attempt document keyed by an HMAC of the client IP.

- [ ] **Step 4: Implement the strict Admin dependency**

```python
async def require_admin_session(
    request: Request,
    x_csrf_token: str | None = Header(default=None),
) -> AdminIdentity:
    identity = await request.app.state.auth_service.authenticate(
        request.cookies.get(ADMIN_COOKIE_NAME, "")
    )
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        request.app.state.auth_service.verify_csrf(identity, x_csrf_token or "")
    return identity
```

The dependency must also reject non-same-origin protected mutations using the request `Origin` header when it is present.

- [ ] **Step 5: Run authentication tests**

Run: `python -m pytest backend/tests/test_auth.py -q`

Expected: PASS.

- [ ] **Step 6: Commit the authentication domain**

```bash
git add backend/auth.py backend/tests/test_auth.py
git commit -m "feat: add secure Admin sessions"
```

### Task 3: Expose authentication endpoints and readiness checks

**Files:**
- Modify: `backend/server.py`
- Modify: `backend/.env.example`
- Modify: `backend/tests/test_auth.py`

**Interfaces:**
- Consumes: `AuthService`, `MongoSessionRepository`, `MongoLoginAttemptRepository`, and `create_auth_router` from Task 2.
- Produces: `/api/admin/auth/login`, `/api/admin/auth/session`, `/api/admin/auth/logout`, `/api/health`, and `app.state.auth_service`.

- [ ] **Step 1: Write failing router tests**

```python
def test_login_sets_strict_secure_httponly_cookie(client):
    response = client.post("/api/admin/auth/login", json={"username": "admin", "password": "correct horse"})
    assert response.status_code == 200
    cookie = response.headers["set-cookie"]
    assert "HttpOnly" in cookie
    assert "Secure" in cookie
    assert "SameSite=strict" in cookie
    assert "Path=/api/admin" in cookie


def test_protected_post_rejects_missing_csrf(client, authenticated_cookie):
    response = client.post("/api/admin/auth/logout", cookies=authenticated_cookie)
    assert response.status_code == 403
```

Also assert generic `401`, revoked logout cookie, `Cache-Control: no-store`, and a readiness response that names missing configuration without exposing values.

- [ ] **Step 2: Run the router tests and verify 404 responses**

Run: `python -m pytest backend/tests/test_auth.py -q`

Expected: FAIL because the authentication router is not mounted.

- [ ] **Step 3: Wire repositories, indexes, router, and middleware**

```python
auth_service = AuthService(
    sessions=MongoSessionRepository(db.admin_sessions),
    attempts=MongoLoginAttemptRepository(db.admin_login_attempts),
    username=os.environ.get("ADMIN_USERNAME", ""),
    password_hash=os.environ.get("ADMIN_PASSWORD_HASH", ""),
    session_secret=os.environ.get("ADMIN_SESSION_SECRET", ""),
)
app.state.auth_service = auth_service
app.include_router(create_auth_router(auth_service))
```

At startup, create a TTL index on `admin_sessions.expires_at`, a unique index on `token_hash`, and an expiry index for login attempts. Extend CORS headers with `X-CSRF-Token` for local split-origin development while production remains same-origin.

- [ ] **Step 4: Document exact environment names**

```dotenv
MONGODB_URI=mongodb://localhost:27017
DB_NAME=fireartro_development
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_SECRET=
```

Keep `MONGO_URL` as a temporary backwards-compatible alias, preferring `MONGODB_URI` in code.

- [ ] **Step 5: Run backend regression tests**

Run: `python -m pytest backend/tests -q`

Expected: PASS.

- [ ] **Step 6: Commit router integration**

```bash
git add backend/server.py backend/.env.example backend/tests/test_auth.py
git commit -m "feat: expose Admin authentication API"
```

### Task 4: Replace the Admin-key prompt with a protected React session gate

**Files:**
- Create: `frontend/src/lib/adminApi.js`
- Create: `frontend/src/lib/adminApi.test.js`
- Create: `frontend/src/admin/AdminSessionContext.jsx`
- Create: `frontend/src/admin/AdminSessionContext.test.jsx`
- Create: `frontend/src/admin/AdminLogin.jsx`
- Create: `frontend/src/admin/AdminLogin.test.jsx`
- Create: `frontend/src/admin/AdminGate.jsx`
- Modify: `frontend/src/pages/AdminPage.jsx`
- Modify: `frontend/src/admin.css`

**Interfaces:**
- Consumes: the Task 3 authentication endpoints.
- Produces: `AdminSessionProvider`, `useAdminSession()`, `adminRequest(path, options)`, and `AdminGate`.

- [ ] **Step 1: Write failing API-client tests**

```javascript
test("Admin mutations send cookies and the current CSRF token", async () => {
  global.fetch = jest.fn().mockResolvedValue(okResponse({ ok: true }));
  await adminRequest("/api/admin/auth/logout", {
    method: "POST",
    csrfToken: "csrf-123",
  });
  expect(global.fetch).toHaveBeenCalledWith("/api/admin/auth/logout", expect.objectContaining({
    credentials: "same-origin",
    headers: expect.objectContaining({ "X-CSRF-Token": "csrf-123" }),
  }));
});
```

Add tests for normalized `401`, `403`, `409`, invalid JSON, and no CSRF header on public/session GET requests.

- [ ] **Step 2: Run the client tests and verify missing module failure**

Run: `cd frontend && yarn test --watchAll=false src/lib/adminApi.test.js`

Expected: FAIL because `adminApi.js` does not exist.

- [ ] **Step 3: Implement the same-origin Admin client**

```javascript
export async function adminRequest(path, { csrfToken, headers, ...options } = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: "same-origin",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      ...headers,
    },
  });
  const payload = await readJson(response);
  if (!response.ok) throw new AdminApiError(response.status, payload?.detail);
  return payload;
}
```

- [ ] **Step 4: Implement the session provider and gate**

```jsx
const value = {
  status,
  admin,
  csrfToken,
  login,
  logout,
  request: (path, options = {}) => adminRequest(path, { ...options, csrfToken }),
};

return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
```

`AdminGate` shows an accessible loading state, `AdminLogin` for anonymous sessions, and the existing Admin workspace only after `GET /api/admin/auth/session` succeeds.

- [ ] **Step 5: Add frontend component tests for login and expiry**

Create tests beside the new components that assert password fields are cleared after failed login, generic errors are announced, no credential reaches localStorage, and a later `401` returns the gate to login.

Run: `cd frontend && yarn test --watchAll=false src/lib/adminApi.test.js src/admin/AdminSessionContext.test.jsx src/admin/AdminLogin.test.jsx`

Expected: PASS.

- [ ] **Step 6: Build the frontend**

Run: `cd frontend && $env:NODE_OPTIONS='--max-old-space-size=8192'; yarn build`

Expected: `Compiled successfully.`

- [ ] **Step 7: Commit the authenticated Admin gate**

```bash
git add frontend/src/lib/adminApi.js frontend/src/lib/adminApi.test.js frontend/src/admin/AdminSessionContext.jsx frontend/src/admin/AdminSessionContext.test.jsx frontend/src/admin/AdminLogin.jsx frontend/src/admin/AdminLogin.test.jsx frontend/src/admin/AdminGate.jsx frontend/src/pages/AdminPage.jsx frontend/src/admin.css
git commit -m "feat: protect Admin with server session"
```

## Foundation completion gate

This plan is complete only when one local or Vercel Preview URL serves both `/` and `/api/`, anonymous `/admin` displays login, successful login uses only an HttpOnly cookie, refresh restores the session, CSRF-less writes fail, logout revokes the session, and all backend/frontend tests above pass.
