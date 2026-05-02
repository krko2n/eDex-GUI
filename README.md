# xKOR_3RR0R

Fullscreen cyberpunk-style system shell built with Electron, plain HTML/CSS/JS, and a local Node backend (WebSockets on port **3001**). Core UI loads from **`file://`** so it runs offline without Vite/webpack dev servers.

Upstream visual inspiration includes [eDEX-UI](https://github.com/GitSquared/edex-ui). This fork is rebranded as **xKOR_3RR0R**.

## Repository layout

- **`xkor_3rror/`** — application source (`package.json`, `run.sh`, `run.bat`, backend, Electron main + renderer).

## Quick start

**Linux / WSL:**

```bash
cd xkor_3rror
./install.sh   # optional; Arch-focused system deps
npm install
./run.sh
```

Or: `npm run backend` in one terminal and `npm start` (Electron only) in another.

**Windows:**

```bat
cd xkor_3rror
npm install
run.bat
```

Or: `npm run start:desktop` (starts backend child process, then Electron, and shuts down backend when Electron exits).

**Developer windowed mode:** `npm run dev` (opens DevTools; not fullscreen).

## Architecture notes

- **Single backend** binds **3001** (HTTP + WebSocket). Do not start `backend/server.js` twice; use `run.sh`, `run.bat`, or `npm run start:desktop` to avoid `EADDRINUSE`.
- **Renderer** is static files under `xkor_3rror/src/renderer/`; Electron loads `index.html` directly.
- **AI / web search** features may use the network; the shell and local monitoring should remain usable when offline or when the backend is still starting.
