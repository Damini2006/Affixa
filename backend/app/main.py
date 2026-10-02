import logging
import time
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .api import analyze, compare, history, analytics

logger = logging.getLogger("affixa")

app = FastAPI(
    title="Affix Identification System API",
    description="NLP-focused morphological analysis API",
    version="1.0.0",
)

# CORS — restricted to specific origins in production
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3001,http://localhost:3000,http://localhost:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Security headers ──────────────────────────────────────────────────────
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response


# ── Request logging ────────────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    logger.info(
        f"{request.method} {request.url.path} {response.status_code} {duration:.3f}s"
    )
    return response


# ── Rate limiting (simple in-memory per-IP) ────────────────────────────────
_rate_limit_store: dict[str, list[float]] = {}
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))  # seconds


@app.middleware("http")
async def rate_limit(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()

    # Clean old entries
    if client_ip in _rate_limit_store:
        _rate_limit_store[client_ip] = [
            t for t in _rate_limit_store[client_ip] if now - t < RATE_LIMIT_WINDOW
        ]
    else:
        _rate_limit_store[client_ip] = []

    if len(_rate_limit_store[client_ip]) >= RATE_LIMIT_REQUESTS:
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Try again later."},
        )

    _rate_limit_store[client_ip].append(now)
    return await call_next(request)


# ── Global exception handler ───────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": "server_error"},
    )


# ── Routes ─────────────────────────────────────────────────────────────────
app.include_router(analyze.router, prefix="/api/analyze", tags=["Analyze"])
app.include_router(compare.router, prefix="/api/compare", tags=["Compare"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


@app.get("/")
def root():
    return {"status": "ok", "message": "Affix Identification System API is running."}


@app.get("/api/health", tags=["Health"])
def health():
    """Liveness probe for CI, containers and the frontend status chip."""
    return {"status": "ok", "service": "affixa-api", "version": "1.0.0"}


@app.get("/api/ready", tags=["Health"])
async def readiness():
    """Readiness probe — verifies NLP dependencies are loaded."""
    from .nlp.validator import Validator
    from .nlp.affix_matcher import AffixMatcher

    checks = {}
    try:
        checks["wordnet"] = Validator.is_valid_word("test")
    except Exception:
        checks["wordnet"] = False

    try:
        matcher = AffixMatcher()
        checks["dictionaries"] = matcher.prefixes is not None and matcher.suffixes is not None
    except Exception:
        checks["dictionaries"] = False

    if all(checks.values()):
        return {"status": "ready", "checks": checks}

    return JSONResponse(
        status_code=503,
        content={"status": "not_ready", "checks": checks},
    )
