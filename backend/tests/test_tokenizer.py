"""Tokenizer behaviour used by the /analyze/text endpoint."""
from app.nlp.tokenizer import tokenize_words


def test_splits_on_whitespace():
    assert tokenize_words("The cat sat") == ["The", "cat", "sat"]


def test_drops_punctuation():
    assert tokenize_words("The cat sat, un-happy!") == ["The", "cat", "sat", "un", "happy"]


def test_collapses_extra_whitespace():
    assert tokenize_words("  spaced   out  ") == ["spaced", "out"]


def test_empty_and_punctuation_only_input_yields_nothing():
    assert tokenize_words("") == []
    assert tokenize_words("?!...") == []


def test_splits_hyphenated_forms():
    assert tokenize_words("well-known co-operate") == ["well", "known", "co", "operate"]


def test_splits_apostrophes_and_decimals():
    assert tokenize_words("don't stop 3.14 now") == ["don", "t", "stop", "3", "14", "now"]
