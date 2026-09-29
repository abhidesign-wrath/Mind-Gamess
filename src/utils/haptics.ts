/**
 * Haptic tactile feedback utility using window.navigator.vibrate.
 * Safely handles unsupported environments, permissions, and user settings.
 */

let hapticsEnabled = true;

/**
 * Configure whether vibration is enabled (synced with user settings).
 */
export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
}

/**
 * Check if haptic vibration is supported on current client.
 */
export function isHapticsSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'navigator' in window &&
    typeof window.navigator.vibrate === 'function'
  );
}

/**
 * Core vibration utility function using window.navigator.vibrate.
 *
 * @param pattern - Duration in ms (number) or vibration/pause pattern (number[])
 * @returns boolean indicating whether vibration was dispatched successfully
 */
export function vibrate(pattern: number | number[] = 10): boolean {
  if (typeof window === 'undefined') return false;
  if (!('navigator' in window) || typeof window.navigator.vibrate !== 'function') {
    return false;
  }
  if (!hapticsEnabled) return false;

  try {
    return window.navigator.vibrate(pattern);
  } catch {
    // Graceful fallback on permission or hardware errors
    return false;
  }
}

/**
 * 10ms subtle tactile pulse when drawing a path segment.
 */
export function vibrateSegment(): boolean {
  return vibrate(10);
}

/**
 * 30ms pulse on successfully connecting with a checkpoint.
 */
export function vibrateCheckpoint(): boolean {
  return vibrate(30);
}

/**
 * 100ms celebratory success vibration on completing a puzzle level.
 */
export function vibrateSuccess(): boolean {
  return vibrate(100);
}
