@echo off
setlocal

echo ========================================
echo Stopping Online Shop Services...
echo ========================================

:: Stop Backend (8080)
echo [1/2] Stopping process on port 8080 (Backend)...
powershell -Command "$pids = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess; if ($pids) { $pids | ForEach-Object { Stop-Process -Id $_ -Force; echo \"Stopped PID $_\" } } else { echo \"No process found on port 8080\" }"

:: Stop Frontend (80)
echo [2/2] Stopping process on port 80 (Frontend)...
powershell -Command "$pids = Get-NetTCPConnection -LocalPort 80 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess; if ($pids) { $pids | ForEach-Object { Stop-Process -Id $_ -Force; echo \"Stopped PID $_\" } } else { echo \"No process found on port 80\" }"

:: Also try to kill node and java processes if the port lookup fails or to be thorough
:: But let's stick to ports first as it's more precise.

echo.
echo ========================================
echo Services stopped (if they were running).
echo ========================================
echo.
pause
