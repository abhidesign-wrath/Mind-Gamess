import React, { useState } from 'react';
import {
  Play,
  Flame,
  Calendar,
  Gift,
  ChevronRight,
  Compass,
  Map as MapIcon,
} from 'lucide-react';
import { UserProfile, PuzzleDifficulty } from '../types/game';
import { getLocalDateString } from '../utils/storage';
import { TOTAL_LEVELS, getLevelDifficultyInfo } from '../utils/puzzleGenerator';
import { FloatingAmbience } from './FloatingAmbience';
import { BadgesModal } from './BadgesModal';
import { getBadgeById } from '../utils/badges';
import { sound } from '../utils/sound';
import { AdventureCartoonMap } from './AdventureCartoonMap';

interface HomeScreenProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onPlayLevel: (levelNumber: number) => void;
  onNewGame: () => void;
  onStartDaily: () => void;
  onStartPractice: (diff: PuzzleDifficulty) => void;
  onOpenStats: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onUpdateProfile,
  onPlayLevel,
  onNewGame,
  onStartDaily,
  onStartPractice,
  onOpenRules,
}) => {
  const [lockedToast, setLockedToast] = useState<string | null>(null);
  const [badgesModalOpen, setBadgesModalOpen] = useState<boolean>(false);

  const todayStr = getLocalDateString();
  const isTodayDailyCompleted = Boolean(profile.dailyHistory[todayStr]);

  const highestUnlocked = Math.min(profile.highestUnlockedLevel || 1, TOTAL_LEVELS);
  const targetLevel = Math.min(Math.max(profile.currentLevel || highestUnlocked, 1), TOTAL_LEVELS);
  const hasSavedTarget = Boolean(profile.savedGame && profile.savedGame.puzzle.levelNumber === targetLevel);
  const targetDiffInfo = getLevelDifficultyInfo(targetLevel);

  // Compute 7 days for the streak
  const getWeekDays = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);

    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const isPast = iso < todayStr;
      const isToday = iso === todayStr;
      const isCompleted = Boolean(profile.dailyHistory[iso]);

      days.push({
        label: labels[i],
        iso,
        isPast,
        isToday,
        isCompleted,
      });
    }
    return days;
  };

  const weekDays = getWeekDays();
  const completedThisWeek = weekDays.filter((d) => d.isCompleted).length;
  const activeBadge = getBadgeById(profile.activeBadge);

  const handleLockedClick = (lvl: number) => {
    sound.playInvalid();
    setLockedToast(`Reach Level ${lvl - 1} first! 🐾`);
    setTimeout(() => setLockedToast(null), 2000);
  };

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] pb-24 text-stone-900 select-none">
      <FloatingAmbience variant="home" />

      {/* Toast */}
      {lockedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-stone-900 text-white text-xs font-semibold shadow-lg animate-bounce">
          {lockedToast}
        </div>
      )}

      <div className="max-w-md mx-auto px-4 pt-3 space-y-3.5 relative z-10">
        {/* ========================================================= */}
        {/* 1. ADVENTURE CARTOON MAP JOURNEY CONTAINER (Primary Hero) */}
        {/* ========================================================= */}
        <div className="relative pt-1">
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
              <MapIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="uppercase tracking-wider">Adventure Map</span>
            </div>
            <span className="text-xs font-semibold text-stone-600 font-mono-numbers">
              {Object.keys(profile.completedLevels).length} / {TOTAL_LEVELS} Clear
            </span>
          </div>

          {/* Adventure Cartoon Map Container */}
          <AdventureCartoonMap
            profile={profile}
            targetLevel={targetLevel}
            highestUnlocked={highestUnlocked}
            onPlayLevel={onPlayLevel}
            onLockedClick={handleLockedClick}
          />
        </div>

        {/* ========================================================= */}
        {/* 2. HERO ACTIVE LEVEL CARD (Below Journey Map)             */}
        {/* ========================================================= */}
        <div className="relative rounded-3xl bg-white p-4 sm:p-5 border border-stone-200/80 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 mb-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Next Adventure</span>
                <span>·</span>
                <span className="text-stone-500">{targetDiffInfo.gridSize}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
                Level {targetLevel}
              </h1>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {targetDiffInfo.label} {targetDiffInfo.hasObstacles ? '· Obstacles' : ''}
              </p>
            </div>

            {/* Play Button */}
            <button
              onClick={() => {
                if (hasSavedTarget) {
                  onPlayLevel(targetLevel);
                } else {
                  onNewGame();
                }
              }}
              className="btn-tactile px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white ml-0.5" />
              <span>{hasSavedTarget ? 'Resume' : 'Play'}</span>
            </button>
          </div>

          {/* Quick secondary row: Daily Quest pill + Practice pill */}
          <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
            <button
              onClick={onStartDaily}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all active:scale-95 ${
                isTodayDailyCompleted
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isTodayDailyCompleted ? 'Daily Done ✓' : "Today's Daily"}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onStartPractice('medium')}
                className="px-2.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-700 font-semibold active:scale-95 transition-all"
              >
                🎲 Practice
              </button>
              <button
                onClick={() => {
                  sound.playModalOpen();
                  onOpenRules();
                }}
                className="px-2.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-600 font-semibold active:scale-95 transition-all"
              >
                Rules
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. WEEKLY STREAK & BADGES STRIP                           */}
        {/* ========================================================= */}
        <div className="rounded-2xl bg-white p-3 border border-stone-200/70 shadow-xs flex items-center justify-between gap-2">
          {/* 7-day minimal dots */}
          <div className="flex items-center gap-1 sm:gap-2">
            {weekDays.map((d, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (d.isCompleted) {
                    sound.playPop(0.7);
                  } else {
                    sound.playTap();
                  }
                }}
                className="flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-[10px] font-semibold text-stone-400">
                  {d.label}
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    d.isCompleted
                      ? 'bg-amber-500 text-white shadow-xs'
                      : d.isToday
                      ? 'border-2 border-dashed border-amber-400 text-amber-500'
                      : 'bg-stone-100 text-stone-300'
                  }`}
                >
                  {d.isCompleted ? (
                    <Flame className="w-3.5 h-3.5 fill-white" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Badges reward trigger */}
          <button
            onClick={() => {
              sound.playModalOpen();
              setBadgesModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-all active:scale-95"
          >
            <Gift className="w-3.5 h-3.5 text-indigo-600" />
            <span>Badges</span>
            {activeBadge && <span className="text-sm">{activeBadge.emoji}</span>}
            <ChevronRight className="w-3 h-3 text-stone-400" />
          </button>
        </div>
      </div>

      {/* Badges Modal */}
      <BadgesModal
        isOpen={badgesModalOpen}
        onClose={() => setBadgesModalOpen(false)}
        profile={profile}
        onUpdateProfile={onUpdateProfile}
        completedThisWeek={completedThisWeek}
      />
    </div>
  );
};
