@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%" >nul 2>&1

if not defined ZEPHYRUS_BANNER_SHOWN (
  echo ==========================================
  echo  ZephyrusTech - Avvio Progetto
  echo ==========================================
)

set "ZEPHYRUS_BANNER_SHOWN=1"
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%avvio.ps1"
if errorlevel 1 (
  echo.
  echo Avvio interrotto.
  echo.
  pause
  exit /b 1
)

exit /b 0
