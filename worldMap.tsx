import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IMG } from './assets';
import { audio } from './audio';
import { LevelManager } from './levelManager';
import { WORLDS } from './levels';
import { getT } from './i18n';
import { SaveData, SaveSystem } from './saveSystem';
import { PipMascot } from './ui';

/** Hi-res generated scenery reused across the 50 worlds (cycled by biome) */
const WORLD_BG_IMAGES = IMG.worldBackgrounds;

/** Winding trail geometry: 5 nodes per world laid out on a gentle S-curve */
const NODE_LAYOUT: Array<{ x: number; y: number }> = [
  { x: 50, y: 88 },
  { x: 22, y: 70 },
  { x: 66, y: 52 },
  { x: 30, y: 34 },
  { x: 58, y: 14 },
];

function buildTrailPath(): string {
  const pts = NODE_LAYOUT;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const midY = (p0.y + p1.y) / 2;
    d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
  }
  return d;
}

const TRAIL_PATH = buildTrailPath();

/** Small ambient decorations placed around the trail — purely visual */
const DECOR: Array<{ x: number; y: number; size: number; delay: number }> = [
  { x: 8, y: 92, size: 22, delay: 0 },
  { x: 90, y: 80, size: 18, delay: 0.6 },
  { x: 6, y: 58, size: 16, delay: 1.1 },
  { x: 92, y: 44, size: 20, delay: 0.3 },
  { x: 10, y: 22, size: 18, delay: 0.9 },
  { x: 88, y: 10, size: 22, delay: 1.4 },
];

const DECOR_ICONS: Record<number, string[]> = {
  0: ['🌼', '🌿', '🦋'],
  1: ['🐚', '🌊', '⛵'],
  2: ['🍬', '🍭', '🧁'],
  3: ['🍄', '🌲', '✨'],
  4: ['☁️', '⭐', '🌙'],
  5: ['🦕', '🌴', '🌋'],
  6: ['🚀', '🪐', '⭐'],
};

export const WorldMapView: React.FC<{
  save: SaveData;
  onSelectLevel: (levelNumber: number) => void;
  onBackHome: () => void;
  onChestClaimed?: () => void;
}> = ({ save, onSelectLevel, onBackHome, onChestClaimed }) => {
  const t = getT(save.settings.language);
  const currentWorldId = Math.max(1, Math.min(50, Math.ceil(save.currentLevel / 5)));
  const [selectedWorldId, setSelectedWorldId] = useState<number>(currentWorldId);
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);
  const [previewLevel, setPreviewLevel] = useState<number | null>(null);
  const tabStripRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const activeWorld = WORLDS.find((w) => w.id === selectedWorldId) || WORLDS[0];
  const [startLvl, endLvl] = activeWorld.levelRange;
  const levelsInWorld = useMemo(() => Array.from({ length: endLvl - startLvl + 1 }, (_, i) => startLvl + i), [startLvl, endLvl]);
  const worldStats = LevelManager.getWorldStars(activeWorld.id);
  const biome = (activeWorld.id - 1) % WORLD_BG_IMAGES.length;
  const isWorldUnlocked = save.unlockedWorlds.includes(activeWorld.id) || activeWorld.levelRange[0] <= save.currentLevel;
  const isDark = activeWorld.id === 7 || activeWorld.id === 14 || activeWorld.id === 20 || activeWorld.id === 24 || activeWorld.id === 31 || activeWorld.id === 44;

  const previewConfig = previewLevel ? LevelManager.getLevel(previewLevel, false) : null;
  const previewProgress = previewLevel ? save.completedLevels[previewLevel] : undefined;

  const goToWorld = (id: number) => {
    const clamped = Math.max(1, Math.min(50, id));
    if (clamped === selectedWorldId) return;
    setSlideDir(clamped > selectedWorldId ? 'left' : 'right');
    setSelectedWorldId(clamped);
  };

  // Keep the active tab centered in the horizontal strip
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const strip = tabStripRef.current;
      const activeTab = strip?.querySelector<HTMLElement>(`[data-world="${selectedWorldId}"]`);
      if (strip && activeTab) {
        const target = activeTab.offsetLeft - strip.clientWidth / 2 + activeTab.clientWidth / 2;
        strip.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [selectedWorldId]);

  // Reset the slide animation class after it plays
  useEffect(() => {
    if (!slideDir) return;
    const id = setTimeout(() => setSlideDir(null), 320);
    return () => clearTimeout(id);
  }, [slideDir, selectedWorldId]);

  // Progress along the trail: fraction of the 5 levels completed (for the golden path fill)
  const completedInWorld = levelsInWorld.filter((l) => Boolean(save.completedLevels[l])).length;
  const currentIdxInWorld = levelsInWorld.findIndex((l) => l === save.currentLevel);
  const trailProgress = Math.min(1, (currentIdxInWorld >= 0 ? currentIdxInWorld : completedInWorld >= 5 ? 5 : 0) / 4);

  const chestClaimable = SaveSystem.isWorldChestClaimable(activeWorld.id);
  const chestClaimed = (save.worldChestsClaimed || []).includes(activeWorld.id);
  const chestReward = Math.min(500, 60 + activeWorld.id * 8);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#1a2332] relative">
      {/* ===== Scenery backdrop ===== */}
      <div className="absolute inset-0">
        <img
          key={biome}
          src={WORLD_BG_IMAGES[biome]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover animate-bg-fade"
          draggable={false}
        />
        <div className={`absolute inset-0 bg-gradient-to-b ${activeWorld.skyGradient} opacity-55 mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" />
      </div>

      {/* ===== Header ===== */}
      <div className="relative z-20 safe-top px-3 pt-2.5 pb-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            onClick={() => {
              audio.playButtonClick();
              onBackHome();
            }}
            className="btn-tactile-cream px-3 py-1.5 rounded-2xl font-bold text-xs text-[#4A3525] flex items-center gap-1 shrink-0"
          >
            <span>◀</span> {t.home}
          </button>

          <div className="flex-1 min-w-0 bg-[#FFFDF9]/92 backdrop-blur-md border-2 border-[#DEC8A8] rounded-2xl px-3 py-1.5 shadow-md text-center">
            <div className="font-display text-sm font-bold text-[#3D2B1F] flex items-center justify-center gap-1.5 truncate">
              <span className="text-base">{activeWorld.icon}</span>
              <span className="truncate">{activeWorld.name}</span>
            </div>
            <div className="text-[10px] font-semibold text-[#8C6D4F] truncate">
              {t.world} {activeWorld.id} / 50 • {activeWorld.subtitle}
            </div>
          </div>

          <div className="bg-amber-100 border-2 border-amber-300 px-2.5 py-1.5 rounded-2xl flex items-center gap-1 font-mono-num text-xs font-bold text-amber-900 shrink-0 shadow-md">
            <span>⭐</span>
            <span>
              {worldStats.earned}/{worldStats.max}
            </span>
          </div>
        </div>

        {/* World strip */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              audio.playButtonClick();
              goToWorld(selectedWorldId - 1);
            }}
            disabled={selectedWorldId <= 1}
            className="w-8 h-8 rounded-xl bg-[#FFFDF9]/90 border-2 border-[#DEC8A8] disabled:opacity-40 font-bold text-xs flex items-center justify-center shrink-0 shadow"
          >
            ◀
          </button>

          <div ref={tabStripRef} className="flex gap-1.5 overflow-x-auto custom-scroll pb-1 flex-1 scroll-smooth">
            {WORLDS.map((w) => {
              const isSelected = w.id === selectedWorldId;
              const isUnlocked = save.unlockedWorlds.includes(w.id) || w.levelRange[0] <= save.currentLevel;
              const stats = LevelManager.getWorldStars(w.id);
              const perfect = stats.earned >= stats.max;
              return (
                <button
                  key={w.id}
                  data-world={w.id}
                  onClick={() => {
                    audio.playButtonClick();
                    goToWorld(w.id);
                  }}
                  className={`relative px-2.5 py-1.5 rounded-xl font-bold text-[11px] whitespace-nowrap flex items-center gap-1 transition-all shrink-0 border-2 ${
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-300 shadow-lg scale-105'
                      : isUnlocked
                      ? 'bg-[#FFFDF9]/90 text-[#5C4433] border-[#DEC8A8]'
                      : 'bg-slate-700/70 text-slate-300 border-slate-500/50'
                  }`}
                >
                  <span>{w.icon}</span>
                  <span>{w.id}</span>
                  {!isUnlocked && <span className="text-[9px]">🔒</span>}
                  {perfect && <span className="absolute -top-1.5 -right-1 text-[10px]">👑</span>}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              audio.playButtonClick();
              goToWorld(selectedWorldId + 1);
            }}
            disabled={selectedWorldId >= 50}
            className="w-8 h-8 rounded-xl bg-[#FFFDF9]/90 border-2 border-[#DEC8A8] disabled:opacity-40 font-bold text-xs flex items-center justify-center shrink-0 shadow"
          >
            ▶
          </button>
        </div>
      </div>

      {/* ===== Trail scene (swipe left/right to change world) ===== */}
      <div
        className="relative z-10 flex-1 min-h-0"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const sx = touchStartX.current;
          touchStartX.current = null;
          if (sx === null) return;
          const dx = (e.changedTouches[0]?.clientX ?? sx) - sx;
          if (Math.abs(dx) > 60) {
            audio.playButtonClick();
            goToWorld(selectedWorldId + (dx < 0 ? 1 : -1));
          }
        }}
      >
        <div
          key={selectedWorldId}
          className={`absolute inset-0 ${slideDir === 'left' ? 'animate-slide-in-left' : slideDir === 'right' ? 'animate-slide-in-right' : 'animate-pop'}`}
        >
          {/* Ambient floating decorations */}
          {DECOR.map((d, i) => (
            <span
              key={i}
              className="absolute pointer-events-none select-none drop-shadow"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                fontSize: d.size,
                animation: `floatSlow ${3 + (i % 3) * 0.6}s ease-in-out ${d.delay}s infinite`,
                opacity: 0.9,
              }}
            >
              {DECOR_ICONS[biome][i % 3]}
            </span>
          ))}

          {/* Winding trail path */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="trailGold" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#FDE68A" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
              <filter id="trailShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0.6" stdDeviation="0.8" floodColor="#000" floodOpacity="0.35" />
              </filter>
            </defs>
            {/* Base dirt path */}
            <path d={TRAIL_PATH} stroke="rgba(0,0,0,0.28)" strokeWidth="6.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path d={TRAIL_PATH} stroke="#D6B27A" strokeWidth="5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            {/* Dashed stones */}
            <path
              d={TRAIL_PATH}
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="1.2 3.2"
              vectorEffect="non-scaling-stroke"
            />
            {/* Golden progress overlay */}
            <path
              d={TRAIL_PATH}
              stroke="url(#trailGold)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${trailProgress} 1`}
              filter="url(#trailShadow)"
              vectorEffect="non-scaling-stroke"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>

          {/* Level nodes */}
          {levelsInWorld.map((lvl, idx) => {
            const pos = NODE_LAYOUT[idx];
            const progress = save.completedLevels[lvl];
            const isCompleted = Boolean(progress);
            const isCurrent = lvl === save.currentLevel;
            const isUnlocked = lvl <= save.currentLevel || isCompleted;
            const stars = progress?.stars || 0;

            return (
              <div
                key={lvl}
                className="absolute flex flex-col items-center"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {/* Pip stands next to the current node */}
                {isCurrent && (
                  <div className="absolute -left-[74px] -top-6 pointer-events-none animate-float z-20" style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.35))' }}>
                    <PipMascot size={72} mood="cheering" />
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!isUnlocked) {
                      audio.playBlockedTap();
                      return;
                    }
                    audio.playButtonClick();
                    setPreviewLevel(lvl);
                  }}
                  className={`relative w-[62px] h-[62px] rounded-full font-display text-xl font-bold flex items-center justify-center transition-transform active:scale-95 ${
                    isCurrent
                      ? 'text-white scale-110 z-10 node-current'
                      : isCompleted
                      ? 'text-white node-done'
                      : isUnlocked
                      ? 'text-white node-open'
                      : 'text-slate-400 node-locked'
                  }`}
                  style={
                    isCurrent
                      ? undefined
                      : isCompleted
                      ? { background: `radial-gradient(circle at 35% 30%, #86EFAC, ${activeWorld.accentColor} 60%, ${activeWorld.badgeColor})` }
                      : undefined
                  }
                >
                  {isCurrent && <span className="absolute inset-0 rounded-full animate-ping bg-amber-300/50" />}
                  <span className="relative">{isUnlocked ? lvl : '🔒'}</span>
                  {isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-sans font-extrabold uppercase tracking-wider shadow-md whitespace-nowrap">
                      {t.playBadge}
                    </span>
                  )}
                </button>

                {/* Stars */}
                <div className="mt-1.5 flex items-center gap-0.5 bg-black/35 backdrop-blur-xs px-2 py-0.5 rounded-full shadow">
                  {[1, 2, 3].map((s) => (
                    <span key={s} className={`text-[11px] leading-none ${s <= stars ? 'text-amber-300 drop-shadow' : 'text-white/30'}`}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Locked world overlay */}
          {!isWorldUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-slate-900/80 backdrop-blur-sm border-2 border-slate-500/50 rounded-3xl px-5 py-4 text-center shadow-2xl">
                <div className="text-4xl mb-1">🔒</div>
                <div className="font-display font-bold text-white text-sm">{activeWorld.name}</div>
                <div className="text-[11px] text-slate-300 font-semibold mt-0.5">
                  {t.world} {activeWorld.id - 1} →
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Bottom info card ===== */}
      <div className="relative z-20 safe-bottom px-3 pb-3 pt-1">
        <div className={`rounded-3xl border-3 shadow-2xl backdrop-blur-md overflow-hidden ${isDark ? 'bg-slate-900/85 border-slate-600/60 text-white' : 'bg-[#FFFDF9]/94 border-[#DEC8A8] text-[#3D2B1F]'}`}>
          <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
                {t.stages} {startLvl} – {endLvl}
              </div>
              <p className={`text-[11px] leading-snug mt-0.5 ${isDark ? 'text-slate-200' : 'text-[#6B513A]'}`}>{activeWorld.description}</p>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-mono-num font-bold text-sm">
                {completedInWorld}/5
              </div>
              <div className="w-16 h-1.5 bg-black/15 rounded-full overflow-hidden mt-1">
                <div className="h-full rounded-full transition-all" style={{ width: `${(completedInWorld / 5) * 100}%`, background: activeWorld.accentColor }} />
              </div>
            </div>
          </div>

          {/* Perfect World Chest */}
          <div
            className={`mx-3 mb-3 rounded-2xl border-2 px-3 py-2 flex items-center justify-between gap-2 ${
              chestClaimable
                ? 'bg-gradient-to-r from-amber-200 to-yellow-100 border-amber-500 shadow-md text-[#3D2B1F]'
                : chestClaimed
                ? isDark ? 'bg-emerald-900/40 border-emerald-500/50' : 'bg-emerald-50 border-emerald-300'
                : isDark ? 'bg-white/5 border-white/15' : 'bg-white/70 border-[#DEC8A8]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-xl ${chestClaimable ? 'animate-trophy' : ''}`}>{chestClaimed ? '📭' : '🎁'}</span>
              <div className="min-w-0">
                <div className="font-display font-bold text-[11px] truncate">{t.perfectWorld}</div>
                <div className={`text-[10px] font-semibold truncate ${isDark && !chestClaimable ? 'text-slate-300' : 'text-[#6B513A]'}`}>
                  {chestClaimed ? `✓ ${t.chestOpened}` : chestClaimable ? `🪙 +${chestReward}` : `${worldStats.earned}/15 ⭐`}
                </div>
              </div>
            </div>
            {chestClaimable && (
              <button
                onClick={() => {
                  const got = SaveSystem.claimWorldChest(activeWorld.id);
                  if (got) {
                    audio.playCoinReward();
                    onChestClaimed?.();
                  }
                }}
                className="btn-tactile-amber px-3 py-1.5 rounded-xl text-white font-bold text-[10px] shrink-0"
              >
                {t.openChest}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== Level preview card ===== */}
      {previewLevel !== null && previewConfig && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3" onClick={() => setPreviewLevel(null)}>
          <div className="w-full max-w-sm rounded-3xl bg-[#FFFDF9] border-4 border-[#DEC8A8] shadow-2xl overflow-hidden animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className={`bg-gradient-to-r ${activeWorld.skyGradient} px-5 py-4 flex items-center justify-between`}>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#3D2B1F]/70">
                  {activeWorld.icon} {activeWorld.name}
                </div>
                <h3 className="font-display text-2xl font-bold text-[#3D2B1F]">
                  {t.level} {previewLevel}
                </h3>
              </div>
              <div className="flex gap-0.5 text-2xl">
                {[1, 2, 3].map((s) => (
                  <span key={s} className={s <= (previewProgress?.stars || 0) ? 'text-amber-400 drop-shadow' : 'text-slate-300'}>
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#F7EFE0] border-2 border-[#E6D5B8] rounded-2xl py-2">
                  <div className="text-xl">🧩</div>
                  <div className="font-mono-num font-bold text-sm text-[#3D2B1F]">{previewConfig.totalTiles}</div>
                  <div className="text-[9px] font-bold uppercase text-[#8C6D4F]">{t.tilesLeft}</div>
                </div>
                <div className="bg-[#F7EFE0] border-2 border-[#E6D5B8] rounded-2xl py-2">
                  <div className="text-xl">🍎</div>
                  <div className="font-mono-num font-bold text-sm text-[#3D2B1F]">{previewConfig.distinctMotifs}</div>
                  <div className="text-[9px] font-bold uppercase text-[#8C6D4F]">{t.fruits}</div>
                </div>
                <div className="bg-[#F7EFE0] border-2 border-[#E6D5B8] rounded-2xl py-2">
                  <div className="text-xl">⏱️</div>
                  <div className="font-mono-num font-bold text-sm text-[#3D2B1F]">{previewConfig.parTimeSec}s</div>
                  <div className="text-[9px] font-bold uppercase text-[#8C6D4F]">{t.parTime}</div>
                </div>
              </div>

              {previewProgress && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl px-3 py-2 text-xs font-bold text-emerald-900 flex items-center justify-between">
                  <span>✓ {t.done}</span>
                  <span className="font-mono-num">🏁 {previewProgress.bestTimeSec}s</span>
                </div>
              )}

              <div className="text-[11px] text-[#6B513A] font-medium text-center">{previewConfig.patternName}</div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    audio.playButtonClick();
                    setPreviewLevel(null);
                  }}
                  className="btn-tactile-cream px-4 py-3 rounded-2xl font-bold text-xs text-[#5C4433]"
                >
                  ✕
                </button>
                <button
                  onClick={() => {
                    audio.playButtonClick();
                    const lvl = previewLevel;
                    setPreviewLevel(null);
                    onSelectLevel(lvl);
                  }}
                  className="flex-1 btn-tactile-green py-3 rounded-2xl font-display text-lg font-bold text-white"
                >
                  ▶ {t.play.split(' ')[0]}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
