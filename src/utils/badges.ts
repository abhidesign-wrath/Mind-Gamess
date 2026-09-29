import { UserProfile } from '../types/game';
import { saveUserProfile } from './storage';

export interface CosmeticBadge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requiredDays: number; // Out of 7 weekly daily challenges
  tier: 'bronze' | 'silver' | 'gold' | 'crown';
  tag: string;
  gradient: string;
  borderClass: string;
  textClass: string;
}

export const WEEKLY_COSMETIC_BADGES: CosmeticBadge[] = [
  {
    id: 'badge_sprout',
    name: 'Sprout Scout',
    emoji: '🌱',
    description: 'Complete 2 Daily Challenges in a single week.',
    requiredDays: 2,
    tier: 'bronze',
    tag: '2 Days',
    gradient: 'from-emerald-400 to-teal-500',
    borderClass: 'border-emerald-300 dark:border-emerald-700',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    id: 'badge_star_wanderer',
    name: 'Star Wanderer',
    emoji: '⭐',
    description: 'Complete 4 Daily Challenges in a single week.',
    requiredDays: 4,
    tier: 'silver',
    tag: '4 Days',
    gradient: 'from-sky-400 to-indigo-500',
    borderClass: 'border-sky-300 dark:border-sky-700',
    textClass: 'text-sky-700 dark:text-sky-300',
  },
  {
    id: 'badge_sun_champion',
    name: 'Solar Champion',
    emoji: '☀️',
    description: 'Complete 6 Daily Challenges in a single week.',
    requiredDays: 6,
    tier: 'gold',
    tag: '6 Days',
    gradient: 'from-amber-400 to-orange-500',
    borderClass: 'border-amber-300 dark:border-amber-700',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
  {
    id: 'badge_cosmic_crown',
    name: 'Crown of Axiom',
    emoji: '👑',
    description: 'Complete all 7 Daily Challenges in a single week!',
    requiredDays: 7,
    tier: 'crown',
    tag: 'Perfect 7',
    gradient: 'from-purple-500 via-pink-500 to-amber-400',
    borderClass: 'border-purple-300 dark:border-purple-600',
    textClass: 'text-purple-700 dark:text-purple-300',
  },
];

/**
 * Get standard ISO week key (e.g. "2026-W39")
 */
export function getWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getBadgeById(id?: string | null): CosmeticBadge | undefined {
  if (!id) return undefined;
  return WEEKLY_COSMETIC_BADGES.find((b) => b.id === id);
}

/**
 * Claim a weekly reward badge and automatically unlock and save
 */
export function claimWeeklyBadge(
  profile: UserProfile,
  badgeId: string,
  weekKey: string
): UserProfile {
  const claimKey = `${weekKey}_${badgeId}`;
  if (profile.claimedWeeklyRewards?.includes(claimKey)) {
    return profile;
  }

  const updatedUnlocked = profile.unlockedBadges.includes(badgeId)
    ? profile.unlockedBadges
    : [...profile.unlockedBadges, badgeId];

  const updatedClaims = [...(profile.claimedWeeklyRewards || []), claimKey];

  // If no badge is currently equipped, auto-equip the new one!
  const updatedActive = profile.activeBadge || badgeId;

  const updatedProfile: UserProfile = {
    ...profile,
    unlockedBadges: updatedUnlocked,
    claimedWeeklyRewards: updatedClaims,
    activeBadge: updatedActive,
  };

  saveUserProfile(updatedProfile);
  return updatedProfile;
}

/**
 * Equip or unequip a badge on user profile
 */
export function toggleEquipBadge(profile: UserProfile, badgeId: string): UserProfile {
  const nextBadge = profile.activeBadge === badgeId ? null : badgeId;
  const updatedProfile: UserProfile = {
    ...profile,
    activeBadge: nextBadge,
  };
  saveUserProfile(updatedProfile);
  return updatedProfile;
}

