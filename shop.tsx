import React, { useState } from 'react';
import { audio } from './audio';
import { TILE_THEMES } from './collection';
import { WORLDS } from './levels';
import { POWER_UPS, PowerUpType } from './powerups';
import {
  getTodayDateString,
  SaveData,
  SaveSystem,
  TileThemeId,
} from './saveSystem';
import { PowerUpButtonArt } from './buttonArt';
import { getT } from './i18n';
import { TileMotifPreview } from './ui';

export const ShopModal: React.FC<{
  save: SaveData;
  onClose: () => void;
  onPurchaseSuccess: () => void;
}> = ({ save, onClose, onPurchaseSuccess }) => {
  const t = getT(save.settings.language);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);
  const today = getTodayDateString();
  const claimedDailyGift = save.dailyChallenge.lastDailyGiftDate === today;

  const showToast = (msg: string) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(null), 2800);
  };

  const handleClaimDailyCoins = () => {
    if (claimedDailyGift) return;
    audio.playCoinReward();
    SaveSystem.save((draft) => {
      draft.coins += 500; // Maximum single reward in the game
      draft.stats.totalCoinsEarned += 500;
      draft.dailyChallenge.lastDailyGiftDate = today;
    });
    showToast('🎁 Claimed +500 Daily Trail Coins!');
    onPurchaseSuccess();
  };

  const handleBuyPowerUp = (type: PowerUpType, qty: number, cost: number) => {
    if (save.coins < cost) {
      audio.playBlockedTap();
      showToast(`Need 🪙 ${cost} — the free supply is gone once used!`);
      return;
    }
    audio.playCoinReward();
    SaveSystem.save((draft) => {
      draft.coins -= cost;
      draft.powerups[type] += qty;
    });
    showToast(`Purchased +${qty} ${POWER_UPS[type].name}!`);
    onPurchaseSuccess();
  };

  const handleBuyPowerUpBundle = () => {
    const cost = 2800;
    if (save.coins < cost) {
      audio.playBlockedTap();
      showToast('Not enough coins for the Explorer Bundle!');
      return;
    }
    audio.playCoinReward();
    SaveSystem.save((draft) => {
      draft.coins -= cost;
      draft.powerups.undo += 1;
      draft.powerups.shuffle += 1;
      draft.powerups.hint += 1;
      draft.powerups.extraSlot += 1;
    });
    showToast('🎒 Explorer Bundle (+1 of all 4 Power-Ups) added!');
    onPurchaseSuccess();
  };

  const handleBuyTileTheme = (themeId: TileThemeId, price: number, name: string) => {
    if (save.unlockedTileThemes.includes(themeId)) return;
    if (save.coins < price) {
      audio.playBlockedTap();
      showToast('Need more coins to unlock this premium Tile Theme!');
      return;
    }
    audio.playCoinReward();
    SaveSystem.save((draft) => {
      draft.coins -= price;
      draft.unlockedTileThemes.push(themeId);
      draft.activeTileTheme = themeId;
    });
    showToast(`🎨 Unlocked & Equipped ${name}!`);
    onPurchaseSuccess();
  };

  const handleBuyWorldBg = (worldId: number, price: number, name: string) => {
    const key = String(worldId);
    if (save.unlockedBackgrounds.includes(key)) return;
    if (save.coins < price) {
      audio.playBlockedTap();
      showToast('Need more coins to unlock this World Scenery early!');
      return;
    }
    audio.playCoinReward();
    SaveSystem.save((draft) => {
      draft.coins -= price;
      draft.unlockedBackgrounds.push(key);
      draft.activeBackground = key;
    });
    showToast(`🏞️ Unlocked & Equipped ${name} Scenery!`);
    onPurchaseSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-3">
      <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border-4 border-[#DEC8A8] shadow-2xl overflow-hidden animate-pop flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">🏪 {t.shopTitle}</h2>
            <p className="text-xs text-amber-100 font-semibold">
              {t.shopSubtitle} (🪙 500 – 5,000)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-amber-950/35 px-3 py-1 rounded-full text-white font-mono-num text-sm font-bold flex items-center gap-1">
              <span>🪙</span>
              <span>{save.coins}</span>
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
        </div>

        {/* Scrollable Shop Shelves */}
        <div className="p-4 overflow-y-auto custom-scroll space-y-5 text-[#3D2B1F]">
          {bannerMsg && (
            <div className="bg-emerald-100 border-2 border-emerald-400 text-emerald-900 px-3.5 py-2 rounded-2xl text-xs font-bold text-center">
              {bannerMsg}
            </div>
          )}

          {/* Section 1: Coin Packs (Free In-Game Supply Chests) */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#8C6D4F] mb-2">
              🪙 Daily Coin Gift
            </h3>
            <div
              className={`rounded-2xl border-2 p-3.5 flex items-center gap-3.5 ${
                claimedDailyGift
                  ? 'bg-slate-50 border-slate-300 opacity-75'
                  : 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 border-amber-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-2xl shrink-0 ${
                  claimedDailyGift ? 'bg-slate-200 border-slate-300' : 'bg-amber-200 border-amber-400'
                }`}
              >
                {claimedDailyGift ? '📭' : '🎁'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-sm text-[#3D2B1F]">Daily Trail Gift</div>
                <p className="text-[11px] text-[#6B513A]">+500 bonus coins once per day</p>
              </div>
              <button
                disabled={claimedDailyGift}
                onClick={handleClaimDailyCoins}
                className={`shrink-0 px-4 py-2 rounded-xl font-bold text-xs ${
                  claimedDailyGift ? 'bg-slate-200 text-slate-500' : 'btn-tactile-green text-white'
                }`}
              >
                {claimedDailyGift ? 'Claimed' : 'FREE +500 🪙'}
              </button>
            </div>
          </div>

          {/* Section 2: Power-Up Packs (500 to 2800) */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#8C6D4F] mb-2">
              ⚡ Power-Up Supplies (500 – 2,800 Coins)
            </h3>
            <p className="text-[11px] font-semibold text-[#8C6D4F] mb-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              ℹ️ Power-ups are one-time use. Once your free supply runs out, you must buy more here —
              they are never granted again for free.
            </p>

            {/* All-in-One Bundle */}
            <div className="mb-2.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <div className="font-display font-bold text-sm text-purple-950">
                  🎒 All-In-One Explorer Pack
                </div>
                <p className="text-xs text-purple-800">
                  +1 Undo, +1 Shuffle, +1 Hint & +1 Extra Slot
                </p>
              </div>
              <button
                onClick={handleBuyPowerUpBundle}
                className="btn-tactile-amber px-3.5 py-2 rounded-xl text-white font-bold text-xs shrink-0"
              >
                🪙 2,800
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {(['undo', 'shuffle', 'hint', 'extraSlot'] as PowerUpType[]).map((type) => {
                const meta = POWER_UPS[type];
                const owned = save.powerups[type];
                return (
                  <div
                    key={type}
                    className={`border-2 rounded-2xl p-3 flex flex-col justify-between ${
                      owned > 0
                        ? 'bg-[#F7EFE0] border-[#E6D5B8]'
                        : 'bg-rose-50 border-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Glossy SVG button asset */}
                      <PowerUpButtonArt type={type} size={44} />
                      <div className="min-w-0">
                        <div className="font-display font-bold text-sm">{t[type]}</div>
                        <div
                          className={`text-[11px] font-bold ${
                            owned > 0 ? 'text-[#8C6D4F]' : 'text-rose-700'
                          }`}
                        >
                          {owned > 0 ? `${t.owned}: ${owned}` : t.none}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuyPowerUp(type, 1, meta.coinCost)}
                      className={`mt-2.5 w-full py-1.5 rounded-xl text-white font-bold text-xs ${
                        owned > 0 ? 'btn-tactile-green' : 'btn-tactile-amber'
                      }`}
                    >
                      {t.buy} +1 (🪙 {meta.coinCost})
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Cosmetic Tile Themes (1500 to 5000) */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#8C6D4F] mb-2">
              🎨 Premium Tile Themes (1,500 – 5,000 Coins)
            </h3>
            <div className="space-y-2">
              {TILE_THEMES.filter((t) => t.coinPrice > 0).map((theme) => {
                const unlocked = save.unlockedTileThemes.includes(theme.id);
                return (
                  <div
                    key={theme.id}
                    className="bg-[#F7EFE0] border-2 border-[#E6D5B8] rounded-2xl p-3 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <TileMotifPreview motifId={0} theme={theme.id} size={48} />
                      <div>
                        <div className="font-display font-bold text-sm">{theme.name}</div>
                        <p className="text-[11px] text-[#6B513A]">{theme.desc}</p>
                      </div>
                    </div>
                    {unlocked ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0">
                        Unlocked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuyTileTheme(theme.id, theme.coinPrice, theme.name)}
                        className="btn-tactile-amber px-3.5 py-2 rounded-xl text-white font-bold text-xs shrink-0"
                      >
                        🪙 {theme.coinPrice}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: World Backgrounds (800 to 5000) */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#8C6D4F] mb-2">
              🏞️ World Scenery (800 – 5,000 Coins)
            </h3>
            <div className="space-y-2">
              {WORLDS.slice(1, 12).map((w) => {
                const key = String(w.id);
                const unlocked = save.unlockedBackgrounds.includes(key) || save.unlockedWorlds.includes(w.id);
                const price = Math.min(5000, 800 + w.id * 350);
                return (
                  <div
                    key={w.id}
                    className="bg-[#F7EFE0] border-2 border-[#E6D5B8] rounded-2xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{w.icon}</span>
                      <div>
                        <div className="font-display font-bold text-sm">{w.name} Backdrop</div>
                        <p className="text-[11px] text-[#6B513A]">Unlock 2D scenery for any level</p>
                      </div>
                    </div>
                    {unlocked ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                        Unlocked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuyWorldBg(w.id, price, w.name)}
                        className="btn-tactile-amber px-3.5 py-2 rounded-xl text-white font-bold text-xs"
                      >
                        🪙 {price}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
