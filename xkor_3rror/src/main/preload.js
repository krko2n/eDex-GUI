const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getArch: () => ipcRenderer.invoke('get-arch'),
  getCpuCount: () => ipcRenderer.invoke('get-cpus'),
  getTotalMemory: () => ipcRenderer.invoke('get-total-memory'),
  onSystemData: (callback) => ipcRenderer.on('system-data', callback),
  onTerminalData: (callback) => ipcRenderer.on('terminal-data', callback),
  sendTerminalCommand: (termId, cmd) => ipcRenderer.send('terminal-command', { termId, cmd })
});
