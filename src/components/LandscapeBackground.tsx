import React from 'react';
import { SpriteCloud, SpriteRiverDucks, SpriteSoaringBird } from './CartoonMapSprites';

interface LandscapeBackgroundProps {
  totalMapHeight: number;
  stride: number;
  mapTopPadding: number;
  getNodeY: (lvl: number) => number;
}

/**
 * Natural, whimsical cartoon landscape background:
 * - Sky with drifting, floating clouds
 * - Lush green pasture lands, rolling hill contours, and sandy dunes
 * - Continuous winding cartoon river with sandy banks, water ripples, and lily pads
 * - Wildflower clover patches and terrain texture (No mechanical dot grids!)
 */
export const LandscapeBackground: React.FC<LandscapeBackgroundProps> = ({
  totalMapHeight,
  getNodeY,
}) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      style={{ height: `${totalMapHeight}px`, zIndex: 0 }}
      aria-hidden="true"
    >
      {/* ========================================================= */}
      {/* 1. SKY & TERRAIN BASE BIOME GRADIENTS                     */}
      {/* ========================================================= */}
      {/* Zone 1: Celestial Twilight Sky & Starlit Peaks (Lv 76 - 100) */}
      <div
        className="absolute w-full bg-gradient-to-b from-[#ECE8F8] via-[#E2DCF7] to-[#D5CDF4]"
        style={{
          top: 0,
          height: `${getNodeY(76)}px`,
        }}
      />

      {/* Zone 2: Tropical Lagoon Sky & Coral Shores (Lv 51 - 75) */}
      <div
        className="absolute w-full bg-gradient-to-b from-[#E5F5F7] via-[#DEF3F6] to-[#ECE8F8]"
        style={{
          top: `${getNodeY(76)}px`,
          height: `${getNodeY(51) - getNodeY(76)}px`,
        }}
      />

      {/* Zone 3: Warm Canyon Sun & Desert Bluffs (Lv 26 - 50) */}
      <div
        className="absolute w-full bg-gradient-to-b from-[#FAF3E0] via-[#FDF0DE] to-[#E5F5F7]"
        style={{
          top: `${getNodeY(51)}px`,
          height: `${getNodeY(26) - getNodeY(51)}px`,
        }}
      />

      {/* Zone 4: Sunny Meadow Sky & Rolling Pastures (Lv 1 - 25) */}
      <div
        className="absolute w-full bg-gradient-to-b from-[#EBF8EE] via-[#E4F5E8] to-[#FAF3E0]"
        style={{
          top: `${getNodeY(26)}px`,
          height: `${totalMapHeight - getNodeY(26)}px`,
        }}
      />

      {/* ========================================================= */}
      {/* 2. SVG NATURAL LANDSCAPE & CONTINUOUS WINDING RIVER       */}
      {/* ========================================================= */}
      <svg
        className="absolute inset-0 w-full pointer-events-none"
        style={{ height: `${totalMapHeight}px`, transform: 'scaleY(-1)' }}
        viewBox={`0 0 400 ${totalMapHeight}`}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Soft drop shadow for river banks */}
          <filter id="riverBankShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#8B7E66" floodOpacity="0.2" />
          </filter>
          {/* River water gradient */}
          <linearGradient id="riverWater" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>

        {/* ------------------------------------------------------------- */}
        {/* ROLLING GREEN HILL CONTOURS (Left & Right landscape flanks)  */}
        {/* ------------------------------------------------------------- */}
        {/* Meadow rolling hills (Left flank) */}
        <path
          d={`M0 0 Q60 120 20 280 T70 600 T15 950 T65 1300 T20 1700 T70 2100 T0 2400 Z`}
          fill="#D1FAE5"
          fillOpacity="0.5"
        />
        <path
          d={`M0 60 Q45 180 15 380 T50 750 T10 1150 T55 1550 T15 1950 T0 2300 Z`}
          fill="#A7F3D0"
          fillOpacity="0.4"
        />

        {/* Meadow rolling hills (Right flank) */}
        <path
          d={`M400 0 Q340 140 385 320 T330 680 T390 1050 T335 1420 T385 1800 T330 2200 T400 2400 Z`}
          fill="#D1FAE5"
          fillOpacity="0.5"
        />
        <path
          d={`M400 80 Q355 220 390 420 T345 820 T395 1250 T350 1650 T390 2050 T400 2350 Z`}
          fill="#A7F3D0"
          fillOpacity="0.4"
        />

        {/* Canyon Sandstone Terraces (Middle Section) */}
        <path
          d={`M0 2400 Q80 2600 25 2850 T90 3250 T20 3650 T85 4050 T15 4450 T0 4800 Z`}
          fill="#FED7AA"
          fillOpacity="0.35"
        />
        <path
          d={`M400 2400 Q320 2650 380 2900 T310 3300 T385 3700 T320 4100 T385 4500 T400 4800 Z`}
          fill="#FED7AA"
          fillOpacity="0.35"
        />

        {/* Coral Lagoon Sandy Shorelines & Sandbars */}
        <path
          d={`M0 4800 Q100 5050 30 5350 T110 5750 T25 6150 T100 6550 T20 6950 T0 7200 Z`}
          fill="#BAE6FD"
          fillOpacity="0.4"
        />
        <path
          d={`M400 4800 Q300 5100 375 5400 T290 5800 T380 6200 T300 6600 T380 7000 T400 7200 Z`}
          fill="#BAE6FD"
          fillOpacity="0.4"
        />

        {/* Celestial Mountain Peak Slopes (Top Section) */}
        <path
          d={`M0 7200 Q90 7450 35 7750 T105 8150 T30 8550 T95 8950 T0 9400 Z`}
          fill="#DDD6FE"
          fillOpacity="0.4"
        />
        <path
          d={`M400 7200 Q310 7500 370 7800 T295 8200 T375 8600 T305 9000 T400 9400 Z`}
          fill="#DDD6FE"
          fillOpacity="0.4"
        />

        {/* ------------------------------------------------------------- */}
        {/* CONTINUOUS MEANDERING CARTOON RIVER                          */}
        {/* ------------------------------------------------------------- */}
        {/* The river originates in the high mountain snows and flows     */}
        {/* all the way down through the canyon and meadows to the sea!  */}

        {/* 1. River Sand/Pebble Bank (Outer under-stroke) */}
        <path
          d={`M 180 0
              C 190 250, 110 500, 120 750
              C 130 950, 260 1100, 250 1350
              C 240 1600, 130 1850, 150 2100
              C 170 2350, 280 2550, 270 2800
              C 260 3050, 120 3250, 130 3550
              C 140 3800, 270 4050, 260 4350
              C 250 4650, 130 4900, 140 5200
              C 150 5500, 290 5750, 280 6100
              C 270 6400, 110 6700, 120 7050
              C 130 7400, 280 7700, 270 8100
              C 260 8500, 130 8850, 150 9200
              L 160 ${totalMapHeight}`}
          fill="none"
          stroke="#E6DFCC"
          strokeWidth="32"
          strokeLinecap="round"
          filter="url(#riverBankShadow)"
        />

        {/* 2. River Blue Water Channel */}
        <path
          d={`M 180 0
              C 190 250, 110 500, 120 750
              C 130 950, 260 1100, 250 1350
              C 240 1600, 130 1850, 150 2100
              C 170 2350, 280 2550, 270 2800
              C 260 3050, 120 3250, 130 3550
              C 140 3800, 270 4050, 260 4350
              C 250 4650, 130 4900, 140 5200
              C 150 5500, 290 5750, 280 6100
              C 270 6400, 110 6700, 120 7050
              C 130 7400, 280 7700, 270 8100
              C 260 8500, 130 8850, 150 9200
              L 160 ${totalMapHeight}`}
          fill="none"
          stroke="url(#riverWater)"
          strokeWidth="22"
          strokeLinecap="round"
        />

        {/* 3. Foaming River Ripples & Water Highlights */}
        <path
          d={`M 180 0
              C 190 250, 110 500, 120 750
              C 130 950, 260 1100, 250 1350
              C 240 1600, 130 1850, 150 2100
              C 170 2350, 280 2550, 270 2800
              C 260 3050, 120 3250, 130 3550
              C 140 3800, 270 4050, 260 4350
              C 250 4650, 130 4900, 140 5200
              C 150 5500, 290 5750, 280 6100
              C 270 6400, 110 6700, 120 7050
              C 130 7400, 280 7700, 270 8100
              C 260 8500, 130 8850, 150 9200
              L 160 ${totalMapHeight}`}
          fill="none"
          stroke="#E0F2FE"
          strokeWidth="3.5"
          strokeDasharray="14 18"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* ------------------------------------------------------------- */}
        {/* TINY RIVER DETAILS: Water Lilies, Docks & River Pebbles       */}
        {/* ------------------------------------------------------------- */}
        {/* Lily Pads at River Bends */}
        <circle cx="125" cy="740" r="4.5" fill="#15803D" />
        <circle cx="127" cy="739" r="1.5" fill="#F472B6" />
        <circle cx="118" cy="746" r="3.5" fill="#16A34A" />

        <circle cx="254" cy="1360" r="5" fill="#15803D" />
        <circle cx="256" cy="1359" r="1.5" fill="#F472B6" />

        <circle cx="152" cy="2120" r="4.5" fill="#15803D" />
        <circle cx="266" cy="4360" r="5" fill="#15803D" />
        <circle cx="144" cy="5220" r="5.5" fill="#0D9488" />

        {/* River Sandbar Pebbles */}
        <ellipse cx="132" cy="760" rx="3" ry="1.8" fill="#CBD5E1" />
        <ellipse cx="242" cy="1340" rx="3.5" ry="2" fill="#E2E8F0" />
        <ellipse cx="140" cy="2080" rx="3" ry="1.5" fill="#CBD5E1" />
        <ellipse cx="262" cy="2780" rx="3.5" ry="2" fill="#FED7AA" />
      </svg>

      {/* ========================================================= */}
      {/* 3. SKY FLOATING CLOUDS DRIFTING ACROSS MULTIPLE REALMS    */}
      {/* ========================================================= */}
      {/* Clouds in Meadow Sky */}
      <div
        className="absolute left-6 pointer-events-none opacity-60 animate-float-1"
        style={{ top: `${getNodeY(3) - 20}px`, animationDuration: '14s' }}
      >
        <SpriteCloud size={56} />
      </div>
      <div
        className="absolute right-6 pointer-events-none opacity-50 animate-float-2"
        style={{ top: `${getNodeY(7) - 10}px`, animationDuration: '18s' }}
      >
        <SpriteCloud size={68} />
      </div>
      <div
        className="absolute left-10 pointer-events-none opacity-55 animate-float-1"
        style={{ top: `${getNodeY(15) - 15}px`, animationDuration: '16s' }}
      >
        <SpriteCloud size={60} />
      </div>
      <div
        className="absolute right-8 pointer-events-none opacity-60 animate-float-2"
        style={{ top: `${getNodeY(23) - 20}px`, animationDuration: '20s' }}
      >
        <SpriteCloud size={74} />
      </div>

      {/* Clouds in Canyon Sky */}
      <div
        className="absolute left-8 pointer-events-none opacity-45 animate-float-1"
        style={{ top: `${getNodeY(31) - 15}px`, animationDuration: '19s' }}
      >
        <SpriteCloud size={62} />
      </div>
      <div
        className="absolute right-10 pointer-events-none opacity-50 animate-float-2"
        style={{ top: `${getNodeY(41) - 20}px`, animationDuration: '17s' }}
      >
        <SpriteCloud size={70} />
      </div>
      <div
        className="absolute left-6 pointer-events-none opacity-40 animate-float-1"
        style={{ top: `${getNodeY(48) - 10}px`, animationDuration: '21s' }}
      >
        <SpriteCloud size={55} />
      </div>

      {/* Clouds in Lagoon Sky */}
      <div
        className="absolute right-8 pointer-events-none opacity-55 animate-float-2"
        style={{ top: `${getNodeY(57) - 25}px`, animationDuration: '15s' }}
      >
        <SpriteCloud size={72} />
      </div>
      <div
        className="absolute left-7 pointer-events-none opacity-50 animate-float-1"
        style={{ top: `${getNodeY(65) - 15}px`, animationDuration: '18s' }}
      >
        <SpriteCloud size={64} />
      </div>
      <div
        className="absolute right-12 pointer-events-none opacity-60 animate-float-2"
        style={{ top: `${getNodeY(73) - 20}px`, animationDuration: '16s' }}
      >
        <SpriteCloud size={78} />
      </div>

      {/* Floating Cloud Banks around Summit Peaks */}
      <div
        className="absolute left-5 pointer-events-none opacity-70 animate-float-1"
        style={{ top: `${getNodeY(79) - 20}px`, animationDuration: '13s' }}
      >
        <SpriteCloud size={80} />
      </div>
      <div
        className="absolute right-6 pointer-events-none opacity-75 animate-float-2"
        style={{ top: `${getNodeY(86) - 25}px`, animationDuration: '16s' }}
      >
        <SpriteCloud size={88} />
      </div>
      <div
        className="absolute left-8 pointer-events-none opacity-80 animate-float-1"
        style={{ top: `${getNodeY(93) - 30}px`, animationDuration: '14s' }}
      >
        <SpriteCloud size={94} />
      </div>
      <div
        className="absolute right-7 pointer-events-none opacity-85 animate-float-2"
        style={{ top: `${getNodeY(98) - 35}px`, animationDuration: '12s' }}
      >
        <SpriteCloud size={100} />
      </div>

      {/* ========================================================= */}
      {/* 4. WILDFLOWER CLOVER PATCHES & PASTURE LAND DETAILS       */}
      {/* ========================================================= */}
      {/* Daisies in Meadow */}
      <div className="absolute left-14 text-xs select-none opacity-70" style={{ top: `${getNodeY(5) + 20}px` }}>
        🌼🌼
      </div>
      <div className="absolute right-16 text-xs select-none opacity-70" style={{ top: `${getNodeY(11) - 10}px` }}>
        🌸🌼
      </div>
      <div className="absolute left-16 text-xs select-none opacity-70" style={{ top: `${getNodeY(18) + 15}px` }}>
        🌼🌸
      </div>
      <div className="absolute right-14 text-xs select-none opacity-70" style={{ top: `${getNodeY(24) - 5}px` }}>
        🍀🌼
      </div>

      {/* Desert Fossils & Blooms in Canyon */}
      <div className="absolute left-14 text-xs select-none opacity-60" style={{ top: `${getNodeY(35) + 15}px` }}>
        🌾
      </div>
      <div className="absolute right-14 text-xs select-none opacity-60" style={{ top: `${getNodeY(46) - 10}px` }}>
        🪨
      </div>

      {/* Shells & Starfish in Lagoon Shores */}
      <div className="absolute left-16 text-xs select-none opacity-75" style={{ top: `${getNodeY(59) + 20}px` }}>
        🐚
      </div>
      <div className="absolute right-14 text-xs select-none opacity-75" style={{ top: `${getNodeY(69) - 15}px` }}>
        ⭐
      </div>

      {/* Twinkling Starlight Sparks on the Summit */}
      <div className="absolute left-14 text-xs select-none opacity-80" style={{ top: `${getNodeY(83) + 10}px` }}>
        ✨
      </div>
      <div className="absolute right-16 text-xs select-none opacity-85" style={{ top: `${getNodeY(91) - 10}px` }}>
        ⭐✨
      </div>
      <div className="absolute left-12 text-xs select-none opacity-90" style={{ top: `${getNodeY(97) - 15}px` }}>
        ✨👑✨
      </div>
    </div>
  );
};
