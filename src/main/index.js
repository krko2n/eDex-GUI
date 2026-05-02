const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');
const os = require('os');

let mainWindow;
let backendProcess;

const isDevelopment = process.argv.includes('--dev') || isDev;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: !isDevelopment,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    }
  });

  const startUrl = isDevelopment
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../renderer/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDevelopment) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  const backendPath = path.join(__dirname, '../../backend/server.js');
  backendProcess = spawn('node', [backendPath], {
    stdio: 'inherit',
    shell: true
  });

  backendProcess.on('error', (err) => {
    console.error('Backend error:', err);
  });
}

app.on('ready', () => {
  startBackend();
  setTimeout(() => {
    createWindow();
  }, 1000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

// IPC handlers
ipcMain.handle('get-platform', () => process.platform);
ipcMain.handle('get-arch', () => process.arch);
ipcMain.handle('get-cpus', () => os.cpus().length);
ipcMain.handle('get-total-memory', () => os.totalmem());

const createMenu = () => {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'Exit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'toggleDevTools' }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

setTimeout(createMenu, 500);
