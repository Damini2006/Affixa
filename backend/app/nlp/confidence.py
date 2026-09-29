def calculate_confidence(prefix: str, root: str, suffix: str, is_valid: bool, method: str = "rule-based") -> float:
    """
    Calculate a transparent confidence score based on the morphological decomposition.
    """
    score = 1.0
    
    if not prefix and not suffix:
        # If no affix was found
        score = 0.5 if not is_valid else 0.8
        return score
        
    if is_valid:
        # Valid roots get a high baseline
        score = 0.95
        # Reward finding both prefix and suffix when root is valid (e.g. un-happy-ness)
        if prefix and suffix:
            score += 0.04
        elif prefix or suffix:
            score += 0.02
    else:
        # Invalid roots get penalized
        score = 0.40
        
    # Penalize very short roots (< 2)
    if len(root) < 2:
        score -= 0.30
        
    # Bound the score between 0.0 and 1.0
    return max(0.0, min(1.0, round(score, 2)))
