"""API tests for /api/analyze/word and /api/analyze/text."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_analyze_word_returns_full_decomposition():
    resp = client.post("/api/analyze/word", json={"word": "unhappiness"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["word"] == "unhappiness"
    assert body["prefix"] == "un"
    assert body["root"] == "happy"
    assert body["suffix"] == "ness"
    assert body["method"] == "rule-based"
    assert 0.0 <= body["confidence"] <= 1.0


def test_analyze_word_rejects_empty_input():
    resp = client.post("/api/analyze/word", json={"word": ""})
    assert resp.status_code == 400


def test_analyze_text_returns_one_result_per_token():
    resp = client.post("/api/analyze/text", json={"text": "The unhappy rethinking"})
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) == 3
    assert [r["word"] for r in results] == ["The", "unhappy", "rethinking"]


def test_analyze_text_rejects_empty_input():
    resp = client.post("/api/analyze/text", json={"text": ""})
    assert resp.status_code == 400


def test_analyze_word_rejects_whitespace_only_input():
    resp = client.post("/api/analyze/word", json={"word": "   "})
    assert resp.status_code == 400


def test_analyze_word_trims_surrounding_whitespace():
    resp = client.post("/api/analyze/word", json={"word": "  play  "})
    assert resp.status_code == 200
    assert resp.json()["word"] == "play"
