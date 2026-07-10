@echo off
REM Builds the frontend (only needs to be re-run after you change the code)
REM and starts the single combined server. Double-click this file, or run
REM it via Task Scheduler, to start SketchRef without opening VS Code.

cd /d "%~dp0frontend"
if not exist dist (
  echo Building frontend...
  call npm install
  call npm run build
)

cd /d "%~dp0backend"
if not exist node_modules (
  echo Installing backend dependencies...
  call npm install
)

echo Starting SketchRef on http://localhost:4000 ...
node server.js
