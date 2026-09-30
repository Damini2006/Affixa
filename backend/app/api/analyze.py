from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.api import WordRequest, TextRequest, AnalysisResponse
from ..nlp.analyzer import MorphologicalAnalyzer
from ..nlp.tokenizer import tokenize_words

router = APIRouter()
analyzer = MorphologicalAnalyzer()

@router.post("/word", response_model=AnalysisResponse)
async def analyze_word(request: WordRequest):
    word = request.word.strip()
    if not word:
        raise HTTPException(status_code=400, detail="Word cannot be empty")
    result = analyzer.analyze(word)
    return result


@router.post("/text", response_model=List[AnalysisResponse])
async def analyze_text(request: TextRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    words = tokenize_words(text)
    results = []
    for w in words:
        results.append(analyzer.analyze(w))
    return results
