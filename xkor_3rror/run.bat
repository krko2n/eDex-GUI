@echo off
setlocal
cd /d "%~dp0"

if not exist "node_modules\" (
  echo ERROR: Run npm install first.
  exit /b 1
)

echo xKOR_3RR0R — starting backend then Electron...
node scripts\start-desktop.js
echo.
echo xKOR_3RR0R terminated.
endlocal
