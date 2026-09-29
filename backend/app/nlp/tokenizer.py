import re

def normalize_word(word: str) -> str:
    """Lowercase and remove non-alphabetic characters except hyphens."""
    word = word.lower()
    word = re.sub(r'[^a-z-]', '', word)
    return word

def tokenize_sentence(text: str) -> list[str]:
    """Basic sentence tokenization using regex. Could be replaced with NLTK/spaCy later."""
    # Split by common sentence boundaries
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if s.strip()]

def tokenize_words(text: str) -> list[str]:
    """Tokenize a string into words, preserving original punctuation for mapping if needed."""
    return re.findall(r'\b\w+\b', text)
