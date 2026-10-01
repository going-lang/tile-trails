@echo off
setlocal

echo Tile Trails - Capacitor 8 Android Setup
echo =========================================

where node >nul 2>nul || (echo ERROR: Node.js 22+ is required.& exit /b 1)
where npm >nul 2>nul || (echo ERROR: npm is required.& exit /b 1)

for /f "tokens=1 delims=." %%A in ('node -p "process.versions.node"') do set NODE_MAJOR=%%A
if %NODE_MAJOR% LSS 22 (echo ERROR: Node.js 22+ is required.& exit /b 1)

npm install
if errorlevel 1 exit /b 1
npm run build
if errorlevel 1 exit /b 1

if exist android rmdir /s /q android
npx cap add android
if errorlevel 1 exit /b 1
npx cap sync android
if errorlevel 1 exit /b 1

echo.
echo Android platform created and synced successfully.
echo Build with: cd android ^&^& gradlew.bat assembleDebug
endlocal
