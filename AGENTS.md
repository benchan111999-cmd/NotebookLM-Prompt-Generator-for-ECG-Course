# AGENTS.md - Repository Instructions

## Setup

1. Install dependencies: `npm install`
2. Create `.env.local` from `.env.example` and set `GEMINI_API_KEY`

## Running the Application

### Development
- Run backend API (keeps Gemini key off the client bundle): `npm run dev:server`
- Run frontend app: `npm run dev`

### Production Build
- Build for production: `npm run build`

## Architecture

This is a React + Vite application with an Express backend.

### Backend
- Express server located in `server/index.ts`
- Provides a secure endpoint for the Gemini API key
- Never store Gemini keys in variables prefixed with `VITE_`. Vite exposes those values to browser JavaScript.

### Frontend
- React application in `src/` directory
- Main entry point: `src/main.tsx`
- App component: `src/App.tsx`

## Key Implementation Details

1. The application has a backend API endpoint (`/api/refine-focus`) that uses the Gemini API to refine focus prompts
2. Frontend generates prompts for NotebookLM based on selected ECG course modules and topics
3. The application is designed to run on port 3000 for frontend and 8787 for backend by default
4. The backend uses `tsx` to run the server: `tsx server/index.ts`

## Deployment

The application is configured to deploy to GitHub Pages via GitHub Actions.

## Security

- The `GEMINI_API_KEY` is secured on the backend and never exposed to the client bundle
- The application follows security best practices by not exposing environment variables with `VITE_` prefix

## Commands

- Development: `npm run dev` and `npm run dev:server`
- Build: `npm run build`
- Type checking: `npm run lint`
- Preview: `npm run preview`
- Clean: `npm run clean`

## Style

- Uses Tailwind CSS for styling
- Follows a modern component-based architecture with React 18
- Uses Vite for build tooling