<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NotebookLM Prompt Generator for ECG Course

This repository contains everything you need to run the app locally and deploy it.

View your app in AI Studio: https://ai.studio/apps/72d140aa-5c07-4dd4-8313-7ae949806450

## Prerequisites

- Node.js **22 or later**
- npm (bundled with Node.js)

## Environment setup

1. Copy `.env.example` to `.env.local`.
2. Set `GEMINI_API_KEY` in `.env.local` (server-side only).
3. (Optional) Set `VITE_BACKEND_URL` if your frontend should call a non-default backend URL.

## Run locally

1. Install dependencies:
   - `npm install`
2. Start backend API (keeps Gemini key off the client bundle):
   - `npm run dev:server`
3. Start frontend app:
   - `npm run dev`

## Package scripts

- `npm run dev`: Runs the Vite frontend dev server on port `3000`.
- `npm run dev:server`: Runs the Express backend server (`server/index.ts`).
- `npm run build`: Builds the production frontend bundle.
- `npm run preview`: Serves the production build locally.
- `npm run clean`: Removes the `dist` directory.
- `npm run lint`: Runs TypeScript type-checking (`tsc --noEmit`).

## Security notes

- Never store Gemini keys in variables prefixed with `VITE_`.
- Never expose `GEMINI_API_KEY` in frontend bundles.
- Route Gemini calls through the backend API (`/api/refine-focus`).
- `POST /api/refine-focus` is protected by rate limiting (1 minute window, max 20 requests per IP).
- `GET /api/health` is intentionally excluded from rate limiting for uptime checks.
- When throttled, the API returns HTTP `429` with a consistent error payload: `{ "error": "Too many requests. Please retry in 1 minute." }`.

## License recommendations

- **Code**: This repository includes an MIT License in `LICENSE`.
- **Course/content materials** (prompts, handouts, teaching assets): consider a separate content license such as **CC BY-NC-SA 4.0** if non-commercial sharing is intended.
