# xKOR_3RR0R v2.1

Fullscreen cyberpunk-style system shell built with **Electron**, plain **HTML/CSS/JS**, and a local **Node** backend (**WebSockets** on port **3001**). Core UI loads from **`file://`**, so it runs offline without a Vite/webpack dev server.

Upstream visual inspiration: [eDEX-UI](https://github.com/GitSquared/edex-ui). This fork is rebranded **xKOR_3RR0R**.

```
╔════════════════════════════════════════════════════════════════════════╗
║                     xKOR_3RR0R — dashboard overview                      ║
║  SYSTEM INFO · multi-terminal · web/monitor/files tabs · AI (F2)       ║
╚════════════════════════════════════════════════════════════════════════╝
```

---

## Repository layout

| Path | Role |
|------|------|
| **`xkor_3rror/`** | Application (`package.json`, `install.sh`, `run.sh`, `run.bat`, `backend/`, Electron main + renderer) |

Most commands below assume **`cd xkor_3rror`**.

---

## Features (summary)

- **Multi-terminal** — three sessions, `ALT+1`/`2`/`3`; shell I/O via WebSocket.
- **Monitoring** — CPU, RAM, temperature, network graphs (real-time from backend).
- **AI panel** — toggled with **`F2`**; proxies to configurable LLM/Ollama-style endpoint.
- **Web / files / monitor tabs** — browser-style HTML→text rendering, file API, enlarged graphs.
- **Virtual keyboard**, globe widget, CRT-style boot flow in the renderer.

---

## Quick start

**Linux (incl. Arch):**

```bash
cd xkor_3rror
chmod +x install.sh run.sh scripts/install-autostart.sh  # if needed
./install.sh    # optional: system deps via pacman; always runs npm install
./run.sh
```

**Windows:**

```bat
cd xkor_3rror
npm install
run.bat
```

**Alternatives:**

- Backend in one terminal, Electron alone: `npm run backend` and `npm start`.
- **`npm run start:desktop`** — Node script starts backend then Electron (see `scripts/start-desktop.js`).
- **`npm run dev`** — windowed + DevTools (`--dev`).

---

## Autostart after login (Linux)

Electron needs a graphical session — this runs **when your desktop starts** (GNOME, KDE, Xfce, …), not at kernel/init.

From **`xkor_3rror/`**:

```bash
./scripts/install-autostart.sh              # ~/.config/autostart/xkor-3rror.desktop
./scripts/install-autostart.sh --systemd   # systemd --user unit
./scripts/install-autostart.sh --remove    # uninstall
```

Use **either** XDG autostart **or** the user service (not both). After `--systemd`: `systemctl --user start xkor-3rror.service`.

---

## Architecture

- **One backend only** binds **3001** (HTTP + WebSocket). Do **not** start `backend/server.js` twice (`EADDRINUSE`). Use **`run.sh`**, **`run.bat`**, or **`npm run start:desktop`**. Electron’s main process must **not** spawn the backend (see comments in `xkor_3rror/src/main/index.js`).
- **Renderer** — static files under `xkor_3rror/src/renderer/`; Electron loads `index.html` via `loadFile`.
- **Offline shell** — no CDN requirement for UI. AI / remote web paths may need the network.

### Data flow (conceptual)

```
Electron (renderer)  —fetch / WS—►  Express + WebSocket backend  —►  /proc, /sys, PTY, fs
```

---

## Usage

### Shortcuts

| Shortcut | Action |
|----------|--------|
| `F2` | Toggle AI panel |
| `ALT+1` … `ALT+3` | Terminal 1–3 |
| `ESC` | Exit fullscreen (dev-style window) |
| `Ctrl+Q` | Quit |

Top bar switches **Terminal / Web / Monitor / Files**.

---

## Configuration

Default file: **`xkor_3rror/config/xkor-3rror.config.json`** (created by `install.sh`).

```json
{
  "theme": "cyberpunk",
  "terminal": { "shell": "/bin/bash", "enableScrollup": true },
  "ai": {
    "endpoint": "http://localhost:11434/api/generate",
    "model": "neural-chat",
    "enabled": true
  },
  "web": { "userAgent": "xKOR_3RR0R/2.1" },
  "display": { "fullscreen": true, "width": 1920, "height": 1080 }
}
```

### Environment variables

| Variable | Purpose |
|----------|---------|
| `AI_API_ENDPOINT` | Override AI backend URL |
| `PORT` | Backend port (default `3001`) |
| `SHELL` | Shell used by terminals |
| `HOME` | Home for PTYs |

---

## Project structure (`xkor_3rror/`)

```
xkor_3rror/
├── install.sh · run.sh · run.bat · package.json
├── scripts/
│   ├── install-autostart.sh
│   └── start-desktop.js
├── src/main/          # Electron main + preload
├── src/renderer/      # index.html, app.js, styles.css, js/
├── backend/server.js # Express + WebSocket + system APIs
└── config/
```

---

## HTTP API (cheat sheet)

Base URL: `http://localhost:3001/api`

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/system/info`, `/system/cpu`, `/system/ram`, `/system/temp`, `/system/network` | Metrics |
| `GET` | `/files/list?path=` | Directory listing |
| `GET` | `/files/read?path=` | File contents |
| `DELETE` | `/files/delete` | Body: `{ path }` |
| `POST` | `/files/rename`, `/files/copy`, `/files/move` | Body paths |
| `GET` | `/web/render?url=` | HTML → text proxy |
| `POST` | `/ai/chat` | Body: `{ message }` |

---

## WebSocket (port 3001)

**Client → server (terminal)**

```json
{ "type": "terminal-input", "termId": 0, "data": "ls\n" }
```

**Server → client**

```json
{ "type": "terminal-output", "termId": 0, "output": "…" }
```

**Server → client (metrics broadcast)**

```json
{ "type": "system-data", "data": { "cpu", "ram", "temp", "net", "timestamp" } }
```

---

## Troubleshooting

| Problem | What to try |
|---------|----------------|
| **`EADDRINUSE` ::3001** | Only one backend. Check `package.json` → **`"main": "src/main/index.js"`** (never `backend/server.js`). `./run.sh` kills the port, then starts `node backend/server.js`, then `./node_modules/.bin/electron .` directly. Pull latest fixes or replace an old **`cyber-os`** tree. |
| **Blank UI + `localhost:3000`** | Electron must **`loadFile` / `file://`** the renderer (`src/renderer/index.html`), not a webpack dev URL. Upgrade to current `src/main/index.js`. |
| **Port 3001 in use** | `lsof -i :3001` / `fuser -k 3001/tcp` |
| **`electron-builder: command not found`** | Run **`npm install`** without **`--omit=dev`** — `electron-builder` is a devDependency. Then **`npm run build`** (runs `npx --no-install electron-builder`). |
| **npm audit (high)** | After full install: **`npm audit fix`** then **`npm audit`** again. |
| **Backend exits** | `PORT=3001 node xkor_3rror/backend/server.js` from `xkor_3rror/` for logs |
| **Arch deps** | Re-run `./install.sh` or `sudo pacman -Syu nodejs npm` etc. |

---

## Development / packaging

```bash
cd xkor_3rror
npm install
npm run dev           # Electron + DevTools, windowed
DEBUG=* node backend/server.js
npm run build         # electron-builder (needs devDependencies)
```

---

## License

**MIT** — see `xkor_3rror/package.json` and upstream [eDEX-UI](https://github.com/GitSquared/edex-ui) attribution.

---

## Credits

Electron, Node.js, WebSocket tooling, Linux `/proc` & friends, and cyberpunk / terminal UI inspiration (including eDEX-UI).
