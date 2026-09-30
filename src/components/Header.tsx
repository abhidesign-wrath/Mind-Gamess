import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentStreak: number;
  activeBadgeId?: string | null;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenRules: () => void;
  onOpenBadges?: () => void;
  isGameView?: boolean;
  onBackToHome?: () => void;
  titleSuffix?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentStreak,
  activeBadgeId,
  onOpenStats,
  onOpenSettings,
  onOpenRules,
  onOpenBadges,
  isGameView = false,
  onBackToHome,
  titleSuffix,
}) => {
  return (
    <header className="w-full bg-[#FAF9F6]/85 backdrop-blur-md sticky top-0 z-30 transition-colors border-b border-stone-200/60">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Brand or Back Button */}
        <div className="flex items-center gap-2">
          {isGameView && onBackToHome ? (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-800 transition-all font-semibold text-xs active:scale-95"
              aria-label="Back to adventure map"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Map</span>
            </button>
          ) : (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                <Sparkles className="w-4 h-4 fill-white" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-stone-900">
                  Axiom
                </span>
                <span className="text-xs font-bold text-indigo-600">
                  Path
                </span>
              </div>
            </button>
          )}

          {isGameView && titleSuffix && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              {titleSuffix}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
