import React, { useMemo, useState } from 'react';
import { audio } from './audio';
import {
  ACHIEVEMENT_TOTAL,
  AchievementRuntime,
  TIER_STYLES,
  buildAchievementList,
  claimAchievementReward,
  getAchievementById,
} from './achievements';
import { fmt, getT } from './i18n';
import { LanguageCode, SaveData, SaveSystem } from './saveSystem';

/**
 * Persistent achievement banner pinned to the top of the screen.
 * It NEVER auto-dismisses — the player must claim it or close it manually.
 */
export const AchievementBar: React.FC<{
  achievementIds: string[];
  lang?: LanguageCode;
  /** 'top' for menus, 'bottom' during gameplay so it never covers the tray dock */
  position?: 'top' | 'bottom';
  onDismiss: () => void;
  onOpenAchievements: () => void;
}> = ({ achievementIds, lang, position = 'top', onDismiss, onOpenAchievements }) => {
  const t = getT(lang);
  if (achievementIds.length === 0) return null;

  const isMultiple = achievementIds.length > 1;
  const first = getAchievementById(achievementIds[0]);
  const totalReward = achievementIds.reduce((sum, id) => sum + (getAchievementById(id)?.rewardCoins || 0), 0);

  return (
    <div className={`absolute left-0 right-0 z-40 px-2.5 ${position === 'bottom' ? 'bottom-[118px] pb-1' : 'top-0 pt-2.5'}`}>
      <div className="relative rounded-3xl border-3 border-amber-400 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shadow-xl overflow-hidden animate-pop">
        {/* Animated shimmer sweep */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.65) 48%, transparent 66%)',
            backgroundSize: '250% 100%',
            animation: 'shimmerSweep 2.6s linear infinite',
          }}
        />

        <div className="relative flex items-center gap-2.5 p-2.5 pr-10">
          {/* Trophy badge with gentle bounce */}
          <div className="w-11 h-11 rounded-2xl bg-white/90 border-2 border-amber-700/40 flex items-center justify-center text-2xl shrink-0 shadow-xs animate-trophy">
            {isMultiple ? '🎉' : first?.icon || '🏅'}
          </div>

          {/* Text block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono-num text-[9px] font-extrabold uppercase tracking-[0.16em] text-amber-950/80">
                {t.achievementUnlocked}
              </span>
              {!isMultiple && first && (
                <span
                  className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-white/80 ${TIER_STYLES[first.tier].text}`}
                >
                  {TIER_STYLES[first.tier].label}
                </span>
              )}
            </div>

            <div className="font-display font-bold text-[13px] leading-tight text-white drop-shadow-xs truncate">
              {isMultiple ? fmt(t.newAchievements, { n: achievementIds.length }) : first?.title || t.achievementUnlocked}
            </div>

            <div className="text-[10.5px] font-bold text-amber-950/85 leading-tight truncate">
              {isMultiple ? `${t.tapToView} 🪙 ${totalReward}` : `${t.reward}: 🪙 ${first?.rewardCoins}`}
            </div>
          </div>

          {/* View button */}
          <button
            onClick={() => {
              audio.playButtonClick();
              onOpenAchievements();
            }}
            className="shrink-0 bg-white/90 hover:bg-white text-amber-900 font-display font-bold text-[11px] px-3 py-2 rounded-xl shadow-xs active:translate-y-0.5 transition"
          >
            {t.view}
          </button>
        </div>

        {/* Manual close — banner persists until the player dismisses it */}
        <button
          onClick={() => {
            audio.playButtonClick();
            onDismiss();
          }}
          aria-label="Dismiss achievement notification"
          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-amber-950/25 hover:bg-amber-950/40 text-white font-bold text-xs flex items-center justify-center transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const CATEGORIES: Array<{ id: string; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: '🏅' },
  { id: 'levels', label: 'Levels', icon: '🥾' },
  { id: 'matching', label: 'Matching', icon: '🍎' },
  { id: 'fruit', label: 'Fruits', icon: '🍇' },
  { id: 'worlds', label: 'Worlds', icon: '🗺️' },
  { id: 'power', label: 'Power', icon: '⚡' },
  { id: 'daily', label: 'Daily', icon: '📅' },
  { id: 'collection', label: 'Stars', icon: '⭐' },
  { id: 'mastery', label: 'Mastery', icon: '👑' },
];

export const AchievementsModal: React.FC<{
  save: SaveData;
  onClose: () => void;
  onChanged: () => void;
}> = ({ save, onClose, onChanged }) => {
  const t = getT(save.settings.language);
  const [category, setCategory] = useState<string>('all');
  const [toast, setToast] = useState<string | null>(null);

  const all = useMemo<AchievementRuntime[]>(
    () => buildAchievementList(save),
    [save]
  );

  const filtered = category === 'all' ? all : all.filter((a) => a.category === category);
  const completedCount = all.filter((a) => a.completed).length;
  const claimedCount = all.filter((a) => a.claimed).length;
  const claimableCount = all.filter((a) => a.completed && !a.claimed).length;
  const totalCoinsFromAchievements = all.reduce((sum, a) => sum + a.rewardCoins, 0);

  const handleClaim = (achievement: AchievementRuntime) => {
    const result = claimAchievementReward(achievement.id);
    if (result) {
      audio.playAchievementUnlock();
      setToast(`🏆 ${result.title} — +${result.coins} Coins!`);
      setTimeout(() => setToast(null), 2600);
      SaveSystem.get();
      onChanged();
    }
  };

  const handleClaimAll = () => {
    let total = 0;
    let count = 0;
    all.forEach((a) => {
      if (a.completed && !a.claimed) {
        const res = claimAchievementReward(a.id);
        if (res) {
          total += res.coins;
          count++;
        }
      }
    });
    if (total > 0) {
      audio.playAchievementUnlock();
      setToast(`🎉 Claimed ${count} achievements for +${total} Coins!`);
      setTimeout(() => setToast(null), 2800);
      onChanged();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
      <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border-4 border-[#DEC8A8] shadow-2xl overflow-hidden animate-pop flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-4 flex items-start justify-between border-b-4 border-amber-700/30">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">🏅 {t.achievementsTitle}</h2>
            <p className="text-xs text-amber-100 font-semibold">
              {completedCount} / {ACHIEVEMENT_TOTAL} {t.unlocked} • 🪙 5 – 500
            </p>
            <p className="text-[10px] text-amber-100/80 font-semibold">
              {t.reward}: 🪙 {totalCoinsFromAchievements}
            </p>
            {/* Global progress bar */}
            <div className="mt-2 w-44 h-2 bg-black/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 rounded-full transition-all"
                style={{ width: `${(completedCount / ACHIEVEMENT_TOTAL) * 100}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => {
              audio.playButtonClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/25 text-white font-bold text-lg flex items-center justify-center shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Claim-all banner */}
        {claimableCount > 0 && (
          <button
            onClick={handleClaimAll}
            className="bg-gradient-to-r from-emerald-50 to-teal-100 border-b-2 border-emerald-300 px-4 py-2.5 flex items-center justify-between animate-pulse"
          >
            <span className="text-xs font-extrabold text-emerald-900">
              🎉 {fmt(t.readyToClaim, { n: claimableCount })}
            </span>
            <span className="btn-tactile-green px-3 py-1 rounded-xl text-white font-bold text-[11px]">
              {t.claimAll}
            </span>
          </button>
        )}

        {/* Category filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto custom-scroll px-3 py-2.5 bg-[#F3E5AB] border-b-2 border-[#DEC8A8]">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            const countInCat =
              cat.id === 'all'
                ? completedCount
                : all.filter((a) => a.category === cat.id && a.completed).length;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  audio.playButtonClick();
                  setCategory(cat.id);
                }}
                className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] whitespace-nowrap flex items-center gap-1 shrink-0 transition ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white/80 text-[#5C4433] border border-[#DEC8A8]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="opacity-70">{countInCat}</span>
              </button>
            );
          })}
        </div>

        {/* Achievements list */}
        <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-2.5">
          {toast && (
            <div className="bg-emerald-100 border-2 border-emerald-400 text-emerald-900 px-3.5 py-2 rounded-2xl text-xs font-bold text-center animate-pop">
              {toast}
            </div>
          )}

          {/* Summary strip */}
          <div className="bg-[#F7EFE0] border-2 border-[#E6D5B8] rounded-2xl p-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-display text-lg font-bold text-amber-700">{completedCount}</div>
              <div className="text-[10px] font-bold text-[#8C6D4F] uppercase">Unlocked</div>
            </div>
            <div className="border-x-2 border-[#E6D5B8]">
              <div className="font-display text-lg font-bold text-emerald-700">{claimedCount}</div>
              <div className="text-[10px] font-bold text-[#8C6D4F] uppercase">Claimed</div>
            </div>
            <div>
              <div className="font-display text-lg font-bold text-rose-600">{claimableCount}</div>
              <div className="text-[10px] font-bold text-[#8C6D4F] uppercase">Ready</div>
            </div>
          </div>

          {filtered.map((a) => {
            const tier = TIER_STYLES[a.tier];
            return (
              <div
                key={a.id}
                className={`rounded-2xl border-2 p-3 flex items-center gap-3 bg-gradient-to-r ${tier.bg} ${tier.ring} ${
                  a.claimed ? 'opacity-70' : ''
                }`}
              >
                {/* Icon badge */}
                <div
                  className={`w-12 h-12 rounded-2xl bg-white/80 border-2 ${tier.ring} flex items-center justify-center text-2xl shrink-0 ${
                    a.completed ? '' : 'grayscale-[60%]'
                  }`}
                >
                  {a.icon}
                </div>

                {/* Text & progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-bold text-sm text-[#3D2B1F] truncate">
                      {a.title}
                    </span>
                    <span
                      className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-white/70 ${tier.text} shrink-0`}
                    >
                      {tier.label}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#6B513A] leading-tight mt-0.5">
                    {a.description}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-black/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          a.completed
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                            : 'bg-gradient-to-r from-amber-400 to-orange-500'
                        }`}
                        style={{ width: `${a.progressPct}%` }}
                      />
                    </div>
                    <span className="font-mono-num text-[9.5px] font-bold text-[#8C6D4F] shrink-0">
                      {a.current}/{a.target}
                    </span>
                  </div>
                </div>

                {/* Claim button / reward label */}
                <div className="shrink-0">
                  {a.claimed ? (
                    <span className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1">
                      ✓ {t.done}
                    </span>
                  ) : a.completed ? (
                    <button
                      onClick={() => handleClaim(a)}
                      className="btn-tactile-amber px-3 py-2 rounded-xl text-white font-bold text-[10.5px] animate-pulse"
                    >
                      🪙 {a.rewardCoins}
                    </button>
                  ) : (
                    <span className="px-2.5 py-1.5 rounded-xl bg-white/60 text-[#8C6D4F] font-bold text-[10.5px]">
                      🪙 {a.rewardCoins}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-xs font-bold text-[#8C6D4F]">
              No achievements in this category yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
