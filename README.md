<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/72d140aa-5c07-4dd4-8313-7ae949806450

## Run Locally

**Prerequisites:** Node.js **18 or later** (Node 20 LTS recommended)


1. Install dependencies:
   `npm install`
2. Create `.env.local` from `.env.example` and set:
   - `GEMINI_API_KEY` (server-side only)
3. Run backend API (keeps Gemini key off the client bundle):
   `npm run dev:server`
4. Run frontend app:
   `npm run dev`

### Security note

- Never store Gemini keys in variables prefixed with `VITE_`. Vite exposes those values to browser JavaScript.
- This project now calls Gemini from an Express backend endpoint (`/api/refine-focus`) so secrets remain server-side.
