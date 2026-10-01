import React from 'react';
import { PowerUpType } from './powerups';

/**
 * Original hand-crafted SVG button assets for the four power-ups.
 * Each is a glossy 3D "candy" button with a beveled face, soft top highlight,
 * dark outline and a recessed emblem — crisp at any resolution and lightweight.
 */

export const BUTTON_ART: Record<
  PowerUpType,
  { from: string; to: string; edge: string; outline: string; glow: string }
> = {
  undo: {
    from: '#7DD3FC',
    to: '#2563EB',
    edge: '#1E40AF',
    outline: '#0F2A63',
    glow: '#93C5FD',
  },
  shuffle: {
    from: '#C4B5FD',
    to: '#7C3AED',
    edge: '#5B21B6',
    outline: '#3B0764',
    glow: '#C4B5FD',
  },
  hint: {
    from: '#FDE68A',
    to: '#F59E0B',
    edge: '#B45309',
    outline: '#713F12',
    glow: '#FEF08A',
  },
  extraSlot: {
    from: '#6EE7B7',
    to: '#059669',
    edge: '#047857',
    outline: '#064E3B',
    glow: '#A7F3D0',
  },
};

export const PowerUpButtonArt: React.FC<{ type: PowerUpType; size?: number }> = ({
  type,
  size = 64,
}) => {
  const art = BUTTON_ART[type];
  const uid = `pua_${type}`;

  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}_face`} x1="36" y1="4" x2="36" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor={art.from} />
          <stop offset="1" stopColor={art.to} />
        </linearGradient>
        <linearGradient id={`${uid}_gloss`} x1="36" y1="8" x2="36" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${uid}_rim`} cx="0.5" cy="0.15" r="0.85">
          <stop stopColor={art.glow} stopOpacity="0.85" />
          <stop offset="1" stopColor={art.glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Dark outer outline */}
      <rect x="2" y="2" width="68" height="68" rx="20" fill={art.outline} />
      {/* Solid bottom lip for tactile depth */}
      <rect x="4" y="10" width="64" height="58" rx="18" fill={art.edge} />
      {/* Glossy gradient face */}
      <rect x="4" y="4" width="64" height="58" rx="18" fill={`url(#${uid}_face)`} />
      {/* Rim light from the top */}
      <rect x="4" y="4" width="64" height="58" rx="18" fill={`url(#${uid}_rim)`} />
      {/* Specular gloss cap */}
      <path d="M10 20C10 12.268 16.268 8 24 8H48C55.732 8 62 12.268 62 20V26C62 26 50 20 36 20C22 20 10 26 10 26V20Z" fill={`url(#${uid}_gloss)`} />

      {/* ===== Emblems ===== */}
      {type === 'undo' && (
        <g stroke="#FFFFFF" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M29 24L17 36L29 48" />
          <path d="M18 36H42C49.18 36 55 41.82 55 49" />
        </g>
      )}

      {type === 'shuffle' && (
        <g stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M14 24H25L47 48H58" />
          <path d="M14 48H25L47 24H58" />
          <path d="M52 18L59 24L52 30" />
          <path d="M52 42L59 48L52 54" />
        </g>
      )}

      {type === 'hint' && (
        <g>
          <path
            d="M36 15C28.27 15 22 21.27 22 29C22 33.7 24.4 37.8 28 40.2V45C28 46.66 29.34 48 31 48H41C42.66 48 44 46.66 44 45V40.2C47.6 37.8 50 33.7 50 29C50 21.27 43.73 15 36 15Z"
            fill="#FFFBEB"
            stroke={art.outline}
            strokeWidth="3.2"
          />
          <rect x="31" y="51" width="10" height="4.5" rx="2.25" fill={art.outline} />
          <rect x="32" y="57" width="8" height="3.5" rx="1.75" fill={art.outline} />
          {/* Rays */}
          <g stroke={art.outline} strokeWidth="3" strokeLinecap="round" opacity="0.55">
            <path d="M36 6V11" />
            <path d="M20 12L23 16" />
            <path d="M52 12L49 16" />
          </g>
        </g>
      )}

      {type === 'extraSlot' && (
        <g>
          <rect
            x="14"
            y="22"
            width="44"
            height="30"
            rx="9"
            fill="#FFFFFF"
            fillOpacity="0.28"
            stroke="#FFFFFF"
            strokeWidth="5"
          />
          <path d="M36 29V45M28 37H44" stroke="#FFFFFF" strokeWidth="6.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

/** Coin icon asset used across the HUD and shop */
export const CoinArt: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="coin_face" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10.5" fill="#92400E" />
    <circle cx="12" cy="11" r="9.5" fill="url(#coin_face)" />
    <circle cx="12" cy="11" r="6.2" fill="#FCD34D" />
    <path d="M12 7.2L13.2 9.8L16 10.4L14 12.4L14.5 15.2L12 13.8L9.5 15.2L10 12.4L8 10.4L10.8 9.8L12 7.2Z" fill="#B45309" />
  </svg>
);

/** Star icon asset used for ratings and counters */
export const StarArt: React.FC<{ size?: number; filled?: boolean }> = ({ size = 20, filled = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="star_face" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEF3C7" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    <path
      d="M12 2.5L15.1 8.8L22 9.8L17 14.7L18.2 21.6L12 18.3L5.8 21.6L7 14.7L2 9.8L8.9 8.8L12 2.5Z"
      fill={filled ? 'url(#star_face)' : 'rgba(120,113,108,0.35)'}
      stroke={filled ? '#B45309' : 'rgba(87,83,78,0.5)'}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);
