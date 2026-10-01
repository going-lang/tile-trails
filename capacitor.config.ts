/// <reference types="@capacitor/splash-screen" />
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tiletrails.game',
  appName: 'Tile Trails',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#1a1a2e',
    allowsLinkPreview: false,
    zoomEnabled: false,
    keyboardResize: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    App: {
      backgroundColor: '#1a1a2e',
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: '#1a1a2e',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      spinnerColor: '#FFD700',
      showSpinnerTitle: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a1a2e',
      overlaysWebView: false,
    },
    Haptics: {
      hapticsEnabled: true,
    },
  },
};

export default config;
