"""Admin security contracts; all storage and HTTP traffic stay in-process."""

import asyncio
import hashlib
import hmac
import os
import threading
import uuid
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import bcrypt
import httpx
import pytest
import pytest_asyncio
from fastapi import Depends, FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import AutoReconnect, DuplicateKeyError

from auth import (
    ADMIN_COOKIE_NAME,
    AuthError,
    AuthService,
    MongoLoginAttemptRepository,
    MongoSessionRepository,
    create_auth_router,
    require_admin_session,
)


class MemoryCollection:
    """Mongo boundary double: unique _id, atomic CAS and detached BSON-like data.

    Each operation yields before its atomic section to expose read/write races.
    Unknown query/update operators fail instead of silently accepting bad queries.
    """

    def __init__(self):
        self.documents = []

    @staticmethod
    def matches(document, query):
        for key, expected in query.items():
            actual = document.get(key)
            if isinstance(expected, dict):
                for operator, value in expected.items():
                    if operator == "$gt":
                        if isinstance(actual, datetime) and actual.tzinfo is None:
                            actual = actual.replace(tzinfo=timezone.utc)
                        if actual is None or actual <= value:
                            return False
                    else:
                        raise AssertionError(f"Unsupported query operator {operator}")
            elif actual != expected:
                return False
        return True

    async def find_one(self, query):
        await asyncio.sleep(0)
        return deepcopy(
            next((d for d in self.documents if self.matches(d, query)), None)
        )

    async def insert_one(self, document):
        await asyncio.sleep(0)
        if any(d["_id"] == document["_id"] for d in self.documents):
            raise DuplicateKeyError("duplicate _id")
        self.documents.append(deepcopy(document))
        return SimpleNamespace(inserted_id=document["_id"])

    async def replace_one(self, query, replacement):
        await asyncio.sleep(0)
        for index, document in enumerate(self.documents):
            if self.matches(document, query):
                assert replacement["_id"] == document["_id"]
                self.documents[index] = deepcopy(replacement)
                return SimpleNamespace(matched_count=1)
        return SimpleNamespace(matched_count=0)

    async def update_one(self, query, update):
        await asyncio.sleep(0)
        assert set(update) == {"$set"}
        for document in self.documents:
            if self.matches(document, query):
                document.update(deepcopy(update["$set"]))
                return SimpleNamespace(matched_count=1)
        return SimpleNamespace(matched_count=0)


class Clock:
    def __init__(self):
        self.now = datetime(2026, 9, 3, 12, tzinfo=timezone.utc)

    def __call__(self):
        return self.now


@pytest.fixture(scope="module")
def password_hash():
    return bcrypt.hashpw(b"correct horse", bcrypt.gensalt(rounds=4)).decode("ascii")


@pytest.fixture
def domain(password_hash, monkeypatch):
    monkeypatch.delenv("VERCEL", raising=False)
    sessions, attempts, clock = MemoryCollection(), MemoryCollection(), Clock()

    def service(**overrides):
        values = dict(
            sessions=MongoSessionRepository(sessions),
            attempts=MongoLoginAttemptRepository(attempts),
            username="admin",
            password_hash=password_hash,
            session_secret="test-session-secret-with-at-least-32-bytes",
            clock=clock,
        )
        values.update(overrides)
        return AuthService(**values)

    return SimpleNamespace(
        sessions=sessions,
        attempts=attempts,
        clock=clock,
        service=service,
        auth=service(),
    )


async def login(service, password="correct horse", username="admin", ip="127.0.0.1"):
    return await service.login(username, password, ip, "pytest")


@pytest.mark.asyncio
async def test_login_creates_only_hashed_twelve_hour_session(domain):
    issued = await login(domain.auth)
    document = domain.sessions.documents[0]
    assert len(issued.raw_token) == 64
    assert len(issued.csrf_token) >= 43
    assert (
        document["token_hash"]
        == hmac.new(
            b"test-session-secret-with-at-least-32-bytes",
            issued.raw_token.encode("ascii"),
            hashlib.sha256,
        ).hexdigest()
    )
    assert (
        document["csrf_hash"]
        == hmac.new(
            b"test-session-secret-with-at-least-32-bytes",
            issued.csrf_token.encode("ascii"),
            hashlib.sha256,
        ).hexdigest()
    )
    assert issued.raw_token not in repr(document)
    assert issued.csrf_token not in repr(document)
    assert document["created_at"] == domain.clock.now
    assert document["expires_at"] == domain.clock.now + timedelta(hours=12)
    assert issued.expires_at == document["expires_at"]
    assert document["revoked_at"] is None
    assert "127.0.0.1" not in repr(domain.attempts.documents)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "username,password", [("admin", "wrong"), ("wrong", "correct horse")]
)
async def test_invalid_credentials_never_create_session(domain, username, password):
    with pytest.raises(AuthError) as error:
        await login(domain.auth, username=username, password=password)
    assert error.value.status_code == 401
    assert error.value.detail == "Datele de autentificare nu sunt valide."
    assert domain.sessions.documents == []


@pytest.mark.asyncio
async def test_refresh_restores_same_csrf_across_instances_without_rotating_tabs(
    domain,
):
    issued = await login(domain.auth)
    before = deepcopy(domain.sessions.documents)
    first = await domain.auth.authenticate(issued.raw_token)
    second = await domain.service().authenticate(issued.raw_token)
    assert first.username == "admin"
    assert first.csrf_token == second.csrf_token == issued.csrf_token
    domain.auth.verify_csrf(first, issued.csrf_token)
    domain.auth.verify_csrf(second, first.csrf_token)
    assert domain.sessions.documents == before


@pytest.mark.asyncio
async def test_separate_sessions_have_independent_tokens_and_csrf(domain):
    first, second = await login(domain.auth), await login(domain.auth)
    assert first.raw_token != second.raw_token
    assert first.csrf_token != second.csrf_token
    identity = await domain.auth.authenticate(first.raw_token)
    with pytest.raises(AuthError) as error:
        domain.auth.verify_csrf(identity, second.csrf_token)
    assert error.value.status_code == 403


@pytest.mark.asyncio
@pytest.mark.parametrize("csrf", ["", "wrong", "é" * 43, "\ud800", None])
async def test_csrf_rejects_missing_mismatched_and_invalid_utf8(domain, csrf):
    issued = await login(domain.auth)
    identity = await domain.auth.authenticate(issued.raw_token)
    with pytest.raises(AuthError) as error:
        domain.auth.verify_csrf(identity, csrf)
    assert error.value.status_code == 403


@pytest.mark.asyncio
async def test_expiry_is_enforced_at_twelve_hours_without_ttl_cleanup(domain):
    issued = await login(domain.auth)
    domain.clock.now += timedelta(hours=12) - timedelta(microseconds=1)
    await domain.auth.authenticate(issued.raw_token)
    domain.clock.now += timedelta(microseconds=1)
    with pytest.raises(AuthError) as error:
        await domain.auth.authenticate(issued.raw_token)
    assert error.value.status_code == 401
    assert len(domain.sessions.documents) == 1


@pytest.mark.asyncio
async def test_mongo_naive_utc_dates_authenticate_correctly(domain):
    issued = await login(domain.auth)
    domain.sessions.documents[0]["expires_at"] = issued.expires_at.replace(tzinfo=None)
    assert (
        await domain.auth.authenticate(issued.raw_token)
    ).expires_at == issued.expires_at


@pytest.mark.asyncio
async def test_logout_revokes_only_its_session_and_is_idempotent(domain):
    first, second = await login(domain.auth), await login(domain.auth)
    await domain.service().logout(first.raw_token)
    await domain.auth.logout(first.raw_token)
    assert domain.sessions.documents[0]["revoked_at"] == domain.clock.now
    with pytest.raises(AuthError):
        await domain.auth.authenticate(first.raw_token)
    await domain.auth.authenticate(second.raw_token)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "token", ["", "unknown", "a" * 64, "é" * 64, "\ud800", None, "x" * 5000]
)
async def test_missing_unknown_and_malformed_sessions_are_unauthorized(domain, token):
    with pytest.raises(AuthError) as error:
        await domain.auth.authenticate(token)
    assert error.value.status_code == 401


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "field,value,config_name",
    [
        ("username", "", "ADMIN_USERNAME"),
        ("username", "\ud800", "ADMIN_USERNAME"),
        ("password_hash", "", "ADMIN_PASSWORD_HASH"),
        ("password_hash", "not-a-bcrypt-hash", "ADMIN_PASSWORD_HASH"),
        ("password_hash", "$2b$31$" + "a" * 53, "ADMIN_PASSWORD_HASH"),
        ("session_secret", "", "ADMIN_SESSION_SECRET"),
        ("session_secret", "too-short", "ADMIN_SESSION_SECRET"),
        ("session_secret", "\ud800" * 32, "ADMIN_SESSION_SECRET"),
    ],
)
async def test_bad_configuration_disables_auth_without_blocking_app_creation(
    domain, field, value, config_name
):
    service = domain.service(**{field: value})
    assert config_name in service.configuration_errors
    for operation in [
        login(service),
        service.authenticate("a" * 64),
        service.logout("a" * 64),
    ]:
        with pytest.raises(AuthError) as error:
            await operation
        assert error.value.status_code == 503
        assert value == "" or value not in error.value.detail
    assert domain.sessions.documents == []


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "username,password",
    [
        ("\ud800", "correct horse"),
        ("a" * 257, "correct horse"),
        ("admin", "\ud800"),
        ("admin", "é" * 37),
        ("admin", "x" * 73),
        ("admin", ""),
        (None, "correct horse"),
        ("admin", None),
    ],
)
async def test_bad_utf8_types_and_bcrypt_byte_lengths_have_generic_errors(
    domain, username, password
):
    with pytest.raises(AuthError) as error:
        await login(domain.auth, username=username, password=password)
    assert error.value.status_code == 401
    assert error.value.detail == "Datele de autentificare nu sunt valide."


@pytest.mark.asyncio
async def test_unicode_credentials_and_exact_72_byte_password_are_supported(domain):
    password = "é" * 36
    hashed = bcrypt.hashpw(password.encode("utf8"), bcrypt.gensalt(rounds=4)).decode(
        "ascii"
    )
    service = domain.service(username="șef", password_hash=hashed)
    issued = await login(service, username="șef", password=password)
    assert (await service.authenticate(issued.raw_token)).username == "șef"
    with pytest.raises(AuthError):
        await login(service, username="șef", password=password + "x")


@pytest.mark.asyncio
async def test_five_failures_block_even_correct_password_across_instances(domain):
    for _ in range(5):
        with pytest.raises(AuthError) as error:
            await login(domain.service(), password="wrong")
        assert error.value.status_code == 401
    with pytest.raises(AuthError) as error:
        await login(domain.service())
    assert error.value.status_code == 429
    assert int(error.value.headers["Retry-After"]) == 600
    assert domain.sessions.documents == []
    await login(domain.auth, ip="127.0.0.2")


@pytest.mark.asyncio
async def test_throttle_uses_rolling_ten_minutes_and_ignores_delayed_ttl(domain):
    with pytest.raises(AuthError):
        await login(domain.auth, password="wrong")
    domain.clock.now += timedelta(minutes=9)
    for _ in range(4):
        with pytest.raises(AuthError):
            await login(domain.auth, password="wrong")
    domain.clock.now += timedelta(minutes=1)
    with pytest.raises(AuthError) as error:
        await login(domain.auth, password="wrong")
    assert error.value.status_code == 401  # oldest reservation just expired
    with pytest.raises(AuthError) as error:
        await login(domain.auth)
    assert error.value.status_code == 429  # four recent failures survived boundary
    domain.clock.now += timedelta(minutes=10)
    await login(domain.service())


@pytest.mark.asyncio
async def test_success_clears_completed_failures(domain):
    for _ in range(4):
        with pytest.raises(AuthError):
            await login(domain.auth, password="wrong")
    await login(domain.auth)
    for _ in range(5):
        with pytest.raises(AuthError) as error:
            await login(domain.auth, password="wrong")
        assert error.value.status_code == 401
    with pytest.raises(AuthError) as error:
        await login(domain.auth)
    assert error.value.status_code == 429


@pytest.mark.asyncio
async def test_concurrent_failed_logins_cannot_bypass_five_attempt_budget(domain):
    outcomes = await asyncio.gather(
        *(login(domain.service(), password="wrong") for _ in range(30)),
        return_exceptions=True,
    )
    assert all(isinstance(result, AuthError) for result in outcomes)
    assert sorted(result.status_code for result in outcomes) == [401] * 5 + [429] * 25
    assert domain.sessions.documents == []
    assert len(domain.attempts.documents) == 1


@pytest.mark.asyncio
async def test_bcrypt_runs_off_event_loop_and_pending_attempts_are_reserved(
    domain, monkeypatch
):
    entered, release = threading.Event(), threading.Event()
    thread_ids = []
    original = bcrypt.checkpw

    def slow_check(password, hashed):
        thread_ids.append(threading.get_ident())
        entered.set()
        if not release.wait(timeout=2):
            raise AssertionError("bcrypt blocked the event loop")
        return original(password, hashed)

    monkeypatch.setattr(bcrypt, "checkpw", slow_check)
    pending = [
        asyncio.create_task(login(domain.service(), password="wrong")) for _ in range(5)
    ]
    try:
        for _ in range(100):
            if len(thread_ids) == 5:
                break
            await asyncio.sleep(0.001)
        assert entered.is_set()
        assert len(thread_ids) == 5
        assert threading.get_ident() not in thread_ids
        with pytest.raises(AuthError) as error:
            await login(domain.auth)
        assert error.value.status_code == 429
    finally:
        release.set()
        await asyncio.gather(*pending, return_exceptions=True)


@pytest.mark.asyncio
async def test_database_failure_cannot_issue_or_authenticate_session(
    domain, monkeypatch
):
    async def unavailable(*args, **kwargs):
        raise AutoReconnect("private database connection detail")

    monkeypatch.setattr(domain.attempts, "find_one", unavailable)
    with pytest.raises(AuthError) as error:
        await login(domain.auth)
    assert error.value.status_code == 503
    assert "private" not in error.value.detail
    assert domain.sessions.documents == []
    monkeypatch.setattr(domain.sessions, "find_one", unavailable)
    with pytest.raises(AuthError) as error:
        await domain.auth.authenticate("a" * 64)
    assert error.value.status_code == 503


def asgi_client(service, base_url="https://fireart.test"):
    app = FastAPI()
    app.state.auth_service = service
    app.include_router(create_auth_router(service))

    @app.api_route(
        "/api/admin/protected", methods=["GET", "POST", "PUT", "PATCH", "DELETE"]
    )
    async def protected(identity=Depends(require_admin_session)):
        return {"username": identity.username}

    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=base_url)


@pytest.mark.asyncio
async def test_router_cookie_refresh_and_logout_contract(domain):
    async with asgi_client(domain.auth) as client:
        response = await client.post(
            "/api/admin/auth/login",
            json={"username": "admin", "password": "correct horse"},
        )
        assert response.status_code == 200
        cookie = response.headers["set-cookie"]
        for value in [
            "HttpOnly",
            "Secure",
            "SameSite=strict",
            "Path=/api/admin",
            "Max-Age=43200",
        ]:
            assert value in cookie
        assert "Domain=" not in cookie
        raw = client.cookies[ADMIN_COOKIE_NAME]
        csrf = response.json()["csrf_token"]
        assert raw not in response.text
        assert "token_hash" not in response.text
        assert response.headers["cache-control"] == "no-store"
        for _ in range(2):
            refreshed = await client.get("/api/admin/auth/session")
            assert refreshed.status_code == 200
            assert refreshed.json()["csrf_token"] == csrf
            assert refreshed.headers["cache-control"] == "no-store"
            assert "set-cookie" not in refreshed.headers
        assert (
            await client.post("/api/admin/protected", headers={"X-CSRF-Token": csrf})
        ).status_code == 200
        assert (await client.post("/api/admin/auth/logout")).status_code == 403
        logout = await client.post(
            "/api/admin/auth/logout", headers={"X-CSRF-Token": csrf}
        )
        assert logout.status_code == 200
        assert "Max-Age=0" in logout.headers["set-cookie"]
        assert "Path=/api/admin" in logout.headers["set-cookie"]
        assert logout.headers["cache-control"] == "no-store"
        assert (await client.get("/api/admin/auth/session")).status_code == 401
        with pytest.raises(AuthError):
            await domain.auth.authenticate(raw)


@pytest.mark.asyncio
@pytest.mark.parametrize("method", ["POST", "PUT", "PATCH", "DELETE"])
@pytest.mark.parametrize(
    "origin",
    [
        "https://evil.test",
        "http://fireart.test",
        "https://fireart.test:444",
        "null",
        "https://fireart.test/",
        "https://fireart.test@evil.test",
        "https://fireart.test?x=1",
    ],
)
async def test_mutations_reject_cross_origin_even_with_valid_csrf(
    domain, method, origin
):
    issued = await login(domain.auth)
    async with asgi_client(domain.auth) as client:
        client.cookies.set(ADMIN_COOKIE_NAME, issued.raw_token)
        response = await client.request(
            method,
            "/api/admin/protected",
            headers={"Origin": origin, "X-CSRF-Token": issued.csrf_token},
        )
        assert response.status_code == 403
        assert response.headers["cache-control"] == "no-store"


@pytest.mark.asyncio
async def test_same_origin_accepts_default_port_and_csrf_but_reads_need_only_cookie(
    domain,
):
    issued = await login(domain.auth)
    async with asgi_client(domain.auth) as client:
        client.cookies.set(ADMIN_COOKIE_NAME, issued.raw_token)
        assert (await client.get("/api/admin/protected")).status_code == 200
        assert (
            await client.post(
                "/api/admin/protected",
                headers={
                    "Origin": "https://fireart.test:443",
                    "X-CSRF-Token": issued.csrf_token,
                },
            )
        ).status_code == 200


@pytest.mark.asyncio
async def test_login_rejects_cross_origin_before_issuing_cookie(domain):
    async with asgi_client(domain.auth) as client:
        response = await client.post(
            "/api/admin/auth/login",
            headers={"Origin": "https://evil.test"},
            json={"username": "admin", "password": "correct horse"},
        )
        assert response.status_code == 403
        assert "set-cookie" not in response.headers
        assert domain.sessions.documents == []


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "payload",
    [
        {"username": "wrong", "password": "secret-input"},
        {"username": "admin", "password": "secret-input"},
        {"username": {}, "password": ["secret-input"]},
        {"password": "secret-input"},
        [],
    ],
)
async def test_router_invalid_credentials_have_generic_nonleaking_errors(
    domain, payload
):
    async with asgi_client(domain.auth) as client:
        response = await client.post("/api/admin/auth/login", json=payload)
        assert response.status_code == 401
        assert response.json() == {"detail": "Datele de autentificare nu sunt valide."}
        assert response.headers["cache-control"] == "no-store"
        assert "set-cookie" not in response.headers


@pytest.mark.asyncio
async def test_dependency_never_accepts_legacy_admin_key(domain):
    async with asgi_client(domain.auth) as client:
        response = await client.get(
            "/api/admin/protected", headers={"X-Admin-Key": "any-old-key"}
        )
        assert response.status_code == 401


@pytest.mark.asyncio
@pytest.mark.parametrize("vercel", [None, "0", "true", "1"])
async def test_forwarded_client_ip_is_used_only_on_vercel(domain, monkeypatch, vercel):
    if vercel is not None:
        monkeypatch.setenv("VERCEL", vercel)
    async with asgi_client(domain.auth) as client:
        statuses = []
        for index in range(6):
            response = await client.post(
                "/api/admin/auth/login",
                json={"username": "admin", "password": "wrong"},
                headers={"X-Forwarded-For": f"192.0.2.{index + 1}"},
            )
            statuses.append(response.status_code)
        assert statuses == ([401] * 6 if vercel == "1" else [401] * 5 + [429])
        if vercel == "1":
            # Different workers may have the same internal peer; the platform IP
            # must provide a shared bucket for the same external client as well.
            for _ in range(4):
                await client.post(
                    "/api/admin/auth/login",
                    json={"username": "admin", "password": "wrong"},
                    headers={"X-Forwarded-For": "192.0.2.1"},
                )
            response = await client.post(
                "/api/admin/auth/login",
                json={"username": "admin", "password": "correct horse"},
                headers={"X-Forwarded-For": "192.0.2.1"},
            )
            assert response.status_code == 429


@pytest.mark.asyncio
@pytest.mark.parametrize("vercel,expected", [("1", 200), ("0", 403)])
async def test_public_https_origin_uses_vercel_proto_but_never_arbitrary_local_forwarding(
    domain, monkeypatch, vercel, expected
):
    monkeypatch.setenv("VERCEL", vercel)
    async with asgi_client(domain.auth, base_url="http://fireart.test") as client:
        response = await client.post(
            "/api/admin/auth/login",
            json={"username": "admin", "password": "correct horse"},
            headers={"Origin": "https://fireart.test", "X-Forwarded-Proto": "https"},
        )
        assert response.status_code == expected


@pytest.mark.asyncio
@pytest.mark.parametrize("vercel", ["0", "1"])
async def test_forwarded_host_cannot_authorize_a_different_origin(
    domain, monkeypatch, vercel
):
    monkeypatch.setenv("VERCEL", vercel)
    async with asgi_client(domain.auth) as client:
        response = await client.post(
            "/api/admin/auth/login",
            json={"username": "admin", "password": "correct horse"},
            headers={
                "Origin": "https://evil.test",
                "X-Forwarded-Host": "evil.test",
                "Forwarded": "host=evil.test;proto=https",
            },
        )
        assert response.status_code == 403


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "origin",
    [
        "https://fireart.test:0",
        "https://fireart.test:",
        "https://fireart.test?",
        "https://fireart.test#",
        "https://fireart.\x00test",
        "https://fireart.\ttest",
    ],
)
async def test_origin_parser_rejects_invalid_serialized_origins(domain, origin):
    async with asgi_client(domain.auth) as client:
        response = await client.post(
            "/api/admin/auth/login",
            json={"username": "admin", "password": "correct horse"},
            headers={"Origin": origin},
        )
        assert response.status_code == 403


@pytest.mark.asyncio
async def test_duplicate_origin_and_cross_site_fetch_metadata_are_denied(domain):
    async with asgi_client(domain.auth) as client:
        for headers in [
            [("Origin", "https://fireart.test"), ("Origin", "https://evil.test")],
            {"Sec-Fetch-Site": "cross-site"},
            {"Sec-Fetch-Site": "same-site"},
        ]:
            response = await client.post(
                "/api/admin/auth/login",
                json={"username": "admin", "password": "correct horse"},
                headers=headers,
            )
            assert response.status_code == 403


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "body,content_type",
    [
        (b'{"password":', "application/json"),
        (b"\xff", "application/json"),
        (b"username=admin&password=correct+horse", "application/x-www-form-urlencoded"),
        (b" " * 4097, "application/json"),
    ],
)
async def test_malformed_login_bodies_are_generic_and_throttled(
    domain, body, content_type
):
    async with asgi_client(domain.auth) as client:
        for _ in range(5):
            response = await client.post(
                "/api/admin/auth/login",
                content=body,
                headers={"Content-Type": content_type},
            )
            assert response.status_code == 401
            assert response.json() == {
                "detail": "Datele de autentificare nu sunt valide."
            }
        response = await client.post(
            "/api/admin/auth/login",
            json={"username": "admin", "password": "correct horse"},
        )
        assert response.status_code == 429


@pytest.mark.asyncio
async def test_invalid_bcrypt_salt_is_generic_and_cannot_issue_session(domain):
    service = domain.service(password_hash="$2b$04$" + "a" * 53)
    assert "ADMIN_PASSWORD_HASH" in service.configuration_errors
    with pytest.raises(AuthError) as error:
        await login(service)
    assert error.value.status_code == 503
    assert "$2b$" not in error.value.detail
    assert domain.sessions.documents == []


@pytest.mark.asyncio
async def test_success_never_erases_other_pending_reservations(domain):
    repository = MongoLoginAttemptRepository(domain.attempts)
    key = "controlled-ip-hmac"
    reservations = [await repository.reserve(key, domain.clock.now) for _ in range(5)]
    await repository.clear(key, reservations[0], domain.clock.now)
    await repository.reserve(key, domain.clock.now)
    with pytest.raises(AuthError) as error:
        await repository.reserve(key, domain.clock.now)
    assert error.value.status_code == 429
    for reservation in reservations[1:]:
        await repository.record_failure(key, reservation, domain.clock.now)
    with pytest.raises(AuthError) as error:
        await repository.reserve(key, domain.clock.now)
    assert error.value.status_code == 429


@pytest.mark.asyncio
async def test_csrf_hash_tampering_fails_closed_and_secret_rotation_invalidates_sessions(
    domain,
):
    issued = await login(domain.auth)
    rotated = domain.service(session_secret="a-different-secret-with-at-least-32-bytes")
    with pytest.raises(AuthError):
        await rotated.authenticate(issued.raw_token)
    domain.sessions.documents[0]["csrf_hash"] = "a" * 64
    with pytest.raises(AuthError):
        await domain.auth.authenticate(issued.raw_token)


@pytest_asyncio.fixture
async def real_mongo(domain):
    uri = os.environ.get("FIREART_AUTH_TEST_MONGO_URI")
    if not uri:
        pytest.skip(
            "Set FIREART_AUTH_TEST_MONGO_URI to the explicitly isolated replica set"
        )
    # Deliberately allow only the controller-authorized local target, never env DBs.
    assert uri == "mongodb://127.0.0.1:27183/?replicaSet=testset"
    database_name = "fireartro_cms_test_auth_" + uuid.uuid4().hex
    clients = [AsyncIOMotorClient(uri, serverSelectionTimeoutMS=3000) for _ in range(2)]
    try:
        assert (await clients[0].admin.command("hello"))["setName"] == "testset"
        database = clients[0][database_name]
        await database.admin_sessions.create_index("expires_at", expireAfterSeconds=0)
        await database.admin_sessions.create_index("token_hash", unique=True)
        await database.admin_login_attempts.create_index(
            "expires_at", expireAfterSeconds=0
        )
        domain.clock.now = datetime.now(timezone.utc).replace(microsecond=0)

        def service(index=0):
            db = clients[index][database_name]
            return domain.service(
                sessions=MongoSessionRepository(db.admin_sessions),
                attempts=MongoLoginAttemptRepository(db.admin_login_attempts),
            )

        yield SimpleNamespace(db=database, service=service, clock=domain.clock)
    finally:
        # Delete exactly the UUID database this fixture created, never a broad drop.
        assert database_name.startswith("fireartro_cms_test_auth_")
        assert len(database_name.removeprefix("fireartro_cms_test_auth_")) == 32
        await clients[0].drop_database(database_name)
        for client in clients:
            client.close()
        print(f"Removed disposable database {database_name}")


@pytest.mark.asyncio
async def test_real_mongo_concurrent_logins_share_five_attempt_budget(real_mongo):
    results = await asyncio.gather(
        *(
            login(real_mongo.service(index % 2), password="wrong")
            for index in range(30)
        ),
        return_exceptions=True,
    )
    assert all(isinstance(result, AuthError) for result in results)
    assert sorted(result.status_code for result in results) == [401] * 5 + [429] * 25
    assert await real_mongo.db.admin_sessions.count_documents({}) == 0
    assert await real_mongo.db.admin_login_attempts.count_documents({}) == 1
    with pytest.raises(AuthError) as error:
        await login(real_mongo.service(1))
    assert error.value.status_code == 429


@pytest.mark.asyncio
async def test_real_mongo_sessions_restore_csrf_revoke_and_expire_across_clients(
    real_mongo,
):
    first = await login(real_mongo.service())
    second = await login(real_mongo.service(1))
    identity = await real_mongo.service(1).authenticate(first.raw_token)
    assert identity.csrf_token == first.csrf_token
    real_mongo.service().verify_csrf(identity, first.csrf_token)
    stored = await real_mongo.db.admin_sessions.find_one(
        {"token_hash": identity.token_hash}
    )
    assert isinstance(stored["expires_at"], datetime)
    assert stored["expires_at"].tzinfo is None  # real Motor codec exercised
    assert first.raw_token not in repr(stored)
    assert first.csrf_token not in repr(stored)
    await real_mongo.service(1).logout(first.raw_token)
    with pytest.raises(AuthError):
        await real_mongo.service().authenticate(first.raw_token)
    await real_mongo.service().authenticate(second.raw_token)
    real_mongo.clock.now += timedelta(hours=12)
    with pytest.raises(AuthError):
        await real_mongo.service().authenticate(second.raw_token)


@pytest.mark.asyncio
async def test_real_mongo_rolling_window_and_success_preserve_pending_budget(
    real_mongo,
):
    repository = real_mongo.service().attempts
    key = "controlled-ip-hmac"
    reservations = [
        await repository.reserve(key, real_mongo.clock.now) for _ in range(5)
    ]
    await real_mongo.service(1).attempts.clear(
        key, reservations[0], real_mongo.clock.now
    )
    await repository.reserve(key, real_mongo.clock.now)
    with pytest.raises(AuthError) as error:
        await repository.reserve(key, real_mongo.clock.now)
    assert error.value.status_code == 429
    real_mongo.clock.now += timedelta(minutes=10)
    assert await repository.reserve(key, real_mongo.clock.now)
