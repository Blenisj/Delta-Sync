# Delta‑Sync (AC Telemetry) — Local Development

React + Vite + Tailwind CSS v4 (frontend in `client/`). Backend is optional.

## Prerequisites
- Node.js 20+ (LTS recommended)
- npm 10+
- Windows PowerShell (commands below use PowerShell)

Check:
```powershell
node -v
npm -v
```

## Project structure
```
Delta-Sync/
  client/               # React + Vite + Tailwind v4 app
  backend/              # optional (placeholder)
  package.json          # root (workspaces)
```

## 1) Install dependencies (run BOTH)
```powershell
# In repo root
cd <path-to>/Delta-Sync
npm install

# Then install inside client (ensures Vite and plugins are present locally)
cd client
npm install
```

If you add a backend later, also run:
```powershell
cd ..\backend
npm install
```

# Install for rechart (ensures visuals for the graphs works on the frontend and is compatible with how tailwind manages it)
cd client
npm install recharts

## 2) Run the dev server
```powershell
cd client
npm run dev
```
Open http://localhost:5173

If you see “‘vite’ is not recognized”, you skipped “npm install” inside `client/`. Run:
```powershell
npm install
npm run dev
```

## 3) Build and preview
```powershell
cd client
npm run build
npm run preview
```

## Tailwind CSS v4 setup (what this repo uses)
- Vite plugin enabled in `client/vite.config.ts`:
  ```ts
  import tailwindcss from "@tailwindcss/vite";
  export default defineConfig({ plugins: [react(), tailwindcss()] });
  ```
- CSS entry imports Tailwind in `client/src/styles/globals.css`:
  ```css
  @import "tailwindcss";
  @plugin "tailwindcss-animate";
  ```
- Tailwind config is ESM: `client/tailwind.config.ts` (`export default { ... }`)

Do NOT add a PostCSS config in `client/` — the Vite plugin handles Tailwind.