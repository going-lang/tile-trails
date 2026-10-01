export type TileThemeId = 'classic' | 'jade' | 'sakura' | 'starlight';

export type LanguageCode = 'EN' | 'ES' | 'FR' | 'DE' | 'JP';

export interface LevelProgress {
  stars: number; // 1 to 3
  bestTimeSec: number;
}

export interface PowerUpInventory {
  undo: number;
  shuffle: number;
  hint: number;
  extraSlot: number;
}

export interface GameSettings {
  music: boolean;
  sound: boolean;
  vibration: boolean;
  notifications: boolean;
  colorFriendly: boolean;
  language: LanguageCode;
}

export interface DailyChallengeState {
  lastCompletedDate: string | null;
  streak: number;
  lastDailyGiftDate: string | null;
  totalChallengesWon: number;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardCoins: number;
  rewardPowerUp?: keyof PowerUpInventory;
  rewardQty?: number;
  completed: boolean;
  claimed: boolean;
}

export interface DailyTasksState {
  date: string;
  tasks: DailyTask[];
  allClaimedBonus: boolean;
}

export interface LoginRewardsState {
  lastClaimDate: string | null;
  currentDay: number;
  totalLogins: number;
  claimedDays: number[];
}

/** Lifetime player statistics used to drive the achievement system */
export interface PlayerStats {
  levelsCompleted: number;
  totalStars: number;
  totalMatches: number;
  maxCombo: number;
  fruitsDiscovered: number;
  worldsUnlocked: number;
  powerupsUsed: number;
  undoUsed: number;
  shuffleUsed: number;
  hintUsed: number;
  extraSlotUsed: number;
  dailyChallengesCompleted: number;
  dailyTasksCompleted: number;
  loginDays: number;
  totalCoinsEarned: number;
  threeStarLevels: number;
  noPowerupWins: number;
  perfectTimeWins: number;
  cosmeticsOwned: number;
  revivesUsed: number;
  replaysCompleted: number;
  trayAlmostFullWins: number;
}

export interface AchievementState {
  current: number;
  claimed: boolean;
  completed?: boolean;
}

export interface SaveData {
  version: number;
  currentLevel: number;
  completedLevels: Record<number, LevelProgress>;
  coins: number;
  powerups: PowerUpInventory;
  unlockedWorlds: number[];
  unlockedTileThemes: TileThemeId[];
  activeTileTheme: TileThemeId;
  unlockedBackgrounds: string[];
  activeBackground: string;
  discoveredTiles: number[];
  dailyChallenge: DailyChallengeState;
  dailyTasks: DailyTasksState;
  loginRewards: LoginRewardsState;
  settings: GameSettings;
  stats: PlayerStats;
  achievements: Record<string, AchievementState>;
  /** True once the player has dismissed the first-run how-to-play overlay */
  tutorialSeen?: boolean;
  /** World IDs whose "perfect world" (15/15 stars) chest has been claimed */
  worldChestsClaimed?: number[];
}

const STORAGE_KEY = 'tile_trails_save_v3';

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateDailyTasks(_dateStr?: string): DailyTask[] {
  return [
    {
      id: 'task_match_fruits',
      title: 'Harvest 20 Fruit Tiles',
      description: 'Match 20 delicious fruit tiles in any puzzle.',
      target: 20,
      current: 0,
      rewardCoins: 20,
      completed: false,
      claimed: false,
    },
    {
      id: 'task_win_levels',
      title: 'Clear 2 Trail Stages',
      description: 'Complete 2 level puzzles on the World Map.',
      target: 2,
      current: 0,
      rewardCoins: 30,
      rewardPowerUp: 'undo',
      rewardQty: 1,
      completed: false,
      claimed: false,
    },
    {
      id: 'task_stars',
      title: 'Earn 3 Stars in a Level',
      description: 'Finish a puzzle within par time for 3 golden stars.',
      target: 1,
      current: 0,
      rewardCoins: 25,
      completed: false,
      claimed: false,
    },
    {
      id: 'task_powerup',
      title: 'Use 1 Trail Power-Up',
      description: 'Activate Undo, Shuffle, Hint, or +1 Extra Slot.',
      target: 1,
      current: 0,
      rewardCoins: 18,
      rewardPowerUp: 'shuffle',
      rewardQty: 1,
      completed: false,
      claimed: false,
    },
    {
      id: 'task_combo',
      title: 'Achieve a 2x Fruit Combo',
      description: 'Match two sets of fruit tiles within 3 seconds of each other.',
      target: 1,
      current: 0,
      rewardCoins: 22,
      rewardPowerUp: 'hint',
      rewardQty: 1,
      completed: false,
      claimed: false,
    },
  ];
}

export function createDefaultStats(): PlayerStats {
  return {
    levelsCompleted: 0,
    totalStars: 0,
    totalMatches: 0,
    maxCombo: 0,
    fruitsDiscovered: 0,
    worldsUnlocked: 1,
    powerupsUsed: 0,
    undoUsed: 0,
    shuffleUsed: 0,
    hintUsed: 0,
    extraSlotUsed: 0,
    dailyChallengesCompleted: 0,
    dailyTasksCompleted: 0,
    loginDays: 0,
    totalCoinsEarned: 0,
    threeStarLevels: 0,
    noPowerupWins: 0,
    perfectTimeWins: 0,
    cosmeticsOwned: 2,
    revivesUsed: 0,
    replaysCompleted: 0,
    trayAlmostFullWins: 0,
  };
}

export function createDefaultSaveData(): SaveData {
  const today = getTodayDateString();
  return {
    version: 3,
    currentLevel: 1,
    completedLevels: {},
    coins: 250,
    powerups: {
      undo: 3,
      shuffle: 2,
      hint: 3,
      extraSlot: 2,
    },
    unlockedWorlds: [1],
    unlockedTileThemes: ['classic'],
    activeTileTheme: 'classic',
    unlockedBackgrounds: ['auto', '1'],
    activeBackground: 'auto',
    discoveredTiles: Array.from({ length: 12 }, (_, i) => i),
    dailyChallenge: {
      lastCompletedDate: null,
      streak: 0,
      lastDailyGiftDate: null,
      totalChallengesWon: 0,
    },
    dailyTasks: {
      date: today,
      tasks: generateDailyTasks(today),
      allClaimedBonus: false,
    },
    loginRewards: {
      lastClaimDate: null,
      currentDay: 1,
      totalLogins: 0,
      claimedDays: [],
    },
    settings: {
      music: true,
      sound: true,
      vibration: true,
      notifications: true,
      colorFriendly: false,
      language: 'EN',
    },
    stats: createDefaultStats(),
    achievements: {},
  };
}

/**
 * Storage wrapper that never throws. Some WebView/private-mode configurations block
 * localStorage entirely; in that case we transparently fall back to an in-memory store
 * so the game still runs (progress just won't persist across launches).
 */
const memoryStore = new Map<string, string>();
const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStore.get(key) ?? null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      memoryStore.set(key, value);
    }
  },
};

export class SaveSystem {
  private static data: SaveData = SaveSystem.load();
  private static listeners: Array<(data: SaveData) => void> = [];
  /** Debounced persistence to avoid hammering disk on rapid successive saves */
  private static persistTimer: number | null = null;

  static load(): SaveData {
    try {
      const raw =
        storage.get(STORAGE_KEY) ||
        storage.get('tile_trails_save_v2') ||
        storage.get('tile_trails_save_v1');
      const today = getTodayDateString();
      if (!raw) {
        const defaults = createDefaultSaveData();
        storage.set(STORAGE_KEY, JSON.stringify(defaults));
        return defaults;
      }
      const parsed = JSON.parse(raw);
      const defaults = createDefaultSaveData();

      let dailyTasks = parsed.dailyTasks;
      if (!dailyTasks || dailyTasks.date !== today) {
        dailyTasks = {
          date: today,
          tasks: generateDailyTasks(today),
          allClaimedBonus: false,
        };
      }

      const loginRewards = parsed.loginRewards || {
        lastClaimDate: null,
        currentDay: 1,
        totalLogins: 0,
        claimedDays: [],
      };

      // Rebuild lifetime stats from legacy progress when migrating older saves
      const completedLevels: Record<number, LevelProgress> = parsed.completedLevels || {};
      const legacyLevelCount = Object.keys(completedLevels).length;
      const legacyStars = Object.values(completedLevels).reduce((sum, item) => sum + (item?.stars || 0), 0);
      const legacyThreeStar = Object.values(completedLevels).filter((item) => item?.stars === 3).length;

      const stats: PlayerStats = {
        ...createDefaultStats(),
        ...(parsed.stats || {}),
        levelsCompleted: parsed.stats?.levelsCompleted ?? legacyLevelCount,
        totalStars: parsed.stats?.totalStars ?? legacyStars,
        threeStarLevels: parsed.stats?.threeStarLevels ?? legacyThreeStar,
        fruitsDiscovered: parsed.stats?.fruitsDiscovered ?? (parsed.discoveredTiles?.length || 0),
        worldsUnlocked: parsed.stats?.worldsUnlocked ?? parsed.unlockedWorlds?.length ?? 1,
        cosmeticsOwned: parsed.stats?.cosmeticsOwned ?? parsed.unlockedMascotItems?.length ?? 2,
      };

      const result: SaveData = {
        ...defaults,
        ...parsed,
        powerups: { ...defaults.powerups, ...(parsed.powerups || {}) },
        settings: { ...defaults.settings, ...(parsed.settings || {}) },
        dailyChallenge: { ...defaults.dailyChallenge, ...(parsed.dailyChallenge || {}) },
        dailyTasks,
        loginRewards,
        stats,
        achievements: parsed.achievements || {},
        discoveredTiles: Array.from(new Set([...defaults.discoveredTiles, ...(parsed.discoveredTiles || [])])),
      };

      return result;
    } catch {
      return createDefaultSaveData();
    }
  }

  static get(): SaveData {
    return this.data;
  }

  static save(updater?: (draft: SaveData) => void): SaveData {
    if (updater) {
      updater(this.data);
    }
    // Keep derived stats in sync with the rest of the save
    this.data.stats.totalStars = Object.values(this.data.completedLevels).reduce(
      (sum, item) => sum + (item?.stars || 0),
      0
    );
    this.data.stats.levelsCompleted = Object.keys(this.data.completedLevels).length;
    this.data.stats.threeStarLevels = Object.values(this.data.completedLevels).filter(
      (item) => item?.stars === 3
    ).length;
    this.data.stats.fruitsDiscovered = this.data.discoveredTiles.length;
    this.data.stats.worldsUnlocked = Math.max(1, this.data.unlockedWorlds.length);
    this.data.stats.cosmeticsOwned = this.data.unlockedTileThemes.length;

    this.schedulePersist();
    this.notify();
    return { ...this.data };
  }

  /** Coalesces rapid saves (e.g. combo chains) into one disk write ~150ms later */
  private static schedulePersist() {
    if (this.persistTimer !== null) return;
    this.persistTimer = window.setTimeout(() => {
      this.persistTimer = null;
      this.flush();
    }, 150);
  }

  /** Writes immediately. Called on a timer, on app hide, and before unload. */
  static flush() {
    if (this.persistTimer !== null) {
      clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }
    try {
      storage.set(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Ignore quota errors on restricted environments
    }
  }

  static subscribe(listener: (data: SaveData) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify() {
    const snapshot = { ...this.data };
    this.listeners.forEach((l) => l(snapshot));
  }

  static getTotalStars(): number {
    return Object.values(this.data.completedLevels).reduce((sum, item) => sum + (item?.stars || 0), 0);
  }

  /** Increments a lifetime statistic used by achievements */
  static trackStat(key: keyof PlayerStats, amount = 1) {
    this.save((draft) => {
      const current = draft.stats[key];
      if (typeof current === 'number') {
        draft.stats[key] = current + amount;
      }
    });
  }

  /** Sets a lifetime statistic to a specific value (used for maximums like combo) */
  static trackMaxStat(key: keyof PlayerStats, value: number) {
    this.save((draft) => {
      const current = draft.stats[key];
      if (typeof current === 'number' && value > current) {
        draft.stats[key] = value;
      }
    });
  }

  static checkAndRefreshDailyDate() {
    const today = getTodayDateString();
    if (this.data.dailyTasks.date !== today) {
      this.save((draft) => {
        draft.dailyTasks = {
          date: today,
          tasks: generateDailyTasks(today),
          allClaimedBonus: false,
        };
      });
    }
  }

  static progressTask(taskId: string, amount = 1) {
    this.checkAndRefreshDailyDate();
    this.save((draft) => {
      const task = draft.dailyTasks.tasks.find((t) => t.id === taskId);
      if (task && !task.completed) {
        task.current = Math.min(task.target, task.current + amount);
        if (task.current >= task.target) {
          task.completed = true;
        }
      }
    });
  }

  static claimTaskReward(taskId: string): { coins: number; powerUp?: keyof PowerUpInventory; qty?: number } | null {
    let result: { coins: number; powerUp?: keyof PowerUpInventory; qty?: number } | null = null;
    this.save((draft) => {
      const task = draft.dailyTasks.tasks.find((t) => t.id === taskId);
      if (task && task.completed && !task.claimed) {
        task.claimed = true;
        draft.coins += task.rewardCoins;
        draft.stats.totalCoinsEarned += task.rewardCoins;
        draft.stats.dailyTasksCompleted += 1;
        if (task.rewardPowerUp && task.rewardQty) {
          draft.powerups[task.rewardPowerUp] += task.rewardQty;
        }
        result = { coins: task.rewardCoins, powerUp: task.rewardPowerUp, qty: task.rewardQty };
      }
    });
    return result;
  }

  static claimAllTasksBonus(): number | null {
    let bonus: number | null = null;
    this.save((draft) => {
      const allDone = draft.dailyTasks.tasks.every((t) => t.completed);
      if (allDone && !draft.dailyTasks.allClaimedBonus) {
        draft.dailyTasks.allClaimedBonus = true;
        bonus = 500; // Maximum single reward in the game
        draft.coins += bonus;
        draft.stats.totalCoinsEarned += bonus;
      }
    });
    return bonus;
  }

  static canClaimLoginRewardToday(): boolean {
    const today = getTodayDateString();
    return this.data.loginRewards.lastClaimDate !== today;
  }

  static claimLoginReward(): {
    day: number;
    coins: number;
    powerUp?: keyof PowerUpInventory;
    qty?: number;
  } | null {
    const today = getTodayDateString();
    if (this.data.loginRewards.lastClaimDate === today) return null;

    let reward: {
      day: number;
      coins: number;
      powerUp?: keyof PowerUpInventory;
      qty?: number;
    } | null = null;

    this.save((draft) => {
      let nextDay = draft.loginRewards.currentDay;
      if (draft.loginRewards.claimedDays.length >= 7) {
        draft.loginRewards.claimedDays = [];
        nextDay = 1;
      } else {
        nextDay = Math.min(7, draft.loginRewards.claimedDays.length + 1);
      }

      draft.loginRewards.lastClaimDate = today;
      draft.loginRewards.currentDay = nextDay;
      draft.loginRewards.claimedDays.push(nextDay);
      draft.loginRewards.totalLogins += 1;
      draft.stats.loginDays += 1;

      let coins = 50;
      let powerUp: keyof PowerUpInventory | undefined = undefined;
      let qty: number | undefined = undefined;

      switch (nextDay) {
        case 1:
          coins = 50;
          break;
        case 2:
          coins = 60;
          powerUp = 'undo';
          qty = 1;
          break;
        case 3:
          coins = 80;
          powerUp = 'hint';
          qty = 1;
          break;
        case 4:
          coins = 100;
          powerUp = 'shuffle';
          qty = 1;
          break;
        case 5:
          coins = 150;
          powerUp = 'extraSlot';
          qty = 1;
          break;
        case 6:
          coins = 250;
          draft.powerups.undo += 1;
          draft.powerups.shuffle += 1;
          draft.powerups.hint += 1;
          draft.powerups.extraSlot += 1;
          break;
        case 7:
          coins = 500; // Maximum single reward in the game
          powerUp = 'extraSlot';
          qty = 2;
          break;
      }

      draft.coins += coins;
      draft.stats.totalCoinsEarned += coins;
      if (powerUp && qty) {
        draft.powerups[powerUp] += qty;
      }

      reward = { day: nextDay, coins, powerUp, qty };
    });

    return reward;
  }

  static recordLevelWin(
    levelId: number,
    stars: number,
    timeSec: number,
    discoveredMotifs: number[],
    meta?: { usedPowerUp?: boolean; beatParTime?: boolean }
  ): { coinsEarned: number; isFirstClear: boolean; isNewThreeStar: boolean; unlockedNewWorld: number | null } {
    const prev = this.data.completedLevels[levelId];
    const isFirstClear = !prev;
    const isNewThreeStar = stars === 3 && (!prev || prev.stars < 3);

    let coinsEarned = isFirstClear ? 30 : 5;
    if (stars === 3) coinsEarned += isNewThreeStar ? 25 : 10;
    else if (stars === 2) coinsEarned += 10;

    let unlockedNewWorld: number | null = null;

    this.save((draft) => {
      draft.completedLevels[levelId] = {
        stars: Math.max(prev?.stars || 0, stars),
        bestTimeSec: prev ? Math.min(prev.bestTimeSec, timeSec) : timeSec,
      };

      if (levelId >= draft.currentLevel && levelId < 250) {
        draft.currentLevel = levelId + 1;
      }

      // 5 levels per world, 50 worlds total
      const nextLevelWorld = Math.ceil((levelId + 1) / 5);
      if (nextLevelWorld <= 50 && !draft.unlockedWorlds.includes(nextLevelWorld)) {
        draft.unlockedWorlds.push(nextLevelWorld);
        if (!draft.unlockedBackgrounds.includes(String(nextLevelWorld))) {
          draft.unlockedBackgrounds.push(String(nextLevelWorld));
        }
        unlockedNewWorld = nextLevelWorld;
      }

      discoveredMotifs.forEach((m) => {
        if (!draft.discoveredTiles.includes(m)) {
          draft.discoveredTiles.push(m);
        }
      });

      draft.coins += coinsEarned;
      draft.stats.totalCoinsEarned += coinsEarned;
      if (!isFirstClear) {
        draft.stats.replaysCompleted += 1;
      }
      if (meta?.usedPowerUp) {
        draft.stats.powerupsUsed = draft.stats.powerupsUsed;
      } else {
        draft.stats.noPowerupWins += 1;
      }
      if (meta?.beatParTime) {
        draft.stats.perfectTimeWins += 1;
      }
    });

    // Progress daily tasks
    this.progressTask('task_win_levels', 1);
    if (stars === 3) {
      this.progressTask('task_stars', 1);
    }

    return { coinsEarned, isFirstClear, isNewThreeStar, unlockedNewWorld };
  }

  static recordDailyChallengeWin(): number {
    const today = getTodayDateString();
    let bonusCoins = 50;
    this.save((draft) => {
      if (draft.dailyChallenge.lastCompletedDate !== today) {
        draft.dailyChallenge.lastCompletedDate = today;
        draft.dailyChallenge.streak += 1;
        draft.dailyChallenge.totalChallengesWon += 1;
        draft.stats.dailyChallengesCompleted += 1;
        // Streak bonus scales up to the 500 coin cap
        bonusCoins = Math.min(500, 100 + draft.dailyChallenge.streak * 50);
      } else {
        bonusCoins = 5; // Minimum reward in the game
      }
      draft.coins += bonusCoins;
      draft.stats.totalCoinsEarned += bonusCoins;
    });
    this.progressTask('task_win_levels', 1);
    return bonusCoins;
  }

  /** Claims the 15/15-star "Perfect World" chest for a world. Returns coins or null. */
  static claimWorldChest(worldId: number): number | null {
    const [start, end] = [(worldId - 1) * 5 + 1, worldId * 5];
    let stars = 0;
    for (let lvl = start; lvl <= end; lvl++) stars += this.data.completedLevels[lvl]?.stars || 0;
    if (stars < 15) return null;
    const claimed = this.data.worldChestsClaimed || [];
    if (claimed.includes(worldId)) return null;

    // Scales gently with world number, capped at the 500 game-wide max
    const reward = Math.min(500, 60 + worldId * 8);
    this.save((draft) => {
      draft.worldChestsClaimed = [...(draft.worldChestsClaimed || []), worldId];
      draft.coins += reward;
      draft.stats.totalCoinsEarned += reward;
    });
    return reward;
  }

  static isWorldChestClaimable(worldId: number): boolean {
    const [start, end] = [(worldId - 1) * 5 + 1, worldId * 5];
    let stars = 0;
    for (let lvl = start; lvl <= end; lvl++) stars += this.data.completedLevels[lvl]?.stars || 0;
    return stars >= 15 && !(this.data.worldChestsClaimed || []).includes(worldId);
  }

  static exportSaveJSON(): string {
    return JSON.stringify(this.data, null, 2);
  }

  static importSaveJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed.coins !== 'number' || typeof parsed.currentLevel !== 'number') {
        return false;
      }
      const defaults = createDefaultSaveData();
      const today = getTodayDateString();

      // Reset any stale daily state so an old backup never shows yesterday's tasks
      const dailyTasks =
        parsed.dailyTasks && parsed.dailyTasks.date === today
          ? parsed.dailyTasks
          : { date: today, tasks: generateDailyTasks(today), allClaimedBonus: false };

      const clampInt = (v: unknown, min: number, max: number, fallback: number) => {
        const n = typeof v === 'number' && Number.isFinite(v) ? Math.floor(v) : fallback;
        return Math.max(min, Math.min(max, n));
      };

      this.data = {
        ...defaults,
        ...parsed,
        // Sanity-clamp scalar values so a corrupted/edited backup can't break the game
        coins: clampInt(parsed.coins, 0, 9_999_999, defaults.coins),
        currentLevel: clampInt(parsed.currentLevel, 1, 250, 1),
        powerups: {
          undo: clampInt(parsed.powerups?.undo, 0, 999, defaults.powerups.undo),
          shuffle: clampInt(parsed.powerups?.shuffle, 0, 999, defaults.powerups.shuffle),
          hint: clampInt(parsed.powerups?.hint, 0, 999, defaults.powerups.hint),
          extraSlot: clampInt(parsed.powerups?.extraSlot, 0, 999, defaults.powerups.extraSlot),
        },
        settings: { ...defaults.settings, ...(parsed.settings || {}) },
        stats: { ...defaults.stats, ...(parsed.stats || {}) },
        achievements: parsed.achievements && typeof parsed.achievements === 'object' ? parsed.achievements : {},
        dailyTasks,
        loginRewards: { ...defaults.loginRewards, ...(parsed.loginRewards || {}) },
        dailyChallenge: { ...defaults.dailyChallenge, ...(parsed.dailyChallenge || {}) },
        unlockedWorlds: Array.isArray(parsed.unlockedWorlds) && parsed.unlockedWorlds.length ? parsed.unlockedWorlds : [1],
        discoveredTiles: Array.from(new Set([...defaults.discoveredTiles, ...(Array.isArray(parsed.discoveredTiles) ? parsed.discoveredTiles : [])])),
        worldChestsClaimed: Array.isArray(parsed.worldChestsClaimed) ? parsed.worldChestsClaimed : [],
      };
      this.flush();
      this.notify();
      return true;
    } catch {
      return false;
    }
  }

  static resetProgress(): SaveData {
    this.data = createDefaultSaveData();
    this.flush();
    this.notify();
    return this.data;
  }
}

// Guarantee nothing is lost if the OS kills the WebView mid-session
if (typeof window !== 'undefined') {
  const flushNow = () => SaveSystem.flush();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flushNow();
  });
  window.addEventListener('pagehide', flushNow);
  window.addEventListener('beforeunload', flushNow);
}
