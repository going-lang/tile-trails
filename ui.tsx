import React, { useEffect, useRef, useState } from 'react';
import { audio } from './audio';
import { fmt, getT, LANGUAGE_NAMES } from './i18n';
import { PowerUpType } from './powerups';
import {
  getTodayDateString,
  LanguageCode,
  SaveData,
  SaveSystem,
  TileThemeId,
} from './saveSystem';
import { getTileTexture } from './tile';

export const PipMascot: React.FC<{
  size?: number;
  mood?: 'happy' | 'cheering' | 'thinking';
  className?: string;
}> = ({ size = 120, mood = 'happy', className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Tail */}
      <g transform="translate(98, 92)">
        <path d="M0 24 C28 32, 52 12, 46 -8 C40 -24, 18 -14, 4 8 Z" fill="#EA580C" stroke="#431407" strokeWidth="4.5" />
        <path d="M18 18 C24 8, 32 4, 38 8" stroke="#FDE68A" strokeWidth="6" strokeLinecap="round" />
        <path d="M28 8 C34 -2, 40 -4, 44 0" stroke="#7C2D12" strokeWidth="6" strokeLinecap="round" />
      </g>
      {/* Body */}
      <ellipse cx="76" cy="118" rx="32" ry="26" fill="#EA580C" stroke="#431407" strokeWidth="4.5" />
      <ellipse cx="76" cy="122" rx="19" ry="16" fill="#FFFBEB" />
      {/* Scarf */}
      <path d="M48 98 Q76 112 104 98 L100 110 Q76 120 52 110 Z" fill="#10B981" stroke="#431407" strokeWidth="4" />
      <path d="M88 105 L96 130 L82 128 L80 106 Z" fill="#34D399" stroke="#431407" strokeWidth="3.8" />
      {/* Paws */}
      <circle cx="48" cy="116" r="10" fill="#7C2D12" stroke="#431407" strokeWidth="4" />
      <circle cx="104" cy={mood === 'cheering' ? '96' : '116'} r="10" fill="#7C2D12" stroke="#431407" strokeWidth="4" />
      {/* Ears */}
      <circle cx="40" cy="48" r="18" fill="#EA580C" stroke="#431407" strokeWidth="4.5" />
      <circle cx="40" cy="48" r="10" fill="#FFFBEB" />
      <circle cx="112" cy="48" r="18" fill="#EA580C" stroke="#431407" strokeWidth="4.5" />
      <circle cx="112" cy="48" r="10" fill="#FFFBEB" />
      {/* Head */}
      <ellipse cx="76" cy="70" rx="44" ry="36" fill="#F97316" stroke="#431407" strokeWidth="4.5" />
      <ellipse cx="52" cy="78" rx="15" ry="12" fill="#FFFBEB" />
      <ellipse cx="100" cy="78" rx="15" ry="12" fill="#FFFBEB" />
      <ellipse cx="76" cy="82" rx="17" ry="13" fill="#FFFBEB" />
      <ellipse cx="62" cy="56" rx="6" ry="4" fill="#FFFBEB" />
      <ellipse cx="90" cy="56" rx="6" ry="4" fill="#FFFBEB" />
      <circle cx="46" cy="80" r="6" fill="#FB7185" opacity="0.65" />
      <circle cx="106" cy="80" r="6" fill="#FB7185" opacity="0.65" />
      {mood === 'cheering' ? (
        <>
          <path d="M54 68 Q60 60 66 68" stroke="#431407" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M86 68 Q92 60 98 68" stroke="#431407" strokeWidth="4.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="60" cy="68" r="6" fill="#431407" />
          <circle cx="58" cy="66" r="2.2" fill="#FFFFFF" />
          <circle cx="92" cy="68" r="6" fill="#431407" />
          <circle cx="90" cy="66" r="2.2" fill="#FFFFFF" />
        </>
      )}
      <ellipse cx="76" cy="75" rx="6.5" ry="4.8" fill="#431407" />
      <path d="M69 83 Q76 90 83 83" stroke="#431407" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* Fixed explorer hat - Pip's signature look */}
      <g transform="translate(0, -4)">
        <ellipse cx="76" cy="38" rx="38" ry="9" fill="#FBBF24" stroke="#431407" strokeWidth="4" />
        <path d="M50 38 C50 16, 102 16, 102 38 Z" fill="#F59E0B" stroke="#431407" strokeWidth="4" />
        <rect x="68" y="25" width="16" height="9" rx="3" fill="#34D399" stroke="#431407" strokeWidth="3" />
      </g>
    </svg>
  );
};

export const PowerUpIcon: React.FC<{ type: PowerUpType; size?: number }> = ({ type, size = 28 }) => {
  switch (type) {
    case 'undo':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <path d="M15 10L7 18L15 26" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 18H22C26.4183 18 30 21.5817 30 26" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'shuffle':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <path d="M7 12H14L22 24H29M29 12H22L14 24H7" stroke="#FFFFFF" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M25 8L30 12L25 16" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M25 20L30 24L25 28" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case 'hint':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <path d="M18 6C12.5 6 8.5 10.2 8.5 15.2C8.5 18.6 10.6 21.5 13.5 23V26C13.5 27.1 14.4 28 15.5 28H20.5C21.6 28 22.5 27.1 22.5 26V23C25.4 21.5 27.5 18.6 27.5 15.2C27.5 10.2 23.5 6 18 6Z" fill="#FEF08A" stroke="#FFFFFF" strokeWidth="3" />
          <line x1="15" y1="32" x2="21" y2="32" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case 'extraSlot':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <rect x="6" y="10" width="24" height="18" rx="5" fill="rgba(255,255,255,0.2)" stroke="#FFFFFF" strokeWidth="3.5" />
          <path d="M18 14V24M13 19H23" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
  }
};

export const TileMotifPreview: React.FC<{
  motifId: number;
  theme?: TileThemeId;
  size?: number;
  colorFriendly?: boolean;
}> = ({ motifId, theme = 'classic', size = 68, colorFriendly = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const tex = getTileTexture(motifId, theme, colorFriendly, false);
    const img = tex.image as HTMLCanvasElement;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, [motifId, theme, colorFriendly]);

  return <canvas ref={canvasRef} width={128} height={128} style={{ width: size, height: size }} className="drop-shadow-xs" />;
};

export const SettingsModal: React.FC<{
  save: SaveData;
  onClose: () => void;
  onSettingsChanged: () => void;
  onOpenAchievements?: () => void;
  onReplayTutorial?: () => void;
}> = ({ save, onClose, onSettingsChanged, onOpenAchievements, onReplayTutorial }) => {
  const t = getT(save.settings.language);
  const [importText, setImportText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showRestoreBox, setShowRestoreBox] = useState(false);
  const [showAboutBox, setShowAboutBox] = useState(false);

  const toggleSetting = (key: keyof SaveData['settings']) => {
    audio.playButtonClick();
    SaveSystem.save((draft) => {
      if (key === 'music') draft.settings.music = !draft.settings.music;
      else if (key === 'sound') draft.settings.sound = !draft.settings.sound;
      else if (key === 'vibration') draft.settings.vibration = !draft.settings.vibration;
      else if (key === 'notifications') draft.settings.notifications = !draft.settings.notifications;
      else if (key === 'colorFriendly') draft.settings.colorFriendly = !draft.settings.colorFriendly;
    });
    if (key === 'music') audio.syncMusicState();
    if (key === 'sound' || key === 'vibration') audio.playButtonClick();
    onSettingsChanged();
  };

  const setLanguage = (lang: LanguageCode) => {
    audio.playButtonClick();
    SaveSystem.save((draft) => {
      draft.settings.language = lang;
    });
    onSettingsChanged();
  };

  const handleSaveProgress = () => {
    audio.playButtonClick();
    SaveSystem.flush();
    const json = SaveSystem.exportSaveJSON();
    // Clipboard can be unavailable or throw synchronously inside some WebViews
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(json).catch(() => {});
      }
    } catch {
      /* clipboard unsupported — the save is still persisted locally */
    }
    setStatusMessage(t.progressSaved);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleRestoreProgress = () => {
    audio.playButtonClick();
    if (!importText.trim()) {
      setStatusMessage(t.pasteFirst);
      return;
    }
    const ok = SaveSystem.importSaveJSON(importText.trim());
    if (ok) {
      setStatusMessage(t.progressRestored);
      setShowRestoreBox(false);
      onSettingsChanged();
    } else {
      setStatusMessage(t.invalidCode);
    }
  };

  const toggles: Array<{ key: keyof SaveData['settings']; label: string; icon: string; value: boolean }> = [
    { key: 'music', label: t.music, icon: '🎵', value: save.settings.music },
    { key: 'sound', label: t.sound, icon: '🔊', value: save.settings.sound },
    { key: 'vibration', label: t.vibration, icon: '📳', value: save.settings.vibration },
    { key: 'notifications', label: t.notifications, icon: '🔔', value: save.settings.notifications },
    { key: 'colorFriendly', label: t.colorFriendly, icon: '👁️', value: save.settings.colorFriendly },
  ];

  const stats = [
    { label: t.levels, value: save.stats.levelsCompleted, icon: '🥾' },
    { label: t.stars, value: save.stats.totalStars, icon: '⭐' },
    { label: t.matches, value: save.stats.totalMatches, icon: '🍎' },
    { label: t.bestCombo, value: `${save.stats.maxCombo}x`, icon: '🔥' },
    { label: t.fruits, value: `${save.stats.fruitsDiscovered}/60`, icon: '🍇' },
    { label: t.worlds, value: `${save.stats.worldsUnlocked}/50`, icon: '🗺️' },
    { label: t.powerUps, value: save.stats.powerupsUsed, icon: '⚡' },
    { label: t.dailyTrails, value: save.stats.dailyChallengesCompleted, icon: '📅' },
    { label: t.coinsEarned, value: save.stats.totalCoinsEarned, icon: '🪙' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border-4 border-[#DEC8A8] shadow-2xl overflow-hidden animate-pop flex flex-col max-h-[88vh]">
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-4 flex items-center justify-between border-b-4 border-amber-600/30">
          <h2 className="font-display text-2xl font-bold text-white drop-shadow-xs">⚙️ {t.gameSettings}</h2>
          <button
            onClick={() => {
              audio.playButtonClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/25 hover:bg-white/40 text-white font-bold text-lg flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto custom-scroll space-y-4 text-[#3D2B1F]">
          {statusMessage && (
            <div className="rounded-2xl bg-emerald-100 border-2 border-emerald-400 px-3.5 py-2 text-xs font-bold text-emerald-900 text-center">
              {statusMessage}
            </div>
          )}

          <div className="space-y-2.5">
            {toggles.map((item) => (
              <div key={item.key} className="flex items-center justify-between bg-[#F7EFE0] px-4 py-3 rounded-2xl border-2 border-[#E6D5B8]">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-bold text-sm">{item.label}</span>
                </div>
                <button
                  onClick={() => toggleSetting(item.key)}
                  className={`w-16 h-8 rounded-full p-1 transition-colors flex items-center ${
                    item.value ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-[10px] font-extrabold text-slate-700">
                    {item.value ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            ))}
          </div>

          {/* Language */}
          <div className="bg-[#F7EFE0] p-3.5 rounded-2xl border-2 border-[#E6D5B8]">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8C6D4F] mb-2">🌍 {t.language}</div>
            <div className="grid grid-cols-5 gap-1.5">
              {(['EN', 'ES', 'FR', 'DE', 'JP'] as LanguageCode[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`py-2 rounded-xl font-bold text-xs transition flex flex-col items-center ${
                    save.settings.language === lang ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-[#5C4433] border border-[#E6D5B8]'
                  }`}
                >
                  <span>{lang}</span>
                  <span className="text-[9px] font-semibold opacity-80">{LANGUAGE_NAMES[lang]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={handleSaveProgress} className="btn-tactile-green py-3 px-3 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-1.5">
              <span>💾</span> {t.saveProgress}
            </button>
            <button
              onClick={() => {
                audio.playButtonClick();
                setShowRestoreBox(!showRestoreBox);
              }}
              className="btn-tactile-blue py-3 px-3 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <span>📥</span> {t.restoreProgress}
            </button>
          </div>

          {showRestoreBox && (
            <div className="bg-[#F7EFE0] p-3 rounded-2xl border-2 border-[#E6D5B8] space-y-2">
              <p className="text-xs text-[#6B513A] font-medium">{t.pasteHint}</p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={3}
                placeholder='{"version":3,"currentLevel":...'
                className="w-full rounded-xl bg-white p-2 text-xs font-mono border border-[#D8C39E] focus:outline-none"
              />
              <div className="flex gap-2">
                <button onClick={handleRestoreProgress} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                  {t.applyBackup}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(t.resetConfirm)) {
                      SaveSystem.resetProgress();
                      onSettingsChanged();
                      setStatusMessage(t.progressReset);
                    }
                  }}
                  className="py-2 px-3 rounded-xl bg-rose-100 text-rose-700 font-bold text-xs border border-rose-300"
                >
                  {t.resetData}
                </button>
              </div>
            </div>
          )}

          {/* Lifetime stats */}
          <div className="bg-[#F7EFE0] p-3.5 rounded-2xl border-2 border-[#E6D5B8]">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8C6D4F] mb-2">📊 {t.lifetimeStats}</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white/70 rounded-xl py-1.5 px-1">
                  <div className="text-sm">{stat.icon}</div>
                  <div className="font-mono-num font-bold text-xs text-[#3D2B1F]">{stat.value}</div>
                  <div className="text-[9px] font-bold text-[#8C6D4F] uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {onOpenAchievements && (
            <button
              onClick={() => {
                audio.playButtonClick();
                onOpenAchievements();
              }}
              className="w-full bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-400 py-3 rounded-2xl font-bold text-sm text-amber-900 flex items-center justify-center gap-2"
            >
              🏅 {t.viewAchievements}
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            {onReplayTutorial && (
              <button
                onClick={() => {
                  audio.playButtonClick();
                  onReplayTutorial();
                }}
                className="btn-tactile-cream py-2.5 rounded-2xl font-bold text-xs text-[#5C4433]"
              >
                🎓 {t.replayTutorial}
              </button>
            )}
            <button
              onClick={() => {
                audio.playButtonClick();
                setShowAboutBox(!showAboutBox);
              }}
              className={`btn-tactile-cream py-2.5 rounded-2xl font-bold text-xs text-[#5C4433] ${onReplayTutorial ? '' : 'col-span-2'}`}
            >
              ℹ️ {t.about}
            </button>
          </div>

          {showAboutBox && (
            <div className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-3.5 text-xs space-y-1 text-[#5C4433]">
              <div className="font-display font-bold text-sm text-amber-900">{t.aboutTitle}</div>
              <p>{t.aboutBody}</p>
              <p className="font-semibold text-emerald-700">{t.aboutFooter}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DailyChallengeModal: React.FC<{
  save: SaveData;
  onClose: () => void;
  onStartDaily: () => void;
}> = ({ save, onClose, onStartDaily }) => {
  const t = getT(save.settings.language);
  const today = getTodayDateString();
  const completedToday = save.dailyChallenge.lastCompletedDate === today;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border-4 border-[#DEC8A8] shadow-2xl overflow-hidden animate-pop">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">📅 {t.dailyChallengeTitle}</h2>
            <p className="text-xs font-semibold text-emerald-50">{today}</p>
          </div>
          <button
            onClick={() => {
              audio.playButtonClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/25 text-white font-bold text-lg flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-5 text-center space-y-4">
          <div className="flex justify-center">
            <PipMascot size={110} mood={completedToday ? 'cheering' : 'happy'} />
          </div>

          <div className="bg-[#F7EFE0] rounded-2xl p-4 border-2 border-[#E6D5B8] space-y-2">
            <div className="flex items-center justify-around">
              <div>
                <div className="text-xs font-bold text-[#8C6D4F] uppercase">{t.currentStreak}</div>
                <div className="font-display text-2xl font-bold text-amber-600">
                  🔥 {save.dailyChallenge.streak} {t.days}
                </div>
              </div>
              <div className="h-10 w-0.5 bg-[#E6D5B8]" />
              <div>
                <div className="text-xs font-bold text-[#8C6D4F] uppercase">{t.completionBonus}</div>
                <div className="font-display text-2xl font-bold text-emerald-600">🪙 +{completedToday ? 5 : Math.min(500, 100 + (save.dailyChallenge.streak + 1) * 50)}</div>
              </div>
            </div>
            <p className="text-xs text-[#6B513A] font-medium pt-1">{completedToday ? t.dailyDescDone : t.dailyDescNew}</p>
          </div>

          <button
            onClick={() => {
              audio.playButtonClick();
              onStartDaily();
            }}
            className="w-full btn-tactile-green py-4 rounded-2xl font-display text-xl font-bold text-white tracking-wide"
          >
            {completedToday ? `${t.playAgain} (+5 🪙)` : t.startDaily}
          </button>
        </div>
      </div>
    </div>
  );
};

export const DailyTasksModal: React.FC<{
  save: SaveData;
  onClose: () => void;
  onClaimReward: () => void;
}> = ({ save, onClose, onClaimReward }) => {
  const t = getT(save.settings.language);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleClaim = (taskId: string) => {
    audio.playCoinReward();
    const result = SaveSystem.claimTaskReward(taskId);
    if (result) {
      setToastMsg(`🎁 +${result.coins} 🪙`);
      setTimeout(() => setToastMsg(null), 2500);
      onClaimReward();
    }
  };

  const handleClaimAllBonus = () => {
    audio.playCoinReward();
    const bonus = SaveSystem.claimAllTasksBonus();
    if (bonus) {
      setToastMsg(`🌟 ${t.masterChest}: +${bonus} 🪙`);
      setTimeout(() => setToastMsg(null), 2500);
      onClaimReward();
    }
  };

  const allCompleted = save.dailyTasks.tasks.every((task) => task.completed);
  const completedCount = save.dailyTasks.tasks.filter((task) => task.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border-4 border-[#DEC8A8] shadow-2xl overflow-hidden animate-pop flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-5 py-4 flex items-center justify-between border-b-4 border-emerald-700/30">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">📋 {t.dailyTasksTitle}</h2>
            <p className="text-xs text-emerald-100 font-semibold">{t.dailyTasksSubtitle}</p>
          </div>
          <button
            onClick={() => {
              audio.playButtonClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/25 text-white font-bold text-lg flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scroll space-y-3 flex-1 text-[#3D2B1F]">
          {toastMsg && (
            <div className="rounded-2xl bg-amber-100 border-2 border-amber-400 px-3.5 py-2 text-xs font-bold text-amber-900 text-center animate-pop">{toastMsg}</div>
          )}

          <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200 border-3 border-amber-400 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              <div>
                <div className="font-display font-bold text-sm text-amber-950">{t.masterChest}</div>
                <div className="text-xs text-[#6B513A] font-semibold">
                  {t.progress}: {completedCount} / 5 {t.tasks}
                </div>
              </div>
            </div>
            {allCompleted ? (
              save.dailyTasks.allClaimedBonus ? (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs">{t.claimed}</span>
              ) : (
                <button onClick={handleClaimAllBonus} className="btn-tactile-amber px-4 py-2 rounded-xl text-white font-bold text-xs animate-bounce">
                  {t.claim} +500 🪙
                </button>
              )
            ) : (
              <span className="text-xs font-bold text-amber-900 bg-white/70 px-2.5 py-1.5 rounded-xl">🪙 +500</span>
            )}
          </div>

          <div className="space-y-2.5">
            {save.dailyTasks.tasks.map((task) => {
              const progressPct = Math.min(100, (task.current / task.target) * 100);
              return (
                <div
                  key={task.id}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 ${
                    task.completed ? 'bg-emerald-50/70 border-emerald-300' : 'bg-[#F7EFE0] border-[#E6D5B8]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-[#3D2B1F]">{task.title}</span>
                      {task.completed && <span className="text-emerald-600 font-bold text-xs">✓</span>}
                    </div>
                    <p className="text-[11px] text-[#6B513A] mt-0.5">{task.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                      </div>
                      <span className="font-mono-num text-[10px] font-bold text-[#8C6D4F]">
                        {task.current}/{task.target}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {task.claimed ? (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs">{t.done}</span>
                    ) : task.completed ? (
                      <button onClick={() => handleClaim(task.id)} className="btn-tactile-green px-3.5 py-2 rounded-xl text-white font-bold text-xs animate-pulse">
                        {t.claim} 🪙{task.rewardCoins}
                      </button>
                    ) : (
                      <span className="px-2.5 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs">🪙 {task.rewardCoins}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const LoginRewardsModal: React.FC<{
  save: SaveData;
  onClose: () => void;
  onClaimSuccess: () => void;
}> = ({ save, onClose, onClaimSuccess }) => {
  const t = getT(save.settings.language);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const canClaim = SaveSystem.canClaimLoginRewardToday();

  const handleClaim = () => {
    audio.playCoinReward();
    const reward = SaveSystem.claimLoginReward();
    if (reward) {
      setToastMsg(`🎉 ${t.day} ${reward.day}: +${reward.coins} 🪙`);
      setTimeout(() => setToastMsg(null), 3000);
      onClaimSuccess();
    }
  };

  const dayRewards = [
    { day: 1, reward: '50 🪙', icon: '🪙', bg: 'from-amber-100 to-amber-200' },
    { day: 2, reward: `60 🪙 + 1 ${t.undo}`, icon: '↩️', bg: 'from-blue-100 to-blue-200' },
    { day: 3, reward: `80 🪙 + 1 ${t.hint}`, icon: '💡', bg: 'from-amber-100 to-yellow-200' },
    { day: 4, reward: `100 🪙 + 1 ${t.shuffle}`, icon: '🔀', bg: 'from-purple-100 to-purple-200' },
    { day: 5, reward: `150 🪙 + 1 ${t.extraSlot}`, icon: '➕', bg: 'from-emerald-100 to-emerald-200' },
    { day: 6, reward: '250 🪙 + 4×', icon: '🎒', bg: 'from-rose-100 to-pink-200' },
    { day: 7, reward: '500 🪙 + 👑', icon: '👑', bg: 'from-amber-200 to-orange-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border-4 border-[#DEC8A8] shadow-2xl overflow-hidden animate-pop flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-4 flex items-center justify-between border-b-4 border-orange-700/30">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">🎁 {t.loginTitle}</h2>
            <p className="text-xs text-amber-100 font-semibold">{t.loginSubtitle}</p>
          </div>
          <button
            onClick={() => {
              audio.playButtonClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/25 text-white font-bold text-lg flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scroll space-y-3 flex-1 text-[#3D2B1F]">
          {toastMsg && (
            <div className="rounded-2xl bg-emerald-100 border-2 border-emerald-400 px-3.5 py-2 text-xs font-bold text-emerald-900 text-center animate-pop">{toastMsg}</div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {dayRewards.slice(0, 6).map((item) => {
              const isClaimed = save.loginRewards.claimedDays.includes(item.day);
              const isCurrentToClaim = canClaim && save.loginRewards.claimedDays.length + 1 === item.day;
              return (
                <div
                  key={item.day}
                  className={`p-2.5 rounded-2xl border-2 flex flex-col items-center text-center justify-between relative bg-gradient-to-b ${item.bg} ${
                    isCurrentToClaim ? 'border-amber-500 ring-2 ring-amber-400 scale-102 shadow-md' : isClaimed ? 'border-slate-300 opacity-60' : 'border-[#DEC8A8]'
                  }`}
                >
                  <div className="font-display font-bold text-xs text-[#3D2B1F]">
                    {t.day} {item.day}
                  </div>
                  <span className="text-3xl my-1">{item.icon}</span>
                  <div className="text-[10px] font-bold text-[#6B513A]">{item.reward}</div>
                  {isClaimed && (
                    <span className="absolute inset-0 bg-slate-900/35 rounded-2xl flex items-center justify-center font-bold text-white text-xs">✓ {t.claimed}</span>
                  )}
                </div>
              );
            })}

            {(() => {
              const item = dayRewards[6];
              const isClaimed = save.loginRewards.claimedDays.includes(7);
              const isCurrentToClaim = canClaim && save.loginRewards.claimedDays.length === 6;
              return (
                <div
                  className={`col-span-3 p-3.5 rounded-2xl border-3 flex items-center justify-between relative bg-gradient-to-r ${item.bg} ${
                    isCurrentToClaim ? 'border-amber-500 ring-4 ring-amber-400 shadow-lg animate-pulse' : isClaimed ? 'border-slate-300 opacity-60' : 'border-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">👑</span>
                    <div>
                      <div className="font-display font-bold text-base text-amber-950">
                        {t.day} 7: 500 🪙 + 👑
                      </div>
                      <p className="text-xs text-[#6B513A] font-semibold">+2 {t.extraSlot}</p>
                    </div>
                  </div>
                  {isClaimed && <span className="px-3 py-1.5 rounded-xl bg-slate-700 text-white font-bold text-xs">{t.claimed}</span>}
                </div>
              );
            })()}
          </div>

          <div className="pt-2">
            {canClaim ? (
              <button onClick={handleClaim} className="w-full btn-tactile-green py-4 rounded-2xl font-display text-xl font-bold text-white tracking-wide">
                {t.claimGift} 🎁
              </button>
            ) : (
              <div className="w-full bg-[#F7EFE0] border-2 border-[#E6D5B8] rounded-2xl py-3 text-center text-xs font-bold text-[#6B513A]">✓ {t.giftClaimed}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { fmt, getT };
