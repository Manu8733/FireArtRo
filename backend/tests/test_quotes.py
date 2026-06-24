"""Backend tests for FIREARTRO /api/quotes endpoints."""
import os
import requests
import pytest

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://spectacle-cinema.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def test_root(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    assert "message" in r.json()


def test_create_quote_and_persist(client):
    payload = {
        "name": "TEST_Andrei Popescu",
        "phone": "0712345678",
        "email": "test_quote@example.com",
        "event_type": "Nuntă",
        "event_date": "2026-06-15",
        "location": "București",
        "package": "Pachet Drone Show",
        "message": "TEST_message",
    }
    r = client.post(f"{API}/quotes", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["name"] == payload["name"]
    assert data["phone"] == payload["phone"]
    assert data["event_type"] == payload["event_type"]
    assert data["status"] == "new"
    assert "id" in data and isinstance(data["id"], str)
    assert "_id" not in data
    qid = data["id"]

    # Verify persistence via GET
    r2 = client.get(f"{API}/quotes")
    assert r2.status_code == 200
    quotes = r2.json()
    assert isinstance(quotes, list)
    found = [q for q in quotes if q.get("id") == qid]
    assert found, f"Created quote {qid} not found in GET /api/quotes"
    q = found[0]
    assert q["name"] == payload["name"]
    assert q["package"] == payload["package"]
    assert "_id" not in q


def test_create_quote_minimal(client):
    payload = {"name": "TEST_Min", "phone": "0700000000", "event_type": "Corporate"}
    r = client.post(f"{API}/quotes", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == ""
    assert data["package"] == ""


def test_create_quote_missing_required(client):
    # Missing event_type
    r = client.post(f"{API}/quotes", json={"name": "x", "phone": "y"})
    assert r.status_code == 422


def test_create_quote_with_consent_and_preferred_service(client):
    """Iteration 2: verify new fields preferred_service and consent persist."""
    payload = {
        "name": "TEST_Consent User",
        "phone": "0733111222",
        "event_type": "Nuntă",
        "preferred_service": "Spectacol drone",
        "consent": True,
    }
    r = client.post(f"{API}/quotes", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["preferred_service"] == "Spectacol drone"
    assert data["consent"] is True
    qid = data["id"]

    r2 = client.get(f"{API}/quotes")
    assert r2.status_code == 200
    found = [q for q in r2.json() if q.get("id") == qid]
    assert found
    assert found[0]["preferred_service"] == "Spectacol drone"
    assert found[0]["consent"] is True


def test_create_quote_consent_defaults_false(client):
    """If consent omitted, it should default to False."""
    payload = {"name": "TEST_NoConsent", "phone": "0700000001", "event_type": "Corporate"}
    r = client.post(f"{API}/quotes", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["consent"] is False
    assert data["preferred_service"] == ""


def test_get_quotes_sorted_desc(client):
    r = client.get(f"{API}/quotes")
    assert r.status_code == 200
    quotes = r.json()
    if len(quotes) >= 2:
        # Sorted by created_at desc
        assert quotes[0]["created_at"] >= quotes[1]["created_at"]
