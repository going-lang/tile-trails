import { PowerUpInventory, SaveSystem } from './saveSystem';

export type PowerUpType = keyof PowerUpInventory;

/** Levels 1..5 are the tutorial: every power-up is free and unlimited there. */
export const TUTORIAL_FREE_MAX_LEVEL = 5;

export function isTutorialLevel(levelNumber: number, isDaily = false): boolean {
  return !isDaily && levelNumber >= 1 && levelNumber <= TUTORIAL_FREE_MAX_LEVEL;
}

export interface PowerUpMeta {
  id: PowerUpType;
  name: string;
  shortDesc: string;
  coinCost: number;
  accentColor: string;
}

export const POWER_UPS: Record<PowerUpType, PowerUpMeta> = {
  undo: {
    id: 'undo',
    name: 'Undo',
    shortDesc: 'Return the last tapped tile from the tray back to the board.',
    coinCost: 500,
    accentColor: '#3B82F6',
  },
  shuffle: {
    id: 'shuffle',
    name: 'Shuffle',
    shortDesc: 'Rearrange all remaining tiles on the board while keeping it solvable.',
    coinCost: 800,
    accentColor: '#8B5CF6',
  },
  hint: {
    id: 'hint',
    name: 'Hint',
    shortDesc: 'Highlight the smartest available tile to match right now.',
    coinCost: 650,
    accentColor: '#F59E0B',
  },
  extraSlot: {
    id: 'extraSlot',
    name: '+1 Slot',
    shortDesc: 'Expand the bottom tray from 5 slots to 6 slots for this level.',
    coinCost: 1200,
    accentColor: '#10B981',
  },
};

export class PowerUpManager {
  /**
   * After the tutorial, power-ups are strictly inventory-based.
   * When the starter supply is used up the player must buy more with coins.
   */
  static canUseOrBuy(type: PowerUpType): { hasStock: boolean; canAffordCoin: boolean; count: number; cost: number } {
    const save = SaveSystem.get();
    const count = save.powerups[type] || 0;
    const cost = POWER_UPS[type].coinCost;
    return {
      hasStock: count > 0,
      canAffordCoin: save.coins >= cost,
      count,
      cost,
    };
  }

  /** Consumes one unit from inventory only. Returns false when out of stock. */
  static consumePowerUp(type: PowerUpType): boolean {
    const count = SaveSystem.get().powerups[type] || 0;
    if (count <= 0) return false;
    SaveSystem.save((draft) => {
      draft.powerups[type] = Math.max(0, draft.powerups[type] - 1);
    });
    return true;
  }

  static hasStock(type: PowerUpType): boolean {
    return (SaveSystem.get().powerups[type] || 0) > 0;
  }

  /** Buys with coins (from the Shop or the in-level purchase prompt). */
  static purchase(type: PowerUpType, qty = 1): boolean {
    const save = SaveSystem.get();
    const cost = POWER_UPS[type].coinCost * qty;
    if (save.coins < cost) return false;
    SaveSystem.save((draft) => {
      draft.coins -= cost;
      draft.powerups[type] += qty;
    });
    return true;
  }
}
