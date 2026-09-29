import nltk
from nltk.corpus import wordnet

# Ensure wordnet is downloaded
try:
    wordnet.ensure_loaded()
except LookupError:
    nltk.download('wordnet', quiet=True)

class Validator:
    @staticmethod
    def is_valid_word(word: str) -> bool:
        """
        Check if the word exists in WordNet.
        Returns True if found, False otherwise.
        """
        if not word:
            return False
        # synsets returns a list of synsets for the word
        return len(wordnet.synsets(word)) > 0
