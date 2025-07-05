@echo off
cls
color 0B

echo.
echo    ====================================================================
echo    CLIENT SCOPE AI - INSTAGRAM LEAD GENERATION
echo    ====================================================================
echo.

REM BULLETPROOF CLEANUP - Uses PowerShell for reliability
echo     [*] FORCE KILLING ALL PROCESSES...
powershell -Command "Get-Process -Name 'node' -ErrorAction SilentlyContinue | Stop-Process -Force"
powershell -Command "Get-Process -Name 'npm' -ErrorAction SilentlyContinue | Stop-Process -Force"
taskkill /f /im cmd.exe /fi "WINDOWTITLE eq ClientScope*" >nul 2>&1

echo     [*] FREEING PORTS 5001 AND 5173...
powershell -Command "$processes=netstat -ano | Select-String ':5001' | ForEach-Object {($_ -split '\s+')[4]}; if($processes){foreach($processId in $processes){if($processId -and $processId -ne '0'){Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue}}}"
powershell -Command "$processes=netstat -ano | Select-String ':5173' | ForEach-Object {($_ -split '\s+')[4]}; if($processes){foreach($processId in $processes){if($processId -and $processId -ne '0'){Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue}}}"

echo     [*] WAITING FOR PORTS TO BE COMPLETELY FREE...
timeout /t 5 >nul

echo     [OK] ALL PROCESSES KILLED - PORTS ARE FREE!
echo.

REM Check if directories exist
if not exist backend (
    echo     [ERROR] Backend folder not found!
    echo     Make sure you're running this from the project root directory.
    pause
    exit /b 1
)

if not exist frontend (
    echo     [ERROR] Frontend folder not found!
    echo     Make sure you're running this from the project root directory.
    pause
    exit /b 1
)

REM Launch sequence
echo     [*] Starting Backend Server...
cd backend
if not exist package.json (
    echo     [ERROR] Backend package.json not found!
    pause
    exit /b 1
)

start "ClientScope Backend" cmd /k "npm start"
if errorlevel 1 (
    echo     [ERROR] Failed to start backend!
    pause
    exit /b 1
)
cd ..

echo     [*] Backend initializing...
timeout /t 6 >nul

echo     [*] Starting Frontend Interface...
cd frontend
if not exist package.json (
    echo     [ERROR] Frontend package.json not found!
    pause
    exit /b 1
)

start "ClientScope Frontend" cmd /k "npm run dev"
if errorlevel 1 (
    echo     [ERROR] Failed to start frontend!
    pause
    exit /b 1
)
cd ..

echo     [*] Frontend loading...
timeout /t 4 >nul

echo.
echo    ====================================================================
echo.
echo                    CLIENT SCOPE AI ONLINE
echo.
echo     Backend API:     http://localhost:5001
echo     Frontend App:    http://localhost:5173
echo.
echo    ====================================================================
echo.

echo     [*] Opening application...
timeout /t 2 >nul
start http://localhost:5173

echo.
echo     Ready to generate leads! 
echo     Press ENTER to restart, or type 'q' and ENTER to quit.
echo.

:wait_for_input
set /p input="     Command: "

if /i "%input%"=="q" goto end
if /i "%input%"=="quit" goto end
if /i "%input%"=="exit" goto end

cls
color 0E
echo.
echo     [*] RESTARTING CLIENT SCOPE AI...
echo.

REM BULLETPROOF RESTART CLEANUP
echo     [*] FORCE KILLING ALL PROCESSES...
powershell -Command "Get-Process -Name 'node' -ErrorAction SilentlyContinue | Stop-Process -Force"
powershell -Command "Get-Process -Name 'npm' -ErrorAction SilentlyContinue | Stop-Process -Force"
taskkill /f /im cmd.exe /fi "WINDOWTITLE eq ClientScope*" >nul 2>&1

echo     [*] FREEING PORTS 5001 AND 5173...
powershell -Command "$processes=netstat -ano | Select-String ':5001' | ForEach-Object {($_ -split '\s+')[4]}; if($processes){foreach($processId in $processes){if($processId -and $processId -ne '0'){Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue}}}"
powershell -Command "$processes=netstat -ano | Select-String ':5173' | ForEach-Object {($_ -split '\s+')[4]}; if($processes){foreach($processId in $processes){if($processId -and $processId -ne '0'){Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue}}}"

echo     [*] WAITING FOR PORTS TO BE COMPLETELY FREE...
timeout /t 6 >nul

echo     [*] Restarting Backend...
cd backend
start "ClientScope Backend" cmd /k "npm start"
cd ..

timeout /t 6 >nul

echo     [*] Restarting Frontend...
cd frontend
start "ClientScope Frontend" cmd /k "npm run dev"
cd ..

echo.
echo     [OK] CLIENT SCOPE AI RESTARTED SUCCESSFULLY!
echo.
echo     Backend API:     http://localhost:5001
echo     Frontend App:    http://localhost:5173
echo.

goto wait_for_input

:end
echo.
echo     [*] FINAL SHUTDOWN - KILLING EVERYTHING...
powershell -Command "Get-Process -Name 'node' -ErrorAction SilentlyContinue | Stop-Process -Force"
powershell -Command "Get-Process -Name 'npm' -ErrorAction SilentlyContinue | Stop-Process -Force"
taskkill /f /im cmd.exe /fi "WINDOWTITLE eq ClientScope*" >nul 2>&1

powershell -Command "$processes=netstat -ano | Select-String ':5001' | ForEach-Object {($_ -split '\s+')[4]}; if($processes){foreach($processId in $processes){if($processId -and $processId -ne '0'){Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue}}}"
powershell -Command "$processes=netstat -ano | Select-String ':5173' | ForEach-Object {($_ -split '\s+')[4]}; if($processes){foreach($processId in $processes){if($processId -and $processId -ne '0'){Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue}}}"

echo     [OK] ALL PROCESSES KILLED AND PORTS FREED!
timeout /t 2 >nul
exit /b 0 