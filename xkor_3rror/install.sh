#!/bin/bash

# xKOR_3RR0R Installation Script
# For Arch Linux

set -e

echo "======================================"
echo "   xKOR_3RR0R System Installation"
echo "======================================"
echo ""

# Check if running on Arch Linux
if ! command -v pacman &> /dev/null; then
    echo "ERROR: This script requires Arch Linux with pacman package manager"
    exit 1
fi

echo "[1/6] Updating system packages..."
sudo pacman -Syu --noconfirm

echo "[2/6] Installing system dependencies..."
sudo pacman -S --noconfirm \
    base-devel \
    python \
    nodejs \
    npm \
    git \
    libxss \
    libnotify \
    xdg-utils \
    gnome-terminal \
    gawk \
    sed

echo "[3/6] Checking Node.js installation..."
node_version=$(node --version)
npm_version=$(npm --version)
echo "Node.js $node_version installed"
echo "npm $npm_version installed"

echo "[4/6] Installing npm dependencies..."
cd "$(dirname "$0")"
npm install --production

echo "[5/6] Building Electron application..."
npm run build || echo "Build step skipped (optional)"

echo "[6/6] Setting up permissions and configuration..."
chmod +x run.sh

# Create config directory if needed
mkdir -p config

# Create default config
cat > config/xkor-3rror.config.json << 'EOF'
{
  "theme": "cyberpunk",
  "terminal": {
    "shell": "/bin/bash",
    "enableScrollup": true
  },
  "ai": {
    "endpoint": "http://localhost:11434/api/generate",
    "model": "neural-chat",
    "enabled": true
  },
  "web": {
    "userAgent": "xKOR_3RR0R/2.1"
  },
  "display": {
    "fullscreen": true,
    "width": 1920,
    "height": 1080
  }
}
EOF

echo ""
echo "======================================"
echo "   Installation Complete!"
echo "======================================"
echo ""
echo "To start xKOR_3RR0R, run:"
echo "  ./run.sh"
echo ""
echo "NOTES:"
echo "  - First run may take a moment to start"
echo "  - Press F2 to toggle AI panel"
echo "  - Use ALT+1/2/3 to switch terminals"
echo "  - Press ESC to exit fullscreen (dev mode)"
echo ""
