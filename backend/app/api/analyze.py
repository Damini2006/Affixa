from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.api import WordRequest, TextRequest, AnalysisResponse
from ..nlp.analyzer import MorphologicalAnalyzer
from ..nlp.tokenizer import tokenize_words

router = APIRouter()
analyzer = MorphologicalAnalyzer()

@router.post("/word", response_model=AnalysisResponse)
async def analyze_word(request: WordRequest):
    if not request.word:
        raise HTTPException(status_code=400, detail="Word cannot be empty")
    result = analyzer.analyze(request.word)
    return result

@router.post("/text", response_model=List[AnalysisResponse])
async def analyze_text(request: TextRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    words = tokenize_words(request.text)
    results = []
    for w in words:
        results.append(analyzer.analyze(w))
    return results
