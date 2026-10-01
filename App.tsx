import { useEffect, useRef, useState } from 'react';

/** Animates a number from 0 → target over `ms` with ease-out; restarts when target changes */
function useCountUp(target: number, ms = 900, enabled = true): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, enabled]);
  return value;
}
import { audio, MusicMood } from './audio';
import { ACHIEVEMENT_TOTAL, countUnclaimedAchievements, refreshAchievements } from './achievements';
import { AchievementBar, AchievementsModal } from './achievementsUI';
import { IMG, preloadImages } from './assets';
import { PowerUpButtonArt } from './buttonArt';
import { CollectionModal } from './collection';
import { GameHUDState, TileTrailsGameEngine } from './game';
import { HomeScreen } from './HomeScreen';
import { fmt, getT } from './i18n';
import { LevelManager } from './levelManager';
import { LevelConfig, WORLDS } from './levels';
import { isTutorialLevel, POWER_UPS, PowerUpManager, PowerUpType } from './powerups';
import { getTodayDateString, SaveData, SaveSystem } from './saveSystem';
import { ShopModal } from './shop';
import { getTileTexture } from './tile';
import { DailyChallengeModal, DailyTasksModal, LoginRewardsModal, PipMascot, SettingsModal } from './ui';
import { WorldMapView } from './worldMap';

type ScreenMode = 'studio' | 'loading' | 'home' | 'map' | 'play';
type ActiveModal = 'none' | 'settings' | 'daily' | 'tasks' | 'login' | 'collection' | 'shop' | 'pause' | 'achievements';

interface WinSummary {
  stars: number;
  coinsEarned: number;
  elapsedSec: number;
  isDaily: boolean;
  unlockedNewWorld: number | null;
  /** Par time for the level (3-star threshold) */
  parTimeSec: number;
  /** True if this run beat the previous personal best */
  isNewBest: boolean;
}

export function App() {
  const [save, setSave] = useState<SaveData>(() => SaveSystem.get());
  const [screen, setScreen] = useState<ScreenMode>('studio');
  const [modal, setModal] = useState<ActiveModal>('none');

  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingStepKey, setLoadingStepKey] = useState<'booting' | 'loadingWorlds' | 'readyNow'>('booting');
  /** Unskippable Wrld Studio intro — counts 10 → 0 */
  const STUDIO_SPLASH_SECONDS = 10;
  const [studioSecondsLeft, setStudioSecondsLeft] = useState<number>(STUDIO_SPLASH_SECONDS);

  const [activeLevelNum, setActiveLevelNum] = useState<number>(() => SaveSystem.get().currentLevel);
  const [isDailyMode, setIsDailyMode] = useState<boolean>(false);
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(() => LevelManager.getLevel(SaveSystem.get().currentLevel, false));

  const [hud, setHud] = useState<GameHUDState>({
    remainingTiles: 0,
    totalTiles: 0,
    trayCount: 0,
    maxTraySlots: 5,
    canUndo: false,
    extraSlotUsed: false,
    comboCount: 0,
    elapsedSec: 0,
    coveredTiles: 0,
    trayDanger: false,
    freeTiles: 0,
    comboMeter: 0,
    comboCoins: 0,
  });

  /** First-run "how to play" overlay — shown once on Level 1 */
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  /** Guards destructive actions mid-level (restart / leave) against accidental taps */
  const [confirmAction, setConfirmAction] = useState<null | { kind: 'restart' } | { kind: 'leave'; to: 'home' | 'map' }>(null);

  const [winSummary, setWinSummary] = useState<WinSummary | null>(null);
  const [showLoseModal, setShowLoseModal] = useState<boolean>(false);
  const [powerUpToast, setPowerUpToast] = useState<string | null>(null);
  const [pendingAchievementIds, setPendingAchievementIds] = useState<string[]>([]);
  /** Power-up the player tried to use with empty stock — prompts a coin purchase */
  const [buyPrompt, setBuyPrompt] = useState<PowerUpType | null>(null);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const gameEngineRef = useRef<TileTrailsGameEngine | null>(null);

  // Translations follow the language saved in Settings
  const t = getT(save.settings.language);

  // Animated coin count-up on the win screen
  const animatedCoins = useCountUp(winSummary?.coinsEarned ?? 0, 900, Boolean(winSummary));

  useEffect(() => {
    const unsub = SaveSystem.subscribe((newData) => {
      setSave({ ...newData });
    });
    return unsub;
  }, []);

  useEffect(() => {
    const newlyCompleted = refreshAchievements();
    if (newlyCompleted.length > 0) {
      audio.playAchievementUnlock();
      setPendingAchievementIds((prev) => {
        const merged = new Set(prev);
        newlyCompleted.forEach((id) => merged.add(id));
        return Array.from(merged);
      });
    }
  }, [save.stats]);

  // Use the intro time productively: decode all scenery + pre-rasterize every fruit tile
  // texture so the first level appears instantly with zero pop-in or hitching.
  useEffect(() => {
    if (screen !== 'studio') return;
    let cancelled = false;
    preloadImages([IMG.banner, ...IMG.worldBackgrounds]).catch(() => {});
    // Warm the texture cache in small idle-friendly batches to avoid a long main-thread stall
    const theme = SaveSystem.get().activeTileTheme;
    const cf = SaveSystem.get().settings.colorFriendly;
    let i = 0;
    const warm = () => {
      if (cancelled) return;
      const end = Math.min(60, i + 6);
      for (; i < end; i++) {
        try {
          getTileTexture(i, theme, cf, false);
        } catch {
          /* ignore */
        }
      }
      if (i < 60) {
        const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
        if (ric) ric(warm);
        else setTimeout(warm, 16);
      }
    };
    warm();
    return () => {
      cancelled = true;
    };
  }, [screen]);

  // Wrld Studio intro: exactly 10 seconds, cannot be skipped
  useEffect(() => {
    if (screen !== 'studio') return;
    setStudioSecondsLeft(STUDIO_SPLASH_SECONDS);
    const startedAt = Date.now();
    const tick = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const remaining = Math.max(0, Math.ceil(STUDIO_SPLASH_SECONDS - elapsed));
      setStudioSecondsLeft(remaining);
      if (elapsed >= STUDIO_SPLASH_SECONDS) {
        clearInterval(tick);
        setScreen('loading');
      }
    }, 100);
    return () => clearInterval(tick);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'loading') return;
    let progress = 0;
    const interval = setInterval(() => {
      progress += 18 + Math.random() * 22;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setScreen('home');
      }
      setLoadingProgress(Math.floor(progress));
      setLoadingStepKey(progress < 40 ? 'booting' : progress < 75 ? 'loadingWorlds' : 'readyNow');
    }, 55);
    return () => clearInterval(interval);
  }, [screen]);

  const totalStars = SaveSystem.getTotalStars();

  const todayCompleted = save.dailyChallenge.lastCompletedDate === getTodayDateString();
  const canClaimLoginGift = SaveSystem.canClaimLoginRewardToday();
  const unclaimedTaskCount = save.dailyTasks.tasks.filter((task) => task.completed && !task.claimed).length;
  const unclaimedAchievementCount = countUnclaimedAchievements();
  const completedAchievementCount = Object.values(save.achievements).filter((a) => a.completed).length;
  const isTutorial = isTutorialLevel(activeLevelNum, isDailyMode);

  useEffect(() => {
    if (screen === 'home' || screen === 'map' || screen === 'play') {
      audio.syncMusicState();
    }
  }, [screen]);

  // Android hardware back button: navigate backwards through the UI instead of exiting
  useEffect(() => {
    const onBack = () => {
      if (confirmAction) {
        setConfirmAction(null);
      } else if (buyPrompt) {
        setBuyPrompt(null);
        gameEngineRef.current?.setPaused(false);
      } else if (showTutorial) {
        // Let the tutorial finish naturally; ignore back
      } else if (modal !== 'none') {
        setModal('none');
        if (screen === 'play') gameEngineRef.current?.setPaused(false);
      } else if (winSummary) {
        setWinSummary(null);
        setScreen('map');
      } else if (showLoseModal) {
        setShowLoseModal(false);
        setScreen('map');
      } else if (screen === 'play') {
        gameEngineRef.current?.setPaused(true);
        setModal('pause');
      } else if (screen === 'map') {
        setScreen('home');
      }
      // On home: swallow the back press so the WebView doesn't close abruptly
    };
    window.addEventListener('tiletrails:back', onBack);
    return () => window.removeEventListener('tiletrails:back', onBack);
  }, [confirmAction, buyPrompt, showTutorial, modal, screen, winSummary, showLoseModal]);

  // Roll daily tasks / gifts over at midnight even if the app stays open
  useEffect(() => {
    const check = () => {
      const today = getTodayDateString();
      if (SaveSystem.get().dailyTasks.date !== today) {
        SaveSystem.checkAndRefreshDailyDate();
        setSave({ ...SaveSystem.get() });
      }
    };
    check();
    const id = setInterval(check, 60_000);
    const onFocus = () => check();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Auto-pause when the app is backgrounded (protects the timer & battery), duck the music
  useEffect(() => {
    const onVisibility = () => {
      const hidden = document.hidden;
      audio.setBackgrounded(hidden);
      if (hidden && screen === 'play' && modal === 'none' && !winSummary && !showLoseModal) {
        gameEngineRef.current?.setPaused(true);
        setModal('pause');
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [screen, modal, winSummary, showLoseModal]);

  // Show the first-run tutorial the very first time Level 1 opens
  useEffect(() => {
    if (screen === 'play' && activeLevelNum === 1 && !isDailyMode && !save.tutorialSeen) {
      setTutorialStep(0);
      setShowTutorial(true);
      gameEngineRef.current?.setPaused(true);
    }
  }, [screen, activeLevelNum, isDailyMode, save.tutorialSeen]);

  // Keyboard shortcuts for desktop testing / accessibility
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (screen !== 'play' || showTutorial) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') {
        if (modal === 'pause') {
          setModal('none');
          gameEngineRef.current?.setPaused(false);
        } else if (modal === 'none' && !winSummary && !showLoseModal) {
          gameEngineRef.current?.setPaused(true);
          setModal('pause');
        }
      } else if (modal === 'none' && !winSummary && !showLoseModal) {
        if (e.key === 'u' || e.key === 'U') handleUsePowerUp('undo');
        else if (e.key === 's' || e.key === 'S') handleUsePowerUp('shuffle');
        else if (e.key === 'h' || e.key === 'H') handleUsePowerUp('hint');
        else if (e.key === 'e' || e.key === 'E') handleUsePowerUp('extraSlot');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    let mood: MusicMood = 'menu';
    if (screen === 'play') {
      const worldId = isDailyMode ? 7 : Math.ceil(activeLevelNum / 5);
      if ([7, 14, 31, 44, 47].includes(worldId)) mood = 'cosmic';
      else if (activeLevelNum > 120) mood = 'intense';
      else mood = 'puzzle';
    } else if (screen === 'map') {
      mood = 'puzzle';
    }
    audio.setMood(mood);
  }, [screen, activeLevelNum, isDailyMode]);

  // 2D game engine lifecycle
  useEffect(() => {
    if (screen !== 'play' || !canvasContainerRef.current) {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
        gameEngineRef.current = null;
      }
      return;
    }

    const config = LevelManager.getLevel(activeLevelNum, isDailyMode);
    setLevelConfig(config);
    setWinSummary(null);
    setShowLoseModal(false);
    setBuyPrompt(null);

    const engine = new TileTrailsGameEngine(canvasContainerRef.current, {
      onHUDUpdate: (newHud) => setHud(newHud),
      onWin: (elapsedSec, usedExtraOrRevive, discoveredMotifs, meta) => {
        if (isDailyMode) {
          const bonusCoins = SaveSystem.recordDailyChallengeWin();
          setWinSummary({
            stars: 3,
            coinsEarned: bonusCoins,
            elapsedSec,
            isDaily: true,
            unlockedNewWorld: null,
            parTimeSec: config.parTimeSec,
            isNewBest: false,
          });
        } else {
          const prevBest = SaveSystem.get().completedLevels[config.levelNumber]?.bestTimeSec;
          const stars = LevelManager.calculateStars(config, elapsedSec, usedExtraOrRevive);
          const res = SaveSystem.recordLevelWin(config.levelNumber, stars, elapsedSec, discoveredMotifs, {
            usedPowerUp: meta.usedPowerUp,
            beatParTime: meta.beatParTime,
          });
          setWinSummary({
            stars,
            coinsEarned: res.coinsEarned,
            elapsedSec,
            isDaily: false,
            unlockedNewWorld: res.unlockedNewWorld,
            parTimeSec: config.parTimeSec,
            isNewBest: prevBest !== undefined && elapsedSec < prevBest,
          });
        }
      },
      onLose: () => setShowLoseModal(true),
    });

    engine.loadLevel(config);
    gameEngineRef.current = engine;

    return () => {
      engine.destroy();
      gameEngineRef.current = null;
    };
  }, [screen, activeLevelNum, isDailyMode]);

  const startLevel = (lvl: number, daily = false) => {
    audio.syncMusicState();
    setIsDailyMode(daily);
    setActiveLevelNum(lvl);
    setModal('none');
    setScreen('play');
  };

  const handleRestartLevel = () => {
    audio.playButtonClick();
    setWinSummary(null);
    setShowLoseModal(false);
    setModal('none');
    setBuyPrompt(null);
    if (gameEngineRef.current && levelConfig) {
      gameEngineRef.current.loadLevel(levelConfig);
    }
  };

  const handleNextLevel = () => {
    audio.playButtonClick();
    if (isDailyMode) {
      setScreen('home');
      return;
    }
    setActiveLevelNum(Math.min(250, activeLevelNum + 1));
  };

  const triggerToast = (msg: string) => {
    setPowerUpToast(msg);
    setTimeout(() => setPowerUpToast(null), 2500);
  };

  const powerUpName = (type: PowerUpType) => t[type];

  const runPowerUp = (type: PowerUpType): boolean => {
    const engine = gameEngineRef.current;
    if (!engine) return false;
    let executed = false;
    if (type === 'undo') executed = engine.executeUndo();
    else if (type === 'shuffle') executed = engine.executeShuffle();
    else if (type === 'hint') executed = engine.executeHint();
    else if (type === 'extraSlot') executed = engine.executeExtraSlot();
    if (executed) {
      audio.playPowerUp();
      setSave({ ...SaveSystem.get() });
    }
    return executed;
  };

  const handleUsePowerUp = (type: PowerUpType) => {
    const engine = gameEngineRef.current;
    if (!engine) return;

    if (type === 'undo' && !engine.canUndo()) {
      audio.playBlockedTap();
      triggerToast(t.tapTileFirst);
      return;
    }
    if (type === 'extraSlot' && hud.extraSlotUsed) {
      audio.playBlockedTap();
      triggerToast(t.slotActive);
      return;
    }

    // Levels 1–5: free & unlimited. Afterwards: inventory, then coins.
    if (!isTutorial && !PowerUpManager.hasStock(type)) {
      audio.playButtonClick();
      engine.setPaused(true);
      setBuyPrompt(type);
      return;
    }

    if (!runPowerUp(type)) {
      audio.playBlockedTap();
      triggerToast(fmt(t.noneLeft, { name: powerUpName(type) }));
    }
  };

  const handleConfirmBuy = () => {
    if (!buyPrompt) return;
    const type = buyPrompt;
    const cost = POWER_UPS[type].coinCost;
    if (SaveSystem.get().coins < cost) {
      audio.playBlockedTap();
      triggerToast(fmt(t.notEnoughCoins, { cost }));
      return;
    }
    if (PowerUpManager.purchase(type, 1)) {
      audio.playCoinReward();
      setBuyPrompt(null);
      gameEngineRef.current?.setPaused(false);
      runPowerUp(type);
    }
  };

  const handleReviveWithCoins = () => {
    const reviveCost = 350;
    if (save.coins < reviveCost) {
      audio.playBlockedTap();
      triggerToast(fmt(t.notEnoughCoins, { cost: reviveCost }));
      return;
    }
    audio.playCoinReward();
    SaveSystem.save((draft) => {
      draft.coins -= reviveCost;
    });
    setShowLoseModal(false);
    gameEngineRef.current?.reviveFromFullTray();
  };

  return (
    <div className="w-screen h-dvh bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* Dark frame so screen swaps never flash light; each screen paints its own backdrop */}
      <div className="relative w-full h-full max-w-[480px] bg-slate-950 shadow-2xl overflow-hidden flex flex-col select-none">
        {/* ==================== SPLASH (10s, not skippable) ==================== */}
        {screen === 'studio' && (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-white relative p-6 select-none overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute w-80 h-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-16 w-64 h-64 rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
            <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-yellow-400/10 blur-3xl pointer-events-none" />

            {/* Slow-drifting sparkles */}
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-amber-200/70 pointer-events-none"
                style={{
                  width: 3 + (i % 3) * 2,
                  height: 3 + (i % 3) * 2,
                  left: `${(i * 37) % 100}%`,
                  top: `${(i * 53) % 100}%`,
                  animation: `floatSlow ${2.6 + (i % 4) * 0.7}s ease-in-out ${(i % 5) * 0.3}s infinite`,
                  opacity: 0.35 + (i % 3) * 0.2,
                }}
              />
            ))}

            <div className="relative z-10 flex flex-col items-center text-center space-y-4 animate-pop">
              {/* Emblem with countdown ring */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
                  <circle cx="72" cy="72" r="66" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
                  <circle
                    cx="72"
                    cy="72"
                    r="66"
                    stroke="url(#ringGrad)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 66}
                    strokeDashoffset={(2 * Math.PI * 66 * studioSecondsLeft) / STUDIO_SPLASH_SECONDS}
                    style={{ transition: 'stroke-dashoffset 0.12s linear' }}
                  />
                  <defs>
                    <linearGradient id="ringGrad" x1="0" y1="0" x2="144" y2="144" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FDE047" />
                      <stop offset="1" stopColor="#EA580C" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-1 shadow-2xl shadow-orange-500/40 flex items-center justify-center animate-trophy">
                  <div className="w-full h-full rounded-[20px] bg-slate-950 flex items-center justify-center">
                    <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
                      <path d="M24 4L40 38H8L24 4Z" stroke="url(#studioGrad)" strokeWidth="3.5" strokeLinejoin="round" />
                      <path d="M24 16L32 34H16L24 16Z" fill="url(#studioGrad)" />
                      <circle cx="24" cy="40" r="3" fill="#FACC15" />
                      <defs>
                        <linearGradient id="studioGrad" x1="8" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#FDE047" />
                          <stop offset="1" stopColor="#EA580C" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <h1
                  className="font-display text-3xl font-extrabold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-400"
                  style={{ textShadow: '0 0 30px rgba(251,191,36,0.35)' }}
                >
                  WRLD STUDIO
                </h1>
                <p className="font-mono-num text-[10px] font-bold tracking-[0.4em] text-slate-400 uppercase mt-1.5">{t.presents}</p>
              </div>

              {/* Tile Trails wordmark reveal */}
              <div className="pt-2">
                <p className="font-display text-lg font-bold text-white/90">
                  TILE <span className="text-emerald-400">TRAILS</span>
                </p>
              </div>

              {/* Countdown */}
              <div className="pt-4 flex flex-col items-center gap-1.5">
                <div className="font-mono-num text-2xl font-extrabold text-amber-300 tabular-nums">{studioSecondsLeft}</div>
                <div className="w-44 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    style={{
                      width: `${((STUDIO_SPLASH_SECONDS - studioSecondsLeft) / STUDIO_SPLASH_SECONDS) * 100}%`,
                      transition: 'width 0.12s linear',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== LOADING ==================== */}
        {screen === 'loading' && (
          <div
            className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 p-6 text-center relative overflow-hidden animate-screen-fade"
            onClick={() => setScreen('home')}
          >
            <img src={IMG.banner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" draggable={false} />
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/30 to-white/60" />
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="animate-float">
                <PipMascot size={124} mood="cheering" />
              </div>
              <h2 className="font-display text-3xl font-bold text-[#3D2B1F]">
                TILE <span className="text-emerald-600">TRAILS</span>
              </h2>
              <div className="w-52">
                <div className="flex justify-between text-[10px] font-bold text-[#6B513A] mb-1">
                  <span>{t[loadingStepKey]}</span>
                  <span className="font-mono-num">{loadingProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#DEC8A8] rounded-full p-0.5 shadow-inner">
                  <div className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-600 rounded-full transition-all duration-100" style={{ width: `${loadingProgress}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== HOME ==================== */}
        {screen === 'home' && (
          <HomeScreen
            save={save}
            totalStars={totalStars}
            completedAchievementCount={completedAchievementCount}
            unclaimedAchievementCount={unclaimedAchievementCount}
            unclaimedTaskCount={unclaimedTaskCount}
            canClaimLoginGift={canClaimLoginGift}
            todayCompleted={todayCompleted}
            onStartLevel={() => startLevel(save.currentLevel, false)}
            onOpenModal={(m) => setModal(m)}
            onGoMap={() => setScreen('map')}
          />
        )}

        {false && (
          <>
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/35 blur-xl pointer-events-none" />
            <div className="absolute top-36 -right-12 w-48 h-48 rounded-full bg-amber-200/40 blur-xl pointer-events-none" />

            <div className="p-4 space-y-4 pb-12">


            </div>
          </>
        )}

        {/* ==================== MAP ==================== */}
        {screen === 'map' && (
          <WorldMapView
            save={save}
            onSelectLevel={(lvl) => startLevel(lvl, false)}
            onBackHome={() => setScreen('home')}
            onChestClaimed={() => setSave({ ...SaveSystem.get() })}
          />
        )}

        {/* ==================== PLAY ==================== */}
        {screen === 'play' && (
          <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col bg-[#1a2332] animate-screen-fade">
            <div ref={canvasContainerRef} className="absolute inset-0 w-full h-full z-0 bg-[#1a2332]" />

            {/* Slim single-row HUD — the tray dock sits directly beneath it */}
            <div className="relative z-10 px-3 pt-2 pb-1 safe-top flex items-center justify-between gap-2 pointer-events-none">
              <button
                onClick={() => {
                  audio.playButtonClick();
                  gameEngineRef.current?.setPaused(true);
                  setModal('pause');
                }}
                className="pointer-events-auto btn-tactile-cream w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold text-[#3D2B1F] shrink-0"
              >
                ⏸
              </button>
              <div
                className={`backdrop-blur-xs border-2 px-3 py-1 rounded-2xl shadow-xs flex items-center gap-2 min-w-0 transition-colors ${
                  hud.trayDanger ? 'bg-rose-50/95 border-rose-400' : 'bg-[#FFFDF9]/92 border-[#DEC8A8]'
                }`}
              >
                <span className="font-display font-bold text-xs text-[#3D2B1F] whitespace-nowrap">{isDailyMode ? `📅 ${t.dailyTrail}` : `${t.level} ${levelConfig.levelNumber}`}</span>
                <span className="w-px h-3.5 bg-[#DEC8A8]" />
                <span className="text-[11px] font-bold text-[#8C6D4F] whitespace-nowrap">
                  {t.tilesLeft}: {hud.remainingTiles}
                </span>
                <span className={`font-mono-num text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border whitespace-nowrap ${
                  hud.trayDanger ? 'bg-rose-500 text-white border-rose-300 animate-pulse' : 'bg-[#F7EFE0] text-[#5C4433] border-[#E6D5B8]'
                }`}>
                  {hud.trayCount}/{hud.maxTraySlots}
                </span>
                {hud.coveredTiles > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold whitespace-nowrap">
                    ? {hud.coveredTiles}
                  </span>
                )}
                {hud.comboCount > 1 && (
                  <span className="relative overflow-hidden bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold whitespace-nowrap">
                    {/* Draining combo meter */}
                    <span
                      className="absolute inset-y-0 left-0 bg-orange-500/60"
                      style={{ width: `${Math.round(hud.comboMeter * 100)}%`, transition: 'width 0.1s linear' }}
                    />
                    <span className="relative">🔥 x{hud.comboCount}</span>
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  audio.playButtonClick();
                  gameEngineRef.current?.setPaused(true);
                  setModal('shop');
                }}
                className="pointer-events-auto bg-[#FFFDF9]/92 border-2 border-[#DEC8A8] rounded-full px-2.5 py-1 shadow-xs flex items-center gap-1 shrink-0"
              >
                <span className="text-sm">🪙</span>
                <span className="font-mono-num font-bold text-xs text-[#3D2B1F]">{save.coins}</span>
              </button>
            </div>

            {/* Spacer reserved for the tray dock rendered on the canvas */}
            <div className="h-[92px] pointer-events-none" />

            {powerUpToast && (
              <div className="relative z-20 mx-auto mt-1 bg-slate-900/85 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pop">{powerUpToast}</div>
            )}

            {/* Stuck hint — no free tiles but board not empty */}
            {!powerUpToast && hud.freeTiles === 0 && hud.remainingTiles > 0 && hud.trayCount < hud.maxTraySlots && (
              <div className="relative z-20 mx-auto mt-1 bg-purple-700/90 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pop flex items-center gap-1.5">
                <span>🔀</span> {t.noMovesHint}
              </div>
            )}

            <div className="flex-1 pointer-events-none" />

            {/* Power-up bar */}
            <div className="relative z-10 px-3 pb-3 pt-1 safe-bottom bg-gradient-to-t from-slate-950/45 to-transparent">
              {isTutorial && (
                <p className="text-center text-[10px] font-extrabold text-emerald-200 mb-1.5 drop-shadow">✨ {t.freePowerUps}</p>
              )}
              <div className="grid grid-cols-4 gap-2.5 max-w-md mx-auto">
                {(['undo', 'shuffle', 'hint', 'extraSlot'] as PowerUpType[]).map((type) => {
                  const meta = POWER_UPS[type];
                  const count = save.powerups[type] || 0;
                  const outOfStock = !isTutorial && count === 0;
                  const isExtraDisabled = type === 'extraSlot' && hud.extraSlotUsed;

                  return (
                    <button
                      key={type}
                      onClick={() => handleUsePowerUp(type)}
                      disabled={isExtraDisabled}
                      className={`relative flex flex-col items-center justify-center active:translate-y-0.5 transition ${isExtraDisabled ? 'opacity-45 cursor-not-allowed' : ''} ${
                        outOfStock ? 'grayscale-[70%] opacity-75' : ''
                      }`}
                    >
                      <PowerUpButtonArt type={type} size={58} />
                      <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/70 border border-white/25 font-display font-bold text-[10.5px] text-white leading-tight">{powerUpName(type)}</span>
                      <span
                        className={`absolute -top-1.5 -right-0.5 min-w-[22px] px-1.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-md border-2 flex items-center justify-center ${
                          isExtraDisabled
                            ? 'bg-slate-300 text-slate-600 border-white'
                            : isTutorial
                            ? 'bg-emerald-500 text-white border-white'
                            : outOfStock
                            ? 'bg-amber-400 text-amber-950 border-white'
                            : 'bg-white text-slate-900 border-emerald-400'
                        }`}
                      >
                        {isExtraDisabled ? '✓' : isTutorial ? t.free : outOfStock ? `🪙${meta.coinCost}` : count}
                      </span>
                    </button>
                  );
                })}
              </div>
              {!isTutorial && (['undo', 'shuffle', 'hint', 'extraSlot'] as PowerUpType[]).every((k) => (save.powerups[k] || 0) === 0) && (
                <p className="text-center text-[10px] font-bold text-amber-200/90 mt-1.5">{t.allPowerUpsUsed} 🪙</p>
              )}
            </div>
          </div>
        )}

        {/* ==================== CONFIRM RESTART / LEAVE ==================== */}
        {confirmAction && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-xs rounded-3xl bg-[#FFFDF9] border-4 border-[#DEC8A8] p-5 text-center space-y-3.5 animate-pop shadow-2xl">
              <div className="text-4xl">{confirmAction.kind === 'restart' ? '🔄' : '🚪'}</div>
              <h3 className="font-display text-xl font-bold text-[#3D2B1F]">
                {confirmAction.kind === 'restart' ? t.confirmRestartTitle : t.confirmLeaveTitle}
              </h3>
              <p className="text-xs text-[#6B513A] font-medium">{confirmAction.kind === 'restart' ? t.confirmRestartBody : t.confirmLeaveBody}</p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    audio.playButtonClick();
                    setConfirmAction(null);
                  }}
                  className="btn-tactile-green py-3 rounded-2xl font-bold text-sm text-white"
                >
                  {t.confirmNo}
                </button>
                <button
                  onClick={() => {
                    const action = confirmAction;
                    setConfirmAction(null);
                    if (action.kind === 'restart') {
                      handleRestartLevel();
                    } else {
                      audio.playButtonClick();
                      setModal('none');
                      setScreen(action.to);
                    }
                  }}
                  className="btn-tactile-cream py-3 rounded-2xl font-bold text-sm text-[#5C4433]"
                >
                  {t.confirmYes}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== FIRST-RUN TUTORIAL ==================== */}
        {showTutorial && screen === 'play' && (() => {
          const steps = [
            { icon: '👆', title: t.tutTitle1, body: t.tutBody1, accent: 'from-emerald-400 to-teal-500' },
            { icon: '🍎🍎🍎', title: t.tutTitle2, body: t.tutBody2, accent: 'from-amber-400 to-orange-500' },
            { icon: '⚠️', title: t.tutTitle3, body: t.tutBody3, accent: 'from-rose-400 to-pink-500' },
            { icon: '⚡', title: t.tutTitle4, body: t.tutBody4, accent: 'from-violet-400 to-indigo-500' },
          ];
          const step = steps[Math.min(tutorialStep, steps.length - 1)];
          const isLast = tutorialStep >= steps.length - 1;
          const finish = () => {
            audio.playButtonClick();
            SaveSystem.save((draft) => {
              draft.tutorialSeen = true;
            });
            setShowTutorial(false);
            gameEngineRef.current?.setPaused(false);
          };
          return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
              <div className="w-full max-w-sm rounded-3xl bg-[#FFFDF9] border-4 border-[#DEC8A8] overflow-hidden animate-pop shadow-2xl">
                <div className={`bg-gradient-to-r ${step.accent} px-5 py-5 text-center`}>
                  <div className="text-4xl mb-1 drop-shadow">{step.icon}</div>
                  <h3 className="font-display text-xl font-bold text-white drop-shadow-xs">{step.title}</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-center -mt-12">
                    <div className="bg-[#FFFDF9] rounded-full p-1 border-4 border-[#DEC8A8]">
                      <PipMascot size={72} mood={isLast ? 'cheering' : 'happy'} />
                    </div>
                  </div>
                  <p className="text-sm text-[#5C4433] font-medium text-center leading-relaxed">{step.body}</p>

                  {/* Step dots */}
                  <div className="flex justify-center gap-1.5">
                    {steps.map((_, i) => (
                      <span key={i} className={`h-2 rounded-full transition-all ${i === tutorialStep ? 'w-6 bg-emerald-500' : 'w-2 bg-[#DEC8A8]'}`} />
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {!isLast && (
                      <button onClick={finish} className="btn-tactile-cream px-4 py-3 rounded-2xl font-bold text-xs text-[#5C4433]">
                        {t.tutSkip}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (isLast) {
                          finish();
                        } else {
                          audio.playButtonClick();
                          setTutorialStep((s) => s + 1);
                        }
                      }}
                      className="flex-1 btn-tactile-green py-3 rounded-2xl font-display text-lg font-bold text-white"
                    >
                      {isLast ? `▶ ${t.tutStart}` : `${t.tutNext} ▶`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ==================== BUY POWER-UP PROMPT ==================== */}
        {buyPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
            <div className="w-full max-w-xs rounded-3xl bg-[#FFFDF9] border-4 border-[#DEC8A8] p-5 text-center space-y-3.5 animate-pop shadow-2xl">
              <div className="flex justify-center">
                <PowerUpButtonArt type={buyPrompt} size={72} />
              </div>
              <h3 className="font-display text-xl font-bold text-[#3D2B1F]">{fmt(t.buyTitle, { name: powerUpName(buyPrompt) })}</h3>
              <p className="text-xs text-[#6B513A] font-medium">{fmt(t.buyBody, { name: powerUpName(buyPrompt), cost: POWER_UPS[buyPrompt].coinCost })}</p>
              <div className="bg-[#F7EFE0] border-2 border-[#E6D5B8] rounded-2xl py-2 text-xs font-bold text-[#3D2B1F] flex items-center justify-center gap-3">
                <span>
                  🪙 {save.coins} {t.coins}
                </span>
                <span className="text-[#8C6D4F]">→</span>
                <span className={save.coins >= POWER_UPS[buyPrompt].coinCost ? 'text-emerald-700' : 'text-rose-600'}>
                  🪙 {save.coins - POWER_UPS[buyPrompt].coinCost}
                </span>
              </div>
              <button onClick={handleConfirmBuy} className="w-full btn-tactile-amber py-3 rounded-2xl font-display text-lg font-bold text-white flex items-center justify-center gap-2">
                <span>{t.buyNow}</span>
                <span className="bg-amber-950/25 px-2 py-0.5 rounded-full text-xs">🪙 {POWER_UPS[buyPrompt].coinCost}</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    audio.playButtonClick();
                    setBuyPrompt(null);
                    setModal('shop');
                  }}
                  className="btn-tactile-cream py-2.5 rounded-2xl font-bold text-xs text-[#5C4433]"
                >
                  🏪 {t.goToShop}
                </button>
                <button
                  onClick={() => {
                    audio.playButtonClick();
                    setBuyPrompt(null);
                    gameEngineRef.current?.setPaused(false);
                  }}
                  className="btn-tactile-cream py-2.5 rounded-2xl font-bold text-xs text-[#5C4433]"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PAUSE ==================== */}
        {modal === 'pause' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
            <div className="w-full max-w-xs rounded-3xl bg-[#FFFDF9] border-4 border-[#DEC8A8] p-5 text-center space-y-3.5 animate-pop shadow-2xl">
              <h3 className="font-display text-2xl font-bold text-[#3D2B1F]">{t.paused}</h3>
              <p className="text-xs font-semibold text-[#6B513A]">{levelConfig.title}</p>
              <button
                onClick={() => {
                  audio.playButtonClick();
                  setModal('none');
                  gameEngineRef.current?.setPaused(false);
                }}
                className="w-full btn-tactile-green py-3 rounded-2xl font-display text-lg font-bold text-white"
              >
                ▶ {t.resume}
              </button>
              <button
                onClick={() => {
                  audio.playButtonClick();
                  // Only confirm if the player has actually made progress on this stage
                  if (hud.remainingTiles < hud.totalTiles) setConfirmAction({ kind: 'restart' });
                  else handleRestartLevel();
                }}
                className="w-full btn-tactile-amber py-3 rounded-2xl font-display text-lg font-bold text-white"
              >
                🔄 {t.restartLevel}
              </button>
              <button
                onClick={() => {
                  audio.playButtonClick();
                  setModal('achievements');
                }}
                className="w-full bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-400 py-2.5 rounded-2xl font-bold text-sm text-amber-900"
              >
                🏅 {t.achievementsTitle} ({completedAchievementCount}/{ACHIEVEMENT_TOTAL})
              </button>
              <button
                onClick={() => {
                  audio.playButtonClick();
                  setModal('settings');
                }}
                className="w-full btn-tactile-cream py-2.5 rounded-2xl font-bold text-sm text-[#3D2B1F]"
              >
                ⚙️ {t.settings}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    audio.playButtonClick();
                    if (hud.remainingTiles < hud.totalTiles) setConfirmAction({ kind: 'leave', to: 'map' });
                    else {
                      setModal('none');
                      setScreen('map');
                    }
                  }}
                  className="btn-tactile-cream py-2.5 rounded-2xl font-bold text-xs text-[#5C4433]"
                >
                  🗺️ {t.worldMap}
                </button>
                <button
                  onClick={() => {
                    audio.playButtonClick();
                    if (hud.remainingTiles < hud.totalTiles) setConfirmAction({ kind: 'leave', to: 'home' });
                    else {
                      setModal('none');
                      setScreen('home');
                    }
                  }}
                  className="btn-tactile-cream py-2.5 rounded-2xl font-bold text-xs text-[#5C4433]"
                >
                  🏠 {t.home}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== WIN ==================== */}
        {winSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#FFFDF9] border-4 border-[#DEC8A8] p-6 text-center space-y-4 animate-pop shadow-2xl">
              <div className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
                {winSummary.isDaily ? t.dailyComplete : fmt(t.stageCleared, { n: levelConfig.levelNumber })}
              </div>
              <h2 className="font-display text-3xl font-bold text-[#3D2B1F]">{t.trailConquered}</h2>
              <div className="flex items-center justify-center gap-3 py-1">
                {[1, 2, 3].map((starIdx) => {
                  const earned = starIdx <= winSummary.stars;
                  return (
                    <div
                      key={starIdx}
                      className={`text-5xl ${earned ? 'text-amber-400 drop-shadow-md animate-star-reveal' : 'text-slate-300 scale-95'}`}
                      style={earned ? { animationDelay: `${(starIdx - 1) * 0.18 + 0.1}s` } : undefined}
                    >
                      ★
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center">
                <PipMascot size={96} mood="cheering" />
              </div>
              <div className="bg-[#F7EFE0] border-2 border-[#E6D5B8] rounded-2xl p-3.5 flex items-center justify-around">
                <div>
                  <div className="text-[11px] font-bold text-[#8C6D4F] uppercase">{t.coinsReward}</div>
                  <div className="font-display text-2xl font-bold text-amber-600 animate-coin-pop font-mono-num">🪙 +{animatedCoins}</div>
                  {hud.comboCoins > 0 && (
                    <div className="text-[10px] font-bold text-orange-600">🔥 +{hud.comboCoins} {t.combo}</div>
                  )}
                </div>
                <div className="h-8 w-0.5 bg-[#E6D5B8]" />
                <div>
                  <div className="text-[11px] font-bold text-[#8C6D4F] uppercase">{t.clearTime}</div>
                  <div className="font-mono-num text-xl font-bold text-[#3D2B1F] flex items-center gap-1.5 justify-center">
                    {winSummary.elapsedSec}s
                    {winSummary.isNewBest && (
                      <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">{t.newBest}</span>
                    )}
                  </div>
                  <div className={`text-[10px] font-bold ${winSummary.elapsedSec <= winSummary.parTimeSec ? 'text-emerald-700' : 'text-[#8C6D4F]'}`}>
                    {t.parTime} {winSummary.parTimeSec}s
                  </div>
                </div>
              </div>
              {winSummary.unlockedNewWorld && (
                <div className="bg-gradient-to-r from-amber-100 to-emerald-100 border-2 border-emerald-400 rounded-2xl p-2.5 text-xs font-bold text-emerald-950">
                  🎉 {fmt(t.newWorldUnlocked, { name: WORLDS[winSummary.unlockedNewWorld - 1]?.name ?? '' })}
                </div>
              )}
              <div className="space-y-2 pt-1">
                <button onClick={handleNextLevel} className="w-full btn-tactile-green py-4 rounded-2xl font-display text-xl font-bold text-white">
                  {winSummary.isDaily ? t.collectHome : activeLevelNum < 250 ? `${fmt(t.nextLevel, { n: activeLevelNum + 1 })} ▶` : `${t.finishExpedition} 🏆`}
                </button>
                <button
                  onClick={() => {
                    audio.playButtonClick();
                    setWinSummary(null);
                    setScreen('map');
                  }}
                  className="w-full btn-tactile-cream py-2.5 rounded-2xl font-bold text-xs text-[#5C4433]"
                >
                  🗺️ {t.backToMap}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== LOSE ==================== */}
        {showLoseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#FFFDF9] border-4 border-[#DEC8A8] p-6 text-center space-y-4 animate-pop shadow-2xl">
              <div className="inline-block px-3.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-xs uppercase tracking-wider">{fmt(t.traySlotsFull, { n: hud.maxTraySlots })}</div>
              <h2 className="font-display text-3xl font-bold text-[#3D2B1F]">{t.outOfSpace}</h2>
              <div className="flex justify-center">
                <PipMascot size={92} mood="thinking" />
              </div>
              <p className="text-xs text-[#6B513A] font-medium">{t.loseHint}</p>
              <div className="space-y-2.5">
                <button onClick={handleReviveWithCoins} className="w-full btn-tactile-amber py-3.5 rounded-2xl font-display text-lg font-bold text-white flex items-center justify-center gap-2">
                  <span>✨ {t.continueRevive}</span>
                  <span className="bg-amber-950/30 px-2.5 py-0.5 rounded-full text-sm">🪙 350</span>
                </button>
                <button onClick={handleRestartLevel} className="w-full btn-tactile-green py-3.5 rounded-2xl font-display text-lg font-bold text-white flex items-center justify-center gap-2">
                  <span>🔄 {t.tryAgain}</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      audio.playButtonClick();
                      setShowLoseModal(false);
                      setScreen('map');
                    }}
                    className="btn-tactile-cream py-2.5 rounded-2xl font-bold text-xs text-[#5C4433]"
                  >
                    🗺️ {t.worldMap}
                  </button>
                  <button
                    onClick={() => {
                      audio.playButtonClick();
                      setShowLoseModal(false);
                      setScreen('home');
                    }}
                    className="btn-tactile-cream py-2.5 rounded-2xl font-bold text-xs text-[#5C4433]"
                  >
                    🏠 {t.home}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ACHIEVEMENT BANNER ==================== */}
        {pendingAchievementIds.length > 0 && modal === 'none' && !buyPrompt && (
          <AchievementBar
            achievementIds={pendingAchievementIds}
            lang={save.settings.language}
            position={screen === 'play' ? 'bottom' : 'top'}
            onDismiss={() => setPendingAchievementIds([])}
            onOpenAchievements={() => {
              gameEngineRef.current?.setPaused(true);
              setModal('achievements');
            }}
          />
        )}

        {/* ==================== MODALS ==================== */}
        {modal === 'settings' && (
          <SettingsModal
            save={save}
            onClose={() => {
              setModal('none');
              gameEngineRef.current?.setPaused(false);
            }}
            onSettingsChanged={() => {
              setSave({ ...SaveSystem.get() });
              gameEngineRef.current?.refreshVisualSettings();
            }}
            onOpenAchievements={() => setModal('achievements')}
            onReplayTutorial={() => {
              SaveSystem.save((draft) => {
                draft.tutorialSeen = false;
              });
              setModal('none');
              startLevel(1, false);
            }}
          />
        )}
        {modal === 'daily' && <DailyChallengeModal save={save} onClose={() => setModal('none')} onStartDaily={() => startLevel(999, true)} />}
        {modal === 'tasks' && <DailyTasksModal save={save} onClose={() => setModal('none')} onClaimReward={() => setSave({ ...SaveSystem.get() })} />}
        {modal === 'login' && <LoginRewardsModal save={save} onClose={() => setModal('none')} onClaimSuccess={() => setSave({ ...SaveSystem.get() })} />}
        {modal === 'achievements' && (
          <AchievementsModal
            save={save}
            onClose={() => {
              setPendingAchievementIds((prev) =>
                prev.filter((id) => {
                  const state = SaveSystem.get().achievements[id];
                  return state ? !state.claimed : false;
                })
              );
              setModal('none');
              if (screen === 'play') gameEngineRef.current?.setPaused(false);
            }}
            onChanged={() => {
              setSave({ ...SaveSystem.get() });
              setPendingAchievementIds((prev) =>
                prev.filter((id) => {
                  const state = SaveSystem.get().achievements[id];
                  return state ? !state.claimed : false;
                })
              );
              refreshAchievements();
            }}
          />
        )}
        {modal === 'collection' && (
          <CollectionModal
            save={save}
            onClose={() => setModal('none')}
            onUpdate={() => {
              setSave({ ...SaveSystem.get() });
              gameEngineRef.current?.refreshVisualSettings();
            }}
          />
        )}
        {modal === 'shop' && (
          <ShopModal
            save={save}
            onClose={() => {
              setModal('none');
              gameEngineRef.current?.setPaused(false);
            }}
            onPurchaseSuccess={() => {
              setSave({ ...SaveSystem.get() });
              gameEngineRef.current?.refreshVisualSettings();
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
