import React from 'react';
import { X, Award, Sparkles } from 'lucide-react';
import { UserProfile } from '../types/game';
import { WEEKLY_COSMETIC_BADGES, toggleEquipBadge, getBadgeById } from '../utils/badges';
import { sound } from '../utils/sound';

interface BadgesModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  completedThisWeek: number;
  isInline?: boolean;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen = true,
  onClose,
  profile,
  onUpdateProfile,
  completedThisWeek,
  isInline = false,
}) => {
  if (!isOpen && !isInline) return null;

  const handleToggleEquip = (badgeId: string) => {
    if (profile.activeBadge === badgeId) {
      sound.playPop(0.4);
    } else {
      sound.playBadgeReward();
    }
    const updated = toggleEquipBadge(profile, badgeId);
    onUpdateProfile(updated);
  };

  const activeBadge = getBadgeById(profile.activeBadge);

  const content = (
    <div className={`w-full max-w-md mx-auto ${isInline ? 'pb-24 pt-4 px-4 text-stone-900 flex flex-col' : 'max-h-[86vh] flex flex-col bg-white rounded-3xl shadow-xl border border-stone-200/90 text-stone-900 overflow-hidden'}`}>
      {/* Modal Header */}
      <div className="flex items-center justify-between p-4 pb-3 border-b border-stone-100 bg-stone-50/50 rounded-t-3xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
            <Award className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-bold text-stone-900">Collectible Badges</h2>
            <p className="text-[10px] text-stone-500">
              Unlock via Weekly Daily Quests
            </p>
          </div>
        </div>
        {!isInline && onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-500 flex items-center justify-center transition-all active:scale-95"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Active Badge Status Banner */}
      <div className="px-4 py-2.5 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-lg shadow-2xs">
            {activeBadge ? activeBadge.emoji : '👤'}
          </div>
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-wider font-semibold text-stone-400 block">
              Current Avatar
            </span>
            <span className="text-xs font-bold text-stone-900">
              {activeBadge ? activeBadge.name : 'None Equipped'}
            </span>
          </div>
        </div>
        {activeBadge && (
          <button
            onClick={() => handleToggleEquip(activeBadge.id)}
            className="text-[10px] font-semibold text-rose-600 hover:underline px-2 py-0.5"
          >
            Unequip
          </button>
        )}
      </div>

      {/* Badge List */}
      <div className={`p-3.5 space-y-2.5 overflow-y-auto flex-1 ${isInline ? 'max-h-[60vh]' : ''}`}>
        <div className="text-[10px] font-semibold text-stone-400 flex items-center justify-between px-1">
          <span>This Week: {completedThisWeek}/7 Daily Quests</span>
          <span>{profile.unlockedBadges.length} / {WEEKLY_COSMETIC_BADGES.length} Collected</span>
        </div>

        {WEEKLY_COSMETIC_BADGES.map((badge) => {
          const isUnlocked = profile.unlockedBadges.includes(badge.id);
          const isEquipped = profile.activeBadge === badge.id;
          const progress = Math.min(completedThisWeek, badge.requiredDays);

          return (
            <div
              key={badge.id}
              className={`p-2.5 rounded-2xl border transition-all flex items-center gap-2.5 ${
                isEquipped
                  ? 'bg-indigo-50/50 border-indigo-300 shadow-2xs'
                  : isUnlocked
                  ? 'bg-white border-stone-200/80 hover:border-amber-400'
                  : 'bg-stone-50 border-dashed border-stone-200 opacity-70'
              }`}
            >
              {/* Badge Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 relative ${
                  isUnlocked
                    ? `bg-gradient-to-br ${badge.gradient} text-white shadow-2xs`
                    : 'bg-stone-200 grayscale opacity-40'
                }`}
              >
                <span>{badge.emoji}</span>
                {isEquipped && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[8px] font-bold">
                    ✓
                  </span>
                )}
              </div>

              {/* Badge Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs font-bold text-stone-900 truncate">
                    {badge.name}
                  </h3>
                  <span
                    className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full border ${badge.borderClass} ${badge.textClass}`}
                  >
                    {badge.tag}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 leading-tight mt-0.5">
                  {badge.description}
                </p>

                {/* Progress tracker if locked */}
                {!isUnlocked && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <div className="w-1/2 h-1 rounded-full bg-stone-200 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{
                          width: `${(progress / badge.requiredDays) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-semibold text-stone-400 font-mono-numbers">
                      {progress}/{badge.requiredDays}d
                    </span>
                  </div>
                )}
              </div>

              {/* Action button */}
              <div className="shrink-0">
                {isUnlocked ? (
                  <button
                    onClick={() => handleToggleEquip(badge.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                      isEquipped
                        ? 'bg-indigo-600 text-white'
                        : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
                    }`}
                  >
                    {isEquipped ? 'Equipped' : 'Equip'}
                  </button>
                ) : (
                  <span className="text-[10px] font-semibold text-stone-400 px-1">
                    Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer tip */}
      <div className="p-2.5 bg-stone-50 border-t border-stone-100 text-center rounded-b-3xl">
        <p className="text-[10px] text-stone-500 flex items-center justify-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Equipped badge displays on your header & profile</span>
        </p>
      </div>
    </div>
  );

  if (isInline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      {content}
    </div>
  );
};
