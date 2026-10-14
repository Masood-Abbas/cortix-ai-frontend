# CortexAI Frontend

React 19 and Vite frontend for the CortexAI chat application. It includes authentication, conversations, chat, file uploads, generated artifacts, and billing screens.

## Setup

Requirements: Node.js 20+ and the backend gateway running on `http://localhost:8000`.

```powershell
npm install
copy .env.example .env
npm run dev
```

The development app runs at `http://localhost:5173`.

## Commands

```powershell
npm run dev
npm run build
npm run preview
npm run lint
npm test
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_FIREBASE_APKEY` | Firebase browser API key used by the current configuration |
| `VITE_SERVER_URL` | Backend gateway base URL |

Only browser-safe `VITE_*` values belong here. Never put server secrets in frontend environment files.
