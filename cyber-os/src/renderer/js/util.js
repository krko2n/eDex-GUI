// Utility functions
const API_BASE = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001';

let ws = null;

function initWebSocket(onConnect = null) {
    return new Promise((resolve) => {
        ws = new WebSocket(WS_URL);
        
        ws.onopen = () => {
            console.log('WebSocket connected');
            if (onConnect) onConnect();
            resolve();
        };
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'system-data') {
                dispatchEvent(new CustomEvent('system-data', { detail: data.data }));
            }
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setTimeout(() => initWebSocket(), 3000);
        };
    });
}

// Make it global
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
        .then(r => r.json())
        .catch(e => console.error('API error:', e));
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    
    // Draw grid
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
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    
    items.forEach(item => {
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

// Initialize time update
setInterval(updateTime, 1000);
updateTime();
