import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Footprints, Share2, Check, ArrowRight, RotateCcw, MapPin, Star } from 'lucide-react';
import { formatTime } from '../utils/storage';
import { GameMode, PuzzleDifficulty } from '../types/game';
import { sound } from '../utils/sound';

interface CompletionModalProps {
  isOpen: boolean;
  mode: GameMode;
  difficulty: PuzzleDifficulty;
  levelNumber?: number;
  tier?: 'beginner' | 'intermediate' | 'advanced';
  dateStr?: string;
  time: number;
  moves: number;
  stars?: number;
  currentStreak: number;
  bestTime: number | null;
  bestMoves?: number | null;
  hasNextLevel?: boolean;
  onHome: () => void;
  onNextLevel: () => void;
  onReplayLevel: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  mode,
  difficulty,
  levelNumber,
  time,
  moves,
  stars = 3,
  currentStreak,
  bestTime,
  hasNextLevel = true,
  onHome,
  onNextLevel,
  onReplayLevel,
}) => {
  const [copied, setCopied] = useState(false);

  // Play victory star sequence chimes on modal open
  useEffect(() => {
    if (isOpen) {
      sound.playVictory();
      for (let s = 1; s <= stars; s++) {
        setTimeout(() => {
          sound.playStar(s);
        }, 350 + s * 180);
      }
    }
  }, [isOpen, stars]);

  if (!isOpen) return null;

  const isLevel = mode === 'level';

  const handleShare = async () => {
    sound.playShare();
    let title = `Axiom Path · Level ${levelNumber || 1}`;
    if (mode === 'daily') {
      title = `Axiom Path · Daily Quest`;
    } else if (mode === 'practice') {
      title = `Axiom Path · Practice (${difficulty})`;
    }

    const starIcons = '⭐'.repeat(stars);
    const shareText = `${title}\n${starIcons}\nSolved in ${formatTime(time)} · ${moves} moves! 🎉`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // safe ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xs sm:max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-stone-200/90 text-center animate-in zoom-in-95 duration-200">
        {/* Joyful Star Rating Animation */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`transition-all duration-300 ${
                starIdx <= stars
                  ? 'text-amber-400 scale-110 drop-shadow-xs animate-soft-pulse'
                  : 'text-stone-200'
              }`}
            >
              <Star
                className="w-8 h-8"
                fill={starIdx <= stars ? '#F59E0B' : 'none'}
                strokeWidth={starIdx <= stars ? 1.5 : 1.5}
              />
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight text-stone-900 mb-0.5">
          {isLevel ? `Level ${levelNumber} Won!` : 'Puzzle Solved!'}
        </h2>
        <p className="text-xs text-indigo-600 font-semibold mb-4">
          ★ Continuous Path Connected ★
        </p>

        {/* Clean, Minimal Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200/60 text-center">
            <div className="flex items-center justify-center gap-1 text-stone-400 text-[10px] font-semibold mb-0.5">
              <Clock className="w-3 h-3" />
              <span>TIME</span>
            </div>
            <div className="font-mono-numbers text-sm font-bold text-stone-900">
              {formatTime(time)}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200/60 text-center">
            <div className="flex items-center justify-center gap-1 text-stone-400 text-[10px] font-semibold mb-0.5">
              <Footprints className="w-3 h-3" />
              <span>MOVES</span>
            </div>
            <div className="font-mono-numbers text-sm font-bold text-stone-900">
              {moves}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200/60 text-center">
            <div className="flex items-center justify-center gap-1 text-stone-400 text-[10px] font-semibold mb-0.5">
              <Trophy className="w-3 h-3 text-amber-500" />
              <span>BEST</span>
            </div>
            <div className="font-mono-numbers text-sm font-bold text-stone-900">
              {bestTime !== null ? formatTime(bestTime) : formatTime(time)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => {
              sound.playLevelStart();
              onNextLevel();
            }}
            className="btn-tactile w-full py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            <span>
              {isLevel
                ? hasNextLevel
                  ? `Next Level ${(levelNumber ?? 0) + 1}`
                  : 'All Levels Solved! 🎉'
                : 'Play Another'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                sound.playReset();
                onReplayLevel();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onHome();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs active:scale-95 transition-all"
              title="Share result"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

