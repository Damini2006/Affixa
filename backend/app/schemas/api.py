from pydantic import BaseModel
from typing import List, Optional

class WordRequest(BaseModel):
    word: str

class TextRequest(BaseModel):
    text: str

class AnalysisResponse(BaseModel):
    word: str
    prefix: str
    root: str
    suffix: str
    rule: str
    confidence: float
    method: str
    is_valid: bool

class CompareResponse(BaseModel):
    word: str
    rule_based: dict
    porter: str
    snowball: str
    spacy: str
