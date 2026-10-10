@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js 24 LTS from https://nodejs.org/
  echo Then close this window and double-click this launcher again.
  pause
  exit /b 1
)
node -e "require('node:sqlite')" >nul 2>nul
if errorlevel 1 (
  echo This Node.js version does not include SQLite. Install Node.js 24 LTS.
  pause
  exit /b 1
)
node --disable-warning=ExperimentalWarning server.cjs --open
if errorlevel 1 pause
