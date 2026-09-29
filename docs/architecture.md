# Architecture

## Overview
The application follows a modern decoupled full-stack architecture.

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **3D Graphics:** React Three Fiber
- **Data Fetching:** Axios

### Backend
- **Framework:** FastAPI (Python)
- **Validation:** Pydantic
- **NLP Processing:** Custom Rule-Based Engine + NLTK (WordNet) + spaCy (for comparison)

### Database & Auth
- **Provider:** Supabase
- **Database:** PostgreSQL
- **Security:** Row Level Security (RLS) policies for user isolation
