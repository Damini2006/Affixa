# Build the static bundle, then serve it with nginx (SPA fallback included).
# NOTE: build context is the repo ROOT (see docker-compose.yml), because the
# frontend imports backend/app/nlp/dictionaries/*.json directly.
FROM node:22-alpine AS build

WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN npm ci --prefix frontend

COPY frontend ./frontend
COPY backend/app/nlp/dictionaries ./backend/app/nlp/dictionaries

WORKDIR /app/frontend

# Vite inlines these at build time — pass via compose build.args.
ARG VITE_SUPABASE_URL=https://placeholder.supabase.co
ARG VITE_SUPABASE_ANON_KEY=placeholder_key
ARG VITE_API_URL=http://localhost:8000/api

RUN npm run build

FROM nginx:alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
