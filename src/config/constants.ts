/**
 * Application Constants
 *
 * Centralized configuration values for the application.
 * Moving magic numbers here improves maintainability and readability.
 */

export const ATTENDANCE = {
  // Alert thresholds
  ABSENCE_ALERT_THRESHOLD: 3,

  // Gesture thresholds (pixels)
  MIN_SWIPE_DISTANCE: 50,
  PULL_TO_REFRESH_DISTANCE: 120,
  PULL_TO_REFRESH_MIN_DISTANCE: 80,
  MAX_SWIPE_OFFSET: 150,

  // Status codes
  STATUS: {
    PRESENT: 'P',
    ABSENT: 'F',
  } as const,
} as const;

export const UI = {
  // Animation durations (milliseconds)
  TRANSITION_FAST: 150,
  TRANSITION_NORMAL: 300,
  TRANSITION_SLOW: 500,

  // Debounce delays (milliseconds)
  SEARCH_DEBOUNCE: 300,

  // Pagination
  ITEMS_PER_PAGE: 20,

  // Virtual scrolling
  ESTIMATED_CARD_HEIGHT: 80,
  VIRTUAL_OVERSCAN: 5,
} as const;

export const QUERY = {
  // Stale times (milliseconds)
  STALE_TIME_SHORT: 1 * 60 * 1000,  // 1 minute
  STALE_TIME_SHORT_MEDIUM: 2 * 60 * 1000,  // 2 minutes
  STALE_TIME_MEDIUM: 5 * 60 * 1000, // 5 minutes
  STALE_TIME_MEDIUM_LONG: 10 * 60 * 1000,  // 10 minutes
  STALE_TIME_LONG: 15 * 60 * 1000,  // 15 minutes
  STALE_TIME_XLARGE: 55 * 60 * 1000, // 55 minutes (current default)

  // Cache times (milliseconds)
  CACHE_TIME_DEFAULT: 60 * 60 * 1000, // 60 minutes

  // Retry configuration
  MAX_QUERY_RETRIES: 3,
  MAX_MUTATION_RETRIES: 2,
  INITIAL_RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 30000,
} as const;

export const HAPTICS = {
  // Vibration patterns (milliseconds)
  LIGHT_TAP: 10,
  MEDIUM_TAP: 25,
  SELECTION_TAP: 15,
  SUCCESS_VIBRATION: [50, 50, 50],
  ERROR_VIBRATION: [100, 50, 100],
} as const;
