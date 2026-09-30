import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Check,
  Lock,
  Star,
  MapPin,
  Sparkles,
  Compass,
  Trophy,
  Play,
  X,
  Footprints,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { UserProfile } from '../types/game';
import { TOTAL_LEVELS, getLevelDifficultyInfo } from '../utils/puzzleGenerator';
import { getBadgeById } from '../utils/badges';
import { sound } from '../utils/sound';
import { triggerPlayfulConfetti } from '../utils/confetti';
import {
  SpriteTentAndFire,
  SpritePineTree,
  SpriteAppleTree,
  SpriteCactus,
  SpriteTreasureChest,
  SpriteLighthouse,
  SpriteHotAirBalloon,
  SpriteCastle,
  SpriteCloud,
  SpriteVillageCottage,
  SpriteWindmill,
  SpriteBunny,
  SpriteDeer,
  SpriteRiverDucks,
  SpriteSoaringBird,
  SpriteMagicalSparkles,
} from './CartoonMapSprites';
import { LandscapeBackground } from './LandscapeBackground';

interface AdventureCartoonMapProps {
  profile: UserProfile;
  targetLevel: number;
  highestUnlocked: number;
  onPlayLevel: (levelNumber: number) => void;
  onLockedClick: (levelNumber: number) => void;
}

const STRIDE = 70;
const MAP_TOP_PADDING = 80;

interface BiomeInfo {
  id: string;
  name: string;
  emoji: string;
  startLevel: number;
  endLevel: number;
  bgGradient: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  subtitle: string;
}

const BIOMES: BiomeInfo[] = [
  {
    id: 'meadow',
    name: 'Meadow',
    emoji: '🌱',
    startLevel: 1,
    endLevel: 25,
    bgGradient: 'from-emerald-50/70 via-teal-50/50 to-lime-50/60',
    borderColor: 'border-emerald-200',
    badgeBg: 'bg-emerald-100/90 text-emerald-800 border-emerald-300',
    badgeText: 'Whispering Meadow',
    subtitle: '5×5 Open Paths & Gentle Springs',
  },
  {
    id: 'canyon',
    name: 'Canyon',
    emoji: '🏜️',
    startLevel: 26,
    endLevel: 50,
    bgGradient: 'from-amber-50/70 via-orange-50/40 to-yellow-50/60',
    borderColor: 'border-amber-200',
    badgeBg: 'bg-amber-100/90 text-amber-900 border-amber-300',
    badgeText: 'Sunlit Canyon',
    subtitle: '6×6 Rocky Arches & Labyrinth Bends',
  },
  {
    id: 'lagoon',
    name: 'Lagoon',
    emoji: '🌊',
    startLevel: 51,
    endLevel: 75,
    bgGradient: 'from-sky-50/70 via-cyan-50/50 to-blue-50/60',
    borderColor: 'border-sky-200',
    badgeBg: 'bg-sky-100/90 text-sky-900 border-sky-300',
    badgeText: 'Coral Shallows',
    subtitle: '6×6 & 7×7 Tidal Pools & Bottlenecks',
  },
  {
    id: 'summit',
    name: 'Summit',
    emoji: '🏔️',
    startLevel: 76,
    endLevel: 100,
    bgGradient: 'from-indigo-50/70 via-purple-50/50 to-pink-50/50',
    borderColor: 'border-indigo-200',
    badgeBg: 'bg-indigo-100/90 text-indigo-900 border-indigo-300',
    badgeText: 'Celestial Summit',
    subtitle: '7×7 Mountain Mazes to the Throne',
  },
];

export const AdventureCartoonMap: React.FC<AdventureCartoonMapProps> = ({
  profile,
  targetLevel,
  highestUnlocked,
  onPlayLevel,
  onLockedClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeNodeRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>('meadow');
  const [showFindMe, setShowFindMe] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [easterEggToast, setEasterEggToast] = useState<{ message: string; emoji: string } | null>(null);

  const levels = useMemo(() => Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1), []);
  const activeBadge = getBadgeById(profile.activeBadge);

  // Compute total stars collected
  const totalStars = useMemo(() => {
    return Object.values(profile.completedLevels).reduce((acc, rec) => acc + (rec.stars || 3), 0);
  }, [profile.completedLevels]);

  // S-Curve frequency for winding cartoon adventure trail
  const getNodeXPercent = (lvl: number) => {
    const angle = ((lvl - 1) * Math.PI) / 3.6;
    return Math.round(50 + Math.sin(angle) * 31);
  };

  const getNodeY = (lvl: number) => {
    return (TOTAL_LEVELS - lvl) * STRIDE + MAP_TOP_PADDING;
  };

  // Scroll to target level node smoothly
  const scrollToLevel = (lvl: number, behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.current) return;
    const yPos = getNodeY(lvl);
    const container = containerRef.current;
    const targetScroll = Math.max(0, yPos - container.clientHeight / 2 + 30);
    container.scrollTo({ top: targetScroll, behavior });
  };

  // Initial center on target level
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToLevel(targetLevel, 'smooth');
    }, 150);
    return () => clearTimeout(timer);
  }, [targetLevel]);

  // Track scroll position to update active biome tab and show "Find Me" button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const containerHeight = containerRef.current.clientHeight;
    const centerPos = scrollTop + containerHeight / 2;

    // Approximate level at center
    const approximateLevel = Math.max(
      1,
      Math.min(TOTAL_LEVELS, Math.round(TOTAL_LEVELS - (centerPos - MAP_TOP_PADDING) / STRIDE))
    );

    const currentBiome = BIOMES.find(
      (b) => approximateLevel >= b.startLevel && approximateLevel <= b.endLevel
    );
    if (currentBiome && currentBiome.id !== activeTab) {
      setActiveTab(currentBiome.id);
    }

    // Show "Find Me" if scrolled far away from active level (> 240px)
    const targetY = getNodeY(targetLevel);
    const distFromTarget = Math.abs(centerPos - targetY);
    setShowFindMe(distFromTarget > 260);
  };

  // Jump to specific biome start
  const handleTabClick = (biome: BiomeInfo) => {
    sound.playTap();
    setActiveTab(biome.id);
    scrollToLevel(biome.startLevel);
  };

  const handleJumpToCurrent = () => {
    sound.playTap();
    scrollToLevel(targetLevel, 'smooth');
  };

  // Trigger playful landmark easter egg reaction
  const triggerEasterEgg = (
    message: string,
    emoji: string,
    soundType: 'duck' | 'bunny' | 'campfire' | 'balloon' | 'windmill' | 'castle' | 'fanfare' | 'chime' | 'plop' = 'chime'
  ) => {
    if (soundType === 'chime') sound.playChime(1);
    else if (soundType === 'plop') sound.playPop(0.7);
    else if (soundType === 'fanfare' || soundType === 'castle') {
      sound.playVictory();
      triggerPlayfulConfetti();
    } else {
      sound.playEasterEgg(soundType as any);
    }
    setEasterEggToast({ message, emoji });
    setTimeout(() => {
      setEasterEggToast(null);
    }, 2800);
  };

  const totalMapHeight = 7200;

  // Selected level inspection details
  const selectedDiffInfo = selectedLevel ? getLevelDifficultyInfo(selectedLevel) : null;
  const selectedRecord = selectedLevel ? profile.completedLevels[selectedLevel] : null;

  return (
    <div className="relative w-full">
      {/* Easter Egg Floating Toast Banner */}
      {easterEggToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-stone-900 text-white text-xs font-bold shadow-xl border border-stone-700 flex items-center gap-2 animate-bounce">
          <span className="text-base">{easterEggToast.emoji}</span>
          <span>{easterEggToast.message}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. CARTOON MAP HUD & BIOME CHAPTER TABS                   */}
      {/* ========================================================= */}
      <div className="space-y-1.5 mb-2 px-1">
        {/* Top Header Strip: World Star Count & Explorer Level */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-200/80">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="font-mono-numbers">{totalStars}</span>
            <span className="text-stone-400 font-normal">/ {TOTAL_LEVELS * 3} Stars</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. THE CARTOON MAP CONTAINER                              */}
      {/* ========================================================= */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative w-full h-[450px] sm:h-[500px] rounded-3xl border-2 border-[#E6DFC8] bg-[#FBF9F1] shadow-inner overflow-y-auto no-scrollbar select-none"
        style={{
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04), 0 4px 12px rgba(220,210,190,0.25)',
        }}
      >
        {/* Natural Cartoon Landscape: Sky with floating clouds, rolling pasture hills, and continuous meandering river */}
        <LandscapeBackground
          totalMapHeight={totalMapHeight}
          stride={STRIDE}
          mapTopPadding={MAP_TOP_PADDING}
          getNodeY={getNodeY}
        />

        {/* ========================================================= */}
        {/* 3. SVG WINDING CARTOON TRAIL & STEPPING STONES            */}
        {/* ========================================================= */}
        <svg
          className="absolute inset-0 w-full pointer-events-none"
          style={{ height: `${totalMapHeight}px`, zIndex: 1 }}
        >
          <defs>
            {/* Soft drop shadow for cartoon road */}
            <filter id="cartoonRoadShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#8C7960" floodOpacity="0.25" />
            </filter>
            {/* Progress trail glow */}
            <filter id="trailGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#6366F1" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Connect every level node with smooth Bezier curve */}
          {levels.slice(0, -1).map((lvl) => {
            const x1 = getNodeXPercent(lvl);
            const y1 = getNodeY(lvl);
            const x2 = getNodeXPercent(lvl + 1);
            const y2 = getNodeY(lvl + 1);

            const midY = (y1 + y2) / 2;
            const pathData = `M ${x1}% ${y1}px C ${x1}% ${midY}px, ${x2}% ${midY}px, ${x2}% ${y2}px`;
            const isCompletedSegment = lvl < highestUnlocked;

            return (
              <g key={`trail-seg-${lvl}`}>
                {/* 1. Base cartoon dirt road with soft shadow */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="#E8DFC8"
                  strokeWidth="18"
                  strokeLinecap="round"
                  filter="url(#cartoonRoadShadow)"
                />
                <path
                  d={pathData}
                  fill="none"
                  stroke="#FAF6ED"
                  strokeWidth="13"
                  strokeLinecap="round"
                />

                {/* 2. Stepping stones / dashed footprints */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isCompletedSegment ? '#818CF8' : '#C7B9A2'}
                  strokeWidth="3"
                  strokeDasharray="4 7"
                  strokeLinecap="round"
                />

                {/* 3. Completed trail vibrant indigo glowing ribbon */}
                {isCompletedSegment && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#trailGlow)"
                    opacity="0.9"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* ========================================================= */}
        {/* 4. BESPOKE CARTOON LANDMARK ILLUSTRATIONS                 */}
        {/* ========================================================= */}
        <div
          className="absolute inset-0 pointer-events-auto"
          style={{ height: `${totalMapHeight}px`, zIndex: 2 }}
        >
          {/* LEVEL 1: Meadow Start Campfire & Tent */}
          <div
            className="absolute"
            style={{ left: '6%', top: `${getNodeY(1) - 28}px` }}
          >
            <SpriteTentAndFire
              onClick={() =>
                triggerEasterEgg('Cozy campfire! Rest your paws and pack your map.', '🏕️', 'chime')
              }
            />
          </div>

          {/* LEVEL 2: Meadow Village Cottage with puffing chimney smoke */}
          <div
            className="absolute"
            style={{ right: '7%', top: `${getNodeY(2) - 20}px` }}
          >
            <SpriteVillageCottage
              onClick={() =>
                triggerEasterEgg('Puffing village hearth! The bakers are making honey bread.', '🏡', 'chime')
              }
            />
          </div>

          {/* LEVEL 3: Hopping Meadow Bunny */}
          <div
            className="absolute"
            style={{ left: '10%', top: `${getNodeY(3) - 5}px` }}
          >
            <SpriteBunny
              onClick={() =>
                triggerEasterEgg('Boing! Meadow bunny hops cheerfully alongside your trail.', '🐰', 'plop')
              }
            />
          </div>

          {/* LEVEL 4: Pine Trees on right */}
          <div
            className="absolute pointer-events-none animate-map-sway"
            style={{ right: '8%', top: `${getNodeY(4) - 15}px` }}
          >
            <SpritePineTree size={42} />
          </div>

          {/* LEVEL 6: Village Windmill with rotating sails */}
          <div
            className="absolute"
            style={{ right: '8%', top: `${getNodeY(6) - 20}px` }}
          >
            <SpriteWindmill
              onClick={() =>
                triggerEasterEgg('Village windmill sails turning gracefully in the valley breeze!', '🌾', 'plop')
              }
            />
          </div>

          {/* LEVEL 8: Apple Tree on left */}
          <div
            className="absolute pointer-events-none animate-map-sway"
            style={{ left: '7%', top: `${getNodeY(8) - 10}px` }}
          >
            <SpriteAppleTree size={40} />
          </div>

          {/* LEVEL 9: Forest Deer Grazing */}
          <div
            className="absolute"
            style={{ right: '9%', top: `${getNodeY(9) - 10}px` }}
          >
            <SpriteDeer
              onClick={() =>
                triggerEasterEgg('A gentle forest deer looks up from the clover field.', '🦌', 'chime')
              }
            />
          </div>

          {/* LEVEL 10: Milestone Treasure Chest */}
          <div
            className="absolute"
            style={{ left: '10%', top: `${getNodeY(10) - 12}px` }}
          >
            <SpriteTreasureChest
              isUnlocked={highestUnlocked >= 10}
              label="Lv 10 Cache"
              onClick={() =>
                triggerEasterEgg(
                  highestUnlocked >= 10
                    ? '🎉 Cache Claimed! 5x5 obstacles unlocked.'
                    : '🔒 Cache Locked! Clear Level 10 to claim.',
                  '🎁',
                  highestUnlocked >= 10 ? 'fanfare' : 'plop'
                )
              }
            />
          </div>

          {/* LEVEL 12: Whispering Brook River Crossing with Swimming Ducks */}
          <div
            className="absolute w-4/5 left-[10%] h-8 rounded-full bg-sky-200/70 border border-sky-300 flex items-center justify-between px-3 shadow-inner pointer-events-auto"
            style={{ top: `${getNodeY(12) - 35}px` }}
          >
            <span className="text-[10px] font-extrabold text-sky-800 tracking-wider">
              〰️ Whispering Brook
            </span>
            <SpriteRiverDucks
              onClick={() =>
                triggerEasterEgg('Quack! River ducks gliding peacefully along the cool current.', '🦆', 'plop')
              }
            />
          </div>

          {/* LEVEL 14: Riverside Cottage on left */}
          <div
            className="absolute"
            style={{ left: '7%', top: `${getNodeY(14) - 18}px` }}
          >
            <SpriteVillageCottage
              onClick={() =>
                triggerEasterEgg('Riverside cottage with fresh water and flowers in bloom.', '🌸', 'chime')
              }
            />
          </div>

          {/* LEVEL 17: Pine Tree Duo */}
          <div
            className="absolute pointer-events-none animate-map-sway"
            style={{ right: '9%', top: `${getNodeY(17) - 10}px` }}
          >
            <SpritePineTree size={36} />
          </div>

          {/* LEVEL 19: Second Bunny hopping near trail */}
          <div
            className="absolute"
            style={{ left: '9%', top: `${getNodeY(19) - 6}px` }}
          >
            <SpriteBunny
              onClick={() =>
                triggerEasterEgg('Twitchy nose! Another bunny bounding across the grass.', '🐇', 'plop')
              }
            />
          </div>

          {/* LEVEL 22: Magical Fireflies & Fairy Dust in the Meadow Glade */}
          <div
            className="absolute pointer-events-none"
            style={{ right: '12%', top: `${getNodeY(22) - 8}px` }}
          >
            <SpriteMagicalSparkles className="scale-110" />
          </div>

          {/* LEVEL 20: Meadow Crest Milestone Chest */}
          <div
            className="absolute"
            style={{ right: '10%', top: `${getNodeY(20) - 12}px` }}
          >
            <SpriteTreasureChest
              isUnlocked={highestUnlocked >= 20}
              label="Meadow Crest"
              onClick={() =>
                triggerEasterEgg(
                  highestUnlocked >= 20
                    ? '🎉 Meadow Crest Achieved! Onward to the Canyon!'
                    : '🔒 Clear Level 20 to conquer the Meadow.',
                  '🌻',
                  highestUnlocked >= 20 ? 'fanfare' : 'plop'
                )
              }
            />
          </div>

          {/* LEVEL 26: CANYON CHAPTER ENTRANCE BANNER */}
          <div
            className="absolute w-full flex justify-center pointer-events-none"
            style={{ top: `${getNodeY(26) + 35}px` }}
          >
            <div className="px-4 py-1.5 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-900 text-xs font-extrabold shadow-sm flex items-center gap-1.5">
              <span>🏜️</span>
              <span>Chapter 2 · Sunlit Canyon</span>
              <span className="text-amber-700 font-normal">(6×6)</span>
            </div>
          </div>

          {/* LEVEL 28: Cactus on left */}
          <div
            className="absolute animate-map-sway"
            style={{ left: '8%', top: `${getNodeY(28) - 14}px` }}
          >
            <SpriteCactus
              onClick={() =>
                triggerEasterEgg('Howdy! A friendly saguaro blooming in the desert sun.', '🌵', 'plop')
              }
            />
          </div>

          {/* LEVEL 30: Ancient Desert Cache */}
          <div
            className="absolute"
            style={{ right: '10%', top: `${getNodeY(30) - 12}px` }}
          >
            <SpriteTreasureChest
              isUnlocked={highestUnlocked >= 30}
              label="Desert Cache"
              onClick={() =>
                triggerEasterEgg(
                  highestUnlocked >= 30
                    ? '🎉 Ancient Cache Opened! Golden relics found.'
                    : '🔒 Reach Level 30 in the Canyon to unlock!',
                  '🏺',
                  highestUnlocked >= 30 ? 'fanfare' : 'plop'
                )
              }
            />
          </div>

          {/* LEVEL 34: Soaring Canyon Hawk / Bird */}
          <div
            className="absolute pointer-events-none"
            style={{ left: '10%', top: `${getNodeY(34) - 20}px` }}
          >
            <SpriteSoaringBird className="scale-110" />
          </div>

          {/* LEVEL 38: Cactus on right */}
          <div
            className="absolute animate-map-sway"
            style={{ right: '9%', top: `${getNodeY(38) - 14}px` }}
          >
            <SpriteCactus
              onClick={() =>
                triggerEasterEgg('Prickly cactus says: Keep going, traveler!', '🌸', 'plop')
              }
            />
          </div>

          {/* LEVEL 44: Desert Sun Glimmers */}
          <div
            className="absolute pointer-events-none"
            style={{ right: '14%', top: `${getNodeY(44) - 10}px` }}
          >
            <SpriteMagicalSparkles />
          </div>

          {/* LEVEL 40: Canyon Cache */}
          <div
            className="absolute"
            style={{ left: '10%', top: `${getNodeY(40) - 12}px` }}
          >
            <SpriteTreasureChest
              isUnlocked={highestUnlocked >= 40}
              label="Canyon Cache"
              onClick={() =>
                triggerEasterEgg(
                  highestUnlocked >= 40
                    ? '🎉 Milestone cleared! Canyon mastered.'
                    : '🔒 Clear Level 40 to unlock.',
                  '💎',
                  highestUnlocked >= 40 ? 'fanfare' : 'plop'
                )
              }
            />
          </div>

          {/* LEVEL 50: Grand Canyon Milestone */}
          <div
            className="absolute"
            style={{ right: '8%', top: `${getNodeY(50) - 12}px` }}
          >
            <SpriteTreasureChest
              isUnlocked={highestUnlocked >= 50}
              label="Canyon Crown"
              onClick={() =>
                triggerEasterEgg(
                  highestUnlocked >= 50
                    ? '🏆 Halfway mark cleared! The Ocean Lagoon beckons!'
                    : '🔒 Level 50 milestone chest.',
                  '🏆',
                  highestUnlocked >= 50 ? 'fanfare' : 'plop'
                )
              }
            />
          </div>

          {/* LEVEL 51: CORAL LAGOON CHAPTER BANNER */}
          <div
            className="absolute w-full flex justify-center pointer-events-none"
            style={{ top: `${getNodeY(51) + 35}px` }}
          >
            <div className="px-4 py-1.5 rounded-full bg-sky-100 border-2 border-sky-300 text-sky-900 text-xs font-extrabold shadow-sm flex items-center gap-1.5">
              <span>🌊</span>
              <span>Chapter 3 · Coral Shallows</span>
              <span className="text-sky-700 font-normal">(6×6 & 7×7)</span>
            </div>
          </div>

          {/* LEVEL 55: Floating Coral Cloud */}
          <div
            className="absolute pointer-events-none animate-float-1"
            style={{ left: '8%', top: `${getNodeY(55) - 20}px` }}
          >
            <SpriteCloud size={46} />
          </div>

          {/* LEVEL 60: Sunken Treasure Chest */}
          <div
            className="absolute"
            style={{ right: '10%', top: `${getNodeY(60) - 12}px` }}
          >
            <SpriteTreasureChest
              isUnlocked={highestUnlocked >= 60}
              label="Sunken Gem"
              onClick={() =>
                triggerEasterEgg(
                  highestUnlocked >= 60
                    ? '💎 Sunken treasure retrieved from the reef!'
                    : '🔒 Level 60 underwater chest.',
                  '💎',
                  highestUnlocked >= 60 ? 'fanfare' : 'plop'
                )
              }
            />
          </div>

          {/* LEVEL 66: Striped Lighthouse with Sweeping Light */}
          <div
            className="absolute"
            style={{ left: '7%', top: `${getNodeY(66) - 15}px` }}
          >
            <SpriteLighthouse
              onClick={() =>
                triggerEasterEgg('Lighthouse beam active! Guiding through reefs ⚓', '🗼', 'chime')
              }
            />
          </div>

          {/* LEVEL 70: Tidal Cache */}
          <div
            className="absolute"
            style={{ right: '9%', top: `${getNodeY(70) - 12}px` }}
          >
            <SpriteTreasureChest
              isUnlocked={highestUnlocked >= 70}
              label="Tidal Cache"
              onClick={() =>
                triggerEasterEgg(
                  highestUnlocked >= 70
                    ? '🐚 Tidal Pearl Chest opened!'
                    : '🔒 Reach Level 70 to open.',
                  '🐚',
                  highestUnlocked >= 70 ? 'fanfare' : 'plop'
                )
              }
            />
          </div>

          {/* LEVEL 72: Ocean Mist Sparkles */}
          <div
            className="absolute pointer-events-none"
            style={{ left: '10%', top: `${getNodeY(72) - 10}px` }}
          >
            <SpriteMagicalSparkles />
          </div>

          {/* LEVEL 76: CELESTIAL SUMMIT CHAPTER BANNER */}
          <div
            className="absolute w-full flex justify-center pointer-events-none"
            style={{ top: `${getNodeY(76) + 35}px` }}
          >
            <div className="px-4 py-1.5 rounded-full bg-indigo-100 border-2 border-indigo-300 text-indigo-900 text-xs font-extrabold shadow-sm flex items-center gap-1.5">
              <span>🏔️</span>
              <span>Chapter 4 · Star Summit</span>
              <span className="text-indigo-700 font-normal">(7×7 Apex)</span>
            </div>
          </div>

          {/* LEVEL 80: Fluffy Mountain Cloud */}
          <div
            className="absolute pointer-events-none animate-float-2"
            style={{ right: '8%', top: `${getNodeY(80) - 20}px` }}
          >
            <SpriteCloud size={50} />
          </div>

          {/* LEVEL 82: Soaring Mountain Eagles */}
          <div
            className="absolute pointer-events-none"
            style={{ left: '8%', top: `${getNodeY(82) - 15}px` }}
          >
            <SpriteSoaringBird className="scale-125" />
          </div>

          {/* LEVEL 85: Mountain Summit Cache */}
          <div
            className="absolute"
            style={{ left: '9%', top: `${getNodeY(85) - 12}px` }}
          >
            <SpriteTreasureChest
              isUnlocked={highestUnlocked >= 85}
              label="Summit Cache"
              onClick={() =>
                triggerEasterEgg(
                  highestUnlocked >= 85
                    ? '⭐ Celestial Star Cache unlocked!'
                    : '🔒 Reach Level 85 to open.',
                  '⭐',
                  highestUnlocked >= 85 ? 'fanfare' : 'plop'
                )
              }
            />
          </div>

          {/* LEVEL 88: Gentle Hot Air Balloon */}
          <div
            className="absolute"
            style={{ right: '8%', top: `${getNodeY(88) - 15}px` }}
          >
            <SpriteHotAirBalloon
              onClick={() =>
                triggerEasterEgg('Honk honk! The Sky Voyager is cruising above the peaks 🎈', '🎈', 'plop')
              }
            />
          </div>

          {/* LEVEL 94: Starlight Fireflies */}
          <div
            className="absolute pointer-events-none"
            style={{ left: '12%', top: `${getNodeY(94) - 10}px` }}
          >
            <SpriteMagicalSparkles className="scale-125" />
          </div>

          {/* LEVEL 100: GRAND CELESTIAL CITADEL FINALE */}
          <div
            className="absolute flex flex-col items-center"
            style={{
              left: '50%',
              top: `${getNodeY(100) - 86}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-black shadow-md border-2 border-amber-200 animate-gentle-bounce mb-1">
              <Sparkles className="w-3.5 h-3.5 fill-amber-950" />
              <span>THE GOLDEN CASTLE</span>
              <Sparkles className="w-3.5 h-3.5 fill-amber-950" />
            </div>
            <SpriteCastle
              onClick={() =>
                triggerEasterEgg(
                  'The Grand Citadel of Axiom! Connect all 100 levels to claim the crown! 👑',
                  '🏰',
                  'fanfare'
                )
              }
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. TACTILE 3D CARTOON CANDY NODES                        */}
        {/* ========================================================= */}
        <div
          className="relative"
          style={{ height: '7200px', width: '341px', zIndex: 3 }}
        >
          {levels.map((lvl) => {
            const isCompleted = Boolean(profile.completedLevels[lvl]);
            const isCurrent = lvl === targetLevel;
            const isUnlocked = lvl <= highestUnlocked;
            const xPercent = getNodeXPercent(lvl);
            const yPos = getNodeY(lvl);
            const isMilestone = lvl % 10 === 0;
            const record = profile.completedLevels[lvl];
            const starCount = record?.stars || 3;

            return (
              <div
                key={`cartoon-node-${lvl}`}
                ref={isCurrent ? activeNodeRef : undefined}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${xPercent}%`, top: `${yPos}px` }}
              >
                {/* Active Player Character Mascot Token */}
                {isCurrent && (
                  <div className="absolute -top-12 z-20 flex flex-col items-center animate-mascot-hop pointer-events-none">
                    {/* Speech Bubble */}
                    <div className="px-2.5 py-0.5 rounded-full bg-stone-900 text-white text-[10px] font-extrabold tracking-wide shadow-md flex items-center gap-1.5 whitespace-nowrap mb-0.5 border border-stone-700">
                      <span>{activeBadge ? activeBadge.emoji : '🐾'}</span>
                      <span>Level {lvl}</span>
                    </div>
                    {/* Downward triangle pointer */}
                    <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-stone-900 -mt-0.5" />
                  </div>
                )}

                {/* 3D Tactile Candy Pebble Button */}
                <button
                  onClick={() => {
                    if (isUnlocked) {
                      sound.playModalOpen();
                      setSelectedLevel(lvl);
                    } else {
                      onLockedClick(lvl);
                    }
                  }}
                  className={`relative w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all duration-150 select-none btn-tactile ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-lg border-b-4 border-indigo-900 scale-110 active:border-b-0 active:translate-y-1'
                      : isCompleted
                      ? 'bg-emerald-500 text-white shadow-xs border-b-4 border-emerald-700 hover:brightness-105 active:border-b-0 active:translate-y-1'
                      : isUnlocked
                      ? 'bg-sky-500 text-white shadow-xs border-b-4 border-sky-700 hover:brightness-105 active:border-b-0 active:translate-y-1'
                      : 'bg-stone-200 text-stone-400 border-b-4 border-stone-300 cursor-not-allowed'
                  }`}
                  aria-label={`Level ${lvl} ${isCompleted ? 'Completed' : isUnlocked ? 'Unlocked' : 'Locked'}`}
                >
                  {/* Subtle top inner shine */}
                  <div className="absolute top-1 left-2 right-2 h-1.5 rounded-full bg-white/30 pointer-events-none" />

                  {/* Pulsing halo ring for current level */}
                  {isCurrent && (
                    <div className="absolute -inset-1.5 rounded-2xl border-2 border-indigo-500 animate-ping pointer-events-none opacity-60" />
                  )}

                  {/* Node Content */}
                  {isCompleted ? (
                    <div className="flex flex-col items-center leading-none">
                      <Check className="w-4 h-4 stroke-[3.5]" />
                      <span className="text-[9px] font-mono-numbers font-bold opacity-90 mt-0.5">
                        {lvl}
                      </span>
                    </div>
                  ) : isUnlocked ? (
                    <div className="flex flex-col items-center leading-none">
                      {isMilestone && <span className="text-[9px] -mt-1">👑</span>}
                      <span className="font-mono-numbers font-extrabold text-sm">
                        {lvl}
                      </span>
                    </div>
                  ) : (
                    <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                </button>

                {/* Stars earned badge under completed node */}
                {isCompleted && (
                  <div className="flex items-center gap-0.5 mt-1 pointer-events-none">
                    {Array.from({ length: starCount }).map((_, sIdx) => (
                      <Star
                        key={sIdx}
                        className="w-2.5 h-2.5 fill-amber-400 text-amber-400 drop-shadow-2xs"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. "FIND ME" FLOATING SNAP BUTTON                         */}
      {/* ========================================================= */}
      {showFindMe && (
        <button
          onClick={handleJumpToCurrent}
          className="absolute bottom-4 right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 text-white text-xs font-bold shadow-lg border border-stone-700 hover:bg-stone-800 active:scale-95 transition-all animate-bounce"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Find Me (Lv {targetLevel})</span>
        </button>
      )}

      {/* ========================================================= */}
      {/* 7. PLAYFUL LEVEL INSPECTION DRAWER / PREVIEW MODAL         */}
      {/* ========================================================= */}
      {selectedLevel && selectedDiffInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl border-2 border-stone-200 text-stone-900 text-center animate-in zoom-in-95 duration-150 relative">
            {/* Close Button */}
            <button
              onClick={() => {
                sound.playModalClose();
                setSelectedLevel(null);
              }}
              className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Level Icon Badge */}
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto shadow-md shadow-indigo-500/30 mb-2 border-b-4 border-indigo-800">
              {selectedLevel}
            </div>

            <h3 className="text-lg font-black text-stone-900">
              Level {selectedLevel}
            </h3>
            <p className="text-xs text-indigo-600 font-bold mt-0.5">
              {selectedDiffInfo.label} · {selectedDiffInfo.gridSize} Grid
            </p>

            {/* Badges Info */}
            <div className="flex items-center justify-center gap-2 my-3 text-[11px] font-semibold">
              <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                {selectedDiffInfo.hasObstacles ? '🧱 Obstacles' : '🌱 Open Meadow'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                ⭐ 3 Stars
              </span>
            </div>

            {/* Record Stats if completed */}
            {selectedRecord ? (
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 mb-4 text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 block font-semibold">BEST TIME</span>
                  <span className="font-mono-numbers font-bold text-stone-800">
                    {Math.floor(selectedRecord.bestTime / 60)}:
                    {(selectedRecord.bestTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block font-semibold">BEST MOVES</span>
                  <span className="font-mono-numbers font-bold text-stone-800">
                    {selectedRecord.bestMoves}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
                ★ Uncharted trail! Connect checkpoints to conquer.
              </div>
            )}

            {/* Play Button */}
            <button
              onClick={() => {
                sound.playLevelStart();
                const lvl = selectedLevel;
                setSelectedLevel(null);
                onPlayLevel(lvl);
              }}
              className="btn-tactile w-full py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-500/30 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{selectedRecord ? 'REPLAY LEVEL' : 'START PUZZLE'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
