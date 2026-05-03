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

        const lineDelayMs = 120;
        const bootMessages = [
            { line: '[  OK  ] Initializing kernel modules...', pct: 20, accent: 'ok' },
            { line: '[  OK  ] Mounting encrypted volumes...', pct: 40, accent: 'ok' },
            { line: '[  OK  ] Loading neural interface drivers...', pct: 60, accent: 'ok' },
            { line: '[  OK  ] Spawning WebSocket daemon on port 3001...', pct: 80, accent: 'ok' },
            { line: '[ WAIT ] Connecting to AI core...', pct: 92, accent: 'wait' }
        ];

        let idx = 0;

        const updateProgress = (pct) => {
            const clamped = Math.max(0, Math.min(100, pct));
            if (progressFill) progressFill.style.width = clamped + '%';
            if (progressBlocks) progressBlocks.textContent = buildAsciiBar(clamped);
            if (progressPct) progressPct.textContent = Math.round(clamped) + '%';
        };

        const appendLine = (entry, accentOverride) => {
            if (!bootLog) return;
            const accent = accentOverride || entry.accent;
            const wrap = document.createElement('div');
            wrap.className = `boot-line boot-line-${accent}`;
            wrap.textContent = typeof entry === 'string' ? entry : entry.line;
            bootLog.appendChild(wrap);
            bootLog.scrollTop = bootLog.scrollHeight;
        };

        const tryRevealOrOffline = () => {
            window.tryBootWebSocket(
                () => {
                    updateProgress(100);
                    this.finishBootReveal();
                },
                () => {
                    appendLine(
                        '[ WARN ] Backend unreachable — running in offline mode',
                        'warn'
                    );
                    updateProgress(100);
                    this.finishBootReveal();
                },
                5000
            );
        };

        const step = () => {
            if (idx < bootMessages.length) {
                const entry = bootMessages[idx];
                appendLine(entry);
                updateProgress(entry.pct);
                idx++;
                setTimeout(step, lineDelayMs);
                return;
            }

            tryRevealOrOffline();
        };

        updateProgress(0);
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
