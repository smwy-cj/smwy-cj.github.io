@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 22 or newer, then reopen this file.
  pause
  exit /b 1
)
if not exist "node_modules\vitepress\package.json" (
  call npm.cmd ci
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Starting the website. Keep this window open while previewing.
call npm.cmd run dev -- --open
pause
