import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './ErrorBoundary';

// Remove the inline HTML boot splash the moment React takes over (no white flash)
function removeBootSplash() {
  const boot = document.getElementById('boot');
  if (!boot) return;
  boot.style.transition = 'opacity 0.25s ease';
  boot.style.opacity = '0';
  window.setTimeout(() => boot.remove(), 260);
}

// Global safety nets: never let an unhandled promise or async error crash the WebView
window.addEventListener('unhandledrejection', (e) => {
  try {
    console.warn('[TileTrails] Unhandled promise rejection (recovered):', e.reason);
  } catch {
    /* noop */
  }
  e.preventDefault();
});
window.addEventListener('error', (e) => {
  try {
    console.warn('[TileTrails] Runtime error (recovered):', e.message);
  } catch {
    /* noop */
  }
});

// Android back button / browser back: keep the user inside the app instead of exiting
try {
  history.pushState(null, '', location.href);
  window.addEventListener('popstate', () => {
    history.pushState(null, '', location.href);
    window.dispatchEvent(new CustomEvent('tiletrails:back'));
  });
} catch {
  /* noop in sandboxed environments */
}

const rootEl = document.getElementById('root')!;
createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Fade out the boot splash after the first paint
requestAnimationFrame(() => requestAnimationFrame(removeBootSplash));
