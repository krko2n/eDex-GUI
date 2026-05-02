# QUICK START GUIDE - CYBER-OS

## 30-Second Setup

```bash
git clone https://github.com/yourusername/cyber-os.git
cd cyber-os
chmod +x install.sh run.sh
./install.sh
./run.sh
```

Done! CYBER-OS is now running.

---

## First Time User Tips

### 🎮 Essential Controls
- **F2** → Toggle AI Chat Panel
- **ALT+1/2/3** → Switch Between 3 Terminals
- **ESC** → Exit fullscreen (dev mode)
- **CTRL+Q** → Quit app

### 📊 What You're Seeing
- **Left Panel**: System stats (CPU, RAM, Temp) with live graphs
- **Center**: Active terminal (or other tabs)
- **Right Panel** (F2): AI assistant for questions
- **Bottom**: Interactive keyboard that mirrors your keypresses
- **Corner**: Rotating globe with threat zones

### 🖥️ First Commands
Try in the  terminal:
```bash
# Check system info
neofetch

# Monitor resources
top

# List files
ls -la

# Check network
nmcli dev show
```

### 💬 Using AI Chat
1. Press **F2** to open AI panel
2. Type your question
3. Wait for response (needs Ollama running for best experience)
4. Chat history automatically saved

### 📁 File Manager Tab
1. Click **FILES** tab
2. Double-click folders to enter
3. Right-click for context menu (copy, delete, rename)
4. Breadcrumb bar shows current path

### 🌐 Web Browser Tab
1. Click **WEB** tab
2. Paste a URL
3. Click GO
4. See rendered text version

### 📈 System Monitor Tab
1. Click **MONITOR** tab
2. See large graphs for all metrics
3. Monitor over time

---

## Customization

### Change Terminal Shell
Edit `config/cyber-os.config.json`:
```json
{
  "terminal": {
    "shell": "/bin/zsh"
  }
}
```

### Connect to Remote AI
Set before running:
```bash
export AI_API_ENDPOINT="http://192.168.1.100:11434/api/generate"
./run.sh
```

### Use Zsh or Fish
Modify the terminal config or set $SHELL:
```bash
export SHELL=/bin/zsh
./run.sh
```

---

## Troubleshooting

**Backend not starting?**
- Check if port 3001 is free: `lsof -i :3001`
- Kill process: `kill -9 $(lsof -t -i:3001)`

**Terminals not responding?**
- Check backend: `ps aux | grep node`
- Restart with: `./run.sh`

**AI not working?**
- Install Ollama: https://ollama.ai
- Pull model: `ollama pull neural-chat`
- Run: `ollama serve`

**Graphs not showing?**
- Check `/proc/stat` readable: `cat /proc/stat`
- Check `/proc/meminfo`: `cat /proc/meminfo`
- Verify backend logs

---

## Key Features at a Glance

| Feature | How to Access | Notes |
|---------|---------------|-------|
| Terminals | Click TERMINAL tab or use ALT+1-3 | 3 independent sessions |
| AI Chat | Press F2 | Needs Ollama running |
| System Monitor | Click MONITOR tab | Real-time graphs |
| File Manager | Click FILES tab | Full operations support |
| Web Browser | Click WEB tab | Text rendering only |
| Keyboard | Bottom panel | Keys light up on press |
| Globe | Corner widget | Animated threat zones |

---

## Next Steps

1. **Install Ollama** for AI:
   ```bash
   curl https://ollama.ai/install.sh | sh
   ollama pull neural-chat
   ollama serve
   ```

2. **Customize theme** in `src/renderer/styles.css`

3. **Add shortcuts** to frequently used commands in terminal history

4. **Configure AI model** in `.env` file

5. **Connect multiple machines** via SSH terminals

---

## Need Help?

- Check README.md for detailed documentation
- Review config/cyber-os.config.json for all options
- Check backend logs: `node backend/server.js --debug`
- Run in dev mode: `npm run dev`

---

**Enjoy CYBER-OS! Stay cyber. 🚀**
