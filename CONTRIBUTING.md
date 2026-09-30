# Contributing to Affixa

Thanks for helping improve Affixa. This document covers the workflow,
style conventions and checks that keep the repository healthy.

## Getting started

1. Fork and clone the repository.
2. Follow the setup steps in `README.md` (backend virtualenv + frontend
   `npm install`).
3. Copy `backend/.env.example` and `frontend/.env.example` to their
   respective `.env` files and fill in values.

## Branches and commits

- Branch from `main`: `feat/<short-name>`, `fix/<short-name>`, or
  `docs/<short-name>`.
- Prefer small, focused commits with an imperative subject line:
  - `fix(analyze): reject whitespace-only words`
  - `feat(a11y): label sidebar collapse button`
- Explain *why* in the body when the reason isn't obvious from the diff.

## Checks before pushing

```bash
# Backend
cd backend && python -m pytest

# Frontend
cd frontend
npx tsc --noEmit
npm run build
```

CI runs both suites on every pull request (`.github/workflows/ci.yml`),
so a green local run means a green PR.

## Pull requests

- Fill in the PR template: what changed, why, and how it was tested.
- Keep PRs reviewable — aim for under ~400 changed lines where practical.
- Screenshots help for UI changes (light **and** dark mode).
- Do not commit secrets: `.env` files are gitignored; only `*.env.example`
  placeholders belong in the repo.

## Style

- **TypeScript/React**: function components + hooks; keep pages
  presentational and data access in `services/api.ts`.
- **Python**: 4-space indent, docstrings for public functions and
  modules; type hints where they clarify contracts.
- **CSS**: Tailwind utilities; add reusable primitives to
  `frontend/src/index.css` rather than repeating long class chains.
- Respect accessibility: label icon-only controls, keep keyboard focus
  visible, and honour `prefers-reduced-motion`.

## Reporting bugs

Use the bug report issue template and include reproduction steps, the
expected/actual behaviour, and console or pytest output.
