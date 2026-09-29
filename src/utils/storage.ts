import { DailyResult, LevelRecord, PuzzleDifficulty, UserProfile } from '../types/game';

const STORAGE_KEY = 'axiom_puzzle_profile_v3';

export const DEFAULT_PROFILE: UserProfile = {
  highestUnlockedLevel: 1,
  currentLevel: 1,
  completedLevels: {},
  totalPuzzlesSolved: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastDailyCompletedDate: null,
  dailyHistory: {},
  practiceStats: {
    easy: { played: 0, completed: 0, bestTime: null, bestMoves: null },
    medium: { played: 0, completed: 0, bestTime: null, bestMoves: null },
    hard: { played: 0, completed: 0, bestTime: null, bestMoves: null },
  },
  unlockedBadges: [],
  activeBadge: null,
  claimedWeeklyRewards: [],
  savedGame: null,
  settings: {
    sound: true,
    music: true,
    haptics: true,
    theme: 'light',
    showStepNumbers: true,
    showAdjacentHints: true,
  },
};

/**
 * Format date to YYYY-MM-DD in local time
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date string for yesterday
 */
export function getYesterdayDateString(d: Date = new Date()): string {
  const yesterday = new Date(d);
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
}

/**
 * Load user profile from localStorage with robust fallback
 */
export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    // Backward compatibility with v2
    if (!raw) {
      raw = localStorage.getItem('axiom_puzzle_profile_v2');
    }
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);

    // Merge in defaults in case new fields were added
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      highestUnlockedLevel: parsed.highestUnlockedLevel || 1,
      currentLevel: parsed.currentLevel || 1,
      completedLevels: parsed.completedLevels || {},
      totalPuzzlesSolved: parsed.totalPuzzlesSolved || Object.keys(parsed.completedLevels || {}).length,
      practiceStats: {
        ...DEFAULT_PROFILE.practiceStats,
        ...(parsed.practiceStats || {}),
      },
      settings: {
        ...DEFAULT_PROFILE.settings,
        ...(parsed.settings || {}),
      },
      dailyHistory: parsed.dailyHistory || {},
      unlockedBadges: parsed.unlockedBadges || [],
      activeBadge: parsed.activeBadge || null,
      claimedWeeklyRewards: parsed.claimedWeeklyRewards || [],
    };
  } catch (err) {
    console.error('Failed to load profile from storage:', err);
    return DEFAULT_PROFILE;
  }
}

/**
 * Save user profile to localStorage
 */
export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile to storage:', err);
  }
}

/**
 * Record a completed Level in the progression campaign
 */
export function recordLevelCompletion(
  profile: UserProfile,
  levelNumber: number,
  time: number,
  moves: number,
  hintUsed: boolean,
  totalCells: number
): { profile: UserProfile; stars: number; isFirstCompletion: boolean } {
  const existing = profile.completedLevels[levelNumber];
  const isFirstCompletion = !existing;

  // Star calculation:
  // 3 stars: no hint used and efficient moves (moves <= totalCells + 6)
  // 2 stars: no hint used
  // 1 star: hint used or higher moves
  let stars = 1;
  if (!hintUsed) {
    stars = moves <= totalCells + 6 ? 3 : 2;
  }

  const bestTime = existing ? Math.min(existing.bestTime, time) : time;
  const bestMoves = existing ? Math.min(existing.bestMoves, moves) : moves;
  const bestStars = existing ? Math.max(existing.stars, stars) : stars;

  const record: LevelRecord = {
    levelNumber,
    completedAt: Date.now(),
    bestTime,
    bestMoves,
    stars: bestStars,
  };

  const nextLevel = levelNumber + 1;
  const newHighestUnlocked = Math.max(profile.highestUnlockedLevel, nextLevel);

  const updatedProfile: UserProfile = {
    ...profile,
    highestUnlockedLevel: newHighestUnlocked,
    currentLevel: nextLevel, // prompt next level
    totalPuzzlesSolved: profile.totalPuzzlesSolved + (isFirstCompletion ? 1 : 0),
    completedLevels: {
      ...profile.completedLevels,
      [levelNumber]: record,
    },
    // Clear saved game if it was this level
    savedGame: profile.savedGame?.puzzle.levelNumber === levelNumber ? null : profile.savedGame,
  };

  saveUserProfile(updatedProfile);
  return { profile: updatedProfile, stars, isFirstCompletion };
}

/**
 * Set current level pointer
 */
export function setCurrentLevel(profile: UserProfile, levelNumber: number): UserProfile {
  const updated: UserProfile = {
    ...profile,
    currentLevel: levelNumber,
  };
  saveUserProfile(updated);
  return updated;
}

/**
 * Record a completed Daily puzzle and update streaks
 */
export function recordDailyCompletion(
  profile: UserProfile,
  dateString: string,
  time: number,
  moves: number,
  hintUsed: boolean
): UserProfile {
  const today = dateString;
  const yesterday = getYesterdayDateString(new Date(today));

  // Check if already completed today
  const wasAlreadyCompleted = Boolean(profile.dailyHistory[today]);

  let newCurrentStreak = profile.currentStreak;
  let newLongestStreak = profile.longestStreak;

  if (!wasAlreadyCompleted) {
    if (profile.lastDailyCompletedDate === yesterday) {
      newCurrentStreak += 1;
    } else if (profile.lastDailyCompletedDate === today) {
      // already recorded today
    } else {
      // Streak broken or brand new
      newCurrentStreak = 1;
    }

    if (newCurrentStreak > newLongestStreak) {
      newLongestStreak = newCurrentStreak;
    }
  }

  const result: DailyResult = {
    date: today,
    time,
    moves,
    completedAt: Date.now(),
    hintUsed,
  };

  const updatedProfile: UserProfile = {
    ...profile,
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastDailyCompletedDate: today,
    dailyHistory: {
      ...profile.dailyHistory,
      [today]: result,
    },
    // Clear saved game if it was this daily
    savedGame: profile.savedGame?.puzzle.id.includes(today) ? null : profile.savedGame,
  };

  saveUserProfile(updatedProfile);
  return updatedProfile;
}

/**
 * Record a completed Practice game
 */
export function recordPracticeCompletion(
  profile: UserProfile,
  difficulty: PuzzleDifficulty,
  time: number,
  moves: number
): UserProfile {
  const current = profile.practiceStats[difficulty] || { played: 0, completed: 0, bestTime: null, bestMoves: null };

  const updatedBestTime = current.bestTime === null ? time : Math.min(current.bestTime, time);
  const updatedBestMoves = current.bestMoves === null ? moves : Math.min(current.bestMoves, moves);

  const updatedStats = {
    ...profile.practiceStats,
    [difficulty]: {
      played: current.played + 1,
      completed: current.completed + 1,
      bestTime: updatedBestTime,
      bestMoves: updatedBestMoves,
    },
  };

  const updatedProfile: UserProfile = {
    ...profile,
    practiceStats: updatedStats,
    savedGame: null,
  };

  saveUserProfile(updatedProfile);
  return updatedProfile;
}

/**
 * Record that a practice game was started (increments played counter)
 */
export function recordPracticeStarted(profile: UserProfile, difficulty: PuzzleDifficulty): UserProfile {
  const current = profile.practiceStats[difficulty] || { played: 0, completed: 0, bestTime: null, bestMoves: null };
  const updatedStats = {
    ...profile.practiceStats,
    [difficulty]: {
      ...current,
      played: current.played + 1,
    },
  };
  const updatedProfile: UserProfile = {
    ...profile,
    practiceStats: updatedStats,
  };
  saveUserProfile(updatedProfile);
  return updatedProfile;
}

/**
 * Format seconds into mm:ss
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Format seconds into zero-padded mm:ss for clean, unobtrusive timer displays (e.g. 00:07, 01:24)
 */
export function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
