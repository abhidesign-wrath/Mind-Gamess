import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { sound } from '../utils/sound';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // Already running in native/standalone mode
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    sound.playTap();
    if (isInstallable) {
      const success = await install();
      if (success) {
        sound.playVictory();
      }
    } else {
      setShowGuide(true);
    }
  };

  if (compact) {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs shadow-2xs border border-emerald-200/80 transition-all active:scale-95"
          title="Install as Android / Mobile App"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
          <span>Get App</span>
        </button>

        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 text-stone-900 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Install Native App</h3>
                    <p className="text-[10px] text-stone-500">Play offline anytime</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGuide(false)}
                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="my-4 space-y-2.5 text-xs text-stone-700">
                {isAndroid || !isIOS ? (
                  <>
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                      <p>Open browser menu (<strong className="text-stone-900">⋮</strong> on Chrome Android).</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                      <p>Tap <strong className="text-stone-900">Install app</strong> or <strong className="text-stone-900">Add to Home screen</strong>.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                      <p>Tap the <strong className="text-stone-900">Share</strong> icon at the bottom of Safari.</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                      <p>Scroll down and select <strong className="text-stone-900">Add to Home Screen</strong>.</p>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-500/25"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto my-3 px-4">
      <div className="p-3.5 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold tracking-tight">Android App Ready</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-900 font-bold">APK / PWA</span>
            </div>
            <p className="text-[10px] text-white/80 leading-tight">Install to home screen with offline play</p>
          </div>
        </div>

        <button
          onClick={handleInstallClick}
          className="btn-tactile px-3.5 py-2 rounded-2xl bg-white text-indigo-700 hover:bg-white/95 font-bold text-xs shadow-md shrink-0 flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
          <span>Install</span>
        </button>
      </div>
    </div>
  );
};
