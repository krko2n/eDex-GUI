// Utility functions — API + WebSocket to local backend only (offline-friendly shell)

const API_BASE = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001';

let ws = null;
let wsReconnectTimer = null;

function clearWsReconnectTimer() {
    if (wsReconnectTimer) {
        clearTimeout(wsReconnectTimer);
        wsReconnectTimer = null;
    }
}

function bindPersistingWsHandlers(activeWs) {
    activeWs.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'system-data') {
                dispatchEvent(new CustomEvent('system-data', { detail: data.data }));
            } else if (data.type === 'terminal-output') {
                window.dispatchEvent(new CustomEvent('xkor-terminal-output', { detail: data }));
            }
        } catch (_) {
            /* ignore malformed frames */
        }
    };

    activeWs.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    activeWs.onclose = () => {
        ws = null;
        console.log('WebSocket disconnected — retrying…');
        if (!wsReconnectTimer) {
            wsReconnectTimer = setTimeout(() => {
                wsReconnectTimer = null;
                initWebSocket();
            }, 3000);
        }
    };
}

/**
 * Boot-time connection: resolve on first open within timeout, else invoke onTimeout (UI may continue offline).
 * On timeout, begins the normal reconnect loop via initWebSocket().
 */
function tryBootWebSocket(onOpen, onTimeout, timeoutMs = 5000) {
    clearWsReconnectTimer();

    let settled = false;
    const socket = new WebSocket(WS_URL);

    const fail = () => {
        if (settled) return;
        settled = true;
        try {
            socket.close();
        } catch (_) {
            /* ignore */
        }
        ws = null;
        initWebSocket();
        if (typeof onTimeout === 'function') onTimeout();
    };

    const timer = setTimeout(() => {
        if (socket.readyState === WebSocket.OPEN) return;
        fail();
    }, timeoutMs);

    socket.onclose = () => {
        if (settled) return;
        clearTimeout(timer);
        fail();
    };

    socket.onopen = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        ws = socket;
        bindPersistingWsHandlers(ws);
        if (typeof onOpen === 'function') onOpen();
    };

    socket.onerror = () => {
        /* Refused/unreachable errors usually pair with onclose — fail() is idempotent */
    };
}

window.tryBootWebSocket = tryBootWebSocket;

function sendWsJson(payload) {
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(body);
    }
}

window.sendWsJson = sendWsJson;

function initWebSocket(onConnect = null) {
    clearWsReconnectTimer();

    try {
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
            if (ws.readyState === WebSocket.OPEN && onConnect) {
                onConnect();
            }
            return Promise.resolve();
        }
    } catch (_) {
        /* continue */
    }

    return new Promise((resolve) => {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log('WebSocket connected');
            bindPersistingWsHandlers(ws);
            if (onConnect) onConnect();
            resolve();
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            ws = null;
            console.log('WebSocket disconnected — retrying…');
            if (!wsReconnectTimer) {
                wsReconnectTimer = setTimeout(() => {
                    wsReconnectTimer = null;
                    initWebSocket();
                }, 3000);
            }
        };
    });
}

window.initWebSocket = initWebSocket;

function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    return fetch(`${API_BASE}${endpoint}`, options)
        .then((r) => r.json())
        .catch((e) => {
            console.error('API error:', e);
            return null;
        });
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    const timeEl = document.getElementById('time');
    if (timeEl) timeEl.textContent = timeStr;
}

function drawGraph(canvas, data, color = '#0f0', maxValue = 100) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const step = width / (data.length - 1 || 1);

    for (let i = 0; i < data.length; i++) {
        const x = i * step;
        const y = height - (data[i] / maxValue) * height;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
        const y = (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function showContextMenu(x, y, items) {
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    items.forEach((item) => {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.textContent = item.label;
        menuItem.onclick = () => {
            item.callback();
            menu.remove();
        };
        menu.appendChild(menuItem);
    });

    document.body.appendChild(menu);

    document.addEventListener('click', () => menu.remove(), { once: true });
}

setInterval(updateTime, 1000);
updateTime();
