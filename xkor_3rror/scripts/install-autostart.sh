#!/usr/bin/env bash
# Install or remove autostart for xKOR_3RR0R on Linux (Arch, GNOME, KDE, XFCE, etc.)
# Uses XDG ~/.config/autostart by default; optional systemd --user unit for a stricter session hook.
#
# Usage:
#   ./scripts/install-autostart.sh              # XDG autostart (recommended)
#   ./scripts/install-autostart.sh --systemd    # systemd user service instead
#   ./scripts/install-autostart.sh --remove     # remove both if present
#   ./scripts/install-autostart.sh --help

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_SH="$ROOT/run.sh"
DESKTOP_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/autostart"
DESKTOP_FILE="$DESKTOP_DIR/xkor-3rror.desktop"
UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
UNIT_FILE="$UNIT_DIR/xkor-3rror.service"

usage() {
    sed -n '1,15p' "$0" | tail -n +2
}

remove_all() {
    rm -f "$DESKTOP_FILE"
    rm -f "$UNIT_FILE"
    if command -v systemctl >/dev/null 2>&1; then
        systemctl --user disable --now xkor-3rror.service 2>/dev/null || true
        systemctl --user daemon-reload 2>/dev/null || true
    fi
    echo "Removed autostart entries (if they existed)."
}

install_desktop() {
    if [[ ! -x "$RUN_SH" ]]; then
        chmod +x "$RUN_SH" 2>/dev/null || true
    fi
    if [[ ! -f "$RUN_SH" ]]; then
        echo "ERROR: run.sh not found at $RUN_SH" >&2
        exit 1
    fi
    mkdir -p "$DESKTOP_DIR"
    local qrun
    qrun="$(printf '%q' "$RUN_SH")"
    # bash -l loads profile (PATH for node/npm if you use nvm/fnm etc.)
    cat >"$DESKTOP_FILE" <<EOF
[Desktop Entry]
Type=Application
Version=1.0
Name=xKOR_3RR0R
Comment=Cyberpunk system dashboard (Electron + backend)
Exec=/usr/bin/env bash -l -c "exec $qrun"
Path=${ROOT}
Icon=applications-system
Terminal=false
Categories=System;Monitor;
StartupNotify=false
X-GNOME-Autostart-enabled=true
EOF
    chmod 644 "$DESKTOP_FILE"
    echo "Installed XDG autostart: $DESKTOP_FILE"
    echo "It runs when your desktop session starts (after login), not at kernel boot."
}

install_systemd_user() {
    if [[ ! -f "$RUN_SH" ]]; then
        echo "ERROR: run.sh not found at $RUN_SH" >&2
        exit 1
    fi
    mkdir -p "$UNIT_DIR"
    local qrun
    qrun="$(printf '%q' "$RUN_SH")"
    cat >"$UNIT_FILE" <<EOF
[Unit]
Description=xKOR_3RR0R dashboard
After=graphical-session-pre.target
Wants=graphical-session-pre.target

[Service]
Type=simple
WorkingDirectory=$ROOT
# Login shell so node/npm from nvm/fnm/etc. are on PATH
ExecStart=/usr/bin/env bash -l -c "exec $qrun"
Restart=on-failure
RestartSec=8

[Install]
WantedBy=graphical-session.target
EOF

    if command -v systemctl >/dev/null 2>&1; then
        systemctl --user daemon-reload
        systemctl --user enable xkor-3rror.service
        echo "Enabled systemd user unit: $UNIT_FILE"
        echo "Start now with:  systemctl --user start xkor-3rror.service"
        echo "Logs:           journalctl --user -u xkor-3rror.service -f"
    else
        echo "Wrote $UNIT_FILE (systemctl not found — enable manually after installing systemd)."
    fi
}

case "${1:-}" in
    --help|-h)
        usage
        ;;
    --remove|--uninstall)
        remove_all
        ;;
    --systemd)
        remove_all
        install_systemd_user
        ;;
    "")
        rm -f "$UNIT_FILE"
        if command -v systemctl >/dev/null 2>&1; then
            systemctl --user disable --now xkor-3rror.service 2>/dev/null || true
            systemctl --user daemon-reload 2>/dev/null || true
        fi
        install_desktop
        ;;
    *)
        echo "Unknown option: $1" >&2
        usage
        exit 1
        ;;
esac
