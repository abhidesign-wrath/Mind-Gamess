import React from 'react';
import { Undo2, Redo2, RotateCcw, Lightbulb, Volume2, VolumeX, Clock, Footprints } from 'lucide-react';
import { formatTimer } from '../utils/storage';
import { GameMode, PuzzleDifficulty } from '../types/game';

interface HUDProps {
  mode: GameMode;
  difficulty: PuzzleDifficulty;
  levelNumber?: number;
  tier?: 'beginner' | 'intermediate' | 'advanced';
  rows?: number;
  cols?: number;
  checkpointCount?: number;
  dateStr?: string;
  elapsedTime: number;
  moveCount: number;
  canUndo: boolean;
  canRedo: boolean;
  isSoundEnabled: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onHint: () => void;
  onToggleSound: () => void;
  onNewGame?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  mode,
  levelNumber,
  rows,
  cols,
  elapsedTime,
  moveCount,
  canUndo,
  canRedo,
  isSoundEnabled,
  onUndo,
  onRedo,
  onReset,
  onHint,
  onToggleSound,
}) => {
  return (
    <div className="w-full max-w-md mx-auto mb-2 space-y-2">
      {/* Sleek single-deck status & control bar */}
      <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-2xl border border-stone-200/80 shadow-xs">
        {/* Left: Mode / Level info */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs font-mono-numbers shadow-xs">
            {mode === 'level' ? `${levelNumber ?? 1}` : '★'}
          </div>
          <div>
            <span className="text-xs font-bold text-stone-900 leading-tight block">
              {mode === 'level' ? `Level ${levelNumber ?? 1}` : mode === 'daily' ? 'Daily Quest' : 'Practice'}
            </span>
            {rows && cols && (
              <span className="text-[10px] text-stone-400 font-semibold leading-none">
                {rows}×{cols} grid
              </span>
            )}
          </div>
        </div>

        {/* Center: Elegant Unobtrusive Live Timer & Moves */}
        <div className="flex items-center gap-2">
          {/* Elegant Live Performance Timer */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-50 border border-stone-200/90 text-stone-700 shadow-2xs select-none"
            title="Elapsed gameplay time"
          >
            {/* Soft pulsing active indicator */}
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <Clock className="w-3.5 h-3.5 text-stone-400 stroke-[2.2]" />
            <span className="font-mono-numbers text-xs font-bold tracking-tight text-stone-800">
              {formatTimer(elapsedTime)}
            </span>
          </div>

          {/* Moves count */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-stone-50 border border-stone-200/70 text-stone-500 text-xs font-semibold select-none"
            title="Move count"
          >
            <Footprints className="w-3 h-3 text-stone-400 stroke-[2.2]" />
            <span className="font-mono-numbers">{moveCount}</span>
          </div>
        </div>

        {/* Right: Sound toggle */}
        <button
          onClick={onToggleSound}
          className="w-7 h-7 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-all active:scale-95"
          title={isSoundEnabled ? 'Mute' : 'Unmute'}
          aria-label="Toggle sound"
        >
          {isSoundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-stone-400" />
          )}
        </button>
      </div>

      {/* Action Controls: Undo, Redo, Reset, Hint */}
      <div className="flex items-center justify-between gap-1.5 px-0.5">
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-stone-200/80 text-stone-700 text-xs font-semibold shadow-2xs hover:bg-stone-50 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
            title="Undo step (Backspace or Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-xl bg-white border border-stone-200/80 text-stone-700 text-xs font-semibold shadow-2xs hover:bg-stone-50 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
            title="Redo step"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-stone-200/80 text-stone-600 text-xs font-semibold shadow-2xs hover:bg-stone-50 active:scale-95 transition-all"
            title="Reset board"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Hint button */}
        <button
          onClick={onHint}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
          title="Highlight next step"
        >
          <Lightbulb className="w-3.5 h-3.5 fill-white" />
          <span>Hint</span>
        </button>
      </div>
    </div>
  );
};
