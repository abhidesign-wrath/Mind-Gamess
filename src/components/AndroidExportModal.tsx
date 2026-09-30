import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Smartphone,
  FolderArchive,
  FileCode,
  Terminal,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { ANDROID_FILES, generateAndDownloadAndroidZip, AndroidSourceFile } from '../utils/androidProjectExporter';

interface AndroidExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidExportModal: React.FC<AndroidExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<AndroidSourceFile>(ANDROID_FILES[10]); // Default to MainActivity or AxiomPathApp
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      sound.playTap();
      await generateAndDownloadAndroidZip();
      sound.playVictory();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to export zip:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    sound.playPop(0.8);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-1.5">
                <span>Native Android App Project</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Kotlin + Compose
                </span>
              </h2>
              <p className="text-xs text-stone-500">
                Complete Android Studio source code & instant `.zip` downloader
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

        {/* Action Hero Bar */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 border-b border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-700">
            <p className="font-bold flex items-center gap-1 text-indigo-900">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ready for Android Studio 2024 / 2025</span>
            </p>
            <p className="text-stone-500 text-[11px] mt-0.5">
              Includes Gradle 8.9 wrapper, Android SDK 35, Jetpack Compose, & 100 Adventure levels.
            </p>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 shrink-0"
          >
            {isDownloading ? (
              <span>Packaging ZIP...</span>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download .ZIP (PC / Mac)</span>
              </>
            )}
          </button>
        </div>

        {/* Main Content Area: File Explorer & Code View */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-[300px]">
          {/* File List Sidebar */}
          <div className="w-full md:w-56 border-r border-stone-100 bg-stone-50/50 p-2 overflow-y-auto no-scrollbar max-h-48 md:max-h-none shrink-0">
            <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
              Project Files ({ANDROID_FILES.length})
            </div>
            <div className="space-y-1">
              {ANDROID_FILES.map((file) => {
                const isSelected = selectedFile?.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => {
                      sound.playTap();
                      setSelectedFile(file);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-stone-400'}`} />
                    <span className="truncate">{file.filename}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-stone-900 text-stone-100">
            {/* Code Panel Header */}
            <div className="px-4 py-2 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {selectedFile.path}
                </span>
                <span className="text-[10px] text-stone-400 block">
                  {selectedFile.description}
                </span>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-3 py-1 bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 text-xs font-semibold rounded-lg transition-all border border-stone-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Block */}
            <div className="flex-1 p-3 overflow-auto font-mono text-[11px] leading-relaxed select-text no-scrollbar text-emerald-300">
              <pre>
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer Build Guide */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-600">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              Extract ZIP → Open in <b>Android Studio</b> → Run <code className="bg-stone-200 px-1 py-0.5 rounded text-[10px] font-bold">./gradlew assembleDebug</code>
            </span>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 font-bold text-stone-700 active:scale-95 transition-all text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
