from fastapi import APIRouter, HTTPException
from ..schemas.api import WordRequest, CompareResponse
from ..nlp.analyzer import MorphologicalAnalyzer
from nltk.stem import PorterStemmer, SnowballStemmer

router = APIRouter()
analyzer = MorphologicalAnalyzer()
porter = PorterStemmer()
snowball = SnowballStemmer("english")

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except ImportError:
    nlp = None

@router.post("", response_model=CompareResponse)
async def compare_methods(request: WordRequest):
    word = request.word.strip()
    if not word:
        raise HTTPException(status_code=400, detail="Word cannot be empty")
    
    # 1. Rule-based
    rule_result = analyzer.analyze(word)
    rule_based_dict = {
        "prefix": rule_result.prefix,
        "root": rule_result.root,
        "suffix": rule_result.suffix
    }
    
    # 2. Porter Stemmer
    porter_stem = porter.stem(word)
    
    # 3. Snowball Stemmer
    snowball_stem = snowball.stem(word)
    
    # 4. spaCy Lemmatizer
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
        spacy=spacy_lemma
    )
