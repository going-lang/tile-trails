#!/bin/bash
set -e

echo "🎮 Tile Trails - Capacitor 8 Android Setup"
echo "=========================================="

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is required. Capacitor 8 requires Node.js 22+."
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm is required."
  exit 1
fi

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "❌ Node.js $NODE_MAJOR detected. Capacitor 8 requires Node.js 22+."
  exit 1
fi

echo "✅ Node.js $(node --version)"

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building web game..."
npm run build

echo "📱 Creating a clean Capacitor Android platform..."
rm -rf android
npx cap add android
npx cap sync android

echo ""
echo "✅ Android platform created and synced successfully."
echo ""
echo "Build a debug APK with:"
echo "  cd android && ./gradlew assembleDebug"
echo ""
echo "APK: android/app/build/outputs/apk/debug/app-debug.apk"
