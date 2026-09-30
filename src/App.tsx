import React, { useState, useEffect } from 'react';
import { UserProfile, PuzzleData, PuzzleDifficulty, GameMode } from './types/game';
import {
  loadUserProfile,
  saveUserProfile,
  recordLevelCompletion,
  setCurrentLevel,
  recordDailyCompletion,
  recordPracticeCompletion,
  recordPracticeStarted,
  getLocalDateString,
  DEFAULT_PROFILE,
} from './utils/storage';
import { generatePuzzle, generateLevelPuzzle, getDailyDifficulty, TOTAL_LEVELS } from './utils/puzzleGenerator';
import { sound } from './utils/sound';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { StatisticsModal } from './components/StatisticsModal';
import { SettingsModal } from './components/SettingsModal';
import { RulesModal } from './components/RulesModal';
import { BadgesModal } from './components/BadgesModal';
import { Compass, Flame, Trophy, Settings } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [currentScreen, setCurrentScreen] = useState<'HOME' | 'GAME'>('HOME');
  const [activePuzzle, setActivePuzzle] = useState<PuzzleData | null>(null);
  const [activeTab, setActiveTab] = useState<'HOME' | 'STREAKS' | 'STATS' | 'SETTINGS'>('HOME');

  // Modals
  const [statsOpen, setStatsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [badgesOpen, setBadgesOpen] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    const loaded = loadUserProfile();
    setProfile(loaded);
  }, []);

  // Update theme class on HTML & body elements
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'paper-theme');
    document.body.classList.remove('dark', 'paper-theme');

    if (profile.settings.theme === 'paper') {
      root.classList.add('paper-theme');
      document.body.classList.add('paper-theme');
    }
  }, [profile.settings.theme]);

  // Keep screen pinned at top on screen change & notify sound engine for ambient background music
  useEffect(() => {
    window.scrollTo(0, 0);
    sound.setEnabled(profile.settings.sound);
    sound.setMusicEnabled(profile.settings.music ?? true);
    sound.setScreen(currentScreen);
  }, [currentScreen, profile.settings.sound, profile.settings.music]);

  // Play or resume a specific level
  const handlePlayLevel = (levelNumber: number) => {
    sound.playLevelStart();
    const updatedProfile = setCurrentLevel(profile, levelNumber);
    setProfile(updatedProfile);

    // If there is an unfinished saved game for this exact level, resume it
    if (profile.savedGame && profile.savedGame.puzzle.levelNumber === levelNumber) {
      setActivePuzzle(profile.savedGame.puzzle);
      setCurrentScreen('GAME');
      return;
    }

    const puzzle = generateLevelPuzzle(levelNumber);
    setActivePuzzle(puzzle);
    setCurrentScreen('GAME');
  };

  // Start New Game button action
  const handleNewGame = () => {
    sound.playLevelStart();
    // Pick the highest unlocked level or first uncompleted level
    let nextUnsolvedLevel = 1;
    for (let l = 1; l <= profile.highestUnlockedLevel; l++) {
      if (!profile.completedLevels[l]) {
        nextUnsolvedLevel = l;
        break;
      }
      nextUnsolvedLevel = l;
    }

    // Clear saved game for this level if user explicitly requested a fresh start
    if (profile.savedGame && profile.savedGame.puzzle.levelNumber === nextUnsolvedLevel) {
      const updated = { ...profile, savedGame: null };
      setProfile(updated);
      saveUserProfile(updated);
    }

    const puzzle = generateLevelPuzzle(nextUnsolvedLevel);
    setActivePuzzle(puzzle);
    setCurrentScreen('GAME');
  };

  // Start today's Daily Puzzle (Secondary Mode)
  const handleStartDaily = () => {
    sound.playLevelStart();
    const todayStr = getLocalDateString();
    const diff = getDailyDifficulty(todayStr);

    // If an unfinished saved game exists for today, resume it
    if (profile.savedGame && profile.savedGame.puzzle.id.includes(todayStr)) {
      setActivePuzzle(profile.savedGame.puzzle);
      setCurrentScreen('GAME');
      return;
    }

    const puzzle = generatePuzzle('daily', diff, todayStr);
    setActivePuzzle(puzzle);
    setCurrentScreen('GAME');
  };

  // Continue whatever saved game exists
  const handleContinueSaved = () => {
    if (profile.savedGame) {
      sound.playLevelStart();
      setActivePuzzle(profile.savedGame.puzzle);
      setCurrentScreen('GAME');
    }
  };

  // Start Practice mode
  const handleStartPractice = (difficulty: PuzzleDifficulty) => {
    sound.playLevelStart();
    const updated = recordPracticeStarted(profile, difficulty);
    setProfile(updated);

    const puzzle = generatePuzzle('practice', difficulty);
    setActivePuzzle(puzzle);
    setCurrentScreen('GAME');
  };

  // When a puzzle / level completes
  const handleGameCompleted = (time: number, moves: number, hintUsed: boolean) => {
    if (!activePuzzle) return;

    if (activePuzzle.mode === 'level' && activePuzzle.levelNumber) {
      const { profile: updatedProfile } = recordLevelCompletion(
        profile,
        activePuzzle.levelNumber,
        time,
        moves,
        hintUsed,
        activePuzzle.totalCells
      );
      setProfile(updatedProfile);
    } else if (activePuzzle.mode === 'daily') {
      const todayStr = activePuzzle.date || getLocalDateString();
      const updated = recordDailyCompletion(profile, todayStr, time, moves, hintUsed);
      setProfile(updated);
    } else {
      const updated = recordPracticeCompletion(profile, activePuzzle.difficulty, time, moves);
      setProfile(updated);
    }
  };

  // Next level / puzzle action: PLAY -> COMPLETE -> UNLOCK NEXT -> KEEP PROGRESSING
  const handlePlayNext = () => {
    if (!activePuzzle) return;

    if (activePuzzle.mode === 'level' && activePuzzle.levelNumber) {
      const nextLevelNum = activePuzzle.levelNumber + 1;
      if (nextLevelNum <= TOTAL_LEVELS) {
        const nextPuzzle = generateLevelPuzzle(nextLevelNum);
        const updated = setCurrentLevel(profile, nextLevelNum);
        setProfile(updated);
        setActivePuzzle(nextPuzzle);
        // Stays on GAME screen to seamlessly play multiple levels!
        return;
      } else {
        // Reached end of 100 levels!
        setCurrentScreen('HOME');
        return;
      }
    }

    if (activePuzzle.mode === 'daily') {
      // Direct back to campaign level progression
      handlePlayLevel(profile.currentLevel || 1);
      return;
    }

    // Practice mode
    handleStartPractice(activePuzzle.difficulty);
  };

  // Reset all user data
  const handleResetData = () => {
    sound.playReset();
    saveUserProfile(DEFAULT_PROFILE);
    setProfile(DEFAULT_PROFILE);
    setActivePuzzle(null);
    setCurrentScreen('HOME');
  };

  const openStats = () => {
    sound.playModalOpen();
    setActiveTab('STATS');
  };
  const closeStats = () => {
    sound.playModalClose();
    setActiveTab('HOME');
  };

  const openSettings = () => {
    sound.playModalOpen();
    setActiveTab('SETTINGS');
  };
  const closeSettings = () => {
    sound.playModalClose();
    setActiveTab('HOME');
  };

  const openRules = () => {
    sound.playModalOpen();
    setRulesOpen(true);
  };
  const closeRules = () => {
    sound.playModalClose();
    setRulesOpen(false);
  };

  const openBadges = () => {
    sound.playModalOpen();
    setActiveTab('STREAKS');
  };
  const closeBadges = () => {
    sound.playModalClose();
    setActiveTab('HOME');
  };

  const backToHome = () => {
    sound.playTap();
    setCurrentScreen('HOME');
    setActiveTab('HOME');
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans-fun transition-colors duration-200 select-none ${
        profile.settings.theme === 'paper'
          ? 'bg-[#FDFBF7] text-stone-900'
          : 'bg-[#FAF9F6] text-stone-900'
      }`}
    >
      {/* Universal Top Header */}
      <Header
        currentStreak={profile.currentStreak}
        activeBadgeId={profile.activeBadge}
        onOpenStats={openStats}
        onOpenSettings={openSettings}
        onOpenRules={openRules}
        onOpenBadges={openBadges}
        isGameView={currentScreen === 'GAME'}
        onBackToHome={backToHome}
        titleSuffix={
          activePuzzle
            ? activePuzzle.mode === 'level'
              ? `Level ${activePuzzle.levelNumber ?? 1}`
              : activePuzzle.mode === 'daily'
              ? 'Daily'
              : 'Practice'
            : undefined
        }
      />

      {/* Main Body View */}
      <main className="flex-1 flex flex-col">
        {currentScreen === 'HOME' && activeTab === 'HOME' && (
          <HomeScreen
            profile={profile}
            onUpdateProfile={(updated) => setProfile(updated)}
            onPlayLevel={handlePlayLevel}
            onNewGame={handleNewGame}
            onStartDaily={handleStartDaily}
            onStartPractice={handleStartPractice}
            onOpenStats={openStats}
            onOpenRules={openRules}
            onOpenSettings={openSettings}
          />
        )}

        {currentScreen === 'HOME' && activeTab === 'STREAKS' && (
          <BadgesModal
            profile={profile}
            onUpdateProfile={(updated) => setProfile(updated)}
            completedThisWeek={Object.values(profile.dailyHistory).length}
            isInline={true}
          />
        )}

        {currentScreen === 'HOME' && activeTab === 'STATS' && (
          <StatisticsModal
            profile={profile}
            isInline={true}
          />
        )}

        {currentScreen === 'HOME' && activeTab === 'SETTINGS' && (
          <SettingsModal
            profile={profile}
            onUpdateSettings={(newSettings) => {
              const updated = { ...profile, settings: newSettings };
              setProfile(updated);
              saveUserProfile(updated);
            }}
            onResetData={handleResetData}
            isInline={true}
          />
        )}

        {currentScreen === 'GAME' && activePuzzle && (
          <GameScreen
            key={activePuzzle.id}
            puzzle={activePuzzle}
            initialPath={
              profile.savedGame?.puzzle.id === activePuzzle.id
                ? profile.savedGame.path
                : undefined
            }
            initialTime={
              profile.savedGame?.puzzle.id === activePuzzle.id
                ? profile.savedGame.elapsedTime
                : 0
            }
            initialMoves={
              profile.savedGame?.puzzle.id === activePuzzle.id
                ? profile.savedGame.moveCount
                : 0
            }
            profile={profile}
            onGameCompleted={handleGameCompleted}
            onExit={backToHome}
            onPlayNext={handlePlayNext}
          />
        )}
      </main>

      {/* Modals */}
      <RulesModal
        isOpen={rulesOpen}
        onClose={closeRules}
        onPlayNow={() => {
          closeRules();
          if (currentScreen === 'HOME') {
            handlePlayLevel(profile.currentLevel || 1);
          }
        }}
      />

      {/* Bottom Navigation Bar */}
      {currentScreen === 'HOME' && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200/80 shadow-lg ${
            profile.settings.theme === 'paper'
              ? 'bg-[#FDFBF7]/95 backdrop-blur-md'
              : 'bg-white/95 backdrop-blur-md'
          }`}
        >
          <div className="max-w-md mx-auto px-4 h-16 grid grid-cols-4 items-center">
            {/* Home Tab */}
            <button
              onClick={() => {
                sound.playTap();
                setActiveTab('HOME');
              }}
              className={`flex flex-col items-center justify-center h-full transition-colors ${
                activeTab === 'HOME'
                  ? 'text-indigo-600'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <Compass className="w-5.5 h-5.5" />
              <span className="text-[10px] font-bold mt-1">Home</span>
            </button>

            {/* Streaks/Badges Tab */}
            <button
              onClick={() => {
                sound.playModalOpen();
                setActiveTab('STREAKS');
              }}
              className={`flex flex-col items-center justify-center h-full transition-colors ${
                activeTab === 'STREAKS'
                  ? 'text-indigo-600'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <Flame className="w-5.5 h-5.5" />
              <span className="text-[10px] font-bold mt-1">Streaks</span>
            </button>

            {/* Stats Tab */}
            <button
              onClick={() => {
                sound.playModalOpen();
                setActiveTab('STATS');
              }}
              className={`flex flex-col items-center justify-center h-full transition-colors ${
                activeTab === 'STATS'
                  ? 'text-indigo-600'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <Trophy className="w-5.5 h-5.5" />
              <span className="text-[10px] font-bold mt-1">Stats</span>
            </button>

            {/* Settings Tab */}
            <button
              onClick={() => {
                sound.playModalOpen();
                setActiveTab('SETTINGS');
              }}
              className={`flex flex-col items-center justify-center h-full transition-colors ${
                activeTab === 'SETTINGS'
                  ? 'text-indigo-600'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <Settings className="w-5.5 h-5.5" />
              <span className="text-[10px] font-bold mt-1">Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
