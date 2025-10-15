/**
 * Haptic feedback utility using the Vibration API
 * Provides tactile feedback for touch interactions on mobile devices
 */

/**
 * Check if the Vibration API is supported
 */
function isVibrationSupported(): boolean {
  return "vibrate" in navigator;
}

/**
 * Trigger a vibration pattern
 * @param pattern - Single number (duration in ms) or array of durations
 */
function vibrate(pattern: number | number[]): void {
  if (isVibrationSupported()) {
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn("Vibration failed:", error);
    }
  }
}

/**
 * Light tap feedback - for general interactions
 * Duration: 10ms
 */
export function lightTap(): void {
  vibrate(10);
}

/**
 * Medium tap feedback - for important actions
 * Duration: 25ms
 */
export function mediumTap(): void {
  vibrate(25);
}

/**
 * Success feedback - for completed actions
 * Pattern: Short-pause-short (50ms, 50ms pause, 50ms)
 */
export function successVibration(): void {
  vibrate([50, 50, 50]);
}

/**
 * Error feedback - for errors or invalid actions
 * Pattern: Long-short-long (100ms, 50ms pause, 100ms)
 */
export function errorVibration(): void {
  vibrate([100, 50, 100]);
}

/**
 * Selection feedback - for selecting/marking items
 * Duration: 15ms
 */
export function selectionTap(): void {
  vibrate(15);
}
