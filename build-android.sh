#!/bin/bash
set -e

echo "🎮 Tile Trails - Android APK Build"
echo "=================================="

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "❌ Node.js and npm are required."
  exit 1
fi
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "❌ Node.js $(node --version) detected. Capacitor 8 requires Node.js 22+."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

echo "🔨 Building web game..."
npm run build

if [ ! -d "android" ]; then
  echo "📱 Android platform is missing; creating it..."
  npx cap add android
fi

echo "🔄 Syncing Capacitor Android..."
npx cap sync android

echo "🤖 Building debug APK..."
cd android
./gradlew assembleDebug

echo ""
echo "✅ APK build complete:"
echo "android/app/build/outputs/apk/debug/app-debug.apk"
