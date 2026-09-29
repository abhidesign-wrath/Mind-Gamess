import React from 'react';
import { X, Flame, Trophy, Award } from 'lucide-react';
import { UserProfile } from '../types/game';
import { TOTAL_LEVELS } from '../utils/puzzleGenerator';
import { getBadgeById, WEEKLY_COSMETIC_BADGES } from '../utils/badges';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  if (!isOpen) return null;

  const completedCount = Object.keys(profile.completedLevels).length;
  const totalStars = Object.values(profile.completedLevels).reduce((a, b) => a + (b.stars || 1), 0);
  const totalDailyCompleted = Object.keys(profile.dailyHistory).length;
  const activeBadge = getBadgeById(profile.activeBadge);
  const unlockedBadgesCount = profile.unlockedBadges?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-stone-200/90 text-stone-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-stone-900">Your Records</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-500 flex items-center justify-center transition-all active:scale-95"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 my-4 text-center">
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
            <span className="block text-xl font-extrabold text-emerald-600 font-mono-numbers">
              {completedCount}
            </span>
            <span className="text-[10px] text-stone-500 font-semibold">
              Levels Clear
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
            <span className="block text-xl font-extrabold text-amber-500 font-mono-numbers">
              {totalStars}
            </span>
            <span className="text-[10px] text-stone-500 font-semibold">
              Stars ⭐
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
            <span className="block text-xl font-extrabold text-indigo-600 font-mono-numbers">
              {profile.highestUnlockedLevel || 1}
            </span>
            <span className="text-[10px] text-stone-500 font-semibold">
              Max Level
            </span>
          </div>
        </div>

        {/* Daily Streak Card */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-200/60 mb-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Flame className="w-4 h-4 fill-white text-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  {profile.currentStreak} Day Streak
                </span>
                <span className="text-[11px] text-stone-500">
                  Best: {profile.longestStreak} days
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-600 font-mono-numbers">
              {totalDailyCompleted} Quests
            </span>
          </div>
        </div>

        {/* Cosmetic Badges Card */}
        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60 mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-lg shadow-2xs">
              {activeBadge ? activeBadge.emoji : <Award className="w-4 h-4 text-amber-500" />}
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 block">
                {activeBadge ? activeBadge.name : 'No Badge Equipped'}
              </span>
              <span className="text-[10px] text-stone-400">
                {unlockedBadgesCount} / {WEEKLY_COSMETIC_BADGES.length} Badges Unlocked
              </span>
            </div>
          </div>
          {activeBadge && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              {activeBadge.tag}
            </span>
          )}
        </div>

        {/* Adventure Progress Bar */}
        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1.5">
            <span>Overall Progress</span>
            <span className="font-mono-numbers">{Math.round((completedCount / TOTAL_LEVELS) * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, Math.round((completedCount / TOTAL_LEVELS) * 100))}%` }}
            />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-tactile w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};
