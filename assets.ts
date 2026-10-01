/**
 * Resolves public asset paths so they work in every packaging environment:
 *  - dev server / web hosting  → "/images/x.jpg"
 *  - Capacitor / Cordova APK   → "./images/x.jpg" relative to index.html
 *  - sub-path deployments      → honours Vite's BASE_URL
 *
 * Always use assetUrl('images/...') instead of hardcoding a leading slash.
 */
const BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';

export function assetUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, '');
  const base = BASE.endsWith('/') ? BASE : `${BASE}/`;
  return `${base}${clean}`;
}

export const IMG = {
  banner: assetUrl('images/tile_trails_banner.png'),
  worldBackgrounds: [
    assetUrl('images/bg_meadow.jpg'),
    assetUrl('images/bg_coastal.jpg'),
    assetUrl('images/bg_candy.jpg'),
    assetUrl('images/bg_mystic.jpg'),
    assetUrl('images/bg_cloud.jpg'),
    assetUrl('images/bg_dino.jpg'),
    assetUrl('images/bg_space.jpg'),
  ],
};

/**
 * Pre-decodes images off the critical path so the first time a world/background is
 * shown there is no pop-in. Safe to call multiple times; failures are ignored.
 */
export function preloadImages(urls: string[]): Promise<void> {
  return Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            // decode() lets the browser rasterize on a background thread where supported
            const anyImg = img as HTMLImageElement & { decode?: () => Promise<void> };
            if (typeof anyImg.decode === 'function') {
              anyImg.decode().then(() => resolve()).catch(() => resolve());
            } else {
              resolve();
            }
          };
          img.onerror = () => resolve();
          img.src = src;
        })
    )
  ).then(() => undefined);
}
