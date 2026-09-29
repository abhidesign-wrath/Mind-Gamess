import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PuzzleData, GridCoord, UserProfile } from '../types/game';
import { HUD } from './HUD';
import { PuzzleBoard } from './PuzzleBoard';
import { CompletionModal } from './CompletionModal';
import { sound } from '../utils/sound';
import { vibrate, setHapticsEnabled } from '../utils/haptics';
import { saveUserProfile } from '../utils/storage';
import { triggerPlayfulConfetti } from '../utils/confetti';
import { FloatingAmbience } from './FloatingAmbience';
import {
  getCheckpointColor,
  getCheckpointNumberStyle,
  getPathSegmentBorderColor,
  CheckpointStateStyle,
  CheckpointColorDef,
  CHECKPOINT_COLORS,
} from '../utils/checkpointColors';

// Re-export numbering system logic and styles for other components
export { getCheckpointColor, getCheckpointNumberStyle, getPathSegmentBorderColor, CHECKPOINT_COLORS };
export type { CheckpointStateStyle, CheckpointColorDef };

/**
 * Numbering system logic helper in GameScreen:
 * Guarantees inactive checkpoints render in soft, light pastel tints of their assigned color,
 * active targets in bright vibrant pastel, and reached in final saturated pastel.
 * (Zero dark tones).
 */
export function getCheckpointPastelStyle(
  checkpointNumber: number,
  isVisited: boolean,
  isNextTarget: boolean
): CheckpointStateStyle {
  return getCheckpointNumberStyle(checkpointNumber, isVisited, isNextTarget);
}

/**
 * Helper to obtain the subtle tactile stroke/border color for path segments.
 * Uses a slightly darker shade of the current path color to enhance the tactile 'string-like' appearance.
 */
export function getPathSegmentStroke(checkpointNumber: number): {
  coreColor: string;
  borderColor: string;
} {
  const colorDef = getCheckpointColor(checkpointNumber);
  return {
    coreColor: colorDef.hexLight,
    borderColor: getPathSegmentBorderColor(checkpointNumber),
  };
}

interface GameScreenProps {
  puzzle: PuzzleData;
  initialPath?: GridCoord[];
  initialTime?: number;
  initialMoves?: number;
  profile: UserProfile;
  onGameCompleted: (time: number, moves: number, hintUsed: boolean) => void;
  onExit: () => void;
  onPlayNext: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  puzzle,
  initialPath,
  initialTime = 0,
  initialMoves = 0,
  profile,
  onGameCompleted,
  onExit,
  onPlayNext,
}) => {
  // Start with at least Checkpoint 1 in path if empty
  const defaultStartingPath: GridCoord[] = initialPath && initialPath.length > 0
    ? initialPath
    : [{ r: puzzle.checkpoints[0].r, c: puzzle.checkpoints[0].c }];

  const [path, setPath] = useState<GridCoord[]>(defaultStartingPath);
  const [history, setHistory] = useState<GridCoord[][]>([defaultStartingPath]);
  const [redoStack, setRedoStack] = useState<GridCoord[][]>([]);
  const [elapsedTime, setElapsedTime] = useState<number>(initialTime);
  const [moveCount, setMoveCount] = useState<number>(initialMoves);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hintUsed, setHintUsed] = useState<boolean>(false);
  const [hintCell, setHintCell] = useState<GridCoord | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(profile.settings.sound);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now() - initialTime * 1000);

  // Reset all local game state when puzzle changes
  useEffect(() => {
    const startPath: GridCoord[] = initialPath && initialPath.length > 0
      ? initialPath
      : [{ r: puzzle.checkpoints[0].r, c: puzzle.checkpoints[0].c }];
    setPath(startPath);
    setHistory([startPath]);
    setRedoStack([]);
    setElapsedTime(initialTime);
    setMoveCount(initialMoves);
    setIsCompleted(false);
    setHintUsed(false);
    setHintCell(null);
    setShowCompletionModal(false);
  }, [puzzle.id, initialTime, initialMoves]);

  // Sync sound & haptics settings
  useEffect(() => {
    sound.setEnabled(profile.settings.sound);
    setIsSoundEnabled(profile.settings.sound);
    setHapticsEnabled(profile.settings.haptics ?? true);
  }, [profile.settings.sound, profile.settings.haptics]);

  // Timer loop
  useEffect(() => {
    if (isCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCompleted]);

  // Persist current in-progress game to localStorage
  const saveProgress = useCallback((currentPath: GridCoord[], currentMoves: number, currentTime: number) => {
    if (isCompleted) return;
    const updatedProfile: UserProfile = {
      ...profile,
      savedGame: {
        puzzle,
        path: currentPath,
        elapsedTime: currentTime,
        moveCount: currentMoves,
        hintUsed,
      },
    };
    saveUserProfile(updatedProfile);
  }, [isCompleted, profile, puzzle, hintUsed]);

  // Check victory condition
  const checkCompletion = useCallback((currentPath: GridCoord[]) => {
    if (currentPath.length !== puzzle.totalCells) return false;

    // Check that all checkpoints are visited in order
    let expectedNumber = 1;
    for (const cell of currentPath) {
      const cp = puzzle.checkpoints.find((c) => c.r === cell.r && c.c === cell.c);
      if (cp) {
        if (cp.number === expectedNumber) {
          expectedNumber++;
        } else {
          return false;
        }
      }
    }

    return expectedNumber === puzzle.checkpoints.length + 1;
  }, [puzzle]);

  // Handle path changes from the board
  const handlePathChange = useCallback((newPath: GridCoord[], action: 'step' | 'backtrack' | 'reset') => {
    setPath(newPath);
    setRedoStack([]); // clear redo on new move

    setHistory((prev) => [...prev.slice(-30), newPath]);

    const newMoves = moveCount + 1;
    setMoveCount(newMoves);

    // Check completion
    if (checkCompletion(newPath)) {
      setIsCompleted(true);
      sound.playVictory();
      vibrate(100); // 100ms success vibration on level completion
      triggerPlayfulConfetti();
      onGameCompleted(elapsedTime, newMoves, hintUsed);
      setTimeout(() => {
        setShowCompletionModal(true);
      }, 500);
    } else {
      saveProgress(newPath, newMoves, elapsedTime);
    }
  }, [moveCount, checkCompletion, onGameCompleted, elapsedTime, hintUsed, saveProgress]);

  // Undo
  const handleUndo = () => {
    if (history.length <= 1) return;
    const current = history[history.length - 1];
    const previous = history[history.length - 2];

    setRedoStack((prev) => [...prev, current]);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setPath(previous);
    sound.playBacktrack();
    saveProgress(previous, moveCount + 1, elapsedTime);
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];

    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setHistory((prev) => [...prev, next]);
    setPath(next);
    sound.playStep(next.length / puzzle.totalCells);
    saveProgress(next, moveCount + 1, elapsedTime);
  };

  // Reset
  const handleReset = () => {
    const resetPath = [{ r: puzzle.checkpoints[0].r, c: puzzle.checkpoints[0].c }];
    setRedoStack([]);
    setHistory([resetPath]);
    setPath(resetPath);
    sound.playReset();
    saveProgress(resetPath, moveCount + 1, elapsedTime);
  };

  // Replay from scratch after completion
  const handleReplayCurrent = () => {
    const resetPath = [{ r: puzzle.checkpoints[0].r, c: puzzle.checkpoints[0].c }];
    setRedoStack([]);
    setHistory([resetPath]);
    setPath(resetPath);
    setElapsedTime(0);
    setMoveCount(0);
    setIsCompleted(false);
    setHintUsed(false);
    setShowCompletionModal(false);
    sound.playReset();
  };

  // Hint
  const handleHint = () => {
    setHintUsed(true);
    // Find next step from ground truth solution
    // Compare current path with solution
    const sol = puzzle.solution;
    if (!sol || sol.length === 0) return;

    // Check how much of current path matches solution prefix
    let matchLen = 0;
    for (let i = 0; i < path.length && i < sol.length; i++) {
      if (path[i].r === sol[i].r && path[i].c === sol[i].c) {
        matchLen++;
      } else {
        break;
      }
    }

    let targetCell: GridCoord;
    if (matchLen < path.length) {
      // Current path diverged! Suggest backtracking to the divergence point
      targetCell = sol[matchLen];
    } else if (matchLen < sol.length) {
      // Suggest the very next step
      targetCell = sol[matchLen];
    } else {
      return;
    }

    setHintCell(targetCell);
    sound.playHint();
    setTimeout(() => {
      setHintCell(null);
    }, 2000);
  };

  const handleToggleSound = () => {
    const nextVal = !isSoundEnabled;
    setIsSoundEnabled(nextVal);
    sound.setEnabled(nextVal);
    if (nextVal) {
      sound.playToggle(true);
    }
    const updatedProfile = {
      ...profile,
      settings: { ...profile.settings, sound: nextVal },
    };
    saveUserProfile(updatedProfile);
  };

  let bestTimeForMode: number | null = null;
  let bestMovesForMode: number | null = null;
  if (puzzle.mode === 'level' && puzzle.levelNumber) {
    const record = profile.completedLevels[puzzle.levelNumber];
    if (record) {
      bestTimeForMode = record.bestTime;
      bestMovesForMode = record.bestMoves;
    }
  } else if (puzzle.mode === 'daily') {
    const record = profile.dailyHistory[puzzle.date || ''];
    if (record) {
      bestTimeForMode = record.time;
      bestMovesForMode = record.moves;
    }
  } else {
    bestTimeForMode = profile.practiceStats[puzzle.difficulty]?.bestTime ?? null;
    bestMovesForMode = profile.practiceStats[puzzle.difficulty]?.bestMoves ?? null;
  }

  // Calculate stars
  const earnedStars = !hintUsed ? (moveCount <= puzzle.totalCells + 6 ? 3 : 2) : 1;

  // Numbering system progression state:
  // Determines reached, active target, and inactive checkpoints for pastel styling
  const checkpoints = puzzle.checkpoints;
  const visitedCheckpointNumbers = new Set<number>();
  let nextExpectedCheckpointNumber = 1;
  for (const cell of path) {
    const cp = checkpoints.find((c) => c.r === cell.r && c.c === cell.c);
    if (cp && cp.number === nextExpectedCheckpointNumber) {
      visitedCheckpointNumbers.add(cp.number);
      nextExpectedCheckpointNumber++;
    }
  }

  const handleNextLevel = () => {
    setShowCompletionModal(false);
    setIsCompleted(false);
    onPlayNext();
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden no-scrollbar">
      {/* Background ambient floating clouds & soap bubbles */}
      <FloatingAmbience variant="game" />

      <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center relative z-10">
        {/* HUD controls and stats */}
      <HUD
        mode={puzzle.mode}
        difficulty={puzzle.difficulty}
        levelNumber={puzzle.levelNumber}
        tier={puzzle.tier}
        rows={puzzle.rows}
        cols={puzzle.cols}
        checkpointCount={puzzle.checkpoints.length}
        dateStr={puzzle.date}
        elapsedTime={elapsedTime}
        moveCount={moveCount}
        canUndo={history.length > 1}
        canRedo={redoStack.length > 0}
        isSoundEnabled={isSoundEnabled}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleReset}
        onHint={handleHint}
        onToggleSound={handleToggleSound}
        onNewGame={onExit}
      />

      {/* Pastel Numbering Sequence Bar:
          Shows all checkpoints in order. Inactive checkpoints use soft, light pastel tints
          of their assigned color (e.g. #1 yellow, #2 light pastel green, #3 light peach),
          with zero dark tones.
      */}
      <div className="w-full max-w-md mx-auto mb-2 px-3 py-1.5 rounded-2xl bg-white/95 border border-stone-200/80 shadow-xs flex items-center justify-between gap-1.5 backdrop-blur-xs select-none">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 shrink-0 mr-1">
            Path
          </span>
          {checkpoints.map((cp, idx) => {
            const isVisited = visitedCheckpointNumbers.has(cp.number);
            const isNext = cp.number === nextExpectedCheckpointNumber;
            const style = getCheckpointNumberStyle(cp.number, isVisited, isNext);
            return (
              <React.Fragment key={`seq-cp-${cp.number}`}>
                {idx > 0 && (
                  <span className="text-[10px] font-bold text-stone-300 shrink-0">→</span>
                )}
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-full font-mono text-xs font-bold transition-all duration-200 shrink-0 ${
                    isNext
                      ? 'scale-110 shadow-xs animate-gentle-bounce ring-2 ring-white'
                      : isVisited
                      ? 'scale-100 ring-1 ring-white/80 shadow-2xs'
                      : 'scale-95 opacity-90'
                  }`}
                  style={{
                    backgroundColor: style.bg,
                    border: `1.5px solid ${style.border}`,
                    color: style.text,
                    ...(isNext && style.glow ? { boxShadow: `0 0 8px ${style.glow}` } : {}),
                  }}
                  title={`Checkpoint #${cp.number}: ${
                    isVisited ? 'Reached' : isNext ? 'Current Target' : 'Inactive (Light Pastel)'
                  }`}
                >
                  {isVisited ? '✓' : cp.number}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div className="text-[11px] font-bold text-stone-500 shrink-0 font-mono-numbers pl-2 border-l border-stone-200/80">
          {visitedCheckpointNumbers.size}/{checkpoints.length}
        </div>
      </div>

      {/* Main Puzzle Interactive Board */}
      <PuzzleBoard
        puzzle={puzzle}
        path={path}
        onPathChange={handlePathChange}
        isCompleted={isCompleted}
        showStepNumbers={profile.settings.showStepNumbers}
        showAdjacentHints={profile.settings.showAdjacentHints}
        hintCell={hintCell}
        enablePathSegmentBorder={true}
        getPathSegmentBorderColor={getPathSegmentBorderColor}
      />

      {/* Completion Modal */}
      <CompletionModal
        isOpen={showCompletionModal}
        mode={puzzle.mode}
        difficulty={puzzle.difficulty}
        levelNumber={puzzle.levelNumber}
        tier={puzzle.tier}
        dateStr={puzzle.date}
        time={elapsedTime}
        moves={moveCount}
        stars={earnedStars}
        currentStreak={profile.currentStreak}
        bestTime={bestTimeForMode}
        bestMoves={bestMovesForMode}
        hasNextLevel={(puzzle.levelNumber || 1) < 100}
        onHome={onExit}
        onNextLevel={handleNextLevel}
        onReplayLevel={handleReplayCurrent}
      />
      </div>
    </div>
  );
};
