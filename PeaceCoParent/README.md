# PeaceCoParent

Webapp for medforeldre. Delt kalender, meldinger, utgifter og dokumenter.

**Live:** [peacecoparent.com](https://peacecoparent.com)

## Struktur

- `frontend-next/` — Next.js (hovedfrontend)
- `backend/` — Node.js + Express + PostgreSQL
- `mobile/` — Expo-app

## Kjøre lokalt

```bash
cd backend && npm install && cp .env.example .env
cd ../frontend-next && npm install && cp .env.example .env.local
```

Start backend (`npm run dev`) og frontend (`npm run dev`). Fyll inn egne verdier i `.env`-filene.