@echo off
setlocal
title JobRadar
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 22.13 or newer from https://nodejs.org and try again.
  pause
  exit /b 1
)

if not exist ".env" if exist ".env.example" copy ".env.example" ".env" >nul

if not exist "node_modules" (
  echo Installing dependencies, this takes a minute the first time...
  call npm install
  if errorlevel 1 goto :fail
)
if not exist "frontend\node_modules" (
  call npm --prefix frontend install --no-audit --no-fund
  if errorlevel 1 goto :fail
)

echo Starting JobRadar on http://localhost:8080  (press Ctrl+C to stop)
start "" cmd /c "timeout /t 8 /nobreak >nul && start http://localhost:8080"
call npm start
goto :eof

:fail
echo Setup failed. See the messages above.
pause
exit /b 1
