# Methodology

## NLP Architecture
The Affix Identification System uses a deterministic, rule-based approach to morphological segmentation, prioritizing transparency and speed.

## Affix Dictionary
We maintain JSON dictionaries of common English prefixes and suffixes, prioritized by length.

## Longest-Match Strategy
To disambiguate overlapping affixes (e.g. `s` vs `ness`), the algorithm always tests the longest possible valid affix first.

## Root Extraction & Orthographic Rules
After a candidate affix is removed, the remaining string is subjected to spelling correction rules:
1. `y \u2192 i` restoration (`happiness` \u2192 `happy`)
2. Consonant degemination (`running` \u2192 `run`)
3. Silent-e restoration (`making` \u2192 `make`)

## Dictionary Validation
Candidate roots are validated against WordNet using NLTK to ensure they are legitimate lexical items.

## Confidence Scoring
A transparent confidence score is computed based on affix presence, dictionary validation success, and root length constraints.
