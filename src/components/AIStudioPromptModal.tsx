import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Bot,
  Sparkles,
  Smartphone,
  ExternalLink,
  Terminal,
  FileText,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { AI_STUDIO_ANDROID_PROMPT, downloadPromptFile } from '../utils/aiStudioPromptDoc';

interface AIStudioPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIStudioPromptModal: React.FC<AIStudioPromptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(AI_STUDIO_ANDROID_PROMPT);
    sound.playPop(0.8);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    sound.playTap();
    downloadPromptFile();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-1.5">
                <span>Google AI Studio Android Prompt</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  Full Spec
                </span>
              </h2>
              <p className="text-xs text-stone-500">
                Complete engineering prompt & architecture doc to replicate Axiom Path in native Kotlin
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Instructions Banner & Action Bar */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 border-b border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-700">
            <p className="font-bold flex items-center gap-1 text-indigo-900">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Paste directly into Google AI Studio</span>
            </p>
            <p className="text-stone-500 text-[11px] mt-0.5">
              Contains all 100 level algorithms, Hamiltonian path logic, 7200px journey map, kalimba sound synthesis, & Compose UI.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              {downloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Saved .md</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-stone-600" />
                  <span>Download .md</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/25 flex items-center justify-center gap-1.5 transition-all shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Full Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prompt Content View (Markdown formatted in code box) */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-900 text-stone-200 font-mono text-[11px] leading-relaxed select-text no-scrollbar">
          <pre className="whitespace-pre-wrap font-mono text-emerald-300">
            <code>{AI_STUDIO_ANDROID_PROMPT}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-600">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              Tip: In Google AI Studio, select <b>Gemini 1.5 Pro</b> or <b>Gemini 2.0 Flash</b> and paste the full prompt.
            </span>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 font-bold text-stone-700 active:scale-95 transition-all text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
