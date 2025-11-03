/**
 * Centralized Theme Configuration
 *
 * This file contains all color and styling tokens used throughout the app.
 * Update colors here to change the entire app theme.
 */

export const theme = {
  // Primary brand colors - based on logo
  colors: {
    primary: {
      50: 'cyan-50',
      100: 'cyan-100',
      500: 'cyan-500',
      600: 'cyan-600',
      700: 'cyan-700',
      800: 'cyan-800',
      900: 'cyan-900',
    },
    secondary: {
      50: 'blue-50',
      100: 'blue-100',
      500: 'blue-500',
      600: 'blue-600',
      700: 'blue-700',
      800: 'blue-800',
      900: 'blue-900',
    },
    // Status colors
    success: {
      50: 'green-50',
      100: 'green-100',
      500: 'green-500',
      600: 'green-600',
      700: 'green-700',
    },
    error: {
      50: 'red-50',
      100: 'red-100',
      500: 'red-500',
      600: 'red-600',
      700: 'red-700',
    },
    warning: {
      50: 'amber-50',
      100: 'amber-100',
      600: 'amber-600',
    },
    // Neutral colors
    neutral: {
      50: 'gray-50',
      100: 'gray-100',
      200: 'gray-200',
      300: 'gray-300',
      600: 'gray-600',
      700: 'gray-700',
      800: 'gray-800',
    },
  },

  // Commonly used color combinations as CSS class strings
  gradients: {
    // Main app background gradient
    background: 'bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600',

    // Primary action button gradient
    primaryButton: 'bg-gradient-to-r from-cyan-600 to-blue-600',
    primaryButtonHover: 'hover:from-cyan-700 hover:to-blue-700',

    // Secondary/neutral button
    neutralButton: 'bg-gradient-to-r from-gray-100 to-gray-200',
    neutralButtonHover: 'hover:from-gray-200 hover:to-gray-300',

    // Success button
    successButton: 'bg-gradient-to-r from-green-500 to-green-600',
    successButtonHover: 'hover:from-green-600 hover:to-green-700',

    // Error/danger button
    errorButton: 'bg-gradient-to-r from-red-500 to-red-600',
    errorButtonHover: 'hover:from-red-600 hover:to-red-700',

    // Card/surface backgrounds
    cardPrimary: 'bg-gradient-to-r from-cyan-50 to-cyan-100',
    cardHighlight: 'bg-gradient-to-br from-cyan-50 to-blue-50',
    cardNeutral: 'bg-gradient-to-r from-white to-cyan-50/30',

    // Progress bar
    progress: 'bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600',

    // Selected/active states
    selectedItem: 'bg-gradient-to-r from-cyan-100 to-cyan-50',
    activeItem: 'bg-gradient-to-br from-cyan-500 to-cyan-600',

    // Badge
    badge: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  },

  // Text colors for different contexts
  text: {
    primary: 'text-cyan-600',
    primaryDark: 'text-cyan-700',
    primaryDarker: 'text-cyan-800',
    primaryLight: 'text-cyan-50',

    secondary: 'text-blue-600',
    secondaryDark: 'text-blue-700',

    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-amber-600',

    neutral: 'text-gray-600',
    neutralDark: 'text-gray-700',
    neutralDarker: 'text-gray-800',
  },

  // Border colors
  borders: {
    primary: 'border-cyan-300',
    primaryFocus: 'focus:border-cyan-500',
    primaryHover: 'hover:border-cyan-400',

    secondary: 'border-blue-500',

    neutral: 'border-gray-300',
    neutralLight: 'border-gray-200',

    success: 'border-green-400',
    error: 'border-red-400',
  },

  // Background colors
  backgrounds: {
    primary: 'bg-cyan-600',
    primaryLight: 'bg-cyan-100',
    primaryLighter: 'bg-cyan-50',

    secondary: 'bg-blue-600',

    success: 'bg-green-100',
    error: 'bg-red-100',
    warning: 'bg-amber-100',

    neutral: 'bg-gray-100',
  },

  // Ring/focus colors
  rings: {
    primary: 'focus:ring-cyan-400',
  },
} as const;

/**
 * Helper function to get complete button class string
 */
export const buttonClasses = {
  primary: `${theme.gradients.primaryButton} text-white rounded-xl font-bold shadow-md ${theme.gradients.primaryButtonHover} hover:shadow-lg active:scale-95 transition-all`,

  secondary: `${theme.gradients.neutralButton} ${theme.text.neutralDark} rounded-xl font-bold ${theme.borders.neutral} border-2 ${theme.gradients.neutralButtonHover} hover:shadow-md active:scale-95 transition-all`,

  success: `${theme.gradients.successButton} text-white rounded-xl font-bold shadow-md ${theme.gradients.successButtonHover} hover:shadow-lg active:scale-95 transition-all`,

  danger: `${theme.gradients.errorButton} text-white rounded-xl font-bold shadow-md ${theme.gradients.errorButtonHover} hover:shadow-lg active:scale-95 transition-all`,
} as const;

/**
 * Helper function to get complete input class string
 */
export const inputClasses = `border-2 ${theme.borders.primary} rounded-xl focus:outline-none focus:ring-4 ${theme.rings.primary} ${theme.borders.primaryFocus} ${theme.gradients.cardNeutral} shadow-md text-gray-900`;
