import React from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayNow?: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  onPlayNow,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-stone-200/90 text-stone-900">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-stone-900">How to Play</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-500 flex items-center justify-center transition-all active:scale-95"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Clean Visual Rules */}
        <div className="space-y-2.5 my-4 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/60">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              1
            </span>
            <div>
              <p className="font-bold text-stone-900">Start at Checkpoint 1</p>
              <p className="text-stone-500 text-[11px] mt-0.5">
                Drag from circle 1 along horizontal and vertical lines.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100/60">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              2
            </span>
            <div>
              <p className="font-bold text-stone-900">Connect in Sequence</p>
              <p className="text-stone-500 text-[11px] mt-0.5">
                Visit each checkpoint in order: 1 ➔ 2 ➔ 3 ➔ 4...
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/50 border border-amber-100/60">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
              3
            </span>
            <div>
              <p className="font-bold text-stone-900">Fill Every Tile</p>
              <p className="text-stone-500 text-[11px] mt-0.5">
                Your path must pass through every open square without overlap!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50/50 border border-rose-100/60">
            <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
              4
            </span>
            <div>
              <p className="font-bold text-stone-900">Avoid Obstacles</p>
              <p className="text-stone-500 text-[11px] mt-0.5">
                Toy hurdle blocks block the path — navigate cleverly around them.
              </p>
            </div>
          </div>
        </div>

        {/* Play Action */}
        <button
          onClick={onPlayNow || onClose}
          className="btn-tactile w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center gap-1.5"
        >
          <span>LET&apos;S PLAY</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
