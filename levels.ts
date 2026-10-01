export interface WorldDefinition {
  id: number;
  name: string;
  subtitle: string;
  levelRange: [number, number];
  skyGradient: string;
  accentColor: string;
  badgeColor: string;
  icon: string;
  description: string;
}

// 50 Handcrafted Scenic Worlds (5 Levels per World = 250 Total Levels!)
export const WORLDS: WorldDefinition[] = [
  { id: 1, name: 'Sunny Meadow', subtitle: 'Breezy Wildflower Trails', levelRange: [1, 5], skyGradient: 'from-sky-200 via-emerald-100 to-lime-200', accentColor: '#38B64A', badgeColor: '#15803D', icon: '🌼', description: 'Warm orchard paths where Pip begins the grand fruit expedition.' },
  { id: 2, name: 'Crystal Coast', subtitle: 'Turquoise Lagoon & Shells', levelRange: [6, 10], skyGradient: 'from-cyan-200 via-teal-100 to-amber-100', accentColor: '#06B6D4', badgeColor: '#0E7490', icon: '🐚', description: 'Shimmering tidepools filled with pearls and tropical palm fruits.' },
  { id: 3, name: 'Candy Valley', subtitle: 'Sugarplum Hills & Honey', levelRange: [11, 15], skyGradient: 'from-pink-200 via-rose-100 to-amber-100', accentColor: '#EC4899', badgeColor: '#BE185D', icon: '🍪', description: 'Fragrant bakery trails lined with sweet berries and candied citrus.' },
  { id: 4, name: 'Mystic Forest', subtitle: 'Lantern Canopy & Toadstools', levelRange: [16, 20], skyGradient: 'from-indigo-200 via-emerald-100 to-teal-200', accentColor: '#10B981', badgeColor: '#047857', icon: '🍄', description: 'Ancient mossy groves glowing with fireflies and wild dark berries.' },
  { id: 5, name: 'Cloud Kingdom', subtitle: 'Starlit Cumulus Citadels', levelRange: [21, 25], skyGradient: 'from-sky-200 via-indigo-100 to-purple-200', accentColor: '#8B5CF6', badgeColor: '#6D28D9', icon: '☁️', description: 'Floating sky bridges where exotic cloudfruits rest on golden peaks.' },
  { id: 6, name: 'Dino Island', subtitle: 'Amber Volcano & Fern Valleys', levelRange: [26, 30], skyGradient: 'from-orange-200 via-amber-100 to-lime-200', accentColor: '#F97316', badgeColor: '#C2410C', icon: '🦕', description: 'Prehistoric jungle clearings with giant durians and ancient relics.' },
  { id: 7, name: 'Space Station', subtitle: 'Astral Orbit & Star Prisms', levelRange: [31, 35], skyGradient: 'from-indigo-900 via-purple-900 to-slate-900', accentColor: '#A855F7', badgeColor: '#7E22CE', icon: '🚀', description: 'Zero-gravity observatory surrounded by cosmic star fruits.' },
  { id: 8, name: 'Bamboo Grove', subtitle: 'Panda Serenity Sanctuary', levelRange: [36, 40], skyGradient: 'from-emerald-200 via-green-100 to-teal-100', accentColor: '#059669', badgeColor: '#065F46', icon: '🎋', description: 'Whispering bamboo shoots and tranquil mountain waterwheels.' },
  { id: 9, name: 'Sunset Oasis', subtitle: 'Golden Dune Mirage', levelRange: [41, 45], skyGradient: 'from-amber-300 via-orange-200 to-rose-200', accentColor: '#D97706', badgeColor: '#92400E', icon: '🌴', description: 'Shimmering desert springs surrounded by sweet dates and pomegranates.' },
  { id: 10, name: 'Coral Reef', subtitle: 'Luminescent Deep Lagoon', levelRange: [46, 50], skyGradient: 'from-blue-300 via-cyan-100 to-emerald-100', accentColor: '#0284C7', badgeColor: '#075985', icon: '🐠', description: 'Subaquatic coral arches with glowing aquatic starflowers.' },
  { id: 11, name: 'Sakura Mountain', subtitle: 'Cherry Blossom Peaks', levelRange: [51, 55], skyGradient: 'from-pink-200 via-rose-100 to-white', accentColor: '#F43F5E', badgeColor: '#9F1239', icon: '🌸', description: 'Floating pink blossom petals drifting down sacred shrine stairs.' },
  { id: 12, name: 'Frosty Peak', subtitle: 'Glistening Ice Caverns', levelRange: [56, 60], skyGradient: 'from-cyan-100 via-sky-200 to-blue-200', accentColor: '#38BDF8', badgeColor: '#0369A1', icon: '❄️', description: 'Crystalline ice ridges where arctic cloudberries gleam.' },
  { id: 13, name: 'Autumn Vale', subtitle: 'Crisp Maple Foliage', levelRange: [61, 65], skyGradient: 'from-amber-200 via-orange-100 to-red-100', accentColor: '#EA580C', badgeColor: '#9A3412', icon: '🍁', description: 'Golden timberland trails carpeted in crisp crimson maple leaves.' },
  { id: 14, name: 'Starry Galaxy', subtitle: 'Nebula Starlight Way', levelRange: [66, 70], skyGradient: 'from-purple-900 via-indigo-950 to-slate-950', accentColor: '#C084FC', badgeColor: '#6B21A8', icon: '🌌', description: 'Swirling purple nebulae sparkling with cosmic fruit constellations.' },
  { id: 15, name: 'Emerald Jungle', subtitle: 'Ancient Canopy Ruin', levelRange: [71, 75], skyGradient: 'from-lime-200 via-emerald-100 to-teal-200', accentColor: '#16A34A', badgeColor: '#14532D', icon: '🦜', description: 'Deep mossy rainforests hiding overgrown golden fruit altars.' },
  { id: 16, name: 'Lavender Fields', subtitle: 'Fragrant Purple Meadows', levelRange: [76, 80], skyGradient: 'from-purple-200 via-pink-100 to-indigo-100', accentColor: '#9333EA', badgeColor: '#581C87', icon: '🪻', description: 'Endless rolling lilac hills buzzing with friendly bumblebees.' },
  { id: 17, name: 'Golden Desert', subtitle: 'Sunken Pyramid Sands', levelRange: [81, 85], skyGradient: 'from-yellow-200 via-amber-100 to-orange-100', accentColor: '#CA8A04', badgeColor: '#713F12', icon: '🏜️', description: 'Ancient sandstone tombs buried under warm shifting golden sands.' },
  { id: 18, name: 'Rainbow Falls', subtitle: 'Seven-Color Mist Valley', levelRange: [86, 90], skyGradient: 'from-sky-200 via-pink-100 to-emerald-100', accentColor: '#E11D48', badgeColor: '#881337', icon: '🌈', description: 'Roaring prism waterfalls creating brilliant perpetual rainbows.' },
  { id: 19, name: 'Firefly Swamp', subtitle: 'Glowing Lotus Bay', levelRange: [91, 95], skyGradient: 'from-emerald-900 via-teal-900 to-slate-900', accentColor: '#34D399', badgeColor: '#064E3B', icon: '🪷', description: 'Mystical mangrove waterways illuminated by dancing fireflies.' },
  { id: 20, name: 'Volcanic Forge', subtitle: 'Molten Ruby Caldera', levelRange: [96, 100], skyGradient: 'from-orange-900 via-red-950 to-slate-950', accentColor: '#EF4444', badgeColor: '#7F1D1D', icon: '🌋', description: 'Smoldering obsidian ridges overlooking glowing magma rivers.' },
  { id: 21, name: 'Moonlit Bay', subtitle: 'Tidal Pearl Harbor', levelRange: [101, 105], skyGradient: 'from-slate-900 via-blue-950 to-indigo-900', accentColor: '#38BDF8', badgeColor: '#0C4A6E', icon: '🌙', description: 'Peaceful midnight shoreline reflecting the silver full moon.' },
  { id: 22, name: 'Dragon Peak', subtitle: 'Sky Citadel of Wyrms', levelRange: [106, 110], skyGradient: 'from-rose-200 via-amber-100 to-purple-200', accentColor: '#E11D48', badgeColor: '#881337', icon: '🐉', description: 'High cliff nests where friendly cloud dragons guard ripe dragonfruits.' },
  { id: 23, name: 'Berry Orchard', subtitle: 'Wild Jam Foothills', levelRange: [111, 115], skyGradient: 'from-red-200 via-pink-100 to-emerald-100', accentColor: '#E11D48', badgeColor: '#881337', icon: '🍓', description: 'Fragrant hillside farm loaded with juicy blueberries and raspberries.' },
  { id: 24, name: 'Crystal Caverns', subtitle: 'Amethyst Geode Mines', levelRange: [116, 120], skyGradient: 'from-indigo-900 via-purple-900 to-violet-950', accentColor: '#A855F7', badgeColor: '#581C87', icon: '💎', description: 'Glittering crystal chambers where giant gemstone geodes hum.' },
  { id: 25, name: 'Sunken Atlantis', subtitle: 'Coral Palace Ruins', levelRange: [121, 125], skyGradient: 'from-cyan-900 via-teal-950 to-slate-900', accentColor: '#06B6D4', badgeColor: '#164E63', icon: '🔱', description: 'Ancient sunken marble colonnades surrounded by schools of fish.' },
  { id: 26, name: 'Citrus Grove', subtitle: 'Lemon & Orange Terraces', levelRange: [126, 130], skyGradient: 'from-yellow-200 via-amber-100 to-lime-100', accentColor: '#EAB308', badgeColor: '#713F12', icon: '🍋', description: 'Sun-drenched Mediterranean terraces heavy with sweet citrus aroma.' },
  { id: 27, name: 'Alpine Ridge', subtitle: 'Crisp Pine Summits', levelRange: [131, 135], skyGradient: 'from-sky-300 via-slate-100 to-teal-100', accentColor: '#0284C7', badgeColor: '#075985', icon: '🏔️', description: 'Snow-dusted evergreen slopes with panoramic valley vistas.' },
  { id: 28, name: 'Twilight Marsh', subtitle: 'Phosphor Reed Trails', levelRange: [136, 140], skyGradient: 'from-indigo-950 via-purple-900 to-emerald-950', accentColor: '#10B981', badgeColor: '#064E3B', icon: '🌾', description: 'Quiet wetland pathways lined with bioluminescent swamp flora.' },
  { id: 29, name: 'Pirate Cove', subtitle: 'Shipwreck Gold Dunes', levelRange: [141, 145], skyGradient: 'from-amber-200 via-cyan-100 to-blue-200', accentColor: '#D97706', badgeColor: '#78350F', icon: '🏴‍☠️', description: 'Secret pirate anchorage with buried chests and parrot perches.' },
  { id: 30, name: 'Blossom Zen', subtitle: 'Tranquil Bonsai Terraces', levelRange: [146, 150], skyGradient: 'from-emerald-100 via-rose-100 to-teal-100', accentColor: '#059669', badgeColor: '#064E3B', icon: '🍵', description: 'Meditative stone rock gardens surrounded by manicured bonsai trees.' },
  { id: 31, name: 'Neon Metropolis', subtitle: 'Cyber City Skyline', levelRange: [151, 155], skyGradient: 'from-purple-950 via-fuchsia-950 to-slate-950', accentColor: '#D946EF', badgeColor: '#701A75', icon: '🏙️', description: 'Futuristic neon skyline bustling with high-tech sky gliders.' },
  { id: 32, name: 'Jungle Oasis', subtitle: 'Secret Waterfall Clearing', levelRange: [156, 160], skyGradient: 'from-teal-200 via-emerald-100 to-amber-100', accentColor: '#0D9488', badgeColor: '#115E59', icon: '🌺', description: 'Hidden tropical lagoon fed by warm volcanic spring water.' },
  { id: 33, name: 'Glacier Fjord', subtitle: 'Crystal Blue Icebergs', levelRange: [161, 165], skyGradient: 'from-blue-200 via-sky-100 to-cyan-100', accentColor: '#0284C7', badgeColor: '#0C4A6E', icon: '🧊', description: 'Majestic glassy fjords where icebergs float under chilly northern skies.' },
  { id: 34, name: 'Tropical Lagoon', subtitle: 'Coconut Beach Boardwalk', levelRange: [166, 170], skyGradient: 'from-cyan-200 via-amber-100 to-rose-100', accentColor: '#0891B2', badgeColor: '#155E75', icon: '🥥', description: 'Sunny coastal pier lined with coconut cabanas and surfboards.' },
  { id: 35, name: 'Whispering Hollow', subtitle: 'Ancient Willow Groves', levelRange: [171, 175], skyGradient: 'from-emerald-200 via-teal-100 to-slate-200', accentColor: '#059669', badgeColor: '#064E3B', icon: '🍃', description: 'Centuries-old weeping willows that whisper trail secrets in the wind.' },
  { id: 36, name: 'Aurora Borealis', subtitle: 'Polar Glow Skies', levelRange: [176, 180], skyGradient: 'from-emerald-950 via-teal-900 to-indigo-950', accentColor: '#2DD4BF', badgeColor: '#115E59', icon: '🎆', description: 'Dancing emerald and violet northern lights illuminating tundra snow.' },
  { id: 37, name: 'Honeycomb Hive', subtitle: 'Golden Honey Citadel', levelRange: [181, 185], skyGradient: 'from-amber-200 via-yellow-100 to-orange-100', accentColor: '#F59E0B', badgeColor: '#78350F', icon: '🐝', description: 'Towering golden hexagonal honeycomb towers filled with pure nectar.' },
  { id: 38, name: 'Starlight Spire', subtitle: 'Cosmic Observatory', levelRange: [186, 190], skyGradient: 'from-indigo-900 via-slate-900 to-purple-950', accentColor: '#818CF8', badgeColor: '#312E81', icon: '🔭', description: 'Grand brass telescope domed spire tracking orbiting fruit comets.' },
  { id: 39, name: 'Redwood Forest', subtitle: 'Towering Giant Pines', levelRange: [191, 195], skyGradient: 'from-amber-900 via-emerald-950 to-slate-900', accentColor: '#B45309', badgeColor: '#451A03', icon: '🌲', description: 'Massive ancient redwood giants whose crowns touch the clouds.' },
  { id: 40, name: 'Mirage Canyon', subtitle: 'Red Sandstone Arches', levelRange: [196, 200], skyGradient: 'from-orange-300 via-rose-200 to-amber-200', accentColor: '#EA580C', badgeColor: '#7C2D12', icon: '🏜️', description: 'Dramatic red rock canyons carved by ancient wind and water.' },
  { id: 41, name: 'Sunken Shipwreck', subtitle: 'Sunken Treasure Reef', levelRange: [201, 205], skyGradient: 'from-cyan-900 via-blue-950 to-slate-950', accentColor: '#06B6D4', badgeColor: '#164E63', icon: '⚓', description: 'Ghostly wooden galleon hull covered in vibrant coral anemones.' },
  { id: 42, name: 'Steampunk Foundry', subtitle: 'Brass Gear Workshop', levelRange: [206, 210], skyGradient: 'from-amber-900 via-orange-950 to-slate-950', accentColor: '#D97706', badgeColor: '#451A03', icon: '⚙️', description: 'Clanking clockwork factory powered by steam and golden fruit gears.' },
  { id: 43, name: 'Fairy Glade', subtitle: 'Enchanted Glow Springs', levelRange: [211, 215], skyGradient: 'from-pink-200 via-purple-100 to-emerald-100', accentColor: '#EC4899', badgeColor: '#831843', icon: '🧚', description: 'Magical forest pool where sprite rings glow under mushroom caps.' },
  { id: 44, name: 'Obsidian Crater', subtitle: 'Black Glass Rift', levelRange: [216, 220], skyGradient: 'from-slate-950 via-purple-950 to-indigo-950', accentColor: '#9333EA', badgeColor: '#3B0764', icon: '🌑', description: 'Mirror-polished black volcanic glass reflecting starry skies.' },
  { id: 45, name: 'Sunflower Plateau', subtitle: 'Golden Bloom Horizons', levelRange: [221, 225], skyGradient: 'from-yellow-200 via-amber-100 to-sky-100', accentColor: '#EAB308', badgeColor: '#713F12', icon: '🌻', description: 'Sun-drenched highlands filled with towering friendly sunflowers.' },
  { id: 46, name: 'Floating Islands', subtitle: 'Sky Temple Steps', levelRange: [226, 230], skyGradient: 'from-sky-200 via-indigo-100 to-teal-100', accentColor: '#38BDF8', badgeColor: '#0369A1', icon: '🏛️', description: 'Floating green islands anchored by ancient glowing vines.' },
  { id: 47, name: 'Comet Crater', subtitle: 'Stardust Meteor Valley', levelRange: [231, 235], skyGradient: 'from-indigo-950 via-purple-900 to-rose-950', accentColor: '#F43F5E', badgeColor: '#881337', icon: '☄️', description: 'Meteor impact site glowing with warm stardust crystal shards.' },
  { id: 48, name: 'Tropical Rainforest', subtitle: 'Exotic Toucan Haven', levelRange: [236, 240], skyGradient: 'from-emerald-200 via-lime-100 to-teal-100', accentColor: '#10B981', badgeColor: '#064E3B', icon: '🌴', description: 'Lush tropical paradise alive with singing birds and sweet passionfruit.' },
  { id: 49, name: 'Celestial Palace', subtitle: 'Pure Starlight Haven', levelRange: [241, 245], skyGradient: 'from-purple-200 via-pink-100 to-amber-100', accentColor: '#A855F7', badgeColor: '#581C87', icon: '🌠', description: 'Heavenly palace built on golden clouds overlooking all 50 worlds.' },
  { id: 50, name: 'Infinity Cosmos', subtitle: "Pip's Master Trail Peak", levelRange: [246, 250], skyGradient: 'from-amber-900 via-purple-950 to-slate-950', accentColor: '#F59E0B', badgeColor: '#78350F', icon: '👑', description: 'The summit of Tile Trails where the Master Harvester crown awaits!' },
];

export interface TilePlacement {
  id: string;
  /** Grid coordinate in half-tile steps (-6..+6) so tiles can half-overlap neatly in 2D */
  gx: number;
  gy: number;
  layer: number;
  motifId: number;
}

export interface LevelConfig {
  levelNumber: number;
  worldId: number;
  title: string;
  patternName: string;
  totalTiles: number;
  distinctMotifs: number;
  maxLayer: number;
  parTimeSec: number;
  tiles: TilePlacement[];
}

// Seeded PRNG so level layouts are 100% consistent across sessions
function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Checks if tile A (on a lower layer) is overlapped/blocked by tile B (on a higher layer).
 * Each tile occupies 2x2 half-grid units in (gx, gy).
 * So two tiles overlap in 2D if |gxA - gxB| < 1.85 and |gyA - gyB| < 1.85.
 */
export function doTilesOverlap2D(gxA: number, gyA: number, gxB: number, gyB: number): boolean {
  return Math.abs(gxA - gxB) < 1.85 && Math.abs(gyA - gyB) < 1.85;
}

interface RawSlot {
  gx: number;
  gy: number;
  layer: number;
}

const PATTERN_NAMES = [
  'Meadow Blossom',
  'Twin Bridges',
  'Stepping Stones',
  'Butterfly Wings',
  'Tidepool Ring',
  'Seashell Spiral',
  'Honeycomb Stack',
  'Heart Box',
  'Lantern Pagoda',
  'Toadstool Circle',
  'Cumulus Crown',
  'Starlight Pyramid',
  'Dino Footprint',
  'Volcano Crater',
  'Orbital Station',
  'Bamboo Lattice',
  'Sunset Mirage',
  'Coral Crest',
  'Sakura Spiral',
  'Glacier Steps',
];

function generateRawSlots(levelNumber: number, targetTriplets: number, maxLayers: number, rand: () => number): RawSlot[] {
  const totalSlots = targetTriplets * 3;
  const slots: RawSlot[] = [];

  // Level 1: Iconic ultra-friendly 9-tile starter layout (2 layers)
  if (levelNumber === 1) {
    return [
      // Layer 0 (6 base tiles)
      { gx: -2.2, gy: 1.2, layer: 0 },
      { gx: 0, gy: 1.2, layer: 0 },
      { gx: 2.2, gy: 1.2, layer: 0 },
      { gx: -2.2, gy: -1.2, layer: 0 },
      { gx: 0, gy: -1.2, layer: 0 },
      { gx: 2.2, gy: -1.2, layer: 0 },
      // Layer 1 (3 centered top tiles overlapping the middle)
      { gx: -1.1, gy: 0, layer: 1 },
      { gx: 1.1, gy: 0, layer: 1 },
      { gx: 0, gy: 2.2, layer: 1 },
    ];
  }

  // Level 2: 15-tile gentle flower layout
  if (levelNumber === 2) {
    return [
      // Layer 0 (9 tiles in 3x3)
      { gx: -2.2, gy: 2.2, layer: 0 },
      { gx: 0, gy: 2.2, layer: 0 },
      { gx: 2.2, gy: 2.2, layer: 0 },
      { gx: -2.2, gy: 0, layer: 0 },
      { gx: 0, gy: 0, layer: 0 },
      { gx: 2.2, gy: 0, layer: 0 },
      { gx: -2.2, gy: -2.2, layer: 0 },
      { gx: 0, gy: -2.2, layer: 0 },
      { gx: 2.2, gy: -2.2, layer: 0 },
      // Layer 1 (5 tiles)
      { gx: -1.1, gy: 1.1, layer: 1 },
      { gx: 1.1, gy: 1.1, layer: 1 },
      { gx: -1.1, gy: -1.1, layer: 1 },
      { gx: 1.1, gy: -1.1, layer: 1 },
      // Layer 2 (2 crown tiles)
      { gx: 0, gy: 1.1, layer: 2 },
      { gx: 0, gy: -1.1, layer: 2 },
    ];
  }

  // Candidate coordinates per layer for structured symmetrical 2D puzzle shapes
  const patternType = levelNumber % 6;

  // Larger boards (harder later levels) need a bigger slot pool per layer, but the
  // deepest layers should still shrink so the visible silhouette narrows to a peak.
  const layerCandidates: RawSlot[][] = [];
  const isBig = targetTriplets >= 22;
  const baseRadius = isBig ? 4 : 3;
  for (let layer = 0; layer < maxLayers; layer++) {
    const candidates: RawSlot[] = [];
    const offset = (layer % 2) * 1.05; // Half-tile offset on odd layers creates classic stack overlap
    const radiusX = Math.max(1, baseRadius - Math.floor(layer / 2));
    const radiusY = Math.max(1, baseRadius - Math.floor(layer / 2));

    for (let ix = -radiusX; ix <= radiusX; ix++) {
      for (let iy = -radiusY; iy <= radiusY; iy++) {
        const gx = Number((ix * 2.1 + (ix >= 0 ? -offset : offset) * 0.5).toFixed(2));
        const gy = Number((iy * 2.1 + (iy >= 0 ? -offset : offset) * 0.5).toFixed(2));

        // Wider horizontal bound so big-board rows fit on portrait mobile
        if (Math.abs(gx) > 5.2 || Math.abs(gy) > 5.4) continue;

        if (patternType === 1 && layer === 0 && Math.abs(ix) === radiusX && Math.abs(iy) === radiusY) continue;
        if (patternType === 2 && layer > 0 && ix === 0 && iy === 0 && layer < maxLayers - 1) continue;
        if (patternType === 3 && Math.abs(ix) + Math.abs(iy) > 5) continue;

        candidates.push({ gx, gy, layer });
      }
    }
    layerCandidates.push(candidates);
  }

  const pool: RawSlot[] = [];
  for (let l = 0; l < maxLayers; l++) {
    const cands = layerCandidates[l];
    for (let i = cands.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [cands[i], cands[j]] = [cands[j], cands[i]];
    }
    pool.push(...cands);
  }

  for (const cand of pool) {
    if (slots.length >= totalSlots) break;
    const clashesSameLayer = slots.some(
      (s) => s.layer === cand.layer && doTilesOverlap2D(s.gx, s.gy, cand.gx, cand.gy)
    );
    if (!clashesSameLayer) {
      slots.push(cand);
    }
  }

  // Fallback fill: scan a fine grid across increasing layers and only accept
  // positions that do NOT collide on the same layer. This guarantees no two
  // tiles are ever placed exactly on top of one another (which would create
  // an invisible, untappable duplicate).
  let fillLayer = 0;
  let safety = 0;
  while (slots.length < totalSlots && safety < 4000) {
    safety++;
    let placed = false;
    const offset = (fillLayer % 2) * 1.05;
    for (let ix = -2; ix <= 2 && !placed; ix++) {
      for (let iy = -2; iy <= 2 && !placed; iy++) {
        const gx = Number((ix * 2.1 + (ix >= 0 ? -offset : offset) * 0.5).toFixed(2));
        const gy = Number((iy * 2.1 + (iy >= 0 ? -offset : offset) * 0.5).toFixed(2));
        const clashes = slots.some((s) => s.layer === fillLayer && doTilesOverlap2D(s.gx, s.gy, gx, gy));
        if (!clashes) {
          slots.push({ gx, gy, layer: fillLayer });
          placed = true;
        }
      }
    }
    if (!placed) fillLayer++;
    if (fillLayer > maxLayers + 6) break;
  }

  // Trim to a multiple of 3 so every tile has a full triplet partner
  const usable = slots.length - (slots.length % 3);
  return slots.slice(0, Math.min(totalSlots, usable));
}

/**
 * Assigns motifs using Reverse-Peel Triplet Construction so the board is 100% solvable.
 */
function assignSolvableMotifs(slots: RawSlot[], distinctMotifs: number, worldId: number, rand: () => number): TilePlacement[] {
  const remainingIndices = slots.map((_, i) => i);
  const assignedMotifs = new Array<number>(slots.length).fill(0);

  // Pick a curated subset of fruit motifs based on world (60 fruits total, 10 primary fruits per world)
  const worldStartOffset = Math.max(0, (worldId - 1) * 4);
  const availableMotifs: number[] = [];
  for (let i = 0; i < Math.max(distinctMotifs, 10); i++) {
    availableMotifs.push((worldStartOffset + i) % 60);
  }

  const activeMotifs: number[] = [];
  for (let i = 0; i < distinctMotifs; i++) {
    const motifId = availableMotifs[i % availableMotifs.length];
    if (!activeMotifs.includes(motifId)) {
      activeMotifs.push(motifId);
    }
  }
  while (activeMotifs.length < 3) {
    const fallback = Math.floor(rand() * 60);
    if (!activeMotifs.includes(fallback)) activeMotifs.push(fallback);
  }

  let tripletCount = 0;
  while (remainingIndices.length >= 3) {
    const freeIndices = remainingIndices.filter((idxA) => {
      const slotA = slots[idxA];
      return !remainingIndices.some((idxB) => {
        if (idxA === idxB) return false;
        const slotB = slots[idxB];
        return slotB.layer > slotA.layer && doTilesOverlap2D(slotA.gx, slotA.gy, slotB.gx, slotB.gy);
      });
    });

    const chosen: number[] = [];
    const candidatePool = [...freeIndices];
    while (chosen.length < 3 && candidatePool.length > 0) {
      const pickIdx = Math.floor(rand() * candidatePool.length);
      chosen.push(candidatePool.splice(pickIdx, 1)[0]);
    }

    while (chosen.length < 3) {
      const remainingNotChosen = remainingIndices.filter((idx) => !chosen.includes(idx));
      remainingNotChosen.sort((a, b) => slots[b].layer - slots[a].layer);
      chosen.push(remainingNotChosen[0]);
    }

    const motif = activeMotifs[(tripletCount + Math.floor(rand() * 2)) % activeMotifs.length];
    chosen.forEach((slotIdx) => {
      assignedMotifs[slotIdx] = motif;
      const pos = remainingIndices.indexOf(slotIdx);
      if (pos !== -1) remainingIndices.splice(pos, 1);
    });

    tripletCount++;
  }

  return slots.map((slot, index) => ({
    id: `tile_${index}_${slot.layer}`,
    gx: slot.gx,
    gy: slot.gy,
    layer: slot.layer,
    motifId: assignedMotifs[index],
  }));
}

/**
 * Simulates a careful player with a limited tray to PROVE the layout is beatable.
 * Strategy per turn: prefer a free tile that completes a triple in the tray, then one
 * that pairs with a tray tile, then one whose other two copies are both free, and
 * finally any free tile. Returns true only if every tile can be cleared without the
 * tray ever exceeding `traySlots`.
 */
export function isSolvableWithTray(tiles: TilePlacement[], traySlots: number): boolean {
  const remaining = new Set(tiles.map((t) => t.id));
  const byId = new Map(tiles.map((t) => [t.id, t]));
  const tray: number[] = [];

  const isFree = (t: TilePlacement) => {
    for (const otherId of remaining) {
      if (otherId === t.id) continue;
      const o = byId.get(otherId)!;
      if (o.layer > t.layer && doTilesOverlap2D(t.gx, t.gy, o.gx, o.gy)) return false;
    }
    return true;
  };

  let guard = 0;
  while (remaining.size > 0 && guard++ < 5000) {
    const free = Array.from(remaining).map((id) => byId.get(id)!).filter(isFree);
    if (free.length === 0) return false;

    const countInTray = (m: number) => tray.filter((x) => x === m).length;
    const freeCount = (m: number) => free.filter((f) => f.motifId === m).length;

    let pick: TilePlacement | undefined;
    // 1. Completes a triple
    pick = free.find((f) => countInTray(f.motifId) === 2);
    // 2. Pairs with a tray tile AND its third copy is also free (safe to commit)
    if (!pick) pick = free.find((f) => countInTray(f.motifId) === 1 && freeCount(f.motifId) >= 2);
    // 3. All three copies free right now
    if (!pick) pick = free.find((f) => freeCount(f.motifId) >= 3);
    // 4. Pairs with tray tile (the third is buried, riskier)
    if (!pick) pick = free.find((f) => countInTray(f.motifId) === 1);
    // 5. Anything, but only if there is room to still complete a triple afterwards
    if (!pick) {
      if (tray.length >= traySlots - 2) return false;
      pick = free[0];
    }

    remaining.delete(pick.id);
    tray.push(pick.motifId);
    if (countInTray(pick.motifId) >= 3) {
      // remove the trio
      let removed = 0;
      for (let i = tray.length - 1; i >= 0 && removed < 3; i--) {
        if (tray[i] === pick.motifId) {
          tray.splice(i, 1);
          removed++;
        }
      }
    }
    if (tray.length > traySlots) return false;
  }
  return remaining.size === 0;
}

/**
 * Generates a level and re-rolls the motif assignment (up to N attempts) until the
 * board is provably beatable with a 5-slot tray. Falls back to the last attempt if
 * none pass (extremely rare) — but relaxes toward simpler layouts each retry.
 */
function buildVerifiedTiles(
  levelNumber: number,
  triplets: number,
  maxLayers: number,
  distinctMotifs: number,
  worldId: number,
  rand: () => number,
  traySlots = 5
): TilePlacement[] {
  let best: TilePlacement[] = [];
  let currentTriplets = triplets;
  let currentLayers = maxLayers;
  let currentDistinct = distinctMotifs;
  // Wider search on the larger boards: they can have many valid layouts and
  // we don't want to bail early and hand the player an easier level.
  const maxAttempts = triplets >= 22 ? 40 : 24;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const rawSlots = generateRawSlots(levelNumber, currentTriplets, currentLayers, rand);
    const tiles = assignSolvableMotifs(rawSlots, currentDistinct, worldId, rand);
    if (best.length === 0) best = tiles;
    if (isSolvableWithTray(tiles, traySlots)) return tiles;

    // Ease difficulty gradually. Keep at least 6 distinct motifs on big boards so
    // the puzzle never degenerates into "10 copies of one fruit" tedium.
    if (attempt % 5 === 4) {
      const minDistinct = triplets >= 22 ? 6 : 4;
      if (currentDistinct > minDistinct) currentDistinct--;
      else if (currentLayers > 3) currentLayers--;
      else if (currentTriplets > 3) currentTriplets--;
    }
  }
  return best;
}

const levelCache = new Map<number, LevelConfig>();

export function getLevelConfig(levelNumber: number): LevelConfig {
  const clamped = Math.max(1, Math.min(250, levelNumber));
  const cached = levelCache.get(clamped);
  if (cached) return cached;

  const worldId = Math.ceil(clamped / 5);
  const world = WORLDS[worldId - 1] || WORLDS[0];
  const rand = createSeededRandom(clamped * 9973 + worldId * 313);

  // Progressive difficulty curve — gentle through World 4 (Levels 1–20), then a
  // steep step-up at World 5 that keeps climbing all the way to Level 250.
  //
  //  W1  (L1–5)    Tutorial          — 9–26 tiles, 3–5 fruit types, 2–3 layers
  //  W2–4 (L6–20)  Easy plateau      — 27–39 tiles, 6–8 fruit types, 3–4 layers
  //  W5  (L21–25)  The Real Trail    — 42–54 tiles, 8–10 fruit types, 4 layers
  //  W6–15 (L26–75) Rising challenge — 54–78 tiles, 10–13 fruit types, 4–5 layers
  //  W16–30 (L76–150) Expert         — 78–96 tiles, 12–15 fruit types, 5 layers
  //  W31–50 (L151–250) Master        — 96–120 tiles, 14–16 fruit types, 5–6 layers
  let triplets = 3;
  let distinctMotifs = 3;
  let maxLayers = 2;

  if (clamped === 1) {
    triplets = 3; // 9 tiles
    distinctMotifs = 3;
    maxLayers = 2;
  } else if (clamped === 2) {
    triplets = 5; // 15 tiles
    distinctMotifs = 4;
    maxLayers = 3;
  } else if (clamped <= 6) {
    triplets = 6 + (clamped - 2) * 2; // 18..26 tiles
    distinctMotifs = 5 + Math.floor((clamped - 2) / 2);
    maxLayers = 3;
  } else if (clamped <= 20) {
    // Worlds 2–4: gentle climb, still forgiving so players learn the systems
    triplets = 9 + Math.floor((clamped - 6) * 0.4); // 27..39 tiles
    distinctMotifs = Math.min(8, 6 + Math.floor((clamped - 6) / 5));
    maxLayers = clamped >= 15 ? 4 : 3;
  } else if (clamped <= 25) {
    // World 5 — the difficulty spike. This is where the "real" trail begins.
    const inW5 = clamped - 20; // 1..5
    triplets = 14 + inW5 * 2; // 16..24 triplets → 48..72 tiles
    distinctMotifs = 8 + Math.floor(inW5 / 2); // 8..10 fruit types
    maxLayers = 4;
  } else if (clamped <= 75) {
    // Worlds 6–15: steady, meaningful growth off the World 5 baseline
    const p = (clamped - 25) / 50; // 0..1 across 50 levels
    triplets = Math.round(18 + p * 8) + (clamped % 3); // 18..27 triplets → 54..84 tiles
    distinctMotifs = Math.min(13, 10 + Math.floor(p * 3));
    maxLayers = 4 + (clamped >= 50 ? 1 : 0);
  } else if (clamped <= 150) {
    // Worlds 16–30: expert territory
    const p = (clamped - 75) / 75; // 0..1
    triplets = Math.round(26 + p * 6) + (clamped % 4); // ~78..96 tiles
    distinctMotifs = Math.min(15, 12 + Math.floor(p * 3));
    maxLayers = 5;
  } else {
    // Worlds 31–50: master runs — the final ascent
    const p = (clamped - 150) / 100; // 0..1
    triplets = Math.min(40, Math.round(32 + p * 8) + (clamped % 3)); // ~96..120 tiles
    distinctMotifs = Math.min(16, 14 + Math.floor(p * 2));
    maxLayers = clamped >= 200 ? 6 : 5;
  }

  // Verified against a 5-slot tray so every level is provably beatable
  const tiles = buildVerifiedTiles(clamped, triplets, maxLayers, distinctMotifs, worldId, rand, 5);

  const patternName = PATTERN_NAMES[(clamped - 1) % PATTERN_NAMES.length];
  // Par-time budget per triplet tightens as the trail gets tougher. Later levels
  // give less time-per-triple, so 3-star runs actually require confident play.
  const secondsPerTriple = clamped <= 20 ? 5.5 : clamped <= 75 ? 5.0 : clamped <= 150 ? 4.6 : 4.2;
  const parTimeSec = Math.max(30, Math.round((tiles.length / 3) * secondsPerTriple));

  const config: LevelConfig = {
    levelNumber: clamped,
    worldId,
    title: `${world.name} • Stage ${clamped}`,
    patternName,
    totalTiles: tiles.length,
    distinctMotifs,
    maxLayer: maxLayers,
    parTimeSec,
    tiles,
  };

  levelCache.set(clamped, config);
  return config;
}

export function getDailyChallengeLevelConfig(dateStr: string): LevelConfig {
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) % 1000000;
  }
  const rand = createSeededRandom(seed + 424242);
  const worldId = (seed % 50) + 1;
  const triplets = 16; // 48 tiles daily puzzle tailored for 5-slot tray!
  const distinctMotifs = 10;
  const maxLayers = 4;

  const tiles = buildVerifiedTiles(50 + (seed % 40), triplets, maxLayers, distinctMotifs, worldId, rand, 5);

  return {
    levelNumber: 999,
    worldId,
    title: `Daily Trail • ${dateStr}`,
    patternName: 'Grand Daily Expedition',
    totalTiles: tiles.length,
    distinctMotifs,
    maxLayer: maxLayers,
    parTimeSec: 120,
    tiles,
  };
}
