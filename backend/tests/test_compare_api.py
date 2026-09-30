"""API tests for /api/compare (rule-based vs. stemmer outputs)."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_compare_returns_all_stemmers():
    resp = client.post("/api/compare", json={"word": "unhappiness"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["word"] == "unhappiness"
    assert body["rule_based"] == {"prefix": "un", "root": "happy", "suffix": "ness"}
    assert body["porter"]
    assert body["snowball"]
    assert body["spacy"]


def test_compare_porter_and_snowball_agree_on_stable_words():
    resp = client.post("/api/compare", json={"word": "unhappiness"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["porter"] == body["snowball"]


def test_compare_rejects_empty_input():
    resp = client.post("/api/compare", json={"word": ""})
    assert resp.status_code in (400, 422)
