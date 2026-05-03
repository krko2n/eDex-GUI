<<<<<<< HEAD
# CYBER-OS v1.0

## A Cyberpunk System Dashboard for Linux

CYBER-OS is a production-ready, fullscreen cyberpunk system dashboard built with Electron and Node.js. It provides realtime system monitoring, multi-terminal support, AI chat integration, and a terminal-based web browser.

```
╔════════════════════════════════════════════════════════════════════════╗
║                        CYBER-OS DASHBOARD                              ║
║  ┌──────────────┐ ┌──────────────────────┐ ┌──────────────────────┐   ║
║  │  SYSTEM INFO │ │   MAIN TERMINAL      │ │    AI ASSISTANT      │   ║
║  │              │ │  [TERM-1][TERM-2]... │ │  > Ask anything...   │   ║
║  │ CPU: 45%     │ │                      │ │                      │   ║
║  │ RAM: 62%     │ │ $ █                  │ │  [ROTATING GLOBE]    │   ║
║  │ TEMP: 52°C   │ │                      │ │                      │   ║
║  │              │ │                      │ │                      │   ║
║  └──────────────┘ └──────────────────────┘ └──────────────────────┘   ║
║  ┌────────────────────────────────────────────────────────────────┐   ║
║  │                      KEYBOARD                                  │   ║
║  │  [ Q ] [ W ] [ E ] [ R ] [ T ] [ Y ] [ U ] [ I ] [ O ] [ P ]  │   ║
║  └────────────────────────────────────────────────────────────────┘   ║
=======
# xKOR_3RR0R v2.1

Fullscreen cyberpunk-style system shell built with **Electron**, plain **HTML/CSS/JS**, and a local **Node** backend (**WebSockets** on port **3001**). Core UI loads from **`file://`**, so it runs offline without a Vite/webpack dev server.

Upstream visual inspiration: [eDEX-UI](https://github.com/GitSquared/edex-ui). This fork is rebranded **xKOR_3RR0R**.

```
╔════════════════════════════════════════════════════════════════════════╗
║                     xKOR_3RR0R — dashboard overview                      ║
║  SYSTEM INFO · multi-terminal · web/monitor/files tabs · AI (F2)       ║
>>>>>>> origin/main
╚════════════════════════════════════════════════════════════════════════╝
```

---

<<<<<<< HEAD
## Features

### 🎮 Multi-Terminal System
- **3 independent terminal sessions** with persistent state
- **Tab switching** via buttons or `ALT+1`, `ALT+2`, `ALT+3`
- Full bash/shell compatibility
- Command history navigation

### 📊 Real-Time System Monitoring
- **CPU Usage** - Updated every 200ms
- **RAM Usage** - Updated every 200ms  
- **System Temperature** - Updated every 1000ms
- **Network Activity** - Updated every 300ms
- Circular buffer graphs with smooth animations
- Large detailed monitor view

### 🤖 AI Chat Panel
- **Toggle with F2** - Right-side overlay panel
- Chat history with persistent storage
- Configurable local LLM endpoint (Ollama compatible)
- Message streaming with typing indicators
- Context-aware responses

### 🌐 Terminal-Based Web Browser
- URL input with auto-protocol detection
- HTML-to-text rendering
- Monochrome display (terminal-safe)
- Form-friendly navigation

### 📁 File Manager
- **Clickable UI** for navigation
- Double-click to open directories or files
- **Right-click context menu**:
  - View file content
  - Copy/Cut/Paste operations
  - Rename files
  - Delete files
  - Breadcrumb navigation
- Drag & drop support (planned)

### ⌨️ Interactive Virtual Keyboard
- Clickable keys send real keyboard events
- Physical keyboard visualization
- Modifier keys (SHIFT, CTRL, ALT, CAPS)
- Visual feedback for pressed keys
- Full ANSI key support

### 🌍 Animated Rotating Globe
- Real-time rotating globe visualization
- Threat zone indicators:
  - **Ukraine** (pulsing red zone)
  - **Middle East** (pulsing red zone)
  - **Taiwan** (pulsing red zone)
- Latitude/longitude grid
- Simplified continent rendering
- Positioned in UI corner

### 🖱️ Full Mouse Support
- Left/right click in all panels
- Context menus for file operations
- Hover highlighting
- Focus system with panel selection
- Scroll wheel support

---

## Installation

### Requirements
- **OS**: Arch Linux with pacman
- **Hardware**: 
  - CPU: Dual-core minimum (quad-core recommended)
  - RAM: 2GB minimum (4GB recommended)
  - Storage: 500MB free space
- **Display**: 1920x1080 minimum (fullscreen capable)

### Quick Install

```bash
git clone https://github.com/yourusername/cyber-os.git
cd cyber-os
./install.sh
./run.sh
```

The installation script automatically:
- ✅ Updates system packages
- ✅ Installs Node.js and npm
- ✅ Installs all dependencies
- ✅ Sets up permissions
- ✅ Configures default settings
=======
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
>>>>>>> origin/main

---

## Usage

<<<<<<< HEAD
### Launch
```bash
./run.sh
```

### Keyboard Shortcuts
=======
### Shortcuts
>>>>>>> origin/main

| Shortcut | Action |
|----------|--------|
| `F2` | Toggle AI panel |
<<<<<<< HEAD
| `ALT+1` | Switch to Terminal 1 |
| `ALT+2` | Switch to Terminal 2 |
| `ALT+3` | Switch to Terminal 3 |
| `ESC` | Exit fullscreen (dev mode only) |
| `CTRL+Q` | Quit application |
| `CTRL+SHIFT+I` | Developer tools (dev mode) |

### Panel Controls

**Top Bar**: Tab switching (TERMINAL, WEB, MONITOR, FILES)

**Left Panel**: 
- System info display
- CPU, RAM, temp, net graphs

**Main Area**:
- Current tab content (terminals, monitor, web, files)
- Dynamic layouts per tab

**Right Panel** (F2 toggle):
- AI assistant chat
- Real-time conversation
- Auto-scrolling history

**Bottom**:
- Virtual keyboard
- Full ANSI key mapping
- Modifier key visualization
=======
| `ALT+1` … `ALT+3` | Terminal 1–3 |
| `ESC` | Exit fullscreen (dev-style window) |
| `Ctrl+Q` | Quit |

Top bar switches **Terminal / Web / Monitor / Files**.
>>>>>>> origin/main

---

## Configuration

<<<<<<< HEAD
Default config: `config/cyber-os.config.json`
=======
Default file: **`xkor_3rror/config/xkor-3rror.config.json`** (created by `install.sh`).
>>>>>>> origin/main

```json
{
  "theme": "cyberpunk",
<<<<<<< HEAD
  "terminal": {
    "shell": "/bin/bash",
    "enableScrollup": true
  },
=======
  "terminal": { "shell": "/bin/bash", "enableScrollup": true },
>>>>>>> origin/main
  "ai": {
    "endpoint": "http://localhost:11434/api/generate",
    "model": "neural-chat",
    "enabled": true
  },
<<<<<<< HEAD
  "web": {
    "userAgent": "CYBER-OS/1.0"
  },
  "display": {
    "fullscreen": true,
    "width": 1920,
    "height": 1080
  }
}
```

### Environment Variables

```bash
# AI API Configuration
export AI_API_ENDPOINT="http://localhost:11434/api/generate"

# Backend port
export PORT=3001

# Shell preference
export SHELL="/bin/bash"

# Home directory
export HOME="/home/username"
```

---

## System Architecture

### Frontend (Electron)
- **Main Process**: Window management, IPC, system integration
- **Renderer Process**: UI rendering, DOM manipulation
- **Preload Script**: Secure IPC bridges
- **CSS Framework**: Cyberpunk theme with green terminal aesthetic

### Backend (Node.js)
- **Express**  server for REST API
- **WebSocket** for real-time system data
- **Terminal PTY** for shell spawning
- **System Monitor** for CPU/RAM/Temp/Network
- **File Manager** API
- **Web Renderer** for HTML-to-text conversion

### Data Flow
```
┌─────────────────────┐
│   Electron Window   │
│  ┌───────────────┐  │
│  │  Renderer JS  │  │
│  └───────┬───────┘  │
│          │ fetch/ws │
└──────────┼──────────┘
           │
    ┌──────v──────┐
    │Express + WS │
    │   Backend   │
    └──────┬──────┘
           │
    ┌──────v──────────┐
    │ System APIs:    │
    │ /proc, /sys      │
    │ PTY Spawning     │
    │ File Operations  │
    └─────────────────┘
```

---

## Performance

- **Frame Rate**: 30-60 FPS (smooth animations)
- **Memory**: ~150-200MB base, grows with terminal history
- **CPU**: <15% idle, <50% under heavy monitoring
- **Update Rates**:
  - CPU/RAM: 200ms
  - Network: 300ms
  - Temperature: 1000ms
- **Optimization**:
  - Circular buffers (prevent memory leaks)
  - Canvas double-buffering
  - Efficient DOM updates
  - RequestAnimationFrame for graphics

---

## Project Structure

```
cyber-os/
├── install.sh              # Installation script
├── run.sh                  # Startup script
├── package.json            # Dependencies
├── README.md               # This file
│
├── src/
│   ├── main/
│   │   ├── index.js        # Electron main process
│   │   └── preload.js      # IPC preload bridge
│   │
│   └── renderer/
│       ├── index.html      # Main UI
│       ├── styles.css      # Styling (cyberpunk theme)
│       ├── app.js          # Main controller
│       │
│       └── js/
│           ├── util.js     # Utilities (fetch, WebSocket, etc)
│           ├── monitor.js  # System monitoring
│           ├── terminal.js # Terminal manager
│           ├── filemanager.js # File manager
│           ├── keyboard.js # Virtual keyboard
│           ├── globe.js    # Rotating globe
│           ├── ai.js       # AI chat panel
│           └── web.js      # Web browser
│
├── backend/
│   └── server.js           # Express + WebSocket backend
│
├── assets/
│   └── (images, fonts if needed)
│
└── config/
    └── cyber-os.config.json # Configuration file
=======
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
>>>>>>> origin/main
```

---

<<<<<<< HEAD
## API Reference

### System Endpoints

```
GET /api/system/info          → { platform, arch, cpus, totalmem, hostname }
GET /api/system/cpu           → { usage: 0-100 }
GET /api/system/ram           → { usage: 0-100 }
GET /api/system/temp          → { temp: degrees_celsius }
GET /api/system/network       → { speed: bytes_per_second }
```

### File Operations

```
GET /api/files/list?path=X    → { files: [...], path }
GET /api/files/read?path=X    → { content: "..." }
DELETE /api/files/delete      → { path } → { status }
POST /api/files/rename        → { oldPath, newPath } → { status }
POST /api/files/copy          → { src, dst } → { status }
POST /api/files/move          → { src, dst } → { status }
```

### Web Browser

```
GET /api/web/render?url=X     → { text: "..." }
```

### AI Chat

```
POST /api/ai/chat             → { message } → { response }
```

---

## WebSocket Protocol

### Terminal Events

**Client → Server**:
```json
{
  "type": "terminal-input",
  "termId": 0,
  "data": "ls\n"
}
```

**Server → Client**:
```json
{
  "type": "terminal-output",
  "termId": 0,
  "output": "file.txt\n"
}
```

### System Data (Server → Client)

```json
{
  "type": "system-data",
  "data": {
    "cpu": 45,
    "ram": 62,
    "temp": 52,
    "net": 1024000,
    "timestamp": 1234567890
  }
}
=======
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
>>>>>>> origin/main
```

---

## Troubleshooting

<<<<<<< HEAD
### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process on port 3001
kill -9 $(lsof -t -i:3001)

# Try again
./run.sh
```

### Terminals not responding
```bash
# Check backend logs
ps aux | grep node

# Restart with verbose logging
PORT=3001 DEBUG=* node backend/server.js
```

### Temperature not reading
```bash
# Check thermal zones
cat /sys/class/thermal/thermal_zone0/temp

# Alternative: hwmon
ls /sys/class/hwmon/
```

### Missing dependencies on Arch
```bash
# Update pacman mirrors
sudo pacman -Syy

# Reinstall
./install.sh
```

### CPU/GPU too high
- Close unnecessary applications
- Reduce update frequencies in config
- Disable globe animation if needed
- Use device compositor (set `LIBGL_ALWAYS_INDIRECT=1`)

---

## Performance Tips

1. **Reduce Terminal History**: Clear terminals regularly with `clear` command
2. **Disable Unused Graphs**: Comment out unused canvas rendering in `monitor.js`
3. **Network Monitoring**: Only update if needed, increase interval
4. **Globe Animation**: Can be disabled by modifying `globe.js` animate() method
5. **AI Panel**: Only enable if LLM service is available

---

## Customization

### Change Theme Colors

Edit `src/renderer/styles.css`:
```css
/* Green terminal theme */
color: #0f0;  /* Green on black */
border: 1px solid #0f0;

/* Change to blue */
color: #00ff;
border: 1px solid #00ff;
```

### Add Custom System Metrics

Edit `backend/server.js` and add new endpoints:
```javascript
app.get('/api/system/custom', (req, res) => {
    res.json({ value: getSomeMetric() });
});
```

Then add to `src/renderer/js/monitor.js` to display.

### Change Shell

Edit `config/cyber-os.config.json`:
```json
{
  "terminal": {
    "shell": "/bin/zsh"
  }
}
```

### Connect to Remote LLM

Set environment variable:
```bash
export AI_API_ENDPOINT="http://192.168.1.100:11434/api/generate"
./run.sh
```

---

## Known Limitations

- File operations: Does not support drag & drop yet  (can be added)
- Web browser: Basic text rendering only (JavaScript not executed)
- Terminal: Some escape sequences may not render perfectly
- AI Chat: Requires local LLM (Ollama) to be installed and running
- Threat zones: Fixed locations (could be made dynamic with API)

---

## Future Enhancements

- [ ] Drag & drop file operations
- [ ] Advanced terminal features (split panes)
- [ ] Custom color themes from UI
- [ ] SSH terminal connections
- [ ] Python-based backend for better system integration
- [ ] GPU monitoring
- [ ] Process manager/taskbar
- [ ] System notifications
- [ ] Custom widgets framework

---

## Development

### Run in Dev Mode

```bash
cd cyber-os
npm install
npm run dev
```

Dev mode includes:
- DevTools window
- Hot reload (with electron-reloader)
- Console logging
- Windowed mode (not fullscreen)

### Debug Backend

```bash
DEBUG=* node backend/server.js
```

### Build for Distribution

```bash
npm run build
=======
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
>>>>>>> origin/main
```

---

## License

<<<<<<< HEAD
CYBER-OS v1.0 - MIT License

Based on eDex-UI by GitSquared, significantly modified and enhanced.

---

## Support

For issues, questions, or contributions:

```
Issues: GitHub Issues tracker
Documentation: See README sections
Code: src/ and backend/ directories
Config: config/cyber-os.config.json
```
=======
**MIT** — see `xkor_3rror/package.json` and upstream [eDEX-UI](https://github.com/GitSquared/edex-ui) attribution.
>>>>>>> origin/main

---

## Credits

<<<<<<< HEAD
- **Electron**: Cross-platform desktop framework
- **Node.js**: JavaScript runtime
- **Linux**: Free and open operating system
- **Inspiration**: Cyberpunk aesthetics and eDex-UI

---

**CYBER-OS v1.0** - Ultimate Linux System Dashboard

*"The future is now"* ⚡

---

## Version History

### v1.0 (Current)
- ✅ Full production release
- ✅ All core features implemented
- ✅ Tested on Arch Linux
- ✅ One-command installation
- ✅ Professional cyberpunk UI
- ✅ Complete documentation

---

Last Updated: 2026-05-02
=======
Electron, Node.js, WebSocket tooling, Linux `/proc` & friends, and cyberpunk / terminal UI inspiration (including eDEX-UI).
>>>>>>> origin/main
