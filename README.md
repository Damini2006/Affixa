<div align="center">

<img src="frontend/public/logo.svg" alt="Affixa logo" width="96" />

# Affixa

### Rule-Based Morphological Analyzer for Natural Language Processing

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20RLS-3ECF8E?logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Explainable, rule-based morphological decomposition engine for English words with morphophonological restoration and WordNet validation.**

</div>

---

## Overview

**Affixa** is a full-stack computational linguistics application built for transparent and explainable morphological analysis. While modern deep-learning tokenizers (Byte-Pair Encoding, WordPiece) break words purely on statistical subword frequencies, Affixa reconstructs true linguistic structure by decomposing words into their exact **Prefix**, **Base Root Lemma**, and **Suffix** components.

The engine pairs a greedy longest-match affix algorithm with 12 morphophonological spelling restoration rules ($y \to i$ changes, silent-*e* deletion/restoration, consonant degemination, $t$-restoration for `-tion`) and validates every candidate base against **Princeton WordNet** to guarantee authentic dictionary lemmas with sub-10ms response time.

### Highlights

- **100% Explainable Decomposition**: Traces exact prefixes, roots, suffixes, and the phonological rule applied
- **12 Morphophonological Rules**: Restores modified base spellings accurately ($y \to i$, silent-*e*, double consonants)
- **WordNet Lexicon Validation**: Cross-verifies candidate stems with Princeton WordNet to prevent pseudo-roots
- **Dual-Mode Visualizer**: Switch between Morpheme Blocks (with etymology tags) and Hierarchical Derivation Trees
- **Word Family Generator**: Dynamically explores derivational and inflectional variants of any base root
- **4-Way Model Benchmark**: Side-by-side comparison against Porter Stemmer, Snowball Stemmer, and spaCy
- **High-Throughput Batch Processing**: Analyze bulk text or uploaded `.txt`/`.csv` files with 1-click CSV export
- **Developer API Playground**: Interactive sandbox with copyable cURL, Python (`requests`), and JavaScript snippets
- **Command Palette (`Ctrl+K` / `Cmd+K`)**: Quick navigation, instant word analysis, and affix lookup from anywhere
- **Forest Green Design System**: Clean, minimal UI with dark and light mode toggle

---

## Features

### Core Linguistic Modules

| Module | Description |
|--------|-------------|
| **Word Analyzer** | Interactive single-word decomposition with real-time confidence rating, rule detection, and morpheme breakdown |
| **Derivation Tree** | Hierarchical structural tree visualizer illustrating the step-by-step affix binding and base root relationship |
| **Word Family Explorer** | Dynamically calculates and displays all morphological derivatives (prefixed, suffixed, compound) for a base root |
| **Batch Processor** | High-throughput corpus analyzer with support for `.txt`/`.csv` file uploads, sample presets, and CSV export |
| **NLP Benchmark Matrix** | 4-way comparison tool evaluating Affixa Rule-Based against Porter Stemmer, Snowball Stemmer, and spaCy |
| **Affix Dictionary** | Searchable database of 200+ prefixes and suffixes with grammatical categories, meanings, and linguistic origins |

### Computational Linguistics & Engine

| Feature | Description |
|---------|-------------|
| **Longest-Match Stripping** | Greedy algorithm prioritizing maximal prefix and suffix matches to avoid partial segmentation errors |
| **12 Morphophonological Rules** | Automatic spelling restoration: $y \leftrightarrow i$, silent-*e* restoration, degemination, $t$-insertion for `-tion` |
| **WordNet Lexicon Validation** | Rejects non-lexical candidate stems and verifies base lemmas against NLTK Princeton WordNet synsets |
| **Calibrated Confidence Scoring** | Deterministic score ($0.0 \to 1.0$) calibrated on affix legitimacy, rule applicability, and lexicon match |
| **Sub-10ms Latency** | In-memory lookup tables and rule execution for lightweight, high-speed processing |

### Platform & Developer Tools

| Feature | Description |
|---------|-------------|
| **Command Palette (`Ctrl+K`)** | Spotlight-style modal for instant page routing, affix lookup, and on-the-fly word decomposition |
| **Developer API Playground** | Interactive REST API tester with copyable cURL, Python (`requests`), and JavaScript (`fetch`) snippets |
| **Analytics Dashboard** | Live metrics tracking total analyses, prefix/suffix coverage rates, confidence distribution, and latency |
| **Dark / Light Mode** | Forest Green aesthetic theme with smooth switching and persistent `localStorage` support |
| **Supabase Auth & RLS** | User authentication with Row-Level Security protecting private analysis history logs |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | Component-based UI framework |
| **TypeScript 5.5** | Type-safe application development |
| **Vite** | Fast frontend build tool and development server |
| **Tailwind CSS 3.4** | Utility-first styling with custom Forest Green theme variables |
| **Lucide React** | Consistent UI iconography |
| **Recharts** | Interactive charts for confidence and affix distribution analytics |
| **Axios** | HTTP client for backend REST API communication |

### Backend

| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance asynchronous Python web framework |
| **Python 3.10+** | Core programming language |
| **NLTK (WordNet)** | Princeton WordNet lexical database integration for stem validation |
| **spaCy** | NLP benchmark comparison model |
| **NLTK Stemmers** | Porter and Snowball stemmer implementations for benchmarking |
| **Pydantic v2** | Data validation, request schemas, and response serialization |
| **Uvicorn** | ASGI server for FastAPI |

### Database & Authentication

| Technology | Purpose |
|------------|---------|
| **Supabase PostgreSQL** | Cloud database for user accounts and analysis history |
| **Row-Level Security (RLS)** | Secure per-user data isolation policies |
| **Supabase Auth** | Email/password authentication and session management |

---

## Architecture

```
Frontend (React 18 + TypeScript + Vite + Tailwind CSS)
    │
    ▼
Backend (FastAPI REST API + Python 3.10+)
    │
    ▼
NLP Engine (Greedy Affix Matcher + 12 Phonological Rules + Princeton WordNet)
    │
    ▼
Supabase PostgreSQL (Auth + User History with Row-Level Security)
```

```
Frontend                          Backend                         Database / Lexicon
+--------------------+       +--------------------+        +-----------------------+
| Word Analyzer      |       | POST /analyze/word |        |                       |
| Derivation Tree    |       | POST /analyze/text |        |   Princeton WordNet   |
| Word Family        | <---> | POST /compare/word | <--->  |   Lexical Database    |
| Batch Processor    |  API  | GET  /affixes      |        |                       |
| Command Palette    |       | Rule Transformer   |        |   Supabase PostgreSQL |
| API Playground     |       | & WordNet Validator|        |   (Auth & History)    |
+--------------------+       +--------------------+        +-----------------------+
```

---

## NLP Model Benchmark

Comparison between Affixa Rule-Based decomposition and standard stemmers/lemmatizers:

| Target Word | Affixa Rule-Based (Our Approach) | Porter Stemmer | Snowball Stemmer | spaCy Lemmatizer | Result Analysis |
|:---|:---|:---|:---|:---|:---|
| `unhappiness` | `[un-] + happy + [-ness]` | `unhappi` | `unhappi` | `unhappiness` | Full 3-part split + restored authentic lemma `happy` |
| `international` | `[inter-] + nation + [-al]` | `intern` | `intern` | `international` | Isolates prefix `inter-` without chopping root |
| `disconnection` | `[dis-] + connect + [-tion]` | `disconnect` | `disconnect` | `disconnection` | Recovers both `dis-` prefix and `-tion` suffix |
| `rewriting` | `[re-] + writ + [-ing]` | `rewrit` | `rewrit` | `rewrite` | Splits affixes cleanly; WordNet-verified orthographic stem `writ` |
| `beautiful` | `beauty + [-ful]` | `beauti` | `beauti` | `beautiful` | Converts `i` back to valid root `beauty` |
| `preprocessing` | `[pre-] + process + [-ing]` | `preprocess` | `preprocess` | `preprocessing` | Dual prefix & suffix extraction |
| `undeniable` | `[un-] + deny + [-able]` | `undeni` | `undeni` | `undeniable` | Handles $y \to i$ restoration and `-able` suffix |

---

## Getting Started

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Damini2006/Affixa.git
cd Affixa
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
python run.py
```
> Backend runs at **`http://localhost:8000`** (Swagger docs at `http://localhost:8000/docs`).

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
> Frontend runs at **`http://localhost:5173`** (Vite picks the next free
> port, e.g. `5174`, if `5173` is taken).

### 4. Environment Variables (Optional)

Create a `.env` file in `frontend/` if connecting to Supabase:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://127.0.0.1:8000/api
```

---

## Running Tests

```bash
# Backend test suite (health routes, analyzer, tokenizer, REST contracts)
cd backend
python -m pytest

# Frontend type check + production build
cd frontend
npx tsc --noEmit
npm run build
```

Both run in CI on every push (`.github/workflows/ci.yml`). See
[`docs/TESTING.md`](docs/TESTING.md) for details.

---

## Troubleshooting

**Every API call returns 404, but `http://127.0.0.1:8000/docs` works**

`localhost` resolves to IPv6 `::1` first on some machines, where WSL's
`wslrelay` or Docker already holds port 8000 and answers 404. The
frontend therefore defaults to `http://127.0.0.1:8000/api` (IPv4). If
you override it, keep the same IP in `VITE_API_URL`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

**spaCy comparison column shows "spaCy model not loaded"**

```bash
python -m spacy download en_core_web_sm
```

**`wordnet` lookup errors on a fresh backend setup**

The validator downloads NLTK's WordNet automatically on first import;
allow the initial request a few seconds of network access.

---

## API Reference

Base URL (local): `http://127.0.0.1:8000` · Interactive docs: `http://127.0.0.1:8000/docs`
Full reference: [`docs/API.md`](docs/API.md)

### 0. Health Check
`GET /api/health`

```json
{ "status": "ok", "service": "affixa-api", "version": "1.0.0" }
```

### 1. Analyze Word
`POST /api/analyze/word`

**Request:**
```json
{
  "word": "unhappiness"
}
```

**Response (200 OK):**
```json
{
  "word": "unhappiness",
  "prefix": "un",
  "root": "happy",
  "suffix": "ness",
  "method": "rule-based",
  "rule": "y → i restoration",
  "confidence": 0.99,
  "is_valid": true
}
```

**Errors:** `400` when `word` is empty or whitespace-only.

### 2. Compare Models
`POST /api/compare`

**Request:**
```json
{
  "word": "disconnection"
}
```

**Response (200 OK):**
```json
{
  "word": "disconnection",
  "rule_based": { "prefix": "dis", "root": "connect", "suffix": "tion" },
  "porter": "disconnect",
  "snowball": "disconnect",
  "spacy": "disconnection"
}
```

> If the `en_core_web_sm` model is not installed, `spacy` returns
> `"spaCy model not loaded"` instead of a lemma.

### 3. Batch Corpus Analysis
`POST /api/analyze/text`

**Request:**
```json
{
  "text": "international preprocessing rewriting"
}
```

**Response (200 OK):** an array of analysis objects (one per token, in
input order). Each entry has the same shape as `POST /api/analyze/word`
above:

```json
[
  { "word": "international", "prefix": "inter", "root": "nation", "suffix": "al", "rule": "none", "method": "rule-based", "confidence": 0.99, "is_valid": true },
  { "word": "preprocessing", "prefix": "pre", "root": "process", "suffix": "ing", "rule": "none", "method": "rule-based", "confidence": 0.99, "is_valid": true },
  { "word": "rewriting", "prefix": "re", "root": "writ", "suffix": "ing", "rule": "none", "method": "rule-based", "confidence": 0.99, "is_valid": true }
]
```

**Errors:** `400` when `text` is empty or whitespace-only.

### 4. History & Analytics (stubs)

- `GET /api/history/` — placeholder until RLS-backed persistence lands
- `GET /api/analytics/summary` — zeroed aggregate counters

The Affix Dictionary page reads `backend/app/nlp/dictionaries/*.json`
directly; there is no dictionary HTTP endpoint.

---

## Project Structure

```
Affixa/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze.py             # /analyze/word and /analyze/text handlers
│   │   │   ├── compare.py             # 4-way benchmark handler (Porter/Snowball/spaCy)
│   │   │   ├── history.py             # Per-user history (stub, RLS-backed later)
│   │   │   └── analytics.py           # Aggregate metrics (stub)
│   │   ├── nlp/
│   │   │   ├── analyzer.py            # Core morphological analysis orchestrator
│   │   │   ├── affix_matcher.py       # Longest-match greedy algorithm
│   │   │   ├── spelling_rules.py      # Morphophonological transformation rules
│   │   │   ├── confidence.py          # Rule-based score calibration
│   │   │   ├── validator.py           # Princeton WordNet synset verification
│   │   │   ├── tokenizer.py           # Normalization and word/sentence tokenization
│   │   │   └── dictionaries/
│   │   │       ├── prefixes.json      # Curated prefix lexicon
│   │   │       └── suffixes.json      # Curated suffix lexicon
│   │   ├── database/schema.sql        # Tables + RLS policies
│   │   └── main.py                    # App initialization, CORS, /api/health
│   ├── tests/                         # Pytest suite (health, analyzer, tokenizer, API)
│   ├── pytest.ini                     # testpaths + pythonpath
│   ├── requirements.txt               # Python dependencies
│   └── run.py                         # Server runner (127.0.0.1:8000)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppLayout.tsx          # Dashboard layout with collapsible sidebar
│   │   │   ├── CommandPalette.tsx     # Global Ctrl+K / Cmd+K Spotlight search
│   │   │   ├── ErrorBoundary.tsx      # Friendly crash fallback
│   │   │   ├── DecompositionVisualizer.tsx # Morpheme Blocks & Tree Visualizer
│   │   │   ├── NavBar.tsx             # Public header with live engine status
│   │   │   └── ProtectedRoute.tsx     # Supabase authentication route guard
│   │   ├── context/
│   │   │   ├── AuthContext.tsx        # Supabase authentication session provider
│   │   │   └── ThemeContext.tsx       # Dark / Light theme state provider
│   │   ├── pages/
│   │   │   ├── Landing.tsx            # Hero, live demo, pipeline & FAQ
│   │   │   ├── Analyzer.tsx           # Single word analyzer & Word Family explorer
│   │   │   ├── Batch.tsx              # Bulk corpus processor & CSV exporter
│   │   │   ├── Comparison.tsx         # 4-way NLP benchmark comparison matrix
│   │   │   ├── Analytics.tsx          # Real-time metrics & Recharts visualizations
│   │   │   ├── Dictionary.tsx         # Searchable 200+ affix reference database
│   │   │   ├── Settings.tsx           # User profile, engine tuning & API Playground
│   │   │   ├── NotFound.tsx           # 404 error page
│   │   │   └── auth/
│   │   │       ├── Login.tsx          # Split-screen login page
│   │   │       └── Register.tsx       # Split-screen registration page
│   │   ├── services/
│   │   │   └── api.ts                 # Axios API client (127.0.0.1 base URL)
│   │   └── index.css                  # Forest Green CSS theme variables
│   ├── public/
│   │   ├── logo.svg                   # Generated badge logo (see tools/gen-logo.mjs)
│   │   └── favicon.svg
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                              # Architecture, API, testing, deployment
├── tools/gen-logo.mjs                 # Logo generator (Catmull-Rom stroke outlines)
├── .github/workflows/ci.yml           # Pytest + type-check + build
├── CONTRIBUTING.md
├── CHANGELOG.md
└── README.md
```

---

## Author & Maintainer

**Neelam Rishika Damini**  
- **GitHub**: [@Damini2006](https://github.com/Damini2006)  
- **Email**: [neelamrishikadamini@gmail.com](mailto:neelamrishikadamini@gmail.com)  
- **Project Repository**: [https://github.com/Damini2006/Affixa](https://github.com/Damini2006/Affixa)

---

## License

This project is licensed under the [MIT License](LICENSE).
