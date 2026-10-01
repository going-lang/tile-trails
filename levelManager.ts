import { getDailyChallengeLevelConfig, getLevelConfig, LevelConfig, WORLDS, WorldDefinition } from './levels';
import { getTodayDateString, SaveSystem } from './saveSystem';

export class LevelManager {
  static getTotalLevels(): number {
    return 250;
  }

  static getWorlds(): WorldDefinition[] {
    return WORLDS;
  }

  static getWorldForLevel(levelNumber: number): WorldDefinition {
    const idx = Math.max(0, Math.min(WORLDS.length - 1, Math.ceil(levelNumber / 5) - 1));
    return WORLDS[idx];
  }

  static getLevel(levelNumber: number, isDaily = false): LevelConfig {
    if (isDaily) {
      return getDailyChallengeLevelConfig(getTodayDateString());
    }
    return getLevelConfig(levelNumber);
  }

  static isLevelUnlocked(levelNumber: number): boolean {
    const save = SaveSystem.get();
    return levelNumber <= save.currentLevel || Boolean(save.completedLevels[levelNumber]);
  }

  static calculateStars(levelConfig: LevelConfig, elapsedSec: number, usedReviveOrExtra: boolean): number {
    if (elapsedSec <= levelConfig.parTimeSec && !usedReviveOrExtra) {
      return 3;
    }
    if (elapsedSec <= levelConfig.parTimeSec * 1.6) {
      return 2;
    }
    return 1;
  }

  static getWorldStars(worldId: number): { earned: number; max: number; completedCount: number } {
    const world = WORLDS.find((w) => w.id === worldId) || WORLDS[0];
    const [start, end] = world.levelRange;
    const save = SaveSystem.get();

    let earned = 0;
    let completedCount = 0;
    for (let lvl = start; lvl <= end; lvl++) {
      const prog = save.completedLevels[lvl];
      if (prog) {
        earned += prog.stars;
        completedCount++;
      }
    }
    return {
      earned,
      max: (end - start + 1) * 3,
      completedCount,
    };
  }
}
