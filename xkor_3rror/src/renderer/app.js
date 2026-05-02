// Main application shell — waits for backend WebSocket before revealing UI

function buildAsciiBar(percent, width = 20) {
    const clamped = Math.max(0, Math.min(100, percent));
    const filled = Math.round((clamped / 100) * width);
    const empty = width - filled;
    return `${'█'.repeat(filled)}${'░'.repeat(empty)}`;
}

class XkorDesktop {
    constructor() {
        this.activeTab = 'terminal';
        this.tabs = ['terminal', 'web', 'monitor', 'files'];
        this._bootDone = false;
        this.init();
    }

    init() {
        this.startBootSequence();
        this.setupTabSwitching();
        console.log('xKOR_3RR0R INITIALIZED');
    }

    finishBootReveal() {
        if (this._bootDone) return;
        this._bootDone = true;

        const bootScreen = document.getElementById('boot-screen');
        const appEl = document.getElementById('app');
        if (!bootScreen || !appEl) return;

        bootScreen.classList.add('boot-exit');
        const removeAfter = () => {
            bootScreen.style.display = 'none';
            appEl.style.display = 'flex';
            bootScreen.removeEventListener('animationend', removeAfter);
        };
        bootScreen.addEventListener('animationend', removeAfter, { once: true });
        setTimeout(removeAfter, 900);
    }

    startBootSequence() {
        const bootLog = document.getElementById('boot-log');
        const progressFill = document.getElementById('progress-fill');
        const progressBlocks = document.getElementById('progress-blocks');
        const progressPct = document.getElementById('progress-text');

        const bootMessages = [
            { line: '[ OK ] Initializing kernel modules...', pct: 12, accent: 'ok' },
            { line: '[ OK ] Mounting encrypted volumes...', pct: 28, accent: 'ok' },
            { line: '[ OK ] Loading neural interface...', pct: 44, accent: 'ok' },
            { line: '[ OK ] Establishing secure WebSocket...', pct: 60, accent: 'ok' },
            { line: '[ WAIT ] Connecting to AI core...', pct: 78, accent: 'wait' },
            { line: '[ OK ] Local shell bridge ready.', pct: 92, accent: 'ok' },
            { line: '[ OK ] xKOR_3RR0R interface armed.', pct: 100, accent: 'ok' }
        ];

        let idx = 0;

        const updateProgress = (pct) => {
            if (progressFill) progressFill.style.width = pct + '%';
            if (progressBlocks) progressBlocks.textContent = buildAsciiBar(pct);
            if (progressPct) progressPct.textContent = Math.round(pct) + '%';
        };

        const appendLine = (entry) => {
            if (!bootLog) return;
            const wrap = document.createElement('div');
            wrap.className = `boot-line boot-line-${entry.accent}`;
            wrap.textContent = entry.line;
            bootLog.appendChild(wrap);
        };

        const step = () => {
            if (idx < bootMessages.length) {
                const entry = bootMessages[idx];
                appendLine(entry);
                updateProgress(entry.pct);
                idx++;
                setTimeout(step, 380);
                return;
            }

            const failOpen = setTimeout(() => {
                const appEl = document.getElementById('app');
                if (appEl && appEl.style.display !== 'flex') {
                    console.warn('xKOR_3RR0R: backend not reachable yet — revealing shell');
                    this.finishBootReveal();
                }
            }, 22000);

            window.initWebSocket(() => {
                clearTimeout(failOpen);
                this.finishBootReveal();
            });
        };

        step();
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        document.addEventListener('keydown', () => {});
    }

    switchTab(tabName) {
        if (!this.tabs.includes(tabName)) return;
        if (this.activeTab === tabName) return;

        const sections = [
            'terminal-section',
            'web-section',
            'monitor-section',
            'files-section'
        ];

        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        const section = document.getElementById(`${tabName}-section`);
        if (section) {
            section.style.display = 'flex';
            section.style.flexDirection = 'column';
        }

        const tabButtons = document.querySelectorAll('.tab');
        tabButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.activeTab = tabName;

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }
}

const xkorDesktop = new XkorDesktop();

async function updateSystemInfo() {
    try {
        const info = await apiCall('/system/info');
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = info ? 'ONLINE' : 'OFFLINE';
        }
    } catch (error) {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = 'OFFLINE';
        }
    }
}

setInterval(updateSystemInfo, 5000);
updateSystemInfo();

document.addEventListener('mousedown', (e) => {
    const panels = document.querySelectorAll('.panel, .left-panel, .right-panel, .bottom-panel');
    panels.forEach(p => p.classList.remove('focused'));

    const clicked = e.target.closest('.panel, .left-panel, .right-panel, .bottom-panel');
    if (clicked) {
        clicked.classList.add('focused');
    }
});

document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.file-item')) {
        e.preventDefault();
    }
});

document.querySelectorAll('*').forEach(el => {
    if (
        el.classList.contains('panel-content') ||
        el.classList.contains('chat-history') ||
        el.classList.contains('file-list')
    ) {
        el.style.scrollBehavior = 'smooth';
    }
});

console.log('xKOR_3RR0R dashboard renderer ready');
