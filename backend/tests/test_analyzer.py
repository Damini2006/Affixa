"""Unit tests for the rule-based morphological analyzer."""
from app.nlp.analyzer import MorphologicalAnalyzer

analyzer = MorphologicalAnalyzer()


def test_splits_prefix_root_and_suffix():
    result = analyzer.analyze("unhappiness")
    assert result.prefix == "un"
    assert result.root == "happy"
    assert result.suffix == "ness"
    assert result.is_valid is True


def test_prefix_only_word():
    result = analyzer.analyze("reconsider")
    assert result.prefix == "re"
    assert result.root == "consider"
    assert result.suffix == ""


def test_stem_without_affixes():
    result = analyzer.analyze("play")
    assert result.prefix == ""
    assert result.suffix == ""
    assert result.root == "play"
    assert result.is_valid is True


def test_nonsensical_word_is_flagged_invalid():
    result = analyzer.analyze("xyzzy")
    assert result.is_valid is False


def test_confidence_is_a_bounded_probability():
    for word in ("unhappiness", "reconsider", "play", "xyzzy"):
        result = analyzer.analyze(word)
        assert 0.0 <= result.confidence <= 1.0, f"bad confidence for {word}"


def test_y_to_i_restoration_rule_is_reported():
    result = analyzer.analyze("unhappiness")
    assert "y → i" in result.rule


def test_analysis_is_deterministic():
    first = analyzer.analyze("unkindness")
    second = analyzer.analyze("unkindness")
    assert first == second
