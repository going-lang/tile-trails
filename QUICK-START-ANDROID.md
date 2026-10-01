# Tile Trails - Quick Start Guide for Android

## 🚀 Super Quick Start (3 Steps)

### For Windows Users

1. **Double-click** `setup-android.bat` (first time only)
2. **Double-click** `build-android.bat`
3. **Install** the APK from Android Studio

### For Mac/Linux Users

1. **Run** `chmod +x setup-android.sh build-android.sh`
2. **Run** `./setup-android.sh` (first time only)
3. **Run** `./build-android.sh`

---

## 📱 Detailed Step-by-Step

### First Time Setup (One Time Only)

#### Windows:
```
Double-click: setup-android.bat
```

#### Mac/Linux:
```bash
chmod +x setup-android.sh
./setup-android.sh
```

This will:
- ✅ Install all dependencies
- ✅ Build the web game
- ✅ Initialize Android project
- ✅ Copy all assets

---

### Building the APK (Every Time You Make Changes)

#### Windows:
```
Double-click: build-android.bat
```

#### Mac/Linux:
```bash
./build-android.sh
```

This will:
- ✅ Build the web game
- ✅ Sync assets to Android
- ✅ Open Android Studio

---

### In Android Studio:

1. **Wait for Gradle sync** (first time: 5-10 minutes)
   
2. **Build the APK:**
   - Menu: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Wait for build notification
   - Click "locate" to find APK

3. **Find your APK:**
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## 📲 Installing on Your Phone

### Option A: USB Cable (Easiest)

1. Connect phone to computer via USB
2. Enable USB Debugging on phone:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"
3. In Android Studio, click the green ▶️ Run button
4. Select your phone and click OK

### Option B: Transfer APK File

1. Copy `app-debug.apk` to your phone (USB, cloud, email, etc.)
2. On your phone:
   - Settings → Security → Enable "Unknown Sources"
   - Open file manager, find the APK
   - Tap to install
3. Open "Tile Trails" from app drawer

---

## 🎮 Game Features Preserved

✅ **All Original Gameplay** - 50 worlds, 250 levels, 60 fruits  
✅ **Offline Play** - No internet required  
✅ **Mobile Controls** - Touch-optimized  
✅ **Portrait Mode** - Locked for best experience  
✅ **Fullscreen** - Immersive gameplay  
✅ **Save Progress** - All progress saved locally  
✅ **Audio** - All music and sound effects  
✅ **Performance** - Optimized for mobile  

---

## 🛠️ Troubleshooting

### "SDK not found" Error
```
1. Open Android Studio
2. Tools → SDK Manager
3. Install "Android SDK Platform 34"
4. Install "Android SDK Build-Tools"
5. Restart Android Studio
```

### "Gradle sync failed"
```
1. In Android Studio: File → Sync Project with Gradle Files
2. If still fails: File → Invalidate Caches / Restart
3. Check internet connection
```

### "App crashes on launch"
```
1. Check Android Studio → Logcat for errors
2. Verify: npm run build works
3. Run: npx cap sync android
4. Rebuild APK
```

### "APK won't install"
```
1. Enable "Unknown Sources" in phone settings
2. Check phone storage space
3. Uninstall any previous version first
4. Verify APK file isn't corrupted
```

### "Game runs slow"
```
1. Close other apps on phone
2. Restart phone
3. Check phone specs (needs Android 7.0+, 2GB+ RAM)
4. Lower screen brightness
```

---

## 📊 What Gets Built

### Debug APK (For Testing)
- **Location:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Size:** ~50-80 MB
- **Use:** Testing on your own device
- **No signing required**

### Release APK (For Distribution)
- **Location:** `android/app/build/outputs/apk/release/`
- **Size:** ~30-50 MB (compressed)
- **Use:** Distributing to others
- **Requires signing key**

---

## 🔄 Updating the Game

When you make changes to the game:

1. Make your code changes
2. Run: `npm run build` (or just run build script)
3. Run: `./build-android.sh` (or `.bat` on Windows)
4. Rebuild APK in Android Studio

---

## 📁 Project Structure

```
tile-trails/
├── android/                    ← Android project (auto-generated)
│   └── app/
│       └── build/
│           └── outputs/
│               └── apk/
│                   ├── debug/
│                   │   └── app-debug.apk  ← YOUR APK HERE!
│                   └── release/
│                       └── app-release.apk
├── src/                        ← Game source code
├── public/                     ← Images, audio, fonts
├── dist/                       ← Built web game
├── setup-android.sh/.bat       ← First-time setup
├── build-android.sh/.bat       ← Build APK
└── README-ANDROID-BUILD.md     ← Detailed guide
```

---

## 🎯 System Requirements

### For Building:
- **OS:** Windows 10/11, macOS 10.14+, or Linux
- **RAM:** 8 GB minimum (16 GB recommended)
- **Storage:** 10 GB free space
- **Node.js:** v18 or higher

### For Playing:
- **Android:** 7.0 (Nougat) or higher
- **RAM:** 2 GB minimum
- **Storage:** 100 MB free space
- **Screen:** Any size (auto-scales)

---

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Review README-ANDROID-BUILD.md** for detailed instructions
3. **Check Android Studio Logcat** for error messages
4. **Verify all prerequisites** are installed

---

## ✅ Checklist Before Building

- [ ] Node.js v18+ installed
- [ ] Android Studio installed
- [ ] Android SDK installed
- [ ] Ran `setup-android.sh/.bat` (first time only)
- [ ] Android Studio closed before running build script
- [ ] Sufficient storage space (10 GB+)
- [ ] Internet connection (for first Gradle sync)

---

## 🎉 You're Ready!

Once you've run the setup script, building the APK is as simple as:

```bash
./build-android.sh
```

Then wait for Android Studio to open and build!

**Good luck, and enjoy Tile Trails!** 🎮


> **Capacitor 8 update:** Use `./setup-android.sh` to generate a clean Android platform, or `./build-android.sh` to build the debug APK. These scripts replace older instructions that assumed a pre-generated Android folder.
