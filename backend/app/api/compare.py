from fastapi import APIRouter, HTTPException
from ..schemas.api import WordRequest, CompareResponse
from ..nlp.analyzer import MorphologicalAnalyzer
from nltk.stem import PorterStemmer, SnowballStemmer

router = APIRouter()
analyzer = MorphologicalAnalyzer()
porter = PorterStemmer()
snowball = SnowballStemmer("english")

# Lazy-load spaCy model
_nlp = None


def get_nlp():
    global _nlp
    if _nlp is None:
        try:
            import spacy

            _nlp = spacy.load("en_core_web_sm")
        except (ImportError, OSError):
            _nlp = False  # Model not available
    return _nlp if _nlp else None


@router.post("", response_model=CompareResponse, include_in_schema=False)
@router.post("/", response_model=CompareResponse)
async def compare_methods(request: WordRequest):
    word = request.word.strip()
    if not word:
        raise HTTPException(status_code=400, detail="Word cannot be empty")

    try:
        # 1. Rule-based
        rule_result = analyzer.analyze(word)
        rule_based_dict = {
            "prefix": rule_result.prefix,
            "root": rule_result.root,
            "suffix": rule_result.suffix,
        }

        # 2. Porter Stemmer
        porter_stem = porter.stem(word)

        # 3. Snowball Stemmer
        snowball_stem = snowball.stem(word)

        # 4. spaCy Lemmatizer
        nlp = get_nlp()
        spacy_lemma = ""
        if nlp:
            doc = nlp(word)
            spacy_lemma = doc[0].lemma_ if len(doc) > 0 else word
        else:
            spacy_lemma = "spaCy model not loaded"

        return CompareResponse(
            word=word,
            rule_based=rule_based_dict,
            porter=porter_stem,
            snowball=snowball_stem,
            spacy=spacy_lemma,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")
