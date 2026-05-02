// Main Application Controller
class CyberOS {
    constructor() {
        this.activeTab = 'terminal';
        this.tabs = ['terminal', 'web', 'monitor', 'files'];
        this.init();
    }
    
    init() {
        // Set up tab switching
        this.setupTabSwitching();
        
        // Initialize all modules
        console.log('CYBER-OS v1.0 INITIALIZED');
    }
    
    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab');
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Could add tab switching shortcuts here
        });
    }
    
    switchTab(tabName) {
        if (!this.tabs.includes(tabName)) return;
        if (this.activeTab === tabName) return;
        
        // Hide all sections
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
        
        // Show selected section
        const section = document.getElementById(`${tabName}-section`);
        if (section) section.style.display = 'flex';
        section.style.flexDirection = 'column';
        
        // Update active tab button
        const tabButtons = document.querySelectorAll('.tab');
        tabButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        this.activeTab = tabName;
        
        // Trigger resize events for canvases
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }
}

// Create main app instance
const cyberOS = new CyberOS();

// System info display
async function updateSystemInfo() {
    try {
        const info = await apiCall('/system/info');
        if (info) {
            // Update status bar if needed
            const statusEl = document.getElementById('status');
            if (statusEl) {
                statusEl.textContent = 'ONLINE';
            }
        }
    } catch (error) {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = 'OFFLINE';
        }
    }
}

// Update system info periodically
setInterval(updateSystemInfo, 5000);
updateSystemInfo();

// Handle mouse support
document.addEventListener('mousedown', (e) => {
    // Update focus based on what was clicked
    const panels = document.querySelectorAll('.panel, .left-panel, .right-panel, .bottom-panel');
    panels.forEach(p => p.classList.remove('focused'));
    
    const clicked = e.target.closest('.panel, .left-panel, .right-panel, .bottom-panel');
    if (clicked) {
        clicked.classList.add('focused');
    }
});

// Prevent default context menu
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.file-item')) {
        e.preventDefault();
    }
});

// Smooth scroll
document.querySelectorAll('*').forEach(el => {
    if (el.classList.contains('panel-content') || el.classList.contains('chat-history') || 
        el.classList.contains('file-list')) {
        el.style.scrollBehavior = 'smooth';
    }
});

console.log('CYBER-OS Dashboard Ready');
