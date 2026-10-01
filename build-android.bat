@echo off
setlocal

echo Tile Trails - Android APK Build
echo ================================

where node >nul 2>nul || (echo ERROR: Node.js 22+ is required.& exit /b 1)
where npm >nul 2>nul || (echo ERROR: npm is required.& exit /b 1)

for /f "tokens=1 delims=." %%A in ('node -p "process.versions.node"') do set NODE_MAJOR=%%A
if %NODE_MAJOR% LSS 22 (echo ERROR: Node.js 22+ is required.& exit /b 1)

if not exist node_modules npm install
if errorlevel 1 exit /b 1
npm run build
if errorlevel 1 exit /b 1

if not exist android npx cap add android
if errorlevel 1 exit /b 1
npx cap sync android
if errorlevel 1 exit /b 1

cd android
gradlew.bat assembleDebug
if errorlevel 1 exit /b 1

echo.
echo APK: android\app\build\outputs\apk\debug\app-debug.apk
endlocal
