import { SaveData, SaveSystem } from './saveSystem';

export type StatKey =
  | 'levelsCompleted'
  | 'totalStars'
  | 'totalMatches'
  | 'maxCombo'
  | 'fruitsDiscovered'
  | 'worldsUnlocked'
  | 'powerupsUsed'
  | 'undoUsed'
  | 'shuffleUsed'
  | 'hintUsed'
  | 'extraSlotUsed'
  | 'dailyChallengesCompleted'
  | 'dailyTasksCompleted'
  | 'loginDays'
  | 'totalCoinsEarned'
  | 'threeStarLevels'
  | 'noPowerupWins'
  | 'perfectTimeWins'
  | 'cosmeticsOwned'
  | 'revivesUsed'
  | 'replaysCompleted'
  | 'trayAlmostFullWins';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  stat: StatKey;
  target: number;
  rewardCoins: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: 'levels' | 'matching' | 'fruit' | 'worlds' | 'power' | 'daily' | 'collection' | 'mastery';
}

/**
 * Coin reward bands (minimum 5, maximum 500 across the whole game):
 *   Bronze:   5 – 45
 *   Silver:  60 – 130
 *   Gold:   150 – 300
 *   Platinum: 500
 */
const ACHIEVEMENTS: AchievementDef[] = [
  // ===== LEVEL PROGRESS (8) =====
  { id: 'lvl_1', title: 'First Steps on the Trail', description: 'Complete your very first level.', icon: '🌱', stat: 'levelsCompleted', target: 1, rewardCoins: 5, tier: 'bronze', category: 'levels' },
  { id: 'lvl_5', title: 'Meadow Wanderer', description: 'Complete 5 levels in total.', icon: '🌿', stat: 'levelsCompleted', target: 5, rewardCoins: 15, tier: 'bronze', category: 'levels' },
  { id: 'lvl_15', title: 'Trail Explorer', description: 'Complete 15 levels in total.', icon: '🥾', stat: 'levelsCompleted', target: 15, rewardCoins: 25, tier: 'bronze', category: 'levels' },
  { id: 'lvl_40', title: 'Pathfinder', description: 'Complete 40 levels in total.', icon: '🧭', stat: 'levelsCompleted', target: 40, rewardCoins: 60, tier: 'silver', category: 'levels' },
  { id: 'lvl_80', title: 'Seasoned Hiker', description: 'Complete 80 levels in total.', icon: '⛰️', stat: 'levelsCompleted', target: 80, rewardCoins: 90, tier: 'silver', category: 'levels' },
  { id: 'lvl_140', title: 'Trail Veteran', description: 'Complete 140 levels in total.', icon: '🏅', stat: 'levelsCompleted', target: 140, rewardCoins: 150, tier: 'gold', category: 'levels' },
  { id: 'lvl_200', title: 'Grand Expedition', description: 'Complete 200 levels in total.', icon: '🎖️', stat: 'levelsCompleted', target: 200, rewardCoins: 220, tier: 'gold', category: 'levels' },
  { id: 'lvl_250', title: 'Tile Trails Champion', description: 'Complete all 250 levels across 50 worlds!', icon: '🏆', stat: 'levelsCompleted', target: 250, rewardCoins: 500, tier: 'platinum', category: 'levels' },

  // ===== STAR HARVESTING (6) =====
  { id: 'star_10', title: 'Star Gatherer', description: 'Collect 10 golden stars.', icon: '⭐', stat: 'totalStars', target: 10, rewardCoins: 10, tier: 'bronze', category: 'collection' },
  { id: 'star_40', title: 'Star Collector', description: 'Collect 40 golden stars.', icon: '🌟', stat: 'totalStars', target: 40, rewardCoins: 30, tier: 'bronze', category: 'collection' },
  { id: 'star_100', title: 'Constellation Keeper', description: 'Collect 100 golden stars.', icon: '✨', stat: 'totalStars', target: 100, rewardCoins: 70, tier: 'silver', category: 'collection' },
  { id: 'star_200', title: 'Starlight Sovereign', description: 'Collect 200 golden stars.', icon: '💫', stat: 'totalStars', target: 200, rewardCoins: 150, tier: 'gold', category: 'collection' },
  { id: 'star_450', title: 'Galaxy of Stars', description: 'Collect 450 golden stars.', icon: '🌌', stat: 'totalStars', target: 450, rewardCoins: 250, tier: 'gold', category: 'collection' },
  { id: 'star_750', title: 'Perfect Star Master', description: 'Collect all 750 golden stars!', icon: '🌠', stat: 'totalStars', target: 750, rewardCoins: 500, tier: 'platinum', category: 'collection' },

  // ===== MATCHING SKILL (7) =====
  { id: 'match_25', title: 'Fruit Matcher', description: 'Match 25 fruit tile sets.', icon: '🍎', stat: 'totalMatches', target: 25, rewardCoins: 8, tier: 'bronze', category: 'matching' },
  { id: 'match_150', title: 'Harvest Helper', description: 'Match 150 fruit tile sets.', icon: '🧺', stat: 'totalMatches', target: 150, rewardCoins: 25, tier: 'bronze', category: 'matching' },
  { id: 'match_600', title: 'Orchard Expert', description: 'Match 600 fruit tile sets.', icon: '🍐', stat: 'totalMatches', target: 600, rewardCoins: 65, tier: 'silver', category: 'matching' },
  { id: 'match_1500', title: 'Fruit Tycoon', description: 'Match 1,500 fruit tile sets.', icon: '🍇', stat: 'totalMatches', target: 1500, rewardCoins: 140, tier: 'gold', category: 'matching' },
  { id: 'combo_3', title: 'Combo Starter', description: 'Reach a 3x fruit combo chain.', icon: '🔥', stat: 'maxCombo', target: 3, rewardCoins: 20, tier: 'bronze', category: 'matching' },
  { id: 'combo_6', title: 'Chain Reaction', description: 'Reach a 6x fruit combo chain.', icon: '⚡', stat: 'maxCombo', target: 6, rewardCoins: 80, tier: 'silver', category: 'matching' },
  { id: 'combo_10', title: 'Unstoppable Flow', description: 'Reach a 10x fruit combo chain!', icon: '🌪️', stat: 'maxCombo', target: 10, rewardCoins: 180, tier: 'gold', category: 'matching' },

  // ===== FRUIT DISCOVERY (5) =====
  { id: 'fruit_12', title: 'Curious Taster', description: 'Discover 12 different fruits.', icon: '🍒', stat: 'fruitsDiscovered', target: 12, rewardCoins: 12, tier: 'bronze', category: 'fruit' },
  { id: 'fruit_25', title: 'Fruit Connoisseur', description: 'Discover 25 different fruits.', icon: '🍑', stat: 'fruitsDiscovered', target: 25, rewardCoins: 35, tier: 'bronze', category: 'fruit' },
  { id: 'fruit_40', title: 'Grove Explorer', description: 'Discover 40 different fruits.', icon: '🥭', stat: 'fruitsDiscovered', target: 40, rewardCoins: 85, tier: 'silver', category: 'fruit' },
  { id: 'fruit_55', title: 'Tropical Botanist', description: 'Discover 55 different fruits.', icon: '🥝', stat: 'fruitsDiscovered', target: 55, rewardCoins: 200, tier: 'gold', category: 'fruit' },
  { id: 'fruit_60', title: 'Complete Fruit Almanac', description: 'Discover all 60 juicy fruits!', icon: '📚', stat: 'fruitsDiscovered', target: 60, rewardCoins: 500, tier: 'platinum', category: 'fruit' },

  // ===== WORLD EXPLORATION (5) =====
  { id: 'world_3', title: 'Village Wanderer', description: 'Unlock 3 scenic worlds.', icon: '🏡', stat: 'worldsUnlocked', target: 3, rewardCoins: 18, tier: 'bronze', category: 'worlds' },
  { id: 'world_8', title: 'Cartographer', description: 'Unlock 8 scenic worlds.', icon: '🗺️', stat: 'worldsUnlocked', target: 8, rewardCoins: 40, tier: 'bronze', category: 'worlds' },
  { id: 'world_18', title: 'World Voyager', description: 'Unlock 18 scenic worlds.', icon: '🧳', stat: 'worldsUnlocked', target: 18, rewardCoins: 95, tier: 'silver', category: 'worlds' },
  { id: 'world_32', title: 'Dimension Drifter', description: 'Unlock 32 scenic worlds.', icon: '🌀', stat: 'worldsUnlocked', target: 32, rewardCoins: 210, tier: 'gold', category: 'worlds' },
  { id: 'world_50', title: 'Master of All Realms', description: 'Unlock all 50 beautiful worlds!', icon: '👑', stat: 'worldsUnlocked', target: 50, rewardCoins: 500, tier: 'platinum', category: 'worlds' },

  // ===== POWER-UP USAGE (5) =====
  { id: 'power_5', title: 'Tool Beginner', description: 'Use 5 power-ups in puzzles.', icon: '🔧', stat: 'powerupsUsed', target: 5, rewardCoins: 15, tier: 'bronze', category: 'power' },
  { id: 'power_30', title: 'Power Apprentice', description: 'Use 30 power-ups in puzzles.', icon: '🛠️', stat: 'powerupsUsed', target: 30, rewardCoins: 75, tier: 'silver', category: 'power' },
  { id: 'power_100', title: 'Power Grandmaster', description: 'Use 100 power-ups in puzzles.', icon: '⚗️', stat: 'powerupsUsed', target: 100, rewardCoins: 170, tier: 'gold', category: 'power' },
  { id: 'hint_15', title: 'Bright Ideas', description: 'Activate 15 Hint power-ups.', icon: '💡', stat: 'hintUsed', target: 15, rewardCoins: 60, tier: 'silver', category: 'power' },
  { id: 'shuffle_15', title: 'Deck Shuffler', description: 'Activate 15 Shuffle power-ups.', icon: '🔀', stat: 'shuffleUsed', target: 15, rewardCoins: 60, tier: 'silver', category: 'power' },

  // ===== DAILY COMMITMENT (6) =====
  { id: 'daily_1', title: 'Daily Explorer', description: 'Complete your first Daily Trail.', icon: '📅', stat: 'dailyChallengesCompleted', target: 1, rewardCoins: 20, tier: 'bronze', category: 'daily' },
  { id: 'daily_7', title: 'Week of Trails', description: 'Complete 7 Daily Trail challenges.', icon: '🗓️', stat: 'dailyChallengesCompleted', target: 7, rewardCoins: 90, tier: 'silver', category: 'daily' },
  { id: 'daily_30', title: 'Dedicated Daily Devotee', description: 'Complete 30 Daily Trail challenges.', icon: '📆', stat: 'dailyChallengesCompleted', target: 30, rewardCoins: 240, tier: 'gold', category: 'daily' },
  { id: 'task_10', title: 'Task Tracker', description: 'Complete 10 daily tasks.', icon: '📋', stat: 'dailyTasksCompleted', target: 10, rewardCoins: 45, tier: 'bronze', category: 'daily' },
  { id: 'task_50', title: 'Mission Master', description: 'Complete 50 daily tasks.', icon: '✅', stat: 'dailyTasksCompleted', target: 50, rewardCoins: 160, tier: 'gold', category: 'daily' },
  { id: 'login_7', title: 'Faithful Friend', description: 'Claim login gifts on 7 separate days.', icon: '🎁', stat: 'loginDays', target: 7, rewardCoins: 100, tier: 'silver', category: 'daily' },

  // ===== WEALTH & MASTERY (6) =====
  { id: 'coins_500', title: 'Coin Saver', description: 'Earn 500 coins in total.', icon: '🪙', stat: 'totalCoinsEarned', target: 500, rewardCoins: 25, tier: 'bronze', category: 'mastery' },
  { id: 'coins_2500', title: 'Coin Hoarder', description: 'Earn 2,500 coins in total.', icon: '💰', stat: 'totalCoinsEarned', target: 2500, rewardCoins: 110, tier: 'silver', category: 'mastery' },
  { id: 'coins_10000', title: 'Trail Treasure Baron', description: 'Earn 10,000 coins in total.', icon: '💎', stat: 'totalCoinsEarned', target: 10000, rewardCoins: 300, tier: 'gold', category: 'mastery' },
  { id: 'threestar_15', title: 'Three-Star Stylist', description: 'Earn 3 stars on 15 levels.', icon: '🌟', stat: 'threeStarLevels', target: 15, rewardCoins: 120, tier: 'silver', category: 'mastery' },
  { id: 'pure_10', title: 'Pure Skill', description: 'Win 10 levels without any power-ups.', icon: '🧠', stat: 'noPowerupWins', target: 10, rewardCoins: 130, tier: 'silver', category: 'mastery' },
  { id: 'pure_40', title: 'Unassisted Genius', description: 'Win 40 levels without any power-ups.', icon: '🦉', stat: 'noPowerupWins', target: 40, rewardCoins: 260, tier: 'gold', category: 'mastery' },
];

export { ACHIEVEMENTS };

export const ACHIEVEMENT_TOTAL = ACHIEVEMENTS.length;

export const TIER_STYLES: Record<AchievementDef['tier'], { label: string; ring: string; bg: string; text: string }> = {
  bronze: { label: 'Bronze', ring: 'border-amber-600/60', bg: 'from-amber-100 to-amber-200', text: 'text-amber-900' },
  silver: { label: 'Silver', ring: 'border-slate-400/70', bg: 'from-slate-100 to-slate-200', text: 'text-slate-800' },
  gold: { label: 'Gold', ring: 'border-yellow-500/70', bg: 'from-yellow-100 to-amber-200', text: 'text-yellow-900' },
  platinum: { label: 'Platinum', ring: 'border-cyan-400/70', bg: 'from-cyan-100 to-indigo-200', text: 'text-indigo-900' },
};

export interface AchievementRuntime extends AchievementDef {
  current: number;
  progressPct: number;
  completed: boolean;
  claimed: boolean;
}

export function buildAchievementList(save: SaveData): AchievementRuntime[] {
  return ACHIEVEMENTS.map((def) => {
    const state = save.achievements[def.id];
    const current = Math.min(def.target, save.stats[def.stat] ?? 0);
    return {
      ...def,
      current,
      progressPct: Math.min(100, (current / def.target) * 100),
      completed: current >= def.target,
      claimed: Boolean(state?.claimed),
    };
  });
}

export function getAchievementById(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * Re-evaluates every achievement against current save stats.
 * Returns the list of achievement IDs that just became claimable.
 */
export function refreshAchievements(): string[] {
  const newlyCompleted: string[] = [];

  SaveSystem.save((draft) => {
    ACHIEVEMENTS.forEach((def) => {
      const current = Math.min(def.target, draft.stats[def.stat] ?? 0);
      const existing = draft.achievements[def.id];
      if (!existing) {
        draft.achievements[def.id] = { current, claimed: false };
      } else {
        existing.current = current;
      }
      if (current >= def.target && !(existing?.completed)) {
        if (!existing) {
          draft.achievements[def.id] = { current, claimed: false, completed: true };
        } else {
          existing.completed = true;
        }
        newlyCompleted.push(def.id);
      }
    });
  });

  return newlyCompleted;
}

export function claimAchievementReward(id: string): { coins: number; title: string } | null {
  const def = getAchievementById(id);
  if (!def) return null;

  let result: { coins: number; title: string } | null = null;
  SaveSystem.save((draft) => {
    const state = draft.achievements[id];
    if (state && state.current >= def.target && !state.claimed) {
      state.claimed = true;
      state.completed = true;
      draft.coins += def.rewardCoins;
      result = { coins: def.rewardCoins, title: def.title };
    }
  });
  return result;
}

export function countUnclaimedAchievements(): number {
  const save = SaveSystem.get();
  return ACHIEVEMENTS.filter((def) => {
    const state = save.achievements[def.id];
    return state && state.current >= def.target && !state.claimed;
  }).length;
}
