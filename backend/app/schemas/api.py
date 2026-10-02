from pydantic import BaseModel, Field
from typing import List, Optional


class WordRequest(BaseModel):
    word: str = Field(
        ...,
        min_length=1,
        max_length=100,
        pattern=r"^[a-zA-Z\-']+$",
        description="A single English word to analyze",
    )


class TextRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=50000,
        description="Text to analyze (max 50000 characters)",
    )


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
