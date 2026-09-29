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

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [currentScreen, setCurrentScreen] = useState<'HOME' | 'GAME'>('HOME');
  const [activePuzzle, setActivePuzzle] = useState<PuzzleData | null>(null);

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
    setStatsOpen(true);
  };
  const closeStats = () => {
    sound.playModalClose();
    setStatsOpen(false);
  };

  const openSettings = () => {
    sound.playModalOpen();
    setSettingsOpen(true);
  };
  const closeSettings = () => {
    sound.playModalClose();
    setSettingsOpen(false);
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
    setBadgesOpen(true);
  };
  const closeBadges = () => {
    sound.playModalClose();
    setBadgesOpen(false);
  };

  const backToHome = () => {
    sound.playTap();
    setCurrentScreen('HOME');
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
        {currentScreen === 'HOME' && (
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
      <StatisticsModal
        isOpen={statsOpen}
        onClose={closeStats}
        profile={profile}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={closeSettings}
        profile={profile}
        onUpdateSettings={(newSettings) => {
          const updated = { ...profile, settings: newSettings };
          setProfile(updated);
          saveUserProfile(updated);
        }}
        onResetData={handleResetData}
      />

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

      <BadgesModal
        isOpen={badgesOpen}
        onClose={closeBadges}
        profile={profile}
        onUpdateProfile={(updated) => setProfile(updated)}
        completedThisWeek={Object.values(profile.dailyHistory).length}
      />
    </div>
  );
}
