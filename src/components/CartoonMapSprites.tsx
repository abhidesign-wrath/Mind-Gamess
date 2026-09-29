import React from 'react';

/**
 * High-quality, lightweight, responsive SVG cartoon illustrations for the adventure map.
 * Designed with soft pastel palettes, rounded friendly corners, and cartoon charm.
 */

export const SpriteTentAndFire: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div
    onClick={onClick}
    className="relative flex items-end gap-2 cursor-pointer group hover:scale-105 transition-transform"
    title="Adventurer's Camp (Click me!)"
  >
    {/* Cozy Tent */}
    <svg width="44" height="38" viewBox="0 0 44 38" fill="none" className="drop-shadow-xs">
      {/* Tent shadow */}
      <ellipse cx="22" cy="35" rx="20" ry="3" fill="#D5CEBA" fillOpacity="0.7" />
      {/* Tent Left Canvas (Green) */}
      <path d="M22 6L4 34H22L22 6Z" fill="#10B981" />
      <path d="M22 6L4 34H12L22 6Z" fill="#059669" />
      {/* Tent Right Canvas (Teal) */}
      <path d="M22 6L40 34H22L22 6Z" fill="#0D9488" />
      {/* Tent Door Flap (Open) */}
      <path d="M22 14L15 34H29L22 14Z" fill="#064E3B" />
      {/* Inside Tent Warm Glow */}
      <path d="M22 20L18 34H26L22 20Z" fill="#FDE047" fillOpacity="0.8" />
      {/* Tent Poles */}
      <line x1="22" y1="4" x2="22" y2="7" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
      <circle cx="22" cy="4" r="1.5" fill="#F59E0B" />
    </svg>

    {/* Crackling Campfire */}
    <div className="flex flex-col items-center">
      <svg width="26" height="30" viewBox="0 0 26 30" fill="none" className="drop-shadow-xs">
        {/* Ground shadow */}
        <ellipse cx="13" cy="27" rx="11" ry="2.5" fill="#D5CEBA" fillOpacity="0.7" />
        {/* Stone ring */}
        <ellipse cx="6" cy="25" rx="3.5" ry="2" fill="#78716C" />
        <ellipse cx="13" cy="26" rx="4" ry="2" fill="#57534E" />
        <ellipse cx="20" cy="25" rx="3.5" ry="2" fill="#78716C" />
        {/* Wooden Logs */}
        <line x1="6" y1="26" x2="20" y2="20" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
        <line x1="20" y1="26" x2="6" y2="20" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
        {/* Flame (Outer Orange) */}
        <path
          d="M13 5C13 5 18 12 18 18C18 21.5 15.5 24 13 24C10.5 24 8 21.5 8 18C8 12 13 5 13 5Z"
          fill="#F97316"
          className="animate-campfire"
          style={{ transformOrigin: 'bottom center' }}
        />
        {/* Flame (Inner Yellow) */}
        <path
          d="M13 11C13 11 16 15 16 19C16 21 14.5 23 13 23C11.5 23 10 21 10 19C10 15 13 11 13 11Z"
          fill="#FDE047"
          className="animate-campfire"
          style={{ transformOrigin: 'bottom center', animationDelay: '0.2s' }}
        />
      </svg>
      <span className="text-[8px] font-black text-amber-800 tracking-wider uppercase -mt-0.5">Camp</span>
    </div>
  </div>
);

export const SpritePineTree: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => (
  <svg
    width={size}
    height={size * 1.25}
    viewBox="0 0 40 50"
    fill="none"
    className={`drop-shadow-xs ${className}`}
  >
    {/* Shadow */}
    <ellipse cx="20" cy="46" rx="14" ry="3" fill="#D5CEBA" fillOpacity="0.6" />
    {/* Trunk */}
    <rect x="17" y="36" width="6" height="10" rx="2" fill="#78350F" />
    {/* Bottom Foliage Tier */}
    <path d="M20 18L36 38H4L20 18Z" fill="#047857" />
    <path d="M20 18L4 38H16L20 18Z" fill="#065F46" />
    {/* Middle Foliage Tier */}
    <path d="M20 10L32 26H8L20 10Z" fill="#059669" />
    <path d="M20 10L8 26H16L20 10Z" fill="#047857" />
    {/* Top Foliage Tier */}
    <path d="M20 2L28 14H12L20 2Z" fill="#10B981" />
    <path d="M20 2L12 14H18L20 2Z" fill="#059669" />
    {/* Top Star/Cap */}
    <circle cx="20" cy="3" r="1.5" fill="#FDE047" />
  </svg>
);

export const SpriteAppleTree: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => (
  <svg
    width={size}
    height={size * 1.25}
    viewBox="0 0 40 50"
    fill="none"
    className={`drop-shadow-xs ${className}`}
  >
    {/* Shadow */}
    <ellipse cx="20" cy="46" rx="13" ry="3" fill="#D5CEBA" fillOpacity="0.6" />
    {/* Trunk */}
    <rect x="17" y="28" width="6" height="18" rx="2" fill="#854D0E" />
    {/* Bush Foliage */}
    <circle cx="20" cy="20" r="16" fill="#16A34A" />
    <circle cx="13" cy="17" r="10" fill="#22C55E" />
    <circle cx="27" cy="18" r="9" fill="#15803D" />
    {/* Tiny Red Apples */}
    <circle cx="14" cy="15" r="2.2" fill="#EF4444" />
    <circle cx="24" cy="14" r="2.2" fill="#EF4444" />
    <circle cx="19" cy="23" r="2.2" fill="#EF4444" />
  </svg>
);

export const SpriteCactus: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer group hover:scale-110 transition-transform"
    title="Friendly Saguaro (Click me!)"
  >
    <svg width="36" height="48" viewBox="0 0 36 48" fill="none" className="drop-shadow-xs">
      {/* Shadow */}
      <ellipse cx="18" cy="44" rx="14" ry="3" fill="#E2D4BF" fillOpacity="0.8" />
      {/* Left Arm */}
      <path
        d="M14 24H8C6 24 5 22 5 20V14C5 12 7 12 7 14V19C7 20 8 20 9 20H14"
        stroke="#15803D"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* Right Arm */}
      <path
        d="M22 28H28C30 28 31 26 31 24V18C31 16 29 16 29 18V23C29 24 28 24 27 24H22"
        stroke="#15803D"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* Main Body */}
      <rect x="13" y="6" width="10" height="38" rx="5" fill="#16A34A" />
      {/* Highlights */}
      <rect x="15" y="8" width="2" height="32" rx="1" fill="#4ADE80" opacity="0.6" />
      {/* Desert Bloom Flower */}
      <circle cx="18" cy="4" r="3.5" fill="#EC4899" />
      <circle cx="18" cy="4" r="1.5" fill="#FDE047" />
    </svg>
  </div>
);

export const SpriteTreasureChest: React.FC<{
  isUnlocked?: boolean;
  label?: string;
  onClick?: () => void;
}> = ({ isUnlocked = false, label = 'Treasure', onClick }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center cursor-pointer group hover:scale-110 active:scale-95 transition-transform"
    title={`${label} (Click to inspect!)`}
  >
    <svg width="40" height="34" viewBox="0 0 40 34" fill="none" className="drop-shadow-sm">
      {/* Shadow */}
      <ellipse cx="20" cy="31" rx="16" ry="2.5" fill="#CBBFA8" fillOpacity="0.7" />
      {/* Chest Base */}
      <rect x="4" y="14" width="32" height="16" rx="3" fill="#854D0E" />
      {/* Chest Lid */}
      <path
        d="M4 14C4 9 9 5 20 5C31 5 36 9 36 14H4Z"
        fill={isUnlocked ? '#A16207' : '#92400E'}
      />
      {/* Gold Bands */}
      <rect x="10" y="5" width="3" height="25" fill="#FBBF24" />
      <rect x="27" y="5" width="3" height="25" fill="#FBBF24" />
      {/* Lock Latch */}
      <rect x="18" y="12" width="4" height="6" rx="1" fill="#F59E0B" />
      <circle cx="20" cy="15" r="1" fill="#451A03" />
      {/* Sparkles if unlocked */}
      {isUnlocked && (
        <>
          <circle cx="8" cy="4" r="2" fill="#FDE047" className="animate-ping" />
          <circle cx="32" cy="6" r="1.5" fill="#FDE047" />
        </>
      )}
    </svg>
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/95 border border-amber-300 shadow-2xs mt-0.5">
      <span className="text-[8px] font-extrabold text-amber-900 whitespace-nowrap">
        {label}
      </span>
    </div>
  </div>
);

export const SpriteLighthouse: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center cursor-pointer group hover:scale-105 transition-transform"
    title="Coral Lighthouse (Click me!)"
  >
    <svg width="38" height="60" viewBox="0 0 38 60" fill="none" className="drop-shadow-md">
      {/* Shadow */}
      <ellipse cx="19" cy="56" rx="15" ry="3" fill="#B7D2DE" fillOpacity="0.8" />
      {/* Base Rock */}
      <ellipse cx="19" cy="54" rx="12" ry="4" fill="#64748B" />
      {/* Tower Body */}
      <polygon points="12,52 26,52 23,20 15,20" fill="#FFFFFF" />
      {/* Red Stripes */}
      <polygon points="12.5,45 25.5,45 24.8,36 13.2,36" fill="#EF4444" />
      <polygon points="14,28 24,28 23.4,21 14.6,21" fill="#EF4444" />
      {/* Lantern Platform */}
      <rect x="13" y="18" width="12" height="3" rx="1" fill="#334155" />
      {/* Lantern Glass Room */}
      <rect x="14" y="11" width="10" height="7" rx="1" fill="#FEF08A" />
      {/* Lantern Roof Dome */}
      <path d="M14 11C14 7 19 4 19 4C19 4 24 7 24 11H14Z" fill="#DC2626" />
      <circle cx="19" cy="3" r="1" fill="#F59E0B" />
      {/* Sweeping Light Beam */}
      <polygon points="19,14 38,6 38,22" fill="#FEF08A" fillOpacity="0.35" />
    </svg>
    <span className="text-[8px] font-black text-sky-900 tracking-wider -mt-1">BEACON</span>
  </div>
);

export const SpriteHotAirBalloon: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform animate-balloon"
    title="Summit Voyager Balloon (Click me!)"
  >
    <svg width="42" height="58" viewBox="0 0 42 58" fill="none" className="drop-shadow-md">
      {/* Balloon Canopy */}
      <path
        d="M21 2C10 2 3 9 3 20C3 29 14 37 17 40H25C28 37 39 29 39 20C39 9 32 2 21 2Z"
        fill="#F43F5E"
      />
      {/* Striped Canopy Segments */}
      <path
        d="M21 2C15 2 10 9 10 20C10 29 16 38 18 40H24C26 38 32 29 32 20C32 9 27 2 21 2Z"
        fill="#FBBF24"
      />
      <path
        d="M21 2C18 2 15 9 15 20C15 29 19 39 20 40H22C23 39 27 29 27 20C27 9 24 2 21 2Z"
        fill="#38BDF8"
      />
      {/* Collar */}
      <rect x="17" y="40" width="8" height="2" rx="1" fill="#9F1239" />
      {/* Ropes */}
      <line x1="18" y1="42" x2="17" y2="48" stroke="#78350F" strokeWidth="1" />
      <line x1="24" y1="42" x2="25" y2="48" stroke="#78350F" strokeWidth="1" />
      {/* Wicker Basket */}
      <rect x="16" y="48" width="10" height="8" rx="2" fill="#B45309" />
      <line x1="16" y1="52" x2="26" y2="52" stroke="#78350F" strokeWidth="1" />
    </svg>
  </div>
);

export const SpriteCastle: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center cursor-pointer group hover:scale-105 active:scale-95 transition-transform"
    title="The Golden Citadel (Click me!)"
  >
    <svg width="64" height="60" viewBox="0 0 64 60" fill="none" className="drop-shadow-lg">
      {/* Shadow */}
      <ellipse cx="32" cy="56" rx="28" ry="4" fill="#C7B8DF" fillOpacity="0.7" />
      {/* Main Wall */}
      <rect x="18" y="24" width="28" height="30" fill="#E2E8F0" />
      {/* Main Gate Arched Door */}
      <path d="M26 54V40C26 36 38 36 38 40V54H26Z" fill="#334155" />
      <circle cx="35" cy="46" r="1.5" fill="#FBBF24" />
      {/* Left Tower */}
      <rect x="8" y="16" width="12" height="38" fill="#CBD5E1" />
      <polygon points="8,16 14,4 20,16" fill="#3B82F6" />
      <line x1="14" y1="4" x2="14" y2="1" stroke="#F59E0B" strokeWidth="1.5" />
      <polygon points="14,1 18,2.5 14,4" fill="#EF4444" />
      {/* Right Tower */}
      <rect x="44" y="16" width="12" height="38" fill="#CBD5E1" />
      <polygon points="44,16 50,4 56,16" fill="#3B82F6" />
      <line x1="50" y1="4" x2="50" y2="1" stroke="#F59E0B" strokeWidth="1.5" />
      <polygon points="50,1 54,2.5 50,4" fill="#EF4444" />
      {/* Center Crown Spire */}
      <rect x="26" y="14" width="12" height="10" fill="#E2E8F0" />
      <polygon points="24,14 32,2 40,14" fill="#F59E0B" />
      {/* Battlements teeth */}
      <rect x="22" y="22" width="4" height="3" fill="#94A3B8" />
      <rect x="30" y="22" width="4" height="3" fill="#94A3B8" />
      <rect x="38" y="22" width="4" height="3" fill="#94A3B8" />
      {/* Central Golden Crown Flag */}
      <line x1="32" y1="2" x2="32" y2="-2" stroke="#F59E0B" strokeWidth="1.5" />
      <circle cx="32" cy="-3" r="2" fill="#FBBF24" />
    </svg>
  </div>
);

export const SpriteCloud: React.FC<{ size?: number; className?: string }> = ({
  size = 48,
  className = '',
}) => (
  <svg
    width={size}
    height={size * 0.6}
    viewBox="0 0 50 30"
    fill="none"
    className={`drop-shadow-xs ${className}`}
  >
    <ellipse cx="25" cy="18" rx="20" ry="10" fill="#FFFFFF" />
    <circle cx="16" cy="14" r="10" fill="#FFFFFF" />
    <circle cx="28" cy="11" r="12" fill="#FFFFFF" />
    <circle cx="38" cy="16" r="8" fill="#FFFFFF" />
  </svg>
);

/**
 * Cozy fairytale village cottage with puffing chimney smoke
 */
export const SpriteVillageCottage: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div
    onClick={onClick}
    className="relative cursor-pointer group hover:scale-105 transition-transform"
    title="Cozy Hamlet Cottage (Click me!)"
  >
    {/* Chimney smoke puffs */}
    <div className="absolute -top-3.5 left-4 flex flex-col items-center pointer-events-none">
      <div className="w-2.5 h-2.5 rounded-full bg-stone-300/80 animate-chimney-smoke" />
      <div
        className="w-2 h-2 rounded-full bg-stone-300/60 animate-chimney-smoke -mt-1"
        style={{ animationDelay: '0.9s' }}
      />
    </div>

    <svg width="44" height="42" viewBox="0 0 44 42" fill="none" className="drop-shadow-sm">
      {/* Shadow */}
      <ellipse cx="22" cy="39" rx="18" ry="3" fill="#D5CEBA" fillOpacity="0.8" />
      {/* House Base Walls */}
      <rect x="8" y="18" width="28" height="20" rx="2" fill="#FEF3C7" />
      <rect x="8" y="18" width="4" height="20" fill="#FDE68A" />
      {/* Stone Chimney */}
      <rect x="11" y="6" width="6" height="12" rx="1" fill="#78716C" />
      <rect x="10" y="5" width="8" height="2" rx="0.5" fill="#57534E" />
      {/* Thatched Roof */}
      <polygon points="6,20 22,7 38,20" fill="#D97706" />
      <polygon points="4,21 22,6 40,21 38,22 22,8 6,22" fill="#B45309" />
      {/* Arched Door */}
      <path d="M19 38V28C19 26 25 26 25 28V38H19Z" fill="#92400E" />
      <circle cx="23.5" cy="33" r="0.8" fill="#FDE047" />
      {/* Warm Glowing Window */}
      <rect x="27" y="24" width="6" height="6" rx="1" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
      <line x1="30" y1="24" x2="30" y2="30" stroke="#B45309" strokeWidth="0.8" />
      <line x1="27" y1="27" x2="33" y2="27" stroke="#B45309" strokeWidth="0.8" />
      {/* Flowerbox */}
      <rect x="26" y="30" width="8" height="2" rx="0.5" fill="#15803D" />
      <circle cx="28" cy="30" r="1" fill="#EF4444" />
      <circle cx="32" cy="30" r="1" fill="#F59E0B" />
    </svg>
  </div>
);

/**
 * Traditional countryside windmill with rotating sails
 */
export const SpriteWindmill: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div
    onClick={onClick}
    className="relative flex flex-col items-center cursor-pointer group hover:scale-105 transition-transform"
    title="Village Windmill (Click me!)"
  >
    <svg width="40" height="50" viewBox="0 0 40 50" fill="none" className="drop-shadow-sm">
      {/* Shadow */}
      <ellipse cx="20" cy="46" rx="14" ry="3" fill="#D5CEBA" fillOpacity="0.7" />
      {/* Tower Body */}
      <polygon points="12,45 28,45 25,18 15,18" fill="#E2E8F0" />
      <rect x="15.5" y="19" width="9" height="2" fill="#CBD5E1" />
      {/* Conical Roof */}
      <polygon points="13,18 20,8 27,18" fill="#0D9488" />
      {/* Door */}
      <path d="M18 45V38C18 37 22 37 22 38V45H18Z" fill="#78350F" />
      {/* Window */}
      <circle cx="20" cy="26" r="2" fill="#FEF08A" stroke="#475569" strokeWidth="0.8" />
      {/* Hub Pin */}
      <circle cx="20" cy="18" r="2.5" fill="#92400E" />
    </svg>

    {/* Rotating Sails (positioned directly on the hub) */}
    <div
      className="absolute top-[10px] w-14 h-14 pointer-events-none animate-windmill-spin"
      style={{ left: 'calc(50% - 28px)' }}
    >
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        {/* Horizontal Sail */}
        <line x1="6" y1="28" x2="50" y2="28" stroke="#78350F" strokeWidth="1.5" />
        <rect x="8" y="24" width="16" height="4" rx="0.5" fill="#FEF3C7" stroke="#92400E" strokeWidth="0.5" />
        <rect x="32" y="28" width="16" height="4" rx="0.5" fill="#FEF3C7" stroke="#92400E" strokeWidth="0.5" />
        {/* Vertical Sail */}
        <line x1="28" y1="6" x2="28" y2="50" stroke="#78350F" strokeWidth="1.5" />
        <rect x="24" y="32" width="4" height="16" rx="0.5" fill="#FEF3C7" stroke="#92400E" strokeWidth="0.5" />
        <rect x="28" y="8" width="4" height="16" rx="0.5" fill="#FEF3C7" stroke="#92400E" strokeWidth="0.5" />
        {/* Center Nut */}
        <circle cx="28" cy="28" r="2" fill="#B45309" />
      </svg>
    </div>
  </div>
);

/**
 * Adorable cartoon bunny hopping in the meadows
 */
export const SpriteBunny: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer group hover:scale-125 transition-transform animate-bunny-hop"
    title="Meadow Bunny (Click me!)"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-2xs">
      {/* Shadow */}
      <ellipse cx="12" cy="22" rx="8" ry="1.8" fill="#D5CEBA" fillOpacity="0.8" />
      {/* Fluffy Tail */}
      <circle cx="5" cy="17" r="2.5" fill="#FFFFFF" />
      {/* Body */}
      <ellipse cx="11" cy="17" rx="6" ry="4.5" fill="#FFFFFF" />
      {/* Head */}
      <circle cx="16" cy="13" r="4.5" fill="#FFFFFF" />
      {/* Ears */}
      <ellipse cx="16" cy="6" rx="1.5" ry="4.5" fill="#FFFFFF" />
      <ellipse cx="16" cy="6" rx="0.8" ry="3" fill="#F472B6" />
      <ellipse cx="19" cy="7" rx="1.5" ry="4" fill="#FFFFFF" />
      <ellipse cx="19" cy="7" rx="0.7" ry="2.5" fill="#F472B6" />
      {/* Eye & Nose */}
      <circle cx="17.5" cy="12.5" r="0.8" fill="#1E293B" />
      <circle cx="19.5" cy="14" r="0.6" fill="#F43F5E" />
    </svg>
  </div>
);

/**
 * Peaceful cartoon deer grazing in the glade
 */
export const SpriteDeer: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer group hover:scale-110 transition-transform animate-map-sway"
    title="Gentle Forest Deer (Click me!)"
  >
    <svg width="32" height="34" viewBox="0 0 32 34" fill="none" className="drop-shadow-xs">
      {/* Shadow */}
      <ellipse cx="16" cy="32" rx="12" ry="2" fill="#D5CEBA" fillOpacity="0.7" />
      {/* Legs */}
      <line x1="9" y1="20" x2="8" y2="31" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="13" y1="20" x2="13" y2="31" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="21" y1="20" x2="20" y2="31" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="25" y1="20" x2="26" y2="31" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
      {/* Torso */}
      <ellipse cx="17" cy="18" rx="9" ry="5.5" fill="#B45309" />
      {/* Tail */}
      <ellipse cx="7" cy="16" rx="2" ry="1.5" fill="#FEF3C7" />
      {/* Neck & Head grazing down */}
      <path d="M23 18L28 22H31L26 14Z" fill="#B45309" />
      <circle cx="29" cy="22" r="2.5" fill="#B45309" />
      <ellipse cx="27" cy="13" rx="1.5" ry="3" fill="#D97706" />
      {/* Little White Dappled Spots */}
      <circle cx="14" cy="16" r="0.8" fill="#FEF3C7" />
      <circle cx="18" cy="16" r="0.8" fill="#FEF3C7" />
      <circle cx="16" cy="19" r="0.8" fill="#FEF3C7" />
    </svg>
  </div>
);

/**
 * Swimming mama duck and duckling in the river
 */
export const SpriteRiverDucks: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center gap-1.5 cursor-pointer group hover:scale-110 transition-transform animate-swim"
    title="River Ducks (Click me!)"
  >
    {/* Mama Duck */}
    <svg width="22" height="18" viewBox="0 0 22 18" fill="none" className="drop-shadow-2xs">
      {/* Body */}
      <path d="M3 10C3 7 7 6 12 7C16 8 18 10 18 13C18 16 14 16 9 16C5 16 3 13 3 10Z" fill="#F59E0B" />
      {/* Head */}
      <circle cx="15" cy="6" r="4" fill="#047857" />
      {/* Beak */}
      <polygon points="18,6 22,7 18,8" fill="#EA580C" />
      {/* Eye */}
      <circle cx="16" cy="5.5" r="0.7" fill="#FFFFFF" />
      <circle cx="16.2" cy="5.5" r="0.4" fill="#0F172A" />
      {/* Water Ripple */}
      <ellipse cx="10" cy="16" rx="9" ry="1.2" fill="#BAE6FD" fillOpacity="0.8" />
    </svg>

    {/* Tiny Duckling */}
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" className="drop-shadow-2xs">
      <path d="M2 7C2 5 4 4 7 5C10 6 11 7 11 9C11 11 9 11 6 11C3 11 2 9 2 7Z" fill="#FDE047" />
      <circle cx="9" cy="4" r="2.8" fill="#FDE047" />
      <polygon points="11,4 14,4.5 11,5.2" fill="#F97316" />
      <circle cx="9.8" cy="3.5" r="0.5" fill="#0F172A" />
      <ellipse cx="7" cy="11" rx="6" ry="1" fill="#BAE6FD" fillOpacity="0.8" />
    </svg>
  </div>
);

/**
 * Animated soaring bird gliding across the sky
 */
export const SpriteSoaringBird: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`pointer-events-none animate-wing-flap ${className}`}>
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
      <path
        d="M1 6C4 2 8 3 9 7C10 3 14 2 17 6C14 4 10 5 9 8C8 5 4 4 1 6Z"
        fill="#334155"
        opacity="0.75"
      />
    </svg>
  </div>
);

/**
 * Magical shimmering fairy dust & fireflies
 */
export const SpriteMagicalSparkles: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`pointer-events-none flex items-center gap-1.5 ${className}`}>
    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs animate-sparkle" />
    <div
      className="w-2 h-2 rounded-full bg-purple-400 shadow-xs animate-sparkle"
      style={{ animationDelay: '0.8s' }}
    />
    <div
      className="w-1 h-1 rounded-full bg-teal-300 shadow-xs animate-sparkle"
      style={{ animationDelay: '1.6s' }}
    />
  </div>
);

