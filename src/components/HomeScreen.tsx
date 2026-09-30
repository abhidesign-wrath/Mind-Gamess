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

      <div className="max-w-md mx-auto px-4 pt-3 relative z-10 pb-28">
        {/* ========================================================= */}
        {/* ADVENTURE CARTOON MAP JOURNEY CONTAINER                */}
        {/* ========================================================= */}
        <div className="relative pt-1">
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
              <MapIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="uppercase tracking-wider">Adventure Map</span>
            </div>
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
      </div>

      {/* Floating Bottom Play Button */}
      <div className="fixed bottom-20 left-0 right-0 z-20 pointer-events-none">
        <div className="max-w-md mx-auto px-4 w-full pointer-events-auto">
          <button
            onClick={() => {
              if (hasSavedTarget) {
                onPlayLevel(targetLevel);
              } else {
                onNewGame();
              }
            }}
            className="btn-tactile w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white ml-0.5 animate-pulse" />
            <span>{hasSavedTarget ? `Resume Level ${targetLevel}` : `Play Level ${targetLevel}`}</span>
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
