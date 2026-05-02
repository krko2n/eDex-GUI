# xKOR_3RR0R v2.1

## A Cyberpunk System Dashboard for Linux

xKOR_3RR0R is a production-ready, fullscreen cyberpunk system dashboard built with Electron and Node.js. It provides realtime system monitoring, multi-terminal support, AI chat integration, and a terminal-based web browser.

```
╔════════════════════════════════════════════════════════════════════════╗
║                        xKOR_3RR0R DASHBOARD                              ║
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
╚════════════════════════════════════════════════════════════════════════╝
```

---

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
git clone https://github.com/yourusername/xkor_3rror.git
cd xkor_3rror
./install.sh
./run.sh
```

The installation script automatically:
- ✅ Updates system packages
- ✅ Installs Node.js and npm
- ✅ Installs all dependencies
- ✅ Sets up permissions
- ✅ Configures default settings

---

## Usage

### Launch
```bash
./run.sh
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F2` | Toggle AI panel |
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

---

## Configuration

Default config: `config/xkor-3rror.config.json`

```json
{
  "theme": "cyberpunk",
  "terminal": {
    "shell": "/bin/bash",
    "enableScrollup": true
  },
  "ai": {
    "endpoint": "http://localhost:11434/api/generate",
    "model": "neural-chat",
    "enabled": true
  },
  "web": {
    "userAgent": "xkor_3rror/1.0"
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
xkor_3rror/
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
    └── xkor-3rror.config.json # Configuration file
```

---

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
```

---

## Troubleshooting

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

Edit `config/xkor-3rror.config.json`:
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
cd xkor_3rror
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
```

---

## License

xKOR_3RR0R v1.0 - MIT License

Based on eDex-UI by GitSquared, significantly modified and enhanced.

---

## Support

For issues, questions, or contributions:

```
Issues: GitHub Issues tracker
Documentation: See README sections
Code: src/ and backend/ directories
Config: config/xkor-3rror.config.json
```

---

## Credits

- **Electron**: Cross-platform desktop framework
- **Node.js**: JavaScript runtime
- **Linux**: Free and open operating system
- **Inspiration**: Cyberpunk aesthetics and eDex-UI

---

**xKOR_3RR0R v1.0** - Ultimate Linux System Dashboard

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
