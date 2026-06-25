"""Contract tests for the FIREARTRO quote endpoint."""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture
def client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


def valid_payload(**overrides):
    payload = {
        "first_name": "Popescu",
        "last_name": "Andrei",
        "phone": "0712345678",
        "email": "andrei@example.com",
        "locality": "București",
        "event_location": "Sala Exemplu",
        "event_type": "Nuntă",
        "event_date": "2026-08-15",
        "services": ["Show drone", "Drone + artificii"],
        "package_id": "hybrid-signature",
        "package_title": "Hybrid Signature",
        "message": "Solicitare de test.",
        "consent": True,
        "company_website": "",
    }
    payload.update(overrides)
    return payload


def test_root(client):
    response = client.get(f"{API}/")
    assert response.status_code == 200


def test_create_quote(client):
    response = client.post(f"{API}/quotes", json=valid_payload())
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["first_name"] == "Popescu"
    assert data["services"] == ["Show drone", "Drone + artificii"]
    assert data["status"] == "new"


def test_consent_is_required(client):
    response = client.post(f"{API}/quotes", json=valid_payload(consent=False))
    assert response.status_code == 422


def test_services_are_required(client):
    response = client.post(f"{API}/quotes", json=valid_payload(services=[]))
    assert response.status_code == 422


def test_honeypot_is_not_persisted(client):
    response = client.post(f"{API}/quotes", json=valid_payload(company_website="spam.example"))
    assert response.status_code == 200
    assert response.json()["status"] == "accepted"
