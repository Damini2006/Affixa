import logging
import os
import nltk
from nltk.corpus import wordnet
from functools import lru_cache

logger = logging.getLogger("affixa")

# Ensure NLTK data path includes our shared directory
_nltk_data_path = os.getenv("NLTK_DATA", "/app/nltk_data")
if _nltk_data_path not in nltk.data.path:
    nltk.data.path.insert(0, _nltk_data_path)

# Ensure wordnet is downloaded
try:
    wordnet.ensure_loaded()
except LookupError:
    try:
        nltk.download("wordnet", download_dir=_nltk_data_path, quiet=True)
    except Exception as e:
        logger.error(f"Failed to download WordNet corpus: {e}")
except Exception as e:
    logger.error(f"WordNet initialization failed: {e}")


class Validator:
    """Validates words against WordNet. Degrades gracefully if WordNet is unavailable."""

    _available = None

    @classmethod
    def is_available(cls) -> bool:
        """Check if WordNet is available (cached result)."""
        if cls._available is None:
            try:
                wordnet.ensure_loaded()
                cls._available = True
            except Exception:
                cls._available = False
        return cls._available

    @staticmethod
    @lru_cache(maxsize=10000)
    def is_valid_word(word: str) -> bool:
        """
        Check if the word exists in WordNet.
        Returns True if found, False otherwise.
        If WordNet is unavailable, returns True (fail-open to avoid blocking analysis).
        """
        if not word:
            return False
        if not Validator.is_available():
            return True  # Fail-open: don't block analysis if WordNet is down
        return len(wordnet.synsets(word)) > 0
