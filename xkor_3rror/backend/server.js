const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');

/**
 * Fail fast if Electron was mistakenly configured to run THIS file as the app "main"
 * If package.json mistakenly sets "main" to backend/server.js, Electron runs this file twice
 * (alongside `./run.sh` starting Node) → second listener on PORT and
 * causes listen EADDRINUSE when run.sh already started the backend via plain Node:
 * node backend/server.js & then npm start → electron loads server.js → second bind.
 *
 * Allowed: plain `node backend/server.js`, or Electron with `ELECTRON_RUN_AS_NODE=1`
 * embedded tooling. Escape hatch: XKOR_ALLOW_BACKEND_IN_ELECTRON=1 (avoid in production).
 */
const runningUnderPlainNodeForBackend =
    process.env.ELECTRON_RUN_AS_NODE === '1' ||
    typeof process.versions?.electron !== 'string';

if (
    !runningUnderPlainNodeForBackend &&
    require.main === module &&
    process.env.XKOR_ALLOW_BACKEND_IN_ELECTRON !== '1'
) {
    console.error(`
[xKOR_3RR0R] Refusing to start the HTTP/WebSocket backend inside Electron.

Cause: package.json → "main" must point at the Electron main process script, usually:
       "main": "src/main/index.js"
       It must NOT be "backend/server.js".

Start backend once from the shell:  node backend/server.js
Launch UI:                          npm start / ./node_modules/.bin/electron .

Or use ./run.sh which starts backend + Electron correctly.
`);
    process.exit(1);
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from renderer
app.use(express.static(path.join(__dirname, '../src/renderer')));

// System monitoring variables
let lastCpuTime = 0;
let lastIdleTime = 0;
const terminalProcesses = new Map();

// WebSocket connections
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('Client connected');
    clients.add(ws);
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleTerminalCommand(data, ws);
        } catch (e) {
            console.error('WebSocket message error:', e);
        }
    });
    
    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});

// Broadcast system data to all clients
function broadcastSystemData(data) {
    const message = JSON.stringify({ type: 'system-data', data });
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Terminal handling
function handleTerminalCommand(data, ws) {
    if (data.type === 'terminal-input') {
        const { termId, data: input } = data;
        const term = terminalProcesses.get(termId);
        
        if (term) {
            term.stdin.write(input);
        } else {
            // Create new terminal if doesn't exist
            createTerminal(termId, ws);
        }
    }
}

function createTerminal(termId, ws) {
    const shell = process.env.SHELL || '/bin/bash';
    const pty = spawn(shell, [], {
        cwd: process.env.HOME,
        env: process.env
    });
    
    const termData = {
        stdin: pty.stdin,
        process: pty
    };
    
    terminalProcesses.set(termId, termData);
    
    pty.stdout.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'terminal-output',
                termId: termId,
                output: data.toString()
            }));
        }
    });
    
    pty.stderr.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'terminal-output',
                termId: termId,
                output: data.toString()
            }));
        }
    });
}

// CPU Usage
function getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
        Object.keys(cpu.times).forEach(type => {
            totalTick += cpu.times[type];
        });
        totalIdle += cpu.times.idle;
    });
    
    const idle = totalIdle;
    const total = totalTick;
    const currentIdle = idle - lastIdleTime;
    const currentTotal = total - lastCpuTime;
    
    lastIdleTime = idle;
    lastCpuTime = total;
    
    const usage = 100 - Math.round(100 * currentIdle / currentTotal);
    return Math.max(0, Math.min(100, usage || 0));
}

// Temperature (Linux)
function getSystemTemperature() {
    try {
        // Try /sys/class/thermal first
        const thermalDir = '/sys/class/thermal';
        if (fs.existsSync(thermalDir)) {
            const zones = fs.readdirSync(thermalDir);
            for (const zone of zones) {
                const tempFile = path.join(thermalDir, zone, 'temp');
                if (fs.existsSync(tempFile)) {
                    const temp = parseInt(fs.readFileSync(tempFile, 'utf8')) / 1000;
                    return Math.round(temp * 10) / 10;
                }
            }
        }
        
        // Fallback to hwmon
        const hwmonDir = '/sys/class/hwmon';
        if (fs.existsSync(hwmonDir)) {
            const devices = fs.readdirSync(hwmonDir);
            for (const device of devices) {
                const tempFile = path.join(hwmonDir, device, 'temp1_input');
                if (fs.existsSync(tempFile)) {
                    const temp = parseInt(fs.readFileSync(tempFile, 'utf8')) / 1000;
                    return Math.round(temp * 10) / 10;
                }
            }
        }
    } catch (e) {
        console.error('Error reading temperature:', e);
    }
    
    // Return default if can't read
    return 45;
}

// Memory Usage
function getMemoryUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usage = Math.round((usedMem / totalMem) * 100);
    return usage;
}

// Network Usage
let lastNetStats = null;
function getNetworkUsage() {
    try {
        if (fs.existsSync('/proc/net/dev')) {
            const data = fs.readFileSync('/proc/net/dev', 'utf8');
            const lines = data.split('\n');
            let totalReceived = 0;
            let totalSent = 0;
            
            lines.forEach(line => {
                const match = line.match(/^\s*(\w+):\s+([\d]+)\s+([\d]+).*?([\d]+)\s+([\d]+)/);
                if (match && !match[1].includes('lo')) {
                    totalReceived += parseInt(match[2]);
                    totalSent += parseInt(match[4]);
                }
            });
            
            const now = Date.now();
            let speed = 0;
            
            if (lastNetStats) {
                const timeDiff = (now - lastNetStats.time) / 1000;
                const bytesDiff = totalReceived + totalSent - lastNetStats.bytes;
                speed = bytesDiff / timeDiff;
            }
            
            lastNetStats = { bytes: totalReceived + totalSent, time: now };
            return speed;
        }
    } catch (e) {
        console.error('Error reading network:', e);
    }
    
    return 0;
}

// API Endpoints
app.get('/api/system/info', (req, res) => {
    res.json({
        platform: process.platform,
        arch: process.arch,
        cpus: os.cpus().length,
        totalmem: os.totalmem(),
        freemem: os.freemem(),
        uptime: os.uptime(),
        hostname: os.hostname()
    });
});

app.get('/api/system/cpu', (req, res) => {
    res.json({ usage: getCPUUsage() });
});

app.get('/api/system/ram', (req, res) => {
    res.json({ usage: getMemoryUsage() });
});

app.get('/api/system/temp', (req, res) => {
    res.json({ temp: getSystemTemperature() });
});

app.get('/api/system/network', (req, res) => {
    res.json({ speed: getNetworkUsage() });
});

// File Operations
app.get('/api/files/list', (req, res) => {
    const dirPath = req.query.path || process.env.HOME;
    
    try {
        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        const fileList = files.map(f => ({
            name: f.name,
            type: f.isDirectory() ? 'dir' : 'file',
            size: !f.isDirectory() ? fs.statSync(path.join(dirPath, f.name)).size : 0
        }));
        
        res.json({ files: fileList, path: dirPath });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.get('/api/files/read', (req, res) => {
    const filePath = req.query.path;
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.json({content});
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.delete('/api/files/delete', (req, res) => {
    const { path: filePath } = req.body;
    
    try {
        if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                fs.rmSync(filePath, { recursive: true });
            } else {
                fs.unlinkSync(filePath);
            }
            res.json({ status: 'deleted' });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/files/rename', (req, res) => {
    const { oldPath, newPath } = req.body;
    
    try {
        fs.renameSync(oldPath, newPath);
        res.json({ status: 'renamed' });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/files/copy', (req, res) => {
    const { src, dst } = req.body;
    
    try {
        fs.copyFileSync(src, dst);
        res.json({ status: 'copied' });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/files/move', (req, res) => {
    const { src, dst } = req.body;
    
    try {
        fs.renameSync(src, dst);
        res.json({ status: 'moved' });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Web rendering (simple text extraction)
app.get('/api/web/render', async (req, res) => {
    const url = req.query.url;
    
    try {
        const response = await axios.get(url, { timeout: 5000 });
        const text = response.data;
        
        // Simple HTML to text conversion
        const textContent = text
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, '\n')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&amp;/gi, '&')
            .replace(/\n\s*\n/g, '\n');
        
        res.json({ text: textContent.substring(0, 5000) });
    } catch (e) {
        res.status(400).json({ error: e.message, html: 'ERROR loading page' });
    }
});

// AI Chat endpoint (placeholder - connects to local API)
app.post('/api/ai/chat', async (req, res) => {
    const { message } = req.body;
    
    try {
        // Try to connect to local LLM API
        const response = await axios.post(process.env.AI_API_ENDPOINT || 'http://localhost:11434/api/generate', {
            model: 'neural-chat',
            prompt: message,
            stream: false
        }, { timeout: 30000 });
        
        res.json({ response: response.data.response || 'No response generated' });
    } catch (e) {
        // Fallback response
        res.json({ 
            response: `Echo: You said "${message}". (AI service not configured. Set AI_API_ENDPOINT environment variable to connect to local LLM.)` 
        });
    }
});

// System data broadcast loop
setInterval(() => {
    const data = {
        cpu: getCPUUsage(),
        ram: getMemoryUsage(),
        temp: getSystemTemperature(),
        net: getNetworkUsage(),
        timestamp: Date.now()
    };
    
    broadcastSystemData(data);
}, 200);

// Start server
const PORT = Number(process.env.PORT) || 3001;

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the other process or set PORT to a free port.`);
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});

server.listen(PORT, () => {
    console.log(`xKOR_3RR0R Backend running on port ${PORT}`);
    console.log(`WebSocket listening on ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down backend...');
    terminalProcesses.forEach(term => term.process.kill());
    server.close();
    process.exit(0);
});
