"""Core morphological analysis pipeline.

Orchestrates the four-stage decomposition used for every request:

1. **Candidate generation** — the longest-match :class:`AffixMatcher`
   proposes prefix/suffix pairs (including the empty pair, so
   affix-less words remain candidates).
2. **Rule application** — :func:`spelling_rules.apply_rules` restores
   the base spelling at the suffix boundary (``y -> i``, silent *e*,
   degemination, ``t``-restoration, ...).
3. **Validation** — every restored candidate root is checked against
   Princeton WordNet to reject pseudo-roots.
4. **Scoring** — :func:`confidence.calculate_confidence` produces a
   deterministic 0..1 score; the best *valid* candidate wins, with a
   no-affix fallback when nothing validates.
"""

from typing import Optional
from pydantic import BaseModel
from .tokenizer import normalize_word
from .affix_matcher import AffixMatcher
from .spelling_rules import apply_rules
from .validator import Validator
from .confidence import calculate_confidence


class AnalysisResult(BaseModel):
    """Schema returned by ``/api/analyze/word`` for a single word."""
    word: str
    prefix: str
    root: str
    suffix: str
    rule: str
    confidence: float
    method: str
    is_valid: bool


class MorphologicalAnalyzer:
    """Stateless analyzer bundling the matcher, validator and scorer."""

    def __init__(self):
        self.matcher = AffixMatcher()
        self.validator = Validator()

    def analyze(self, word: str) -> AnalysisResult:
        """Decompose *word* into prefix, root and suffix.

        Explores every affix combination longest-match first, applies
        spelling restoration rules, validates candidate roots against
        WordNet and returns the highest-scoring valid split. Words with
        no valid split fall back to a no-affix analysis of the
        normalized form.
        """
        normalized = normalize_word(word)
        if not normalized:
            return self._build_result(word, "", word, "", "none", False)

        # 1. Get candidates
        prefixes = self.matcher.get_prefix_candidates(normalized)
        suffixes = self.matcher.get_suffix_candidates(normalized)
        
        # Always add empty string to consider no-affix scenarios
        prefixes.append("")
        suffixes.append("")

        best_result = None
        best_score = -1.0
        
        # Minimum root length constraint
        MIN_ROOT_LENGTH = 3

        # 2. Iterate combinations (longest match first due to sorting in matcher)
        for p in prefixes:
            for s in suffixes:
                # Avoid overlapping prefix and suffix that consume the whole word or leave < MIN_ROOT_LENGTH
                if len(p) + len(s) + MIN_ROOT_LENGTH > len(normalized) and (p or s):
                    continue
                
                # Check if word actually starts with p and ends with s
                if (not p or normalized.startswith(p)) and (not s or normalized.endswith(s)):
                    # Extract base
                    base_start = len(p)
                    base_end = len(normalized) - len(s) if s else len(normalized)
                    
                    if base_start >= base_end:
                        continue
                        
                    base = normalized[base_start:base_end]
                    
                    # 3. Apply spelling rules (only applies to suffix boundary typically)
                    candidates = apply_rules(base, s)
                    
                    for cand in candidates:
                        cand_root = cand["root"]
                        cand_rule = cand["rule"]
                        
                        # 4. Validate
                        is_valid = self.validator.is_valid_word(cand_root)
                        
                        # 5. Score
                        conf = calculate_confidence(p, cand_root, s, is_valid)
                        
                        # Tie breaker prioritizing validity, then confidence, then rule simplicity
                        if is_valid and conf > best_score:
                            best_score = conf
                            best_result = self._build_result(word, p, cand_root, s, cand_rule, is_valid, conf)
                            
        if best_result:
            return best_result
            
        # Fallback to no-affix
        is_valid = self.validator.is_valid_word(normalized)
        conf = calculate_confidence("", normalized, "", is_valid)
        return self._build_result(word, "", normalized, "", "none", is_valid, conf)

    def _build_result(self, word: str, prefix: str, root: str, suffix: str, rule: str, is_valid: bool, conf: float = 0.0) -> AnalysisResult:
        """Assemble an :class:`AnalysisResult` tagged as rule-based."""
        return AnalysisResult(
            word=word,
            prefix=prefix,
            root=root,
            suffix=suffix,
            rule=rule,
            confidence=conf,
            method="rule-based",
            is_valid=is_valid
        )
