@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo ==========================================
echo  ZephyrusTech - Avvio Progetto
echo ==========================================

call :ensure_node
if errorlevel 1 goto :fail

call :ensure_deps
if errorlevel 1 goto :fail

echo Starting ZephyrusTech Dev Server...
start "ZephyrusTech Dev Server" cmd /k "%NPM_CMD% run dev -- --host --port 3002"
timeout /t 3 /nobreak >nul
start "" "http://localhost:3002/#presentation"
goto :eof

:ensure_node
set "NPM_CMD="

where node >nul 2>&1
if %errorlevel%==0 goto :find_npm

call :try_add_known_paths
where node >nul 2>&1
if %errorlevel%==0 goto :find_npm

echo Node.js not found. Attempting install...
call :install_node_winget
call :try_add_known_paths
where node >nul 2>&1
if %errorlevel%==0 goto :find_npm

call :install_node_msi
call :try_add_known_paths
where node >nul 2>&1
if %errorlevel%==0 goto :find_npm

echo.
echo Failed to install Node.js automatically.
echo Please install Node.js LTS and re-run this script.
echo.
exit /b 1

:find_npm
where npm >nul 2>&1
if %errorlevel%==0 (
  set "NPM_CMD=npm"
  exit /b 0
)

if exist "%ProgramFiles%\nodejs\npm.cmd" (
  set "NPM_CMD=%ProgramFiles%\nodejs\npm.cmd"
  exit /b 0
)

if exist "%ProgramFiles(x86)%\nodejs\npm.cmd" (
  set "NPM_CMD=%ProgramFiles(x86)%\nodejs\npm.cmd"
  exit /b 0
)

if exist "%LOCALAPPDATA%\Programs\nodejs\npm.cmd" (
  set "NPM_CMD=%LOCALAPPDATA%\Programs\nodejs\npm.cmd"
  exit /b 0
)

echo.
echo npm not found after Node.js install attempt.
echo.
exit /b 1

:try_add_known_paths
for %%D in ("%ProgramFiles%\nodejs" "%ProgramFiles(x86)%\nodejs" "%LOCALAPPDATA%\Programs\nodejs") do (
  if exist "%%~D\node.exe" set "PATH=%%~D;%PATH%"
)
exit /b 0

:install_node_winget
where winget >nul 2>&1
if not %errorlevel%==0 exit /b 0

echo Installing Node.js LTS with winget...
winget install -e --id OpenJS.NodeJS.LTS --source winget
exit /b 0

:install_node_msi
echo Installing Node.js LTS via direct download...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; " ^
  "$arch = if ([Environment]::Is64BitOperatingSystem) { 'x64' } else { 'x86' }; " ^
  "$base = 'https://nodejs.org/dist/latest-v20.x/'; " ^
  "$html = Invoke-WebRequest -UseBasicParsing $base; " ^
  "$msi = ($html.Links | Where-Object { $_.href -match \"node-v\\d+\\.\\d+\\.\\d+-$arch\\.msi\" } | Select-Object -First 1).href; " ^
  "if (-not $msi) { throw 'MSI not found'; } " ^
  "$url = $base + $msi; " ^
  "$dest = Join-Path $env:TEMP $msi; " ^
  "Invoke-WebRequest $url -OutFile $dest; " ^
  "Start-Process msiexec.exe -Wait -ArgumentList \"/i `\"$dest`\" /qn /norestart ALLUSERS=0\""
exit /b 0

:ensure_deps
if exist "node_modules\" exit /b 0

echo Installing npm dependencies...
"%NPM_CMD%" install
if errorlevel 1 exit /b 1
exit /b 0

:fail
echo.
echo Avvio interrotto.
echo.
pause
