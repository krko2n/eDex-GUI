// Terminal Module
class TerminalManager {
    constructor() {
        this.terminals = new Map();
        this.activeTerminal = 0;
        this.init();
    }
    
    init() {
        // Create 3 terminal containers
        for (let i = 0; i < 3; i++) {
            this.terminals.set(i, {
                id: i,
                element: document.getElementById(`terminal-${i}`),
                buffer: '',
                history: [],
                historyIndex: -1
            });
        }
        
        // Set up terminal tab switching
        const termTabs = document.querySelectorAll('.term-tab');
        termTabs.forEach((tab, index) => {
            tab.addEventListener('click', () => this.switchTerminal(index));
        });
        
        // Initialize WebSocket for terminal input/output
        this.initTerminalSocket();
        
        // Keyboard shortcuts: ALT+1, ALT+2, ALT+3
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key >= '1' && e.key <= '3') {
                this.switchTerminal(parseInt(e.key) - 1);
            }
        });
        
        // Focus on terminal
        document.addEventListener('click', (e) => {
            if (e.target.closest('.xterm')) {
                const termId = this.activeTerminal;
                this.focusTerminal(termId);
            }
        });
    }
    
    switchTerminal(index) {
        if (index === this.activeTerminal) return;
        
        // Hide current
        const currentEl = this.terminals.get(this.activeTerminal).element;
        if (currentEl) currentEl.style.display = 'none';
        
        const currentTab = document.querySelectorAll('.term-tab')[this.activeTerminal];
        if (currentTab) currentTab.classList.remove('active');
        
        // Show new
        this.activeTerminal = index;
        const newEl = this.terminals.get(index).element;
        if (newEl) newEl.style.display = 'block';
        
        const newTab = document.querySelectorAll('.term-tab')[index];
        if (newTab) newTab.classList.add('active');
        
        this.focusTerminal(index);
    }
    
    focusTerminal(id) {
        const term = this.terminals.get(id);
        if (term && term.element) {
            term.element.focus();
        }
    }
    
    initTerminalSocket() {
        const termElement = this.terminals.get(0).element;
        if (!termElement) return;
        
        // Create a virtual terminal display
        termElement.innerHTML = '<pre id="term-output-0" class="term-output"></pre>';
        
        for (let i = 1; i < 3; i++) {
            const el = this.terminals.get(i).element;
            if (el) {
                el.innerHTML = `<pre id="term-output-${i}" class="term-output"></pre>`;
            }
        }
        
        window.addEventListener('xkor-terminal-output', (event) => {
            const data = event.detail;
            if (data && data.type === 'terminal-output') {
                this.writeToTerminal(data.termId, data.output);
            }
        });
        
        // Handle keyboard input in terminal
        document.addEventListener('keydown', (e) => {
            const section = document.getElementById('terminal-section');
            if (!section || section.style.display === 'none') return;
            
            this.sendTerminalCommand(this.activeTerminal, e);
        });
    }
    
    sendTerminalCommand(termId, event) {
        let char = null;
        
        if (event.key === 'Enter') {
            char = '\r\n';
            this.terminals.get(termId).history.push(this.terminals.get(termId).buffer);
            this.terminals.get(termId).historyIndex = -1;
            this.terminals.get(termId).buffer = '';
        } else if (event.key === 'Backspace') {
            char = '\b';
            this.terminals.get(termId).buffer = this.terminals.get(termId).buffer.slice(0, -1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            // Show previous command
            const term = this.terminals.get(termId);
            if (term.history.length > 0) {
                term.historyIndex = Math.min(term.historyIndex + 1, term.history.length - 1);
                term.buffer = term.history[term.history.length - 1 - term.historyIndex];
                this.updateTerminalDisplay(termId);
            }
            return;
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            const term = this.terminals.get(termId);
            if (term.historyIndex > 0) {
                term.historyIndex--;
                term.buffer = term.history[term.history.length - 1 - term.historyIndex];
            } else {
                term.buffer = '';
                term.historyIndex = -1;
            }
            this.updateTerminalDisplay(termId);
            return;
        } else if (event.key.length === 1) {
            char = event.key;
            this.terminals.get(termId).buffer += event.key;
        }
        
        if (char) {
            event.preventDefault();
            if (typeof window.sendWsJson === 'function') {
                window.sendWsJson({
                    type: 'terminal-input',
                    termId: termId,
                    data: char
                });
            }
            this.updateTerminalDisplay(termId);
        }
    }
    
    writeToTerminal(termId, output) {
        const term = this.terminals.get(termId);
        if (term) {
            term.buffer += output;
            this.updateTerminalDisplay(termId);
        }
    }
    
    updateTerminalDisplay(termId) {
        const term = this.terminals.get(termId);
        const outputEl = document.getElementById(`term-output-${termId}`);
        
        if (outputEl && term) {
            // Keep buffer to last 1000 lines
            const lines = term.buffer.split('\n');
            if (lines.length > 1000) {
                term.buffer = lines.slice(-1000).join('\n');
            }
            
            outputEl.textContent = term.buffer;
            outputEl.parentElement.scrollTop = outputEl.parentElement.scrollHeight;
        }
    }
}

const terminalManager = new TerminalManager();

// Clear terminal button
const clearBtn = document.getElementById('clear-term');
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        const termId = terminalManager.activeTerminal;
        const term = terminalManager.terminals.get(termId);
        if (term) {
            term.buffer = '';
            terminalManager.updateTerminalDisplay(termId);
        }
    });
}
