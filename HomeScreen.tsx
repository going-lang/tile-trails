import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IMG } from './assets';
import { audio } from './audio';
import { ACHIEVEMENT_TOTAL } from './achievements';
import { LevelManager } from './levelManager';
import { WORLDS } from './levels';
import { getT } from './i18n';
import { SaveData } from './saveSystem';
import { TILE_MOTIFS } from './tile';
import { PipMascot, TileMotifPreview } from './ui';

export interface HomeScreenProps {
  save: SaveData;
  totalStars: number;
  completedAchievementCount: number;
  unclaimedAchievementCount: number;
  unclaimedTaskCount: number;
  canClaimLoginGift: boolean;
  todayCompleted: boolean;
  onStartLevel: () => void;
  onOpenModal: (m: 'settings' | 'daily' | 'tasks' | 'login' | 'collection' | 'shop' | 'achievements') => void;
  onGoMap: () => void;
}

/** Slow-drifting decorative fruit floating in the hero scene */
const FLOATERS: Array<{ motif: number; x: number; y: number; size: number; delay: number; spin: number }> = [
  { motif: 3, x: 6, y: 22, size: 52, delay: 0, spin: -14 },
  { motif: 12, x: 84, y: 16, size: 62, delay: 0.5, spin: 12 },
  { motif: 30, x: 12, y: 62, size: 44, delay: 1.1, spin: 9 },
  { motif: 41, x: 88, y: 54, size: 50, delay: 0.8, spin: -10 },
  { motif: 59, x: 4, y: 42, size: 38, delay: 1.5, spin: 16 },
  { motif: 15, x: 78, y: 74, size: 40, delay: 1.9, spin: -7 },
];

function useCountUp(target: number, ms = 800): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  save,
  totalStars,
  completedAchievementCount,
  unclaimedAchievementCount,
  unclaimedTaskCount,
  canClaimLoginGift,
  todayCompleted,
  onStartLevel,
  onOpenModal,
  onGoMap,
}) => {
  const t = getT(save.settings.language);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const currentWorld = LevelManager.getWorldForLevel(save.currentLevel);

  const stats = useMemo(
    () => [
      { icon: '⭐', label: t.stars, value: totalStars, max: 750, color: 'from-amber-300 to-amber-500' },
      { icon: '🥾', label: t.levels, value: Object.keys(save.completedLevels).length, max: 250, color: 'from-emerald-300 to-emerald-600' },
      { icon: '🍎', label: t.fruits, value: save.discoveredTiles.length, max: 60, color: 'from-rose-300 to-rose-500' },
      { icon: '🪙', label: t.coins, value: save.coins, max: null, color: 'from-amber-400 to-orange-500' },
    ],
    [save, totalStars, t]
  );

  const animatedStars = useCountUp(totalStars);
  const animatedLevels = useCountUp(Object.keys(save.completedLevels).length);
  const animatedFruits = useCountUp(save.discoveredTiles.length);
  const animatedCoins = useCountUp(save.coins, 700);
  const statValues = [animatedStars, animatedLevels, animatedFruits, animatedCoins];

  const nextWorldProgress = save.currentLevel > 250 ? 100 : (((save.currentLevel - 1) % 5) / 5) * 100;
  const featuredFruitIds = useMemo(() => {
    // Show a rotating sample that leans on fruits the player has actually discovered
    const discovered = save.discoveredTiles.slice(-8);
    return discovered.length >= 4 ? discovered.slice(0, 6) : [0, 3, 11, 15, 30, 49];
  }, [save.discoveredTiles]);



  return (
    <div
      ref={scrollerRef}
      className="flex-1 flex flex-col h-full overflow-y-auto custom-scroll relative animate-screen-fade"
      style={{
        backgroundColor: '#DCEBD3',
        // Soft orchard paper texture: faint dots + warm vignette so the feed never looks flat
        backgroundImage:
          'radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), radial-gradient(circle at 15% 20%, rgba(255,232,178,0.55), transparent 55%), radial-gradient(circle at 90% 80%, rgba(167,221,160,0.5), transparent 60%)',
        backgroundSize: '18px 18px, 100% 100%, 100% 100%',
      }}
    >
      {/* ================= HERO ORCHARD SCENE ================= */}
      <header className="relative overflow-hidden">
        {/* Sky + orchard photo (always fills the header exactly) */}
        <img
          src={IMG.banner}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        {/* Colour grade: warm daylight tint + soft fade into the page below */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#7cc4f0]/25 via-[#fde8b0]/15 to-[#DCEBD3]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-transparent to-[#DCEBD3]" />

        {/* Sun glow */}
        <div className="absolute top-10 right-8 w-36 h-36 rounded-full bg-amber-200/70 blur-2xl pointer-events-none" />

        {/* Parallax floating fruit */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {FLOATERS.map((f) => (
            <div
              key={f.motif}
              className="absolute"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                transform: `rotate(${f.spin}deg)`,
                animation: `floatSlow ${3.4 + (f.delay % 1.2)}s ease-in-out ${f.delay}s infinite`,
                opacity: 0.95,
              }}
            >
              <TileMotifPreview motifId={f.motif} theme={save.activeTileTheme} size={f.size} />
            </div>
          ))}
        </div>

        {/* Top resource bar */}
        <div className="relative z-10 px-3.5 pt-3 flex items-center justify-between gap-2 safe-top">
          <button
            onClick={() => {
              audio.playButtonClick();
              onOpenModal('shop');
            }}
            className="flex items-center gap-2 bg-[#FFFDF9]/92 backdrop-blur-md border-2 border-[#DEC8A8] rounded-full pl-2 pr-3 py-1.5 shadow-md active:scale-95 transition"
          >
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 border-2 border-amber-700/40 flex items-center justify-center text-[13px]">🪙</span>
            <span className="font-mono-num font-extrabold text-sm text-[#3D2B1F]">{save.coins}</span>
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">+</span>
          </button>

          <button
            onClick={() => {
              audio.playButtonClick();
              onGoMap();
            }}
            className="flex items-center gap-1.5 bg-[#FFFDF9]/92 backdrop-blur-md border-2 border-[#DEC8A8] rounded-full px-3 py-1.5 shadow-md active:scale-95 transition"
          >
            <span>⭐</span>
            <span className="font-mono-num font-extrabold text-sm text-[#3D2B1F]">{totalStars}</span>
            <span className="text-[10px] font-bold text-[#8C6D4F]">/ 750</span>
          </button>

          <button
            onClick={() => {
              audio.playButtonClick();
              onOpenModal('settings');
            }}
            aria-label={t.settings}
            className="btn-tactile-cream w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
          >
            ⚙️
          </button>
        </div>

        {/* Logo lockup */}
        <div className="relative z-10 text-center px-4 mt-1">
          <div className="inline-flex items-center gap-1.5 bg-white/75 backdrop-blur-xs px-3 py-0.5 rounded-full border border-amber-300 text-[9px] font-extrabold text-amber-900 uppercase tracking-[0.18em] mb-1.5 shadow-xs">
            <span>🌟</span> Wrld Studio
          </div>
          <h1
            className="font-display font-bold leading-[0.92] text-[44px] sm:text-[54px] text-[#2F4A22] tracking-tight"
            style={{ textShadow: '0 2px 0 rgba(255,255,255,0.95), 0 5px 12px rgba(47,74,34,0.30)' }}
          >
            TILE
            <br />
            <span className="text-[#C2410C]">TRAILS</span>
          </h1>
          <p className="inline-block mt-1.5 px-3 py-1 rounded-full bg-white/55 backdrop-blur-xs border border-white/50 text-[11px] font-bold text-[#3D4A32]">
            {t.tagline}
          </p>
        </div>

        {/* Pip on the signpost */}
        <div className="relative z-10 flex justify-center mt-1">
          <div className="relative animate-float">
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[128px] h-3 rounded-[50%] bg-black/18 blur-md" />
            <PipMascot size={132} mood="cheering" />
          </div>
        </div>
      </header>

      {/* ================= CONTINUE ADVENTURE SIGNPOST ================= */}
      <section className="relative z-20 px-4 -mt-7">
        {/* Wooden post */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2 w-5 h-8 rounded-b-lg bg-gradient-to-b from-[#A9743E] to-[#6B4226] shadow-md" />
        <div className="relative">
          {/* Plank shadow layer */}
          <div className="absolute inset-x-0 top-1.5 bottom-[-6px] rounded-[26px] bg-[#7A4E24]" />
          {/* Plank */}
          <div className="relative rounded-[26px] border-4 border-[#7A4E24] bg-gradient-to-b from-[#D9A25F] to-[#B57B3C] p-3.5 shadow-[inset_0_3px_0_rgba(255,255,255,0.32),inset_0_-4px_0_rgba(0,0,0,0.18)]">
            {/* wood grain */}
            <div className="absolute inset-0 rounded-[22px] overflow-hidden pointer-events-none opacity-30">
              {[18, 42, 66, 88].map((top) => (
                <div
                  key={top}
                  className="absolute left-4 right-4 h-[2px] rounded-full"
                  style={{ top: `${top}%`, background: 'rgba(90,55,25,0.5)' }}
                />
              ))}
            </div>

            <div className="relative flex items-center gap-3">
              {/* Progress medallion */}
              <div className="relative w-14 h-14 shrink-0">
                <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                  <circle cx="28" cy="28" r="23" stroke="rgba(90,55,25,0.35)" strokeWidth="6" fill="none" />
                  <circle
                    cx="28"
                    cy="28"
                    r="23"
                    stroke="#FFF1C2"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 23}
                    strokeDashoffset={2 * Math.PI * 23 * (1 - Math.min(100, nextWorldProgress) / 100)}
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 rounded-full bg-[#5B3719] border-2 border-[#7A4E24] flex items-center justify-center">
                  <span className="font-display font-bold text-base text-amber-100 leading-none">{save.currentLevel}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0 text-white">
                <div className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-amber-100/90">
                  {currentWorld.icon} {t.world} {currentWorld.id} / 50
                </div>
                <div className="font-display font-bold text-[15px] leading-tight truncate drop-shadow-sm">
                  {currentWorld.name}
                </div>
                <div className="text-[10px] font-semibold text-amber-100/85 truncate">{currentWorld.subtitle}</div>
              </div>
            </div>

            {/* The big action button */}
            <button
              onClick={() => {
                audio.playButtonClick();
                onStartLevel();
              }}
              className="w-full mt-3 relative rounded-2xl overflow-hidden btn-tactile-green shine-sweep py-3.5 px-4 flex items-center justify-center gap-2.5 shadow-lg"
            >
              <span className="w-9 h-9 rounded-full bg-white/22 border-2 border-white/45 flex items-center justify-center text-white text-base">▶</span>
              <span className="font-display font-bold text-[19px] text-white tracking-wide drop-shadow-sm">
                {t.play} {save.currentLevel}
              </span>
            </button>

            {/* Chips row */}
            <div className="relative flex items-center justify-center gap-1.5 mt-2.5">
              <span className="px-2.5 py-1 rounded-full bg-[#5B3719]/45 border border-white/25 text-[9px] font-bold text-amber-50">
                🍎 {save.discoveredTiles.length}/60
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#5B3719]/45 border border-white/25 text-[9px] font-bold text-amber-50">
                ⭐ {totalStars}/750
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#5B3719]/45 border border-white/25 text-[9px] font-bold text-amber-50">
                🏆 {completedAchievementCount}/{ACHIEVEMENT_TOTAL}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= QUICK ACTIONS ================= */}
      <section className="px-4 pt-5">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="font-display font-bold text-[15px] text-[#3D4A32]">{t.quickActions}</h2>
          <button
            onClick={() => {
              audio.playButtonClick();
              onGoMap();
            }}
            className="text-[11px] font-extrabold text-emerald-700 hover:underline"
          >
            {t.seeAll} ▶
          </button>
        </div>

        {/* Asymmetric grid: one wide hero + two stacked */}
        <div className="flex gap-2.5">
          {/* Wide: Daily Trail */}
          <button
            onClick={() => {
              audio.playButtonClick();
              onOpenModal('daily');
            }}
            className="flex-1 min-w-0 relative rounded-3xl overflow-hidden border-2 border-emerald-800/25 shadow-md text-left active:scale-[0.98] transition"
            style={{ background: 'linear-gradient(150deg, #34D399 0%, #059669 62%, #047857 100%)' }}
          >
            <div className="absolute -right-5 -bottom-5 w-24 h-24 rounded-full bg-white/12" />
            <div className="absolute -right-2 -top-3 w-16 h-16 rounded-full bg-white/10" />
            <div className="relative p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-emerald-50/90">
                    {todayCompleted ? `✓ ${t.done}` : t.today}
                  </div>
                  <div className="font-display font-bold text-white text-[17px] leading-tight drop-shadow-sm mt-0.5">
                    {t.dailyChallenge}
                  </div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-50/95 mt-1 px-1.5 py-0.5 rounded-full bg-black/15 border border-white/20">
                    🪙 +{todayCompleted ? 5 : 100}
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/22 border-2 border-white/35 flex items-center justify-center text-xl shrink-0">
                  📅
                </div>
              </div>
            </div>
            {!todayCompleted && (
              <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Stacked narrow actions */}
          <div className="w-[112px] shrink-0 flex flex-col gap-2.5">
            <button
              onClick={() => {
                audio.playButtonClick();
                onOpenModal('tasks');
              }}
              className="relative rounded-3xl border-2 border-amber-600/25 shadow-md py-2.5 px-2.5 text-left active:scale-[0.98] transition"
              style={{ background: 'linear-gradient(150deg, #FBBF24 0%, #D97706 100%)' }}
            >
              <div className="text-lg leading-none">📋</div>
              <div className="font-display font-bold text-white text-[12px] leading-tight drop-shadow-sm mt-1">
                {t.dailyTasks}
              </div>
              <div className="text-[9px] font-semibold text-amber-50/90">{t.missionsCoins}</div>
              {unclaimedTaskCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white">
                  {unclaimedTaskCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                audio.playButtonClick();
                onOpenModal('login');
              }}
              className="relative rounded-3xl border-2 border-rose-600/25 shadow-md py-2.5 px-2.5 text-left active:scale-[0.98] transition"
              style={{ background: 'linear-gradient(150deg, #F472B6 0%, #BE185D 100%)' }}
            >
              <div className="text-lg leading-none">🎁</div>
              <div className="font-display font-bold text-white text-[12px] leading-tight drop-shadow-sm mt-1">
                {t.loginRewards}
              </div>
              <div className="text-[9px] font-semibold text-rose-50/90">{t.freeDailyRewards}</div>
              {canClaimLoginGift && (
                <span className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-amber-300 ring-2 ring-white animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* Achievements banner */}
        <button
          onClick={() => {
            audio.playButtonClick();
            onOpenModal('achievements');
          }}
          className="w-full mt-2.5 rounded-3xl border-3 border-amber-500/40 shadow-md p-3 flex items-center gap-3 active:scale-[0.99] transition text-left"
          style={{ background: 'linear-gradient(115deg, #FEF3C7 0%, #FDE68A 45%, #FCD34D 100%)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-amber-700/35 flex items-center justify-center text-2xl shrink-0 shadow-xs">
            🏅
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-[13px] text-[#3D2B1F] truncate">{t.achievements}</div>
            <div className="text-[10px] font-bold text-[#8C6D4F] truncate">
              {completedAchievementCount} / {ACHIEVEMENT_TOTAL} {t.unlocked}
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-black/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                style={{ width: `${(completedAchievementCount / ACHIEVEMENT_TOTAL) * 100}%` }}
              />
            </div>
          </div>
          {unclaimedAchievementCount > 0 ? (
            <span className="shrink-0 btn-tactile-green px-3 py-1.5 rounded-xl text-white font-bold text-[11px]">
              {unclaimedAchievementCount} {t.ready}
            </span>
          ) : (
            <span className="shrink-0 text-amber-800/60 text-xl">▶</span>
          )}
        </button>
      </section>

      {/* ================= STATS STRIP ================= */}
      <section className="px-4 pt-5">
        <div className="grid grid-cols-4 gap-2">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="rounded-2xl bg-[#FFFDF9]/92 border-2 border-[#DEC8A8]/70 shadow-xs p-2 flex flex-col items-center"
            >
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-base shadow-xs`}>
                {s.icon}
              </div>
              <div className="font-mono-num font-extrabold text-[13px] text-[#3D2B1F] mt-1 leading-none">
                {statValues[i]}
              </div>
              <div className="text-[8px] font-bold uppercase tracking-wider text-[#8C6D4F] mt-0.5 text-center leading-tight">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= WORLD JOURNEY ================= */}
      <section className="pt-5">
        <div className="px-4 flex items-center justify-between mb-2.5">
          <h2 className="font-display font-bold text-[15px] text-[#3D4A32]">{t.yourJourney}</h2>
          <button
            onClick={() => {
              audio.playButtonClick();
              onGoMap();
            }}
            className="text-[11px] font-extrabold text-emerald-700 hover:underline"
          >
            {t.worldMap} ▶
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto custom-scroll px-4 pb-2">
          {WORLDS.map((w) => {
            const statsW = LevelManager.getWorldStars(w.id);
            const isUnlocked = save.unlockedWorlds.includes(w.id) || w.levelRange[0] <= save.currentLevel;
            const isCurrent = w.id === currentWorld.id;
            const pct = Math.round((statsW.earned / Math.max(1, statsW.max)) * 100);
            return (
              <button
                key={w.id}
                onClick={() => {
                  audio.playButtonClick();
                  onGoMap();
                }}
                className={`shrink-0 w-[112px] rounded-2xl overflow-hidden border-2 shadow-sm active:scale-[0.97] transition ${
                  isCurrent ? 'border-amber-500 shadow-lg scale-[1.03]' : 'border-[#DEC8A8]/70'
                } ${isUnlocked ? '' : 'opacity-55 grayscale'}`}
              >
                <div
                  className="h-14 relative flex items-center justify-center"
                  style={{ background: `linear-gradient(140deg, ${w.accentColor}cc, ${w.badgeColor})` }}
                >
                  <span className="text-2xl drop-shadow">{w.icon}</span>
                  {isCurrent && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-white/85 text-[8px] font-extrabold text-[#3D2B1F]">
                      ▶
                    </span>
                  )}
                </div>
                <div className="bg-[#FFFDF9] px-2 py-1.5">
                  <div className="font-display font-bold text-[10px] text-[#3D2B1F] truncate">{w.name}</div>
                  <div className="mt-1 h-1 rounded-full bg-black/10 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[8px] font-bold text-[#8C6D4F] mt-0.5">
                    {statsW.earned}/{statsW.max} ⭐
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ================= FEATURED FRUIT GROVE ================= */}
      <section className="px-4 pt-4">
        <div className="rounded-3xl bg-[#FFFDF9]/92 border-2 border-[#DEC8A8]/70 shadow-xs p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-300 to-rose-500 flex items-center justify-center text-base shadow-xs">🍓</span>
              <div>
                <div className="font-display font-bold text-[13px] text-[#3D2B1F] leading-tight">{t.myFruitGrove}</div>
                <div className="text-[10px] font-semibold text-[#8C6D4F]">
                  {save.discoveredTiles.length} / 60 {t.discovered}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                audio.playButtonClick();
                onOpenModal('collection');
              }}
              className="text-[11px] font-extrabold text-purple-700 hover:underline"
            >
              {t.seeAll} ▶
            </button>
          </div>

          {/* Discovery progress */}
          <div className="flex items-center gap-2 mb-2.5">
            <div className="flex-1 h-2 rounded-full bg-[#E6D5B8]/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${Math.round((save.discoveredTiles.length / 60) * 100)}%` }}
              />
            </div>
            <span className="font-mono-num text-[10px] font-extrabold text-[#8C6D4F]">
              {Math.round((save.discoveredTiles.length / 60) * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {featuredFruitIds.slice(0, 6).map((id) => {
              const motif = TILE_MOTIFS[id] ?? TILE_MOTIFS[0];
              return (
                <button
                  key={id}
                  onClick={() => {
                    audio.playButtonClick();
                    onOpenModal('collection');
                  }}
                  className="rounded-2xl bg-gradient-to-b from-[#FFFDF9] to-[#F3EAD6] border border-[#E6D5B8] p-2 flex flex-col items-center active:scale-[0.96] transition"
                >
                  <TileMotifPreview motifId={id} theme={save.activeTileTheme} size={44} colorFriendly={save.settings.colorFriendly} />
                  <span className="font-display text-[9px] font-bold text-[#3D2B1F] truncate w-full text-center mt-1">
                    {motif.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= PROMO / SHOP ================= */}
      <section className="px-4 pt-4">
        <div className="relative rounded-3xl overflow-hidden border-3 border-[#DEC8A8] shadow-md">
          <img src={IMG.banner} alt="" className="w-full h-24 object-cover" draggable={false} loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/45 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-between px-4 gap-3">
            <div className="text-white">
              <div className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-amber-200">
                {t.shopTitle}
              </div>
              <div className="font-display font-bold text-[15px] leading-tight drop-shadow-sm">
                {t.shopSubtitle}
              </div>
              <div className="text-[10px] font-semibold text-white/85 mt-0.5">
                🪙 500 – 5,000 • {t.free} LV 1–5
              </div>
            </div>
            <button
              onClick={() => {
                audio.playButtonClick();
                onOpenModal('shop');
              }}
              className="btn-tactile-amber shrink-0 px-4 py-2.5 rounded-2xl font-display font-bold text-[13px] text-white"
            >
              🏪 {t.shop}
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="px-4 py-5 text-center safe-bottom">
        <div className="inline-flex items-center gap-1.5 bg-white/70 border border-[#DEC8A8] rounded-full px-3.5 py-1.5">
          <span className="text-sm">🌟</span>
          <span className="text-[10px] font-extrabold tracking-wider text-[#5C4433]">
            Wrld Studio • Tile Trails v2.0
          </span>
        </div>
        <div className="text-[10px] font-semibold text-[#8C6D4F] mt-1.5">{t.footer}</div>
      </footer>
    </div>
  );
};

export default HomeScreen;
