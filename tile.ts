import * as THREE from 'three';
import { IMG } from './assets';
import { drawFruitArtwork } from './fruitArt';
import { TileThemeId } from './saveSystem';

export interface TileMotifMeta {
  id: number;
  name: string;
  category: string;
  symbol: string; // Used in color-friendly mode
  accentColor: string;
  description: string;
}

export const TILE_MOTIFS: TileMotifMeta[] = [
  // Sunny Meadow Grove (0-9)
  { id: 0, name: 'Orchard Red Apple', category: 'Sunny Meadow', symbol: 'A', accentColor: '#EF4444', description: 'Crisp ruby red apple fresh from the meadow orchard.' },
  { id: 1, name: 'Granny Smith Apple', category: 'Sunny Meadow', symbol: 'G', accentColor: '#84CC16', description: 'Tart green apple with a cheeky bite taken out.' },
  { id: 2, name: 'Honey Banana', category: 'Sunny Meadow', symbol: 'B', accentColor: '#FACC15', description: 'Sweet golden banana pair ripened under the sun.' },
  { id: 3, name: 'Wild Strawberry', category: 'Sunny Meadow', symbol: 'S', accentColor: '#F43F5E', description: 'Juicy ruby berry speckled with tiny golden seeds.' },
  { id: 4, name: 'Twin Sweet Cherries', category: 'Sunny Meadow', symbol: 'C', accentColor: '#BE123C', description: 'Pair of glossy crimson cherries on curved stems.' },
  { id: 5, name: 'Juicy Sun Peach', category: 'Sunny Meadow', symbol: 'P', accentColor: '#FB923C', description: 'Velvety golden peach with a rosy sun-kissed blush.' },
  { id: 6, name: 'Valencia Sweet Orange', category: 'Sunny Meadow', symbol: 'O', accentColor: '#F97316', description: 'Fragrant citrus with a juicy segmented slice.' },
  { id: 7, name: 'Eureka Yellow Lemon', category: 'Sunny Meadow', symbol: 'L', accentColor: '#EAB308', description: 'Zesty pointed lemon with a dimpled peel.' },
  { id: 8, name: 'Fresh Meadow Lime', category: 'Sunny Meadow', symbol: 'M', accentColor: '#22C55E', description: 'Vivid green citrus with a tart wedge.' },
  { id: 9, name: 'Velvet Apricot', category: 'Sunny Meadow', symbol: 'V', accentColor: '#F59E0B', description: 'Small freckled apricot with a deep velvet crease.' },

  // Crystal Coast Grove (10-19)
  { id: 10, name: 'Tropical Coconut', category: 'Crystal Coast', symbol: 'N', accentColor: '#78350F', description: 'Hairy island coconut cracked open to snowy flesh.' },
  { id: 11, name: 'Golden Pineapple', category: 'Crystal Coast', symbol: 'I', accentColor: '#EAB308', description: 'Crown-topped tropical pineapple full of sweet tang.' },
  { id: 12, name: 'Crimson Watermelon', category: 'Crystal Coast', symbol: 'W', accentColor: '#EF4444', description: 'Cool summer melon wedge with crisp green rind.' },
  { id: 13, name: 'Purple Passionfruit', category: 'Crystal Coast', symbol: 'F', accentColor: '#7C3AED', description: 'Halved purple shell filled with tangy golden pulp.' },
  { id: 14, name: 'Golden Papaya', category: 'Crystal Coast', symbol: 'Y', accentColor: '#FB923C', description: 'Tropical papaya sliced open to its dark seed cavity.' },
  { id: 15, name: 'Golden Starfruit', category: 'Crystal Coast', symbol: '★', accentColor: '#FACC15', description: 'Luminous five-pointed star fruit from island palms.' },
  { id: 16, name: 'Pink Guava', category: 'Crystal Coast', symbol: 'U', accentColor: '#FB7185', description: 'Green tropical fruit hiding a coral-pink centre.' },
  { id: 17, name: 'Giant Pomelo', category: 'Crystal Coast', symbol: 'Ω', accentColor: '#A3E635', description: 'Massive teardrop citrus with thick snowy pith.' },
  { id: 18, name: 'Honey Cantaloupe', category: 'Crystal Coast', symbol: '☾', accentColor: '#FDBA74', description: 'Netted crescent wedge of honeyed orange melon.' },
  { id: 19, name: 'Fresh Honeydew', category: 'Crystal Coast', symbol: 'H', accentColor: '#86EFAC', description: 'Smooth pale green melon with a delicate slice.' },

  // Candy Valley Grove (20-29)
  { id: 20, name: 'Honey Tangerine', category: 'Candy Valley', symbol: 'T', accentColor: '#F97316', description: 'Squat easy-peel citrus with a curling strip of peel.' },
  { id: 21, name: 'Sweet Lychee', category: 'Candy Valley', symbol: '✿', accentColor: '#FDA4AF', description: 'Bumpy rosy shell peeled back to translucent flesh.' },
  { id: 22, name: 'Golden Mirabelle', category: 'Candy Valley', symbol: '⁂', accentColor: '#FBBF24', description: 'Trio of petite golden plums with red freckles.' },
  { id: 23, name: 'Turkish Black Fig', category: 'Candy Valley', symbol: '♠', accentColor: '#581C87', description: 'Purple teardrop split open to sweet pink seeds.' },
  { id: 24, name: 'Sweet Kumquat', category: 'Candy Valley', symbol: '⁝', accentColor: '#F59E0B', description: 'Bite-sized oval oranges hanging from a leafy twig.' },
  { id: 25, name: 'Sweet Clementine', category: 'Candy Valley', symbol: '●', accentColor: '#FB923C', description: 'Glossy mandarin with a cheerful navel dimple.' },
  { id: 26, name: 'Queen Mangosteen', category: 'Candy Valley', symbol: '♛', accentColor: '#4C1D95', description: 'Royal purple shell revealing snow-white segments.' },
  { id: 27, name: 'Sweet Mulberry', category: 'Candy Valley', symbol: '⫶', accentColor: '#6B21A8', description: 'Long aggregate berry packed with rich purple juice.' },
  { id: 28, name: 'Forest Boysenberry', category: 'Candy Valley', symbol: '⬢', accentColor: '#831843', description: 'Plump maroon berry with big glossy drupelets.' },
  { id: 29, name: 'Sugar Custard Apple', category: 'Candy Valley', symbol: '♥', accentColor: '#4ADE80', description: 'Heart-shaped scaly cherimoya with creamy flesh.' },

  // Mystic Forest Grove (30-39)
  { id: 30, name: 'Wild Blueberry', category: 'Mystic Forest', symbol: '⁘', accentColor: '#2563EB', description: 'Cluster of dusty blue berries with star crowns.' },
  { id: 31, name: 'Forest Blackberry', category: 'Mystic Forest', symbol: '▲', accentColor: '#1E1B4B', description: 'Tall cone of glossy dark bramble drupelets.' },
  { id: 32, name: 'Dark Elderberry', category: 'Mystic Forest', symbol: '✳', accentColor: '#312E81', description: 'Umbrella of tiny midnight berries on red stems.' },
  { id: 33, name: 'Tart Gooseberry', category: 'Mystic Forest', symbol: '◍', accentColor: '#65A30D', description: 'Translucent veined emerald berry with a tail.' },
  { id: 34, name: 'Red Currant Cluster', category: 'Mystic Forest', symbol: '⋮', accentColor: '#DC2626', description: 'Hanging string of gleaming ruby pearls.' },
  { id: 35, name: 'Black Currant Cluster', category: 'Mystic Forest', symbol: '⁞', accentColor: '#0F172A', description: 'Hanging string of inky berries under a lobed leaf.' },
  { id: 36, name: 'Crimson Cranberry', category: 'Mystic Forest', symbol: '◗', accentColor: '#991B1B', description: 'Three snappy crimson bog berries.' },
  { id: 37, name: 'Golden Cloudberry', category: 'Mystic Forest', symbol: '☁', accentColor: '#F59E0B', description: 'Rare amber aggregate berry, gold of the tundra.' },
  { id: 38, name: 'Amazon Acai Berry', category: 'Mystic Forest', symbol: '⚬', accentColor: '#4C1D95', description: 'Deep purple palm berries beneath a frond.' },
  { id: 39, name: 'Miracle Sweet Berry', category: 'Mystic Forest', symbol: '✦', accentColor: '#E11D48', description: 'Elongated scarlet berry that sparkles with magic.' },

  // Cloud Kingdom Grove (40-49)
  { id: 40, name: 'Japanese Yuzu', category: 'Cloud Kingdom', symbol: 'Z', accentColor: '#A3E635', description: 'Bumpy yellow-green mountain citrus.' },
  { id: 41, name: 'Ruby Dragonfruit', category: 'Cloud Kingdom', symbol: 'D', accentColor: '#DB2777', description: 'Magenta pitaya armoured with green flame scales.' },
  { id: 42, name: 'Emerald Muscat Grape', category: 'Cloud Kingdom', symbol: '∴', accentColor: '#84CC16', description: 'Translucent jade grape bunch with a broad leaf.' },
  { id: 43, name: 'Royal Concord Grape', category: 'Cloud Kingdom', symbol: '∵', accentColor: '#6B21A8', description: 'Deep violet grape bunch with a curling tendril.' },
  { id: 44, name: 'Golden Quince', category: 'Cloud Kingdom', symbol: 'Q', accentColor: '#EAB308', description: 'Knobby golden pear-shaped fruit with a fuzzy sheen.' },
  { id: 45, name: 'Dragon Eye Longan', category: 'Cloud Kingdom', symbol: '◉', accentColor: '#D97706', description: 'Tan shell peeled to a crystal pearl with a dark eye.' },
  { id: 46, name: 'Emerald Feijoa', category: 'Cloud Kingdom', symbol: '◐', accentColor: '#16A34A', description: 'Dark green oval halved to a pale jelly centre.' },
  { id: 47, name: 'Ruby Blood Orange', category: 'Cloud Kingdom', symbol: 'R', accentColor: '#991B1B', description: 'Orange peel hiding crimson berry-flavoured segments.' },
  { id: 48, name: 'Sliced Emerald Kiwi', category: 'Cloud Kingdom', symbol: 'K', accentColor: '#65A30D', description: 'Sunburst kiwi slice ringed with tiny black seeds.' },
  { id: 49, name: 'Ruby Pomegranate', category: 'Cloud Kingdom', symbol: '♦', accentColor: '#BE123C', description: 'Crowned crimson fruit brimming with ruby arils.' },

  // Dino Island Grove (50-59)
  { id: 50, name: 'Golden Durian', category: 'Dino Island', symbol: '✴', accentColor: '#CA8A04', description: 'Spiky king of fruits with a ring of thorns.' },
  { id: 51, name: 'Giant Jackfruit', category: 'Dino Island', symbol: '▣', accentColor: '#65A30D', description: 'Colossal bumpy jungle fruit with knobbly skin.' },
  { id: 52, name: 'Tropical Breadfruit', category: 'Dino Island', symbol: '⬡', accentColor: '#84CC16', description: 'Round green staple tiled with hexagon patterns.' },
  { id: 53, name: 'Prickly Cactus Pear', category: 'Dino Island', symbol: '✶', accentColor: '#E11D48', description: 'Magenta cactus fruit with spiny tufts and a pad.' },
  { id: 54, name: 'Spiky Rambutan', category: 'Dino Island', symbol: '✺', accentColor: '#DC2626', description: 'Hairy red jungle sphere with soft green spines.' },
  { id: 55, name: 'Golden Plantain', category: 'Dino Island', symbol: '▬', accentColor: '#EAB308', description: 'Thick ridged plantain with dark cooking tips.' },
  { id: 56, name: 'Orange Persimmon', category: 'Dino Island', symbol: '✤', accentColor: '#EA580C', description: 'Flattened pumpkin-orange fruit with a four-lobed calyx.' },
  { id: 57, name: 'Deep Purple Plum', category: 'Dino Island', symbol: '◆', accentColor: '#4C1D95', description: 'Dusty violet plum with a deep cleft.' },
  { id: 58, name: 'Sweet Tamarind Pod', category: 'Dino Island', symbol: '≋', accentColor: '#78350F', description: 'Curved lumpy brown pod full of tangy pulp.' },
  { id: 59, name: 'Astral Star Mango', category: 'Dino Island', symbol: '☆', accentColor: '#F59E0B', description: 'Kidney-shaped sunset mango glowing with starlight.' },
];

const textureCache = new Map<string, THREE.CanvasTexture>();

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function getThemePalette(theme: TileThemeId) {
  switch (theme) {
    case 'jade':
      return { lip: '#2D7A63', border: '#1F5746', faceTop: '#F2FFF9', faceBottom: '#D6F5E8', innerRim: '#A5E4CB' };
    case 'sakura':
      return { lip: '#C86D88', border: '#8A3B52', faceTop: '#FFF7FA', faceBottom: '#FFE4EE', innerRim: '#F9C2D4' };
    case 'starlight':
      return { lip: '#312E81', border: '#1E1B4B', faceTop: '#F5F3FF', faceBottom: '#DDD6FE', innerRim: '#C4B5FD' };
    case 'classic':
    default:
      return { lip: '#C8AE82', border: '#6E5034', faceTop: '#FFFDF9', faceBottom: '#F7EFE0', innerRim: '#E8D8BE' };
  }
}

export function getTileTexture(
  motifId: number,
  theme: TileThemeId,
  colorFriendly: boolean,
  isBlocked: boolean
): THREE.CanvasTexture {
  const safeId = ((motifId % TILE_MOTIFS.length) + TILE_MOTIFS.length) % TILE_MOTIFS.length;
  const key = `tile_${safeId}_${theme}_${colorFriendly ? 'cf' : 'std'}_${isBlocked ? 'blk' : 'free'}`;
  const existing = textureCache.get(key);
  if (existing) return existing;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const palette = getThemePalette(theme);
  const pad = 12;
  const w = size - pad * 2;
  const h = size - pad * 2 - 14;
  const radius = 40;

  // Soft outer drop shadow
  ctx.save();
  ctx.fillStyle = 'rgba(28, 18, 10, 0.24)';
  drawRoundedRect(ctx, pad + 2, pad + 16, w, h, radius);
  ctx.fill();
  ctx.restore();

  // 2D Tile Bottom Lip
  ctx.fillStyle = palette.lip;
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 7;
  drawRoundedRect(ctx, pad, pad + 12, w, h, radius);
  ctx.fill();
  ctx.stroke();

  // Main Tile Top Face
  const faceGrad = ctx.createLinearGradient(0, pad, 0, pad + h);
  faceGrad.addColorStop(0, palette.faceTop);
  faceGrad.addColorStop(1, palette.faceBottom);
  ctx.fillStyle = faceGrad;
  drawRoundedRect(ctx, pad, pad, w, h, radius);
  ctx.fill();
  ctx.stroke();

  // Inner rim highlight
  ctx.strokeStyle = palette.innerRim;
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, pad + 10, pad + 10, w - 20, h - 20, radius - 8);
  ctx.stroke();

  // Distinct 2D fruit artwork
  drawFruitArtwork(ctx, safeId, size / 2, pad + h / 2 + 2, 1.42);

  // Color-friendly high-contrast corner badge
  if (colorFriendly) {
    const meta = TILE_MOTIFS[safeId];
    ctx.fillStyle = '#1E293B';
    drawRoundedRect(ctx, pad + 14, pad + 14, 52, 52, 14);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(meta.symbol, pad + 40, pad + 41);
  }

  // Twilight veil if blocked by upper layer tile
  if (isBlocked) {
    ctx.fillStyle = 'rgba(35, 28, 46, 0.46)';
    drawRoundedRect(ctx, pad - 2, pad - 2, w + 4, h + 16, radius);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Mystery "covered" tile texture. Fruit is hidden beneath a leafy cap
 * until the player taps once to peel it back.
 */
export function getCoveredTileTexture(theme: TileThemeId, isBlocked: boolean): THREE.CanvasTexture {
  const key = `tile_covered_${theme}_${isBlocked ? 'blk' : 'free'}`;
  const existing = textureCache.get(key);
  if (existing) return existing;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const palette = getThemePalette(theme);
  const pad = 12;
  const w = size - pad * 2;
  const h = size - pad * 2 - 14;
  const radius = 40;

  // Drop shadow
  ctx.save();
  ctx.fillStyle = 'rgba(28, 18, 10, 0.24)';
  drawRoundedRect(ctx, pad + 2, pad + 16, w, h, radius);
  ctx.fill();
  ctx.restore();

  // Bottom lip
  ctx.fillStyle = palette.lip;
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 7;
  drawRoundedRect(ctx, pad, pad + 12, w, h, radius);
  ctx.fill();
  ctx.stroke();

  // Leafy green cover face
  const coverGrad = ctx.createLinearGradient(0, pad, 0, pad + h);
  coverGrad.addColorStop(0, '#86EFAC');
  coverGrad.addColorStop(0.5, '#22C55E');
  coverGrad.addColorStop(1, '#15803D');
  ctx.fillStyle = coverGrad;
  drawRoundedRect(ctx, pad, pad, w, h, radius);
  ctx.fill();
  ctx.stroke();

  // Subtle leaf-vein pattern
  ctx.save();
  drawRoundedRect(ctx, pad, pad, w, h, radius);
  ctx.clip();
  ctx.strokeStyle = 'rgba(20, 83, 45, 0.22)';
  ctx.lineWidth = 3;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(size / 2 + i * 30, pad);
    ctx.quadraticCurveTo(size / 2 + i * 44, size / 2, size / 2 + i * 30, pad + h);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(20, 83, 45, 0.28)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(size / 2, pad + 8);
  ctx.lineTo(size / 2, pad + h - 8);
  ctx.stroke();
  ctx.restore();

  // Inner rim highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, pad + 10, pad + 10, w - 20, h - 20, radius - 8);
  ctx.stroke();

  // Big "?" badge
  ctx.fillStyle = 'rgba(255, 253, 249, 0.95)';
  ctx.beginPath();
  ctx.arc(size / 2, pad + h / 2 + 2, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#14532D';
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = '#15803D';
  ctx.font = 'bold 84px Fredoka, "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', size / 2, pad + h / 2 + 8);

  // Small "tap" hint sparkle
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? 11 : 4.5;
    const a = (i * Math.PI) / 4;
    const x = size - pad - 34 + Math.cos(a) * r;
    const y = pad + 34 + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#A16207';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  if (isBlocked) {
    ctx.fillStyle = 'rgba(35, 28, 46, 0.46)';
    drawRoundedRect(ctx, pad - 2, pad - 2, w + 4, h + 16, radius);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  textureCache.set(key, texture);
  return texture;
}

export function getTrayDockTexture(slotCount: number): THREE.CanvasTexture {
  const key = `tray_dock_${slotCount}`;
  const existing = textureCache.get(key);
  if (existing) return existing;

  const width = 1024;
  const height = 192;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const woodGrad = ctx.createLinearGradient(0, 8, 0, height - 8);
  woodGrad.addColorStop(0, '#E7C896');
  woodGrad.addColorStop(0.5, '#D4AC72');
  woodGrad.addColorStop(1, '#A97B42');

  ctx.fillStyle = '#6E4720';
  drawRoundedRect(ctx, 10, 16, width - 20, height - 20, 36);
  ctx.fill();

  ctx.fillStyle = woodGrad;
  ctx.strokeStyle = '#6E4720';
  ctx.lineWidth = 8;
  drawRoundedRect(ctx, 10, 8, width - 20, height - 26, 36);
  ctx.fill();
  ctx.stroke();

  const marginX = 38;
  const usableW = width - marginX * 2;
  const slotW = usableW / slotCount;
  const wellSize = Math.min(slotW - 12, 118);

  for (let i = 0; i < slotCount; i++) {
    const cx = marginX + slotW * (i + 0.5);
    const cy = (height - 18) / 2 + 4;
    ctx.fillStyle = 'rgba(92, 56, 24, 0.35)';
    ctx.strokeStyle = 'rgba(255, 248, 231, 0.45)';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, cx - wellSize / 2, cy - wellSize / 2, wellSize, wellSize, 22);
    ctx.fill();
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  textureCache.set(key, tex);
  return tex;
}

export function getWorldBackgroundTexture(worldId: number): THREE.CanvasTexture {
  const key = `world_bg_${worldId}`;
  const existing = textureCache.get(key);
  if (existing) return existing;

  const w = 720;
  const h = 1280;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const biomePalettes: Array<{ top: string; mid: string; bot: string; hill1: string; hill2: string; accent: string }> = [
    { top: '#BCE6FF', mid: '#E3F6D5', bot: '#95D57A', hill1: '#7BC96F', hill2: '#5BB350', accent: '#FFF3B0' },
    { top: '#A5F3FC', mid: '#67E8F9', bot: '#FDE68A', hill1: '#38BDF8', hill2: '#FCD34D', accent: '#FFFFFF' },
    { top: '#FBCFE8', mid: '#FDE2E4', bot: '#F9A8D4', hill1: '#F472B6', hill2: '#EC4899', accent: '#FEF08A' },
    { top: '#C7D2FE', mid: '#A7F3D0', bot: '#34D399', hill1: '#10B981', hill2: '#059669', accent: '#6EE7B7' },
    { top: '#BAE6FD', mid: '#E0E7FF', bot: '#F3E8FF', hill1: '#C4B5FD', hill2: '#A78BFA', accent: '#FEF9C3' },
    { top: '#FED7AA', mid: '#FDE68A', bot: '#86EFAC', hill1: '#4ADE80', hill2: '#FB923C', accent: '#FDBA74' },
    { top: '#1E1B4B', mid: '#312E81', bot: '#4C1D95', hill1: '#4338CA', hill2: '#6D28D9', accent: '#38BDF8' },
    { top: '#A7F3D0', mid: '#D1FAE5', bot: '#34D399', hill1: '#10B981', hill2: '#047857', accent: '#FEF08A' },
    { top: '#FDE68A', mid: '#FED7AA', bot: '#F97316', hill1: '#EA580C', hill2: '#C2410C', accent: '#FEF9C3' },
    { top: '#7DD3FC', mid: '#38BDF8', bot: '#0284C7', hill1: '#0369A1', hill2: '#075985', accent: '#E0F2FE' },
    { top: '#FCE7F3', mid: '#FBCFE8', bot: '#F472B6', hill1: '#EC4899', hill2: '#BE185D', accent: '#FFF1F2' },
    { top: '#E0F2FE', mid: '#BAE6FD', bot: '#7DD3FC', hill1: '#38BDF8', hill2: '#0284C7', accent: '#FFFFFF' },
    { top: '#FED7AA', mid: '#FDBA74', bot: '#EA580C', hill1: '#C2410C', hill2: '#9A3412', accent: '#FEF3C7' },
    { top: '#2E1065', mid: '#3B0764', bot: '#1E1B4B', hill1: '#4C1D95', hill2: '#581C87', accent: '#E879F9' },
    { top: '#BBF7D0', mid: '#86EFAC', bot: '#22C55E', hill1: '#16A34A', hill2: '#15803D', accent: '#FEF9C3' },
    { top: '#DDD6FE', mid: '#C4B5FD', bot: '#8B5CF6', hill1: '#7C3AED', hill2: '#6D28D9', accent: '#F5F3FF' },
  ];

  const paletteIndex = ((((worldId - 1) % biomePalettes.length) + biomePalettes.length) % biomePalettes.length);
  const p = biomePalettes[paletteIndex];
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, p.top);
  skyGrad.addColorStop(0.55, p.mid);
  skyGrad.addColorStop(1, p.bot);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = p.accent;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(w * 0.78, h * 0.16, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = p.hill1;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.72);
  ctx.quadraticCurveTo(w * 0.3, h * 0.64, w * 0.65, h * 0.72);
  ctx.quadraticCurveTo(w * 0.85, h * 0.77, w, h * 0.7);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = p.hill2;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.82);
  ctx.quadraticCurveTo(w * 0.4, h * 0.75, w, h * 0.84);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  textureCache.set(key, tex);

  // Composite the generated hi-res world background asset once it loads
  const bgImgList = IMG.worldBackgrounds;
  const bgImgPath = bgImgList[((((worldId - 1) % bgImgList.length) + bgImgList.length) % bgImgList.length)];

  if (typeof Image !== 'undefined') {
    const img = new Image();
    img.src = bgImgPath;
    img.onload = () => {
      ctx.globalAlpha = 0.85;
      ctx.drawImage(img, 0, 0, w, h);
      ctx.globalAlpha = 1;
      const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.75);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
      tex.needsUpdate = true;
    };
  }

  return tex;
}

export function getSparkleParticleTexture(): THREE.CanvasTexture {
  const key = 'particle_sparkle';
  const existing = textureCache.get(key);
  if (existing) return existing;

  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? 28 : 10;
    const a = (i * Math.PI) / 4;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set(key, tex);
  return tex;
}

/** Soft radial glow sprite used for halos, flashes and bloom puffs */
export function getGlowTexture(): THREE.CanvasTexture {
  const key = 'vfx_glow';
  const existing = textureCache.get(key);
  if (existing) return existing;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set(key, tex);
  return tex;
}

/** Hollow expanding shockwave ring for triple-match ripples */
export function getRingTexture(): THREE.CanvasTexture {
  const key = 'vfx_ring';
  const existing = textureCache.get(key);
  if (existing) return existing;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.28, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.82, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set(key, tex);
  return tex;
}

/** Small bright rectangle used for celebration confetti strips */
export function getConfettiTexture(): THREE.CanvasTexture {
  const key = 'vfx_confetti';
  const existing = textureCache.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 32, 16);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set(key, tex);
  return tex;
}

/** Rendered text popup sprite (combo numbers, coin rewards, praise words) */
export function getTextPopupTexture(text: string, color: string): THREE.CanvasTexture {
  const key = `vfx_text_${text}_${color}`;
  const existing = textureCache.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.font = 'bold 118px Fredoka, "Plus Jakarta Sans", sans-serif';
  ctx.lineWidth = 22;
  ctx.strokeStyle = '#3D2817';
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2);

  const g = ctx.createLinearGradient(0, 30, 0, canvas.height - 30);
  g.addColorStop(0, '#FFFFFF');
  g.addColorStop(0.55, color);
  g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  textureCache.set(key, tex);
  return tex;
}

/** Five-pointed celebration star sprite */
export function getStarBurstTexture(): THREE.CanvasTexture {
  const key = 'vfx_starburst';
  const existing = textureCache.get(key);
  if (existing) return existing;

  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 28 : 12;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set(key, tex);
  return tex;
}

export function getHintHaloTexture(): THREE.CanvasTexture {
  const key = 'hint_halo_tex';
  const existing = textureCache.get(key);
  if (existing) return existing;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 14;
  ctx.shadowColor = '#F59E0B';
  ctx.shadowBlur = 18;
  drawRoundedRect(ctx, 14, 14, size - 28, size - 28, 44);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  textureCache.set(key, tex);
  return tex;
}
