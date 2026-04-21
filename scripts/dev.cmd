@echo off
setlocal

cd /d "%~dp0.."

echo [1/3] Checking MySQL (127.0.0.1:3306)...
powershell -NoProfile -Command "Test-NetConnection 127.0.0.1 -Port 3306 | Select-Object -ExpandProperty TcpTestSucceeded" | findstr /i true >nul
if errorlevel 1 (
  echo MySQL not reachable on 3306. Start MySQL first, then retry.
  echo Tip: Check services.msc for "MySQL96".
  exit /b 1
)

set API_PORT=8081
:find_api_port
netstat -ano | findstr ":%API_PORT%" | findstr LISTENING >nul
if %errorlevel%==0 (
  set /a API_PORT=%API_PORT%+1
  goto find_api_port
)
echo [2/3] Starting API on port %API_PORT%...
if not exist apps\api\target\greenplanep2-api-0.1.0.jar (
  echo Building backend jar: mvn -DskipTests package...
  call mvn -f apps\api\pom.xml -DskipTests package
  if errorlevel 1 (
    echo Backend build failed.
    exit /b 1
  )
)
start "greenplan-api-%API_PORT%" cmd /k "java -jar apps\api\target\greenplanep2-api-0.1.0.jar --server.port=%API_PORT%"

set VITE_PORT=5175
:find_vite_port
netstat -ano | findstr ":%VITE_PORT%" | findstr LISTENING >nul
if %errorlevel%==0 (
  set /a VITE_PORT=%VITE_PORT%+1
  goto find_vite_port
)
echo [3/3] Starting Web on port %VITE_PORT%...
set VITE_API_TARGET=http://localhost:%API_PORT%
if not exist apps\web\node_modules (
  echo Installing frontend deps: npm ci...
  pushd apps\web
  call npm ci
  popd
)
start "greenplan-web" cmd /k "set VITE_PORT=%VITE_PORT% && set VITE_API_TARGET=%VITE_API_TARGET% && cd /d apps\web && npm run dev -- --port %VITE_PORT%"

echo Web: http://localhost:%VITE_PORT%/
echo API: http://localhost:%API_PORT%/
echo Done.
