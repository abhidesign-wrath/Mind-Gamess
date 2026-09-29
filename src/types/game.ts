export type PuzzleDifficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'level' | 'daily' | 'practice';
export type LevelTier = 'beginner' | 'intermediate' | 'advanced';

export interface GridCoord {
  r: number;
  c: number;
}

export interface Checkpoint {
  number: number;
  r: number;
  c: number;
}

export interface PuzzleData {
  id: string;
  mode: GameMode;
  difficulty: PuzzleDifficulty;
  levelNumber?: number;
  tier?: LevelTier;
  date?: string; // YYYY-MM-DD for daily
  rows: number;
  cols: number;
  totalCells: number;
  checkpoints: Checkpoint[];
  solution: GridCoord[];
  seed: number;
  obstacles?: GridCoord[];
  deadEnds?: GridCoord[];
}

export interface GameState {
  puzzle: PuzzleData;
  path: GridCoord[];
  moveCount: number;
  elapsedTime: number; // in seconds
  isCompleted: boolean;
  completedAt?: number;
  hintUsed: boolean;
  history: GridCoord[][];
  redoStack: GridCoord[][];
}

export interface LevelRecord {
  levelNumber: number;
  completedAt: number;
  bestTime: number;
  bestMoves: number;
  stars: number; // 1, 2, or 3
}

export interface DailyResult {
  date: string;
  time: number;
  moves: number;
  completedAt: number;
  hintUsed: boolean;
}

export interface PracticeStats {
  played: number;
  completed: number;
  bestTime: number | null;
  bestMoves: number | null;
}

export interface UserProfile {
  // Core progression
  highestUnlockedLevel: number;
  currentLevel: number;
  completedLevels: Record<number, LevelRecord>;
  totalPuzzlesSolved: number;

  // Secondary Daily & Streak
  currentStreak: number;
  longestStreak: number;
  lastDailyCompletedDate: string | null;
  dailyHistory: Record<string, DailyResult>;

  // Practice & Supporting stats
  practiceStats: Record<PuzzleDifficulty, PracticeStats>;

  // Cosmetic Badges & Weekly Rewards
  unlockedBadges: string[];
  activeBadge: string | null;
  claimedWeeklyRewards: string[]; // key formatted as `${weekKey}_${badgeId}`

  // Saved in-progress game
  savedGame: {
    puzzle: PuzzleData;
    path: GridCoord[];
    elapsedTime: number;
    moveCount: number;
    hintUsed: boolean;
  } | null;

  settings: {
    sound: boolean;
    music: boolean;
    haptics: boolean;
    theme: 'light' | 'paper';
    showStepNumbers: boolean;
    showAdjacentHints: boolean;
  };
}
