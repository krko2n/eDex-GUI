// System Monitor Module
class SystemMonitor {
    constructor() {
        this.cpuData = new Array(60).fill(0);
        this.ramData = new Array(60).fill(0);
        this.tempData = new Array(60).fill(0);
        this.netData = new Array(60).fill(0);
        
        this.maxTemp = 100;
        this.maxNet = 100;
        
        this.init();
    }
    
    init() {
        // Get current system info
        this.updateSystemInfo();
        
        // Set up event listener for system data
        document.addEventListener('system-data', (e) => {
            this.handleSystemData(e.detail);
        });
        
        // Request system data periodically
        this.startDataCollection();
    }
    
    startDataCollection() {
        // CPU and RAM - update every 200ms
        setInterval(() => {
            apiCall('/system/cpu').then(data => {
                if (data && data.usage !== undefined) {
                    this.cpuData.shift();
                    this.cpuData.push(data.usage);
                    this.updateCPUDisplay(data.usage);
                }
            });
        }, 200);
        
        // Temp - update every 1s
        setInterval(() => {
            apiCall('/system/temp').then(data => {
                if (data && data.temp !== undefined) {
                    this.tempData.shift();
                    this.tempData.push(data.temp);
                    this.maxTemp = Math.max(this.maxTemp, data.temp * 1.1);
                    this.updateTempDisplay(data.temp);
                }
            });
        }, 1000);
        
        // Network - update every 300ms
        setInterval(() => {
            apiCall('/system/network').then(data => {
                if (data && data.speed !== undefined) {
                    this.netData.shift();
                    this.netData.push(data.speed);
                    this.maxNet = Math.max(this.maxNet, data.speed * 1.1);
                    this.updateNetDisplay(data.speed);
                }
            });
        }, 300);
        
        // RAM - update every 200ms
        setInterval(() => {
            apiCall('/system/ram').then(data => {
                if (data && data.usage !== undefined) {
                    this.ramData.shift();
                    this.ramData.push(data.usage);
                    this.updateRAMDisplay(data.usage);
                }
            });
        }, 200);
    }
    
    handleSystemData(data) {
        if (data.cpu !== undefined) {
            this.cpuData.shift();
            this.cpuData.push(data.cpu);
            this.updateCPUDisplay(data.cpu);
        }
        
        if (data.ram !== undefined) {
            this.ramData.shift();
            this.ramData.push(data.ram);
            this.updateRAMDisplay(data.ram);
        }
        
        if (data.temp !== undefined) {
            this.tempData.shift();
            this.tempData.push(data.temp);
            this.updateTempDisplay(data.temp);
        }
    }
    
    updateSystemInfo() {
        apiCall('/system/info').then(data => {
            if (!data) return;
            
            const sysinfo = document.getElementById('sysinfo');
            if (sysinfo && data) {
                // Update any static info if needed
            }
        });
    }
    
    updateCPUDisplay(value) {
        const el = document.getElementById('cpu-usage');
        if (el) el.textContent = Math.round(value) + '%';
        
        const canvas = document.getElementById('cpu-graph');
        if (canvas) drawGraph(canvas, this.cpuData, '#0f0', 100);
        
        const largeCanvas = document.getElementById('large-cpu-graph');
        if (largeCanvas) drawGraph(largeCanvas, this.cpuData, '#0f0', 100);
    }
    
    updateRAMDisplay(value) {
        const el = document.getElementById('ram-usage');
        if (el) el.textContent = Math.round(value) + '%';
        
        const canvas = document.getElementById('ram-graph');
        if (canvas) drawGraph(canvas, this.ramData, '#00ff00', 100);
        
        const largeCanvas = document.getElementById('large-ram-graph');
        if (largeCanvas) drawGraph(largeCanvas, this.ramData, '#00ff00', 100);
    }
    
    updateTempDisplay(value) {
        const el = document.getElementById('temp-usage');
        if (el) el.textContent = Math.round(value) + '°C';
        
        const canvas = document.getElementById('temp-graph');
        if (canvas) drawGraph(canvas, this.tempData, '#f0f', this.maxTemp);
        
        const largeCanvas = document.getElementById('large-temp-graph');
        if (largeCanvas) drawGraph(largeCanvas, this.tempData, '#f0f', this.maxTemp);
    }
    
    updateNetDisplay(value) {
        const el = document.getElementById('net-usage');
        if (el) el.textContent = formatBytes(value) + '/s';
        
        const largeCanvas = document.getElementById('large-net-graph');
        if (largeCanvas) drawGraph(largeCanvas, this.netData, '#ffff00', this.maxNet);
    }
}

const monitor = new SystemMonitor();
