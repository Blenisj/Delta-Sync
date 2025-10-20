# Delta‑Sync (AC Telemetry) — Local Development

A React + Vite app styled with Tailwind CSS v4. The repo is a simple workspace with a “client” app (frontend). Backend is optional.

## Prerequisites
- Node.js 20+ (LTS recommended)
- npm 10+
- Windows PowerShell or a POSIX shell

Check versions:
```powershell
node -v
npm -v
```

## Project structure
```
Delta-Sync/
  client/               # React + Vite + Tailwind v4 app
  backend/              # optional; placeholder package.json
  package.json          # root (workspaces)
```

## 1) Clone and install
```powershell
git clone <this-repo-url> Delta-Sync
cd Delta-Sync

# install client deps
cd client
npm install
```

## 2) Run the dev server
```powershell
npm run dev
```


## Tailwind CSS (v4) setup used in this repo

This project uses Tailwind v4 with the official Vite plugin (no PostCSS config required).

- Vite plugin: `@tailwindcss/vite` is enabled in `client/vite.config.ts`
- CSS entry: `client/src/styles/globals.css` imports Tailwind via:
  ```css
  @import "tailwindcss";
  /* design tokens and @layer base live here */
  ```
- Tailwind config is ESM: `client/tailwind.config.ts` (export default)

Important:
- Do not add a PostCSS config to the client app. The Vite plugin handles Tailwind.
- If you add a PostCSS config anyway, it can interfere with Tailwind v4.
