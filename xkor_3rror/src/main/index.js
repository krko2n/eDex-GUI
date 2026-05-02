const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const os = require('os');

let mainWindow;

const isDevelopment = process.argv.includes('--dev');

app.setName('xKOR_3RR0R');

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

  const indexPath = path.join(__dirname, '..', 'renderer', 'index.html');
  mainWindow.loadURL(pathToFileURL(indexPath).href);

  if (isDevelopment) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();
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
      submenu: [{ role: 'toggleDevTools' }]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

setTimeout(createMenu, 500);
