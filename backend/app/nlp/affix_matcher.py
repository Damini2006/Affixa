import json
import os

class AffixMatcher:
    def __init__(self):
        base_dir = os.path.dirname(__file__)
        with open(os.path.join(base_dir, 'dictionaries', 'prefixes.json'), 'r') as f:
            self.prefixes = json.load(f)
        with open(os.path.join(base_dir, 'dictionaries', 'suffixes.json'), 'r') as f:
            self.suffixes = json.load(f)
            
        # Sort by length descending for longest-match-first
        self.prefixes.sort(key=lambda x: len(x['affix']), reverse=True)
        self.suffixes.sort(key=lambda x: len(x['affix']), reverse=True)

    def get_prefix_candidates(self, word: str) -> list[str]:
        candidates = []
        for p in self.prefixes:
            if word.startswith(p['affix']):
                candidates.append(p['affix'])
        return candidates

    def get_suffix_candidates(self, word: str) -> list[str]:
        candidates = []
        for s in self.suffixes:
            if word.endswith(s['affix']):
                candidates.append(s['affix'])
        return candidates
