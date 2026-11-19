# Шексіз білім AI
React + TS (Vite) frontend, Express AI proxy, Postgres/Supabase schema.
1. `npm i` → copy `.env.example` to `.env` (AI_PROVIDER=gemini|openai, key server-side only; `mock` works without a key)
2. `npm run server` and `npm run dev` (Vite proxies /api to :8787)
3. `npm run build && npm start` serves everything on one port
Routes: `/`, `/:module/:role` (adaptive|social|story × student|teacher). DB: `db/schema.sql`.
Next stages: auth (Supabase), save results to ai_results, teacher approval flow, guardian consent.

## Updated modules
- Adaptive: original implementation retained.
- Social: six scenario cards, three difficulty modes, contextual AI dialogue, browser speech output and labelled offline practice.
- Story: three offline stories, teacher AI generation, editable scenes, approval preview and browser print. Illustrations are emoji, not generated images.
- New API routes: POST /api/social/turn and POST /api/story/generate.

The teacher/student routes are still prototype views, not authenticated roles. Do not publish with real student data until authentication, authorization, consent, persistence, and abuse controls are implemented. AI output requires educational supervision. Browser audio depends on installed voices. The project was not fully built in the editing environment because dependencies could not be downloaded; run npm ci, npm run build, npm test locally.
