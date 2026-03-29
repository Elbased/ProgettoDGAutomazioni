@echo off
echo Starting ZephyrusTech Dev Server...
start npm run dev
timeout /t 3 /nobreak >nul
start http://localhost:3002/#simulation
