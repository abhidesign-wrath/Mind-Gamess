import React, { useState } from 'react';
import {
  X,
  Volume2,
  Music,
  Sun,
  Sparkles,
  Trash2,
  Sliders,
  Hash,
  Smartphone,
  Download,
  Code2,
  Bot,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { UserProfile } from '../types/game';
import { sound } from '../utils/sound';
import { vibrate, setHapticsEnabled } from '../utils/haptics';
import { generateAndDownloadAndroidZip } from '../utils/androidProjectExporter';
import { AndroidExportModal } from './AndroidExportModal';
import { AIStudioPromptModal } from './AIStudioPromptModal';
import { AI_STUDIO_ANDROID_PROMPT, downloadPromptFile } from '../utils/aiStudioPromptDoc';

interface SettingsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  profile: UserProfile;
  onUpdateSettings: (newSettings: UserProfile['settings']) => void;
  onResetData: () => void;
  isInline?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen = true,
  onClose,
  profile,
  onUpdateSettings,
  onResetData,
  isInline = false,
}) => {
  const [showAndroidModal, setShowAndroidModal] = useState<boolean>(false);
  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [promptCopied, setPromptCopied] = useState<boolean>(false);

  if (!isOpen && !isInline) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(AI_STUDIO_ANDROID_PROMPT);
    sound.playPop(0.8);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2500);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      sound.playTap();
      await generateAndDownloadAndroidZip();
      sound.playVictory();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const { settings } = profile;

  const handleToggle = (key: keyof UserProfile['settings']) => {
    const nextVal = !settings[key];
    const updated = {
      ...settings,
      [key]: nextVal,
    };
    if (key === 'sound') {
      sound.setEnabled(updated.sound);
      if (updated.sound) sound.playToggle(true);
    } else if (key === 'music') {
      sound.setMusicEnabled(Boolean(nextVal));
      sound.playToggle(Boolean(nextVal));
    } else {
      sound.playToggle(Boolean(nextVal));
    }
    if (key === 'haptics') {
      setHapticsEnabled(updated.haptics);
      if (updated.haptics) vibrate(30);
    }
    onUpdateSettings(updated);
  };

  const handleThemeChange = (theme: 'light' | 'paper') => {
    sound.playPop(0.6);
    onUpdateSettings({
      ...settings,
      theme,
    });
  };

  const content = (
    <div className={`w-full max-w-md mx-auto ${isInline ? 'pb-24 pt-4 px-4 text-stone-900 space-y-4' : 'max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-stone-200/90 text-stone-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-stone-900">Settings</h2>
        </div>
        {!isInline && onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-500 flex items-center justify-center transition-all active:scale-95"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Theme Selector */}
      <div className="my-3.5">
        <label className="block text-[11px] uppercase tracking-wider text-stone-400 font-bold mb-2">
          Color Atmosphere
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleThemeChange('light')}
            className={`p-2.5 rounded-2xl text-xs font-semibold border text-center transition-all ${
              settings.theme !== 'paper'
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-2xs'
                : 'border-stone-200 bg-white text-stone-600'
            }`}
          >
            <Sun className="w-4 h-4 mx-auto mb-1 text-amber-500" />
            <span>Clean Light</span>
          </button>

          <button
            onClick={() => handleThemeChange('paper')}
            className={`p-2.5 rounded-2xl text-xs font-semibold border text-center transition-all ${
              settings.theme === 'paper'
                ? 'border-amber-500 bg-amber-50/50 text-amber-800 shadow-2xs'
                : 'border-stone-200 bg-white text-stone-600'
            }`}
          >
            <span className="block w-4 h-4 rounded-full bg-amber-200 mx-auto mb-1 border border-amber-400" />
            <span>Warm Paper</span>
          </button>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-stone-200/60 shadow-2xs">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <div className="text-left">
              <span className="text-xs font-bold text-stone-900 block">Sound FX</span>
              <span className="text-[10px] text-stone-500">Kalimba chime audio</span>
            </div>
          </div>
          <button
            onClick={() => handleToggle('sound')}
            className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.sound ? 'bg-indigo-600' : 'bg-stone-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.sound ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-stone-200/60 shadow-2xs">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-indigo-600" />
            <div className="text-left">
              <span className="text-xs font-bold text-stone-900 block">Ambient Music</span>
              <span className="text-[10px] text-stone-500">Gentle soundtrack on map</span>
            </div>
          </div>
          <button
            onClick={() => handleToggle('music')}
            className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.music !== false ? 'bg-indigo-600' : 'bg-stone-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.music !== false ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-stone-200/60 shadow-2xs">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-indigo-600" />
            <div className="text-left">
              <span className="text-xs font-bold text-stone-900 block">Step Numbers</span>
              <span className="text-[10px] text-stone-500">Show step index</span>
            </div>
          </div>
          <button
            onClick={() => handleToggle('showStepNumbers')}
            className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.showStepNumbers ? 'bg-indigo-600' : 'bg-stone-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.showStepNumbers ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-stone-200/60 shadow-2xs">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <div className="text-left">
              <span className="text-xs font-bold text-stone-900 block">Tactile Haptics</span>
              <span className="text-[10px] text-stone-500">Subtle vibration pulses</span>
            </div>
          </div>
          <button
            onClick={() => handleToggle('haptics')}
            className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.haptics ? 'bg-indigo-600' : 'bg-stone-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.haptics ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-stone-200/60 shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <div className="text-left">
              <span className="text-xs font-bold text-stone-900 block">Move Guidance</span>
              <span className="text-[10px] text-stone-500">Subtle adjacent tile hint</span>
            </div>
          </div>
          <button
            onClick={() => handleToggle('showAdjacentHints')}
            className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.showAdjacentHints ? 'bg-indigo-600' : 'bg-stone-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.showAdjacentHints ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Native Android Project Export */}
      <div className="my-3 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-stone-900 block">Native Android Project</span>
            <span className="text-[10px] text-stone-500">Kotlin + Jetpack Compose (.zip)</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => {
              sound.playTap();
              setShowAndroidModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 transition-all active:scale-95 shadow-2xs"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>View Code</span>
          </button>
          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Packaging...' : 'Download .ZIP'}</span>
          </button>
        </div>
      </div>

      {/* Google AI Studio Master System Prompt Doc */}
      <div className="my-3 p-3 rounded-2xl bg-gradient-to-r from-amber-50/80 via-purple-50/60 to-indigo-50/80 border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-stone-900 flex items-center gap-1">
              <span>Google AI Studio Prompt Doc</span>
              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 uppercase">
                Spec Doc
              </span>
            </span>
            <span className="text-[10px] text-stone-500 block">
              Complete replication prompt for Gemini & Android Native
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 transition-all active:scale-95 shadow-2xs"
          >
            {promptCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-600" />
                <span>Copy Prompt</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              sound.playTap();
              setShowPromptModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Doc</span>
          </button>
        </div>
      </div>

      {/* Reset Progress */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
        <div className="text-left">
          <span className="text-xs font-semibold text-rose-600 block">Reset Progress</span>
          <span className="text-[10px] text-stone-400">Clear solved levels</span>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Reset all level progress and start from Level 1?')) {
              onResetData();
              onClose?.();
            }
          }}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Android Native Source Code Viewer & Exporter Modal */}
      <AndroidExportModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
      />

      {/* Google AI Studio Master System Prompt Modal */}
      <AIStudioPromptModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
      />
    </div>
  );

  if (isInline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      {content}
    </div>
  );
};
