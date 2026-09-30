"""Smoke tests for the FastAPI app's liveness routes."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_returns_ok():
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_health_endpoint_reports_service():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["service"] == "affixa-api"
    assert body["version"]


def test_unknown_route_returns_404():
    resp = client.get("/api/does-not-exist")
    assert resp.status_code == 404
