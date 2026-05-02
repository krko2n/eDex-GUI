#!/bin/bash

# CYBER-OS Run Script
# Starts backend and Electron frontend

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "======================================"
echo "   CYBER-OS v1.0 Startup"
echo "======================================"
echo ""

# Check if node_modules exists
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo "ERROR: Dependencies not installed. Please run ./install.sh first"
    exit 1
fi

# Start backend in background
echo "[*] Starting CYBER-OS Backend..."
cd "$SCRIPT_DIR"
node backend/server.js &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 2

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "ERROR: Backend failed to start"
    exit 1
fi

echo "[*] Backend PID: $BACKEND_PID"
echo "[*] Starting CYBER-OS Frontend..."

# Start Electron frontend
npm start

# Cleanup on exit
echo ""
echo "Shutting down CYBER-OS..."
kill $BACKEND_PID 2>/dev/null || true
wait $BACKEND_PID 2>/dev/null || true

echo "CYBER-OS terminated"
