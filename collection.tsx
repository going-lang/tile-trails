import React, { useState } from 'react';
import { audio } from './audio';
import { getT } from './i18n';
import { WORLDS } from './levels';
import { SaveData, SaveSystem, TileThemeId } from './saveSystem';
import { TILE_MOTIFS } from './tile';
import { PipMascot, TileMotifPreview } from './ui';

export const TILE_THEMES: Array<{
  id: TileThemeId;
  name: string;
  desc: string;
  coinPrice: number;
}> = [
  { id: 'classic', name: 'Warm Ivory & Wood', desc: 'Hand-carved birch wood rim with cream glaze.', coinPrice: 0 },
  { id: 'jade', name: 'Celadon Jade', desc: 'Soothing mint-emerald porcelain from Mystic Forest.', coinPrice: 1500 },
  { id: 'sakura', name: 'Sakura Blossom', desc: 'Soft petal-pink ceramic with rosewood trim.', coinPrice: 2400 },
  { id: 'starlight', name: 'Midnight Starlight', desc: 'Luminous lavender-indigo enamel from Cloud Kingdom.', coinPrice: 3800 },
];

// Mascot cosmetics removed - Pip now has a fixed appearance (explorer hat)
export const MASCOT_COSMETICS: Array<{
  id: string;
  name: string;
  desc: string;
  coinPrice: number;
}> = [];

export const CollectionModal: React.FC<{
  save: SaveData;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ save, onClose, onUpdate }) => {
  const t = getT(save.settings.language);
  const [tab, setTab] = useState<'tiles' | 'themes' | 'backgrounds'>('tiles');
  const [filterWorld, setFilterWorld] = useState<string>('all');

  const handleEquipTheme = (id: TileThemeId) => {
    audio.playButtonClick();
    SaveSystem.save((draft) => {
      draft.activeTileTheme = id;
    });
    onUpdate();
  };

  const handleEquipBg = (bgId: string) => {
    audio.playButtonClick();
    SaveSystem.save((draft) => {
      draft.activeBackground = bgId;
    });
    onUpdate();
  };

  const filteredMotifs =
    filterWorld === 'all'
      ? TILE_MOTIFS
      : TILE_MOTIFS.filter((m) => m.category.toLowerCase().includes(filterWorld.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-3">
      <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border-4 border-[#DEC8A8] shadow-2xl overflow-hidden animate-pop flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">📖 {t.collectionTitle}</h2>
            <p className="text-xs text-purple-100 font-semibold">{t.collectionSubtitle}</p>
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

        {/* Category Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#F3E5AB] p-1.5 border-b-2 border-[#DEC8A8]">
          {[
            { id: 'tiles' as const, label: t.tabFruits, icon: '🍎' },
            { id: 'themes' as const, label: t.tabStyle, icon: '🎨' },
            { id: 'backgrounds' as const, label: t.tabScenery, icon: '🏞️' },
          ].map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => {
                audio.playButtonClick();
                setTab(tabItem.id);
              }}
              className={`py-2 rounded-2xl font-bold text-xs flex flex-col items-center gap-0.5 transition ${
                tab === tabItem.id
                  ? 'bg-white text-[#3D2B1F] shadow-xs'
                  : 'text-[#6B513A] hover:bg-white/50'
              }`}
            >
              <span>{tabItem.icon}</span>
              <span>{tabItem.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto custom-scroll flex-1 space-y-3">
          {tab === 'tiles' && (
            <>
              <div className="flex items-center justify-between bg-amber-50 border-2 border-amber-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-amber-900">
                <span>{t.harvested}</span>
                <span>
                  {save.discoveredTiles.length} / {TILE_MOTIFS.length} {t.discovered}
                </span>
              </div>

              {/* World filter pills */}
              <div className="flex gap-1.5 overflow-x-auto custom-scroll pb-1">
                {[
                  { id: 'all', label: t.allFruits },
                  { id: 'Sunny Meadow', label: '🌼 Sunny Meadow' },
                  { id: 'Crystal Coast', label: '🐚 Crystal Coast' },
                  { id: 'Candy Valley', label: '🍬 Candy Valley' },
                  { id: 'Mystic Forest', label: '🌲 Mystic Forest' },
                  { id: 'Cloud Kingdom', label: '☁️ Cloud Kingdom' },
                  { id: 'Dino Island', label: '🦕 Dino Island' },
                  { id: 'Space Station', label: '🚀 Space Station' },
                ].map((world) => (
                  <button
                    key={world.id}
                    onClick={() => setFilterWorld(world.id)}
                    className={`px-3 py-1 rounded-xl font-bold text-xs whitespace-nowrap ${
                      filterWorld === world.id
                        ? 'bg-amber-400 text-white'
                        : 'bg-[#F7EFE0] text-[#6B513A] hover:bg-[#F3E5AB]'
                    }`}
                  >
                    {world.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {filteredMotifs.map((motif) => {
                  const isDiscovered = save.discoveredTiles.includes(motif.id);
                  return (
                    <div
                      key={motif.id}
                      className={`p-2 rounded-2xl border-2 flex flex-col items-center ${
                        isDiscovered
                          ? 'bg-[#FFFDF9] border-[#E6D5B8]'
                          : 'bg-slate-100 border-slate-200 opacity-60'
                      }`}
                    >
                      <TileMotifPreview motifId={motif.id} theme={save.activeTileTheme} size={56} />
                      <span className="font-display text-[10px] font-bold text-[#3D2B1F] mt-1.5 truncate w-full text-center">
                        {isDiscovered ? motif.name : '???'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {tab === 'themes' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center bg-gradient-to-b from-sky-100 to-emerald-100 rounded-2xl py-3 border-2 border-emerald-200">
                <PipMascot size={110} mood="cheering" />
              </div>

              {TILE_THEMES.map((theme) => {
                const isUnlocked = save.unlockedTileThemes.includes(theme.id);
                const isEquipped = save.activeTileTheme === theme.id;
                return (
                  <div
                    key={theme.id}
                    className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 ${
                      isEquipped
                        ? 'bg-emerald-50 border-emerald-400'
                        : 'bg-[#F7EFE0] border-[#E6D5B8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl border-2 border-[#DEC8A8] overflow-hidden">
                        <TileMotifPreview motifId={0} theme={theme.id} size={48} />
                      </div>
                      <div>
                        <div className="font-display font-bold text-base text-[#3D2B1F]">
                          {theme.name}
                        </div>
                        <p className="text-xs text-[#6B513A]">{theme.desc}</p>
                      </div>
                    </div>
                    {isEquipped ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shrink-0">
                        {t.equipped}
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => handleEquipTheme(theme.id)}
                        className="btn-tactile-green px-3.5 py-2 rounded-xl text-white font-bold text-xs shrink-0"
                      >
                        {t.equip}
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1.5 rounded-xl shrink-0">
                        {t.inShop} (🪙 {theme.coinPrice})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'backgrounds' && (
            <div className="space-y-2.5">
              <div
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between ${
                  save.activeBackground === 'auto'
                    ? 'bg-emerald-50 border-emerald-400'
                    : 'bg-[#F7EFE0] border-[#E6D5B8]'
                }`}
              >
                <div>
                  <div className="font-display font-bold text-sm text-[#3D2B1F]">
                    {t.matchWorld}
                  </div>
                  <p className="text-xs text-[#6B513A]">{t.matchWorldDesc}</p>
                </div>
                {save.activeBackground === 'auto' ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                    {t.active}
                  </span>
                ) : (
                  <button
                    onClick={() => handleEquipBg('auto')}
                    className="btn-tactile-green px-3.5 py-2 rounded-xl text-white font-bold text-xs"
                  >
                    {t.equip}
                  </button>
                )}
              </div>

              {WORLDS.slice(0, 20).map((world) => {
                const isUnlocked = save.unlockedWorlds.includes(world.id);
                const isEquipped = save.activeBackground === String(world.id);
                return (
                  <div
                    key={world.id}
                    className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 ${
                      isEquipped
                        ? 'bg-emerald-50 border-emerald-400'
                        : 'bg-[#F7EFE0] border-[#E6D5B8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{world.icon}</span>
                      <div>
                        <div className="font-display font-bold text-sm text-[#3D2B1F]">
                          {world.name}
                        </div>
                        <p className="text-xs text-[#6B513A]">{world.subtitle}</p>
                      </div>
                    </div>
                    {isEquipped ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shrink-0">
                        {t.active}
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => handleEquipBg(String(world.id))}
                        className="btn-tactile-green px-3.5 py-2 rounded-xl text-white font-bold text-xs shrink-0"
                      >
                        {t.equip}
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl shrink-0">
                        🔒
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
