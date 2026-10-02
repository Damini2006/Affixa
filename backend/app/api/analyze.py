from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.api import WordRequest, TextRequest, AnalysisResponse
from ..nlp.analyzer import MorphologicalAnalyzer
from ..nlp.tokenizer import tokenize_words

router = APIRouter()
analyzer = MorphologicalAnalyzer()

MAX_WORDS_PER_REQUEST = 500


@router.post("/word", response_model=AnalysisResponse)
async def analyze_word(request: WordRequest):
    word = request.word.strip()
    if not word:
        raise HTTPException(status_code=400, detail="Word cannot be empty")
    try:
        result = analyzer.analyze(word)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/text", response_model=List[AnalysisResponse])
async def analyze_text(request: TextRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    words = tokenize_words(text)
    if len(words) > MAX_WORDS_PER_REQUEST:
        raise HTTPException(
            status_code=400,
            detail=f"Text exceeds maximum of {MAX_WORDS_PER_REQUEST} words (got {len(words)})",
        )

    results = []
    for w in words:
        try:
            results.append(analyzer.analyze(w))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Analysis failed for word '{w}': {str(e)}")
    return results
