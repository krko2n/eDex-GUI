/**
 * Starts backend (port 3001) then Electron once. Use EITHER this script OR `./run.sh` on Linux —
 * never start the backend twice (EADDRINUSE on 3001). Electron must not spawn `server.js`; `src/main/index.js` does not.
 * Exiting Electron sends SIGTERM to the backend child.
 */
const path = require('path');
const { spawn } = require('child_process');

const root = path.join(__dirname, '..');
let backendPid = null;

function shutdownBackend() {
  if (!backendPid) return;
  try {
    process.kill(backendPid, 'SIGTERM');
  } catch (_) {
    /* already gone */
  }
  backendPid = null;
}

const backend = spawn(process.execPath, [path.join(root, 'backend', 'server.js')], {
  cwd: root,
  stdio: 'inherit',
  detached: false,
  shell: process.platform === 'win32'
});

backendPid = backend.pid;

backend.on('error', (err) => {
  console.error('Failed to start backend:', err.message);
  process.exit(1);
});

backend.on('exit', (code, signal) => {
  backendPid = null;
  if (signal !== 'SIGTERM' && code !== 0 && code !== null) {
    console.error(`Backend exited (${code}).`);
  }
});

const delayMs = Number(process.env.XKOR_ELECTRON_DELAY_MS || 1200);

setTimeout(() => {
  const electronBin = require('electron');
  const electron = spawn(electronBin, ['.'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  electron.on('close', () => {
    shutdownBackend();
    process.exit(0);
  });
}, delayMs);

process.on('SIGINT', () => {
  shutdownBackend();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdownBackend();
  process.exit(0);
});
