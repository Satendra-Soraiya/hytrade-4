@echo off
setlocal enabledelayedexpansion

title HYtrade - Windows Local Dev Bootstrap

REM Determine project root (directory of this script)
set "ROOT=%~dp0"

echo ================================================
echo HYtrade - Windows Local Development Bootstrap
echo ================================================
echo.

REM Check Node and npm availability
where node >nul 2>&1
if errorlevel 1 (
  echo [Error] Node.js is not installed or not on PATH.
  echo Install Node 18+ from https://nodejs.org/
  pause
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo [Error] npm is not installed or not on PATH.
  echo Install Node.js which includes npm: https://nodejs.org/
  pause
  exit /b 1
)

REM Enforce Node >= 18
for /f %%v in ('powershell -NoProfile -Command "$v=(node -v).TrimStart(''v'');$v.Split(''.'')[0]"') do set NODE_MAJOR=%%v
if "%NODE_MAJOR%"=="" set NODE_MAJOR=0
if %NODE_MAJOR% LSS 18 (
  echo [Error] Node.js 18+ required. Current major: %NODE_MAJOR%
  pause
  exit /b 1
)

REM Default ports and URLs
set BACKEND_PORT=3002
set FRONTEND_PORT=3001
set DASHBOARD_PORT=5174

set API_URL=http://localhost:%BACKEND_PORT%
set FRONTEND_URL=http://localhost:%FRONTEND_PORT%
set DASHBOARD_URL=http://localhost:%DASHBOARD_PORT%

REM Generate a JWT secret using PowerShell
for /f %%s in ('powershell -NoProfile -Command "[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([Guid]::NewGuid().ToString()))"') do set JWT_SECRET=%%s

REM Resolve MongoDB URI
set MONGODB_URI=
if exist "%ROOT%backend\.env" (
  for /f "usebackq tokens=1,* delims==" %%A in ("%ROOT%backend\.env") do (
    if /i "%%A"=="MONGODB_URI" set MONGODB_URI=%%B
  )
)
if "%MONGODB_URI%"=="" (
  REM Fallback to known cloud URI from start-local-dev.sh for zero-effort setup
  set "MONGODB_URI=mongodb+srv://ShaliniGupta:shalinidb@hytradecluster.3fctevs.mongodb.net/hytrade?retryWrites=true&w=majority&appName=HytradeCluster"
)

echo [1/4] Writing environment files...

REM backend/.env
> "%ROOT%backend\.env" (
  echo PORT=%BACKEND_PORT%
  echo NODE_ENV=development
  echo MONGODB_URI=%MONGODB_URI%
  echo JWT_SECRET=%JWT_SECRET%
)

REM frontend2/.env.local
> "%ROOT%frontend2\.env.local" (
  echo NEXT_PUBLIC_API_URL=%API_URL%
  echo NEXT_PUBLIC_DASHBOARD_URL=%DASHBOARD_URL%
  echo NEXT_PUBLIC_APP_URL=%FRONTEND_URL%
)

REM new-dashboard/.env
> "%ROOT%new-dashboard\.env" (
  echo VITE_API_URL=%API_URL%
  echo VITE_FRONTEND_URL=%FRONTEND_URL%
  echo VITE_DASHBOARD_URL=%DASHBOARD_URL%
)

echo [2/4] Installing dependencies...
pushd "%ROOT%backend"
call npm install
if errorlevel 1 (
  echo [Error] npm install failed in backend
  popd
  pause
  exit /b 1
)
popd

pushd "%ROOT%frontend2"
call npm install
if errorlevel 1 (
  echo [Error] npm install failed in frontend2
  popd
  pause
  exit /b 1
)
popd

pushd "%ROOT%new-dashboard"
call npm install
if errorlevel 1 (
  echo [Error] npm install failed in new-dashboard
  popd
  pause
  exit /b 1
)
popd

echo [3/4] Starting development servers in separate windows...

REM Backend server
start "HYtrade Backend" cmd /c "cd /d \"%ROOT%backend\" && set PORT=%BACKEND_PORT% && set NODE_ENV=development && set MONGODB_URI=%MONGODB_URI% && set JWT_SECRET=%JWT_SECRET% && npm start"

REM Landing page (Next.js) dev server
start "HYtrade Landing (Next.js)" cmd /c "cd /d \"%ROOT%frontend2\" && set PORT=%FRONTEND_PORT% && npm run dev -- -p %FRONTEND_PORT%"

REM Dashboard (Vite) dev server
start "HYtrade Dashboard (Vite)" cmd /c "cd /d \"%ROOT%new-dashboard\" && npm run dev -- --port %DASHBOARD_PORT%"

echo [4/4] Opening browser tabs...
start "" "%FRONTEND_URL%"
start "" "%DASHBOARD_URL%"

echo.
echo Done! Servers are starting:
echo - Backend:    %API_URL%
echo - Landing:    %FRONTEND_URL%
echo - Dashboard:  %DASHBOARD_URL%
echo.
echo This window can be closed. New windows were opened for each server.
pause