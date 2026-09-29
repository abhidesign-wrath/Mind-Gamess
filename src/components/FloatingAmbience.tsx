import React from 'react';
import { SpriteSoaringBird, SpriteCloud, SpriteMagicalSparkles } from './CartoonMapSprites';

interface FloatingAmbienceProps {
  variant?: 'home' | 'game';
}

/**
 * Magical atmospheric background with:
 * - Distant layered mountain peaks & soft sky horizon
 * - Animated soaring birds gliding across the sky
 * - Soft drifting cloud puffs
 * - Shimmering floating firefly / fairy dust particles
 */
export const FloatingAmbience: React.FC<FloatingAmbienceProps> = ({ variant = 'home' }) => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* 1. Warm morning sky & celestial ambient glows */}
      <div className="absolute -top-36 -left-36 w-96 h-96 rounded-full bg-amber-100/45 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-36 w-96 h-96 rounded-full bg-indigo-100/35 blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 -left-32 w-80 h-80 rounded-full bg-teal-100/30 blur-3xl pointer-events-none" />

      {/* 2. Animated Soaring Birds gliding across the sky */}
      <div className="absolute top-10 left-0 w-full overflow-hidden h-24">
        {/* Bird flock 1 */}
        <div className="absolute animate-bird-flight-1 flex items-center gap-3">
          <SpriteSoaringBird className="scale-90" />
          <SpriteSoaringBird className="scale-75 -mt-2" />
          <SpriteSoaringBird className="scale-60 -mt-1" />
        </div>
        {/* Bird flock 2 (delayed flight path) */}
        <div className="absolute animate-bird-flight-2 top-8 flex items-center gap-2.5">
          <SpriteSoaringBird className="scale-75" />
          <SpriteSoaringBird className="scale-60 -mt-1.5" />
        </div>
      </div>

      {/* 3. Soft Drifting Pastel Clouds in the Sky */}
      <div className="absolute top-6 left-8 opacity-40 animate-float-1" style={{ animationDuration: '18s' }}>
        <SpriteCloud size={60} />
      </div>
      <div className="absolute top-16 right-10 opacity-35 animate-float-2" style={{ animationDuration: '22s' }}>
        <SpriteCloud size={75} />
      </div>

      {/* 4. Magical Shimmering Fireflies & Fairy Dust */}
      <div className="absolute top-1/3 left-12 opacity-60">
        <SpriteMagicalSparkles />
      </div>
      <div className="absolute top-1/2 right-14 opacity-60">
        <SpriteMagicalSparkles className="scale-125" />
      </div>
      <div className="absolute bottom-1/4 left-16 opacity-60">
        <SpriteMagicalSparkles className="scale-110" />
      </div>

      {/* 5. Distant Layered Mountains & Horizon Silhouette (SVG) */}
      <svg
        className="absolute bottom-0 left-0 w-full h-40 sm:h-52 opacity-30 pointer-events-none"
        viewBox="0 0 1440 280"
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Far Celestial Mountains (Lavender/Purple) */}
        <path
          d="M0 160L80 120L200 180L320 90L460 170L600 80L720 160L860 70L980 150L1120 85L1240 160L1360 100L1440 140V280H0Z"
          fill="#DDD6FE"
          fillOpacity="0.5"
        />
        {/* Mid-range Gentle Peaks (Teal/Sage) */}
        <path
          d="M0 190L120 150L260 210L380 140L520 200L660 130L800 200L920 140L1060 190L1200 130L1340 180L1440 160V280H0Z"
          fill="#A7F3D0"
          fillOpacity="0.45"
        />
        {/* Near Rolling Green Foothills */}
        <path
          d="M0 230C180 200 360 250 540 220C720 190 900 240 1080 210C1260 180 1360 220 1440 210V280H0Z"
          fill="#E2E8F0"
          fillOpacity="0.6"
        />
      </svg>
    </div>
  );
};
