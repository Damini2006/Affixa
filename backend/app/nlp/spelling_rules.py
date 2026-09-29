def apply_rules(base: str, suffix: str) -> list[dict]:
    """
    Given a candidate base (after suffix stripped) and the suffix,
    generate possible restored roots based on spelling rules.
    """
    candidates = []
    
    # Base case: no rule applied
    candidates.append({"root": base, "rule": "none"})
    
    if not suffix:
        return candidates

    # Rule 1: y -> i restoration
    # e.g., happiness -> happi + ness -> happy
    if base.endswith('i'):
        restored = base[:-1] + 'y'
        candidates.append({"root": restored, "rule": "y \u2192 i restoration"})
        
    # Rule 2: Consonant doubling / degemination
    # e.g., running -> runn + ing -> run
    if len(base) >= 2 and base[-1] == base[-2] and base[-1] not in ['s', 'l', 'f', 'z']:
        # simplistic check for double consonant
        restored = base[:-1]
        candidates.append({"root": restored, "rule": "consonant degemination"})
        
    # Rule 3: Silent-e restoration
    # e.g., making -> mak + ing -> make
    vowel_suffixes = ['ing', 'ed', 'er', 'est', 'able', 'ible', 'ous', 'ive', 'ish', 'ation', 'ion']
    if suffix in vowel_suffixes:
        restored = base + 'e'
        candidates.append({"root": restored, "rule": "silent-e restoration"})
        
    # Rule 4: -tion / -ion root completion (e.g. disconnec + tion -> connect)
    if suffix == 'tion' and base.endswith('c'):
        restored = base + 't'
        candidates.append({"root": restored, "rule": "t-restoration for -tion"})

    return candidates
