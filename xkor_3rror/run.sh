#!/bin/bash

# xKOR_3RR0R Run Script — starts backend, then Electron (renderer loads via file://, not a dev server)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "======================================"
echo "   xKOR_3RR0R Startup"
echo "======================================"
echo ""

if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo "ERROR: Dependencies not installed. Please run ./install.sh first"
    exit 1
fi

PORT="${PORT:-3001}"
echo "[*] Ensuring port $PORT is free (best effort)..."
# Stale listener would cause EADDRINUSE when the new backend starts
(command -v fuser >/dev/null 2>&1 && fuser -k "${PORT}/tcp" 2>/dev/null) || true
(command -v lsof >/dev/null 2>&1 && lsof -ti:"${PORT}" | xargs -r kill -9 2>/dev/null) || true

echo "[*] Starting xKOR_3RR0R Backend..."
cd "$SCRIPT_DIR"
node backend/server.js &
BACKEND_PID=$!

sleep 2

if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "ERROR: Backend failed to start"
    exit 1
fi

echo "[*] Backend PID: $BACKEND_PID"
echo "[*] Starting Electron shell (loads local renderer)..."

cleanup() {
    echo ""
    echo "Shutting down xKOR_3RR0R..."
    kill $BACKEND_PID 2>/dev/null || true
    wait $BACKEND_PID 2>/dev/null || true
    echo "xKOR_3RR0R terminated"
}

trap cleanup EXIT INT TERM

npm start
