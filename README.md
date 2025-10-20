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
Open http://localhost:5173

## 3) Build and preview
```powershell
npm run build
npm run preview
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

## Common issues and fixes

1) Page looks unstyled (no Tailwind utilities)
- Check the CSS import in the app entry:
  ```ts
  // client/src/main.tsx
  import "./styles/globals.css";
  ```
- Confirm Vite plugin is present:
  ```ts
  // client/vite.config.ts
  import tailwindcss from "@tailwindcss/vite";
  export default defineConfig({ plugins: [react(), tailwindcss()] });
  ```
- Ensure Tailwind config file is ESM (this repo uses `tailwind.config.ts` with `export default`).
- Remove any PostCSS config files in client (if present):
  ```powershell
  Remove-Item -Recurse -Force postcss.config.*  # in client/
  ```
- Clear Vite cache and restart:
  ```powershell
  Remove-Item -Recurse -Force node_modules\.vite
  npm run dev
  ```
- Hard refresh the browser (Ctrl+F5). In DevTools → Network → globals.css, you should see a header like:
  `/*! tailwindcss v4.x */`

2) Editor shows “Unknown at rule @tailwind”
- Cosmetic linter warning. Install the Tailwind CSS IntelliSense extension in VS Code or ignore:
  ```json
  // .vscode/settings.json
  { "css.lint.unknownAtRules": "ignore", "scss.lint.unknownAtRules": "ignore" }
  ```

3) “Cannot apply unknown utility class border-border”
- Don’t `@apply` custom utilities on the universal selector (`*`) or outside components.
- If needed globally, use plain CSS:
  ```css
  * { border-color: hsl(var(--border)); }
  ```
  or use the class `border-border` in markup rather than `@apply` in global CSS.

4) “Failed to load PostCSS config” or autoprefixer errors
- Remove `postcss.config.*` from `client/` (Tailwind v4 + Vite plugin does not need it).

5) Workspace JSON errors on install (EJSONPARSE / “Unexpected end of JSON”)
- Ensure both root and backend package.json files are valid JSON (no empties).
  Minimal backend/package.json is fine:
  ```json
  { "name": "delta-sync-backend", "version": "1.0.0", "private": true, "type": "module" }
  ```

6) Windows cache removal commands
- Use PowerShell equivalents, not `rm -rf`:
  ```powershell
  Remove-Item -Recurse -Force node_modules\.vite
  ```

## Tech stack
- React 19 + Vite 7
- Tailwind CSS v4 + @tailwindcss/vite
- Radix UI, shadcn/ui-like components
- TypeScript

## Scripts (client/)
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build

## Troubleshooting checklist (unstyled UI)
- [ ] `client/src/main.tsx` imports `./styles/globals.css`
- [ ] `client/vite.config.ts` includes `tailwindcss()` plugin
- [ ] `client/src/styles/globals.css` starts with `@import "tailwindcss";`
- [ ] `client/tailwind.config.ts` exists and is ESM (`export default { ... }`)
- [ ] No `postcss.config.*` in client
- [ ] Cleared `node_modules/.vite` and hard-refreshed browser
- [ ] Network tab shows compiled `globals.css` (contains `/*! tailwindcss v4` header)

If problems persist, open an issue with:
- OS, Node, npm versions
- `client/vite.config.ts`, `client/tailwind.config.ts`
- The first 50 lines of `client/src/styles/globals.css`
- Console and terminal output from `npm run dev`