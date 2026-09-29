from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import analyze, compare, history, analytics

app = FastAPI(
    title="Affix Identification System API",
    description="NLP-focused morphological analysis API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(analyze.router, prefix="/api/analyze", tags=["Analyze"])
app.include_router(compare.router, prefix="/api/compare", tags=["Compare"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {"status": "ok", "message": "Affix Identification System API is running."}
