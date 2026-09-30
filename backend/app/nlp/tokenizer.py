"""Lightweight regex-based tokenization helpers.

Kept dependency-free so the API layer can split input before handing
individual tokens to the analyzer.
"""
import re


def normalize_word(word: str) -> str:
    """Lowercase and remove non-alphabetic characters except hyphens."""
    word = word.lower()
    word = re.sub(r'[^a-z-]', '', word)
    return word


def tokenize_sentence(text: str) -> list[str]:
    """Split text into sentences on ``. ! ?`` boundaries, dropping blanks."""
    # Split by common sentence boundaries
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if s.strip()]


def tokenize_words(text: str) -> list[str]:
    """Extract word tokens from *text*.

    Uses ``\\b\\w+\\b``, which yields one token per alphanumeric run and
    implicitly drops punctuation; apostrophes and hyphens therefore
    split forms (``don't`` -> ``don`` + ``t``, ``un-happy`` -> ``un``
    + ``happy``).
    """
    return re.findall(r'\b\w+\b', text)
