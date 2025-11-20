/**
 * Haptic feedback utility with iOS and Android support
 * Provides tactile feedback for touch interactions on mobile devices
 */

import { HAPTICS } from '@/config/constants';

/**
 * Check if we're on an iOS device
 */
function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

/**
 * Check if the Vibration API is supported
 */
function isVibrationSupported(): boolean {
  return "vibrate" in navigator;
}

// Create a shared audio context for iOS haptic feedback
let audioContext: AudioContext | null = null;

/**
 * Initialize audio context for iOS haptic feedback
 * This must be called from a user interaction event
 */
function initAudioContext(): void {
  if (!audioContext && isIOS()) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      // Silently fail if AudioContext is not supported
    }
  }
}

/**
 * Trigger haptic feedback on iOS using the Web Audio API
 * iOS triggers haptic feedback when playing silent audio during user interactions
 */
function triggerIOSHaptic(intensity: 'light' | 'medium' | 'heavy'): void {
  try {
    // Initialize audio context if not already done
    if (!audioContext) {
      initAudioContext();
    }

    if (!audioContext) return;

    // Create a very short, nearly silent tone that triggers haptic feedback
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set frequency based on intensity (lower frequencies feel more substantial)
    oscillator.frequency.value = intensity === 'heavy' ? 80 : intensity === 'medium' ? 100 : 120;

    // Set very low volume - just enough to trigger haptics without audible sound
    gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);

    // Very short duration
    const duration = intensity === 'heavy' ? 0.03 : intensity === 'medium' ? 0.02 : 0.01;

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    // Silently fail if haptics don't work
  }
}

/**
 * Trigger a vibration pattern with iOS fallback
 * @param pattern - Single number (duration in ms) or array of durations
 * @param intensity - Haptic intensity for iOS
 */
function vibrate(pattern: number | readonly number[], intensity: 'light' | 'medium' | 'heavy' = 'medium'): void {
  if (isIOS()) {
    // Use iOS haptic feedback
    triggerIOSHaptic(intensity);
  } else if (isVibrationSupported()) {
    // Use Android Vibration API
    try {
      // Convert readonly array to mutable array for navigator.vibrate
      const vibratePattern = typeof pattern === 'number' ? pattern : [...pattern];
      navigator.vibrate(vibratePattern);
    } catch (error) {
      console.warn("Vibration failed:", error);
    }
  }
}

/**
 * Initialize haptic feedback system
 * Call this early in your app, ideally on first user interaction
 * Required for iOS to enable haptic feedback
 */
export function initHaptics(): void {
  initAudioContext();
}

/**
 * Light tap feedback - for general interactions
 * Duration: 10ms
 */
export function lightTap(): void {
  vibrate(HAPTICS.LIGHT_TAP, 'light');
}

/**
 * Medium tap feedback - for important actions
 * Duration: 25ms
 */
export function mediumTap(): void {
  vibrate(25, 'medium');
}

/**
 * Success feedback - for completed actions
 * Pattern: Short-pause-short (50ms, 50ms pause, 50ms)
 */
export function successVibration(): void {
  if (isIOS()) {
    // iOS: double tap for success feeling
    triggerIOSHaptic('medium');
    setTimeout(() => triggerIOSHaptic('medium'), 100);
  } else {
    vibrate(HAPTICS.SUCCESS_VIBRATION, 'medium');
  }
}

/**
 * Error feedback - for errors or invalid actions
 * Pattern: Long-short-long (100ms, 50ms pause, 100ms)
 */
export function errorVibration(): void {
  if (isIOS()) {
    // iOS: heavy-light-heavy pattern for error feeling
    triggerIOSHaptic('heavy');
    setTimeout(() => triggerIOSHaptic('light'), 100);
    setTimeout(() => triggerIOSHaptic('heavy'), 200);
  } else {
    vibrate(HAPTICS.ERROR_VIBRATION, 'heavy');
  }
}

/**
 * Selection feedback - for selecting/marking items
 * Duration: 15ms
 */
export function selectionTap(): void {
  vibrate(HAPTICS.SELECTION_TAP, 'light');
}
