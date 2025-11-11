/**
 * Centralized Theme Configuration
 *
 * This file contains all color and styling tokens used throughout the app.
 * Update the `colors` object to change the entire app theme.
 * All other theme properties reference these base colors.
 */

// Base color definitions - SINGLE SOURCE OF TRUTH
// Change colors here and they propagate throughout the entire theme
const colors = {
  // Base colors
  white: 'white',
  black: 'black',

  // Primary brand colors (cyan)
  primary: {
    50: 'cyan-50',
    100: 'cyan-100',
    200: 'cyan-200',
    300: 'cyan-300',
    400: 'cyan-400',
    500: 'cyan-500',
    600: 'cyan-600',
    700: 'cyan-700',
    800: 'cyan-800',
    900: 'cyan-900',
  },

  // Secondary colors (blue)
  secondary: {
    50: 'blue-50',
    100: 'blue-100',
    200: 'blue-200',
    300: 'blue-300',
    400: 'blue-400',
    500: 'blue-500',
    600: 'blue-600',
    700: 'blue-700',
    800: 'blue-800',
    900: 'blue-900',
  },

  // Success colors (green)
  success: {
    50: 'green-50',
    100: 'green-100',
    300: 'green-300',
    400: 'green-400',
    500: 'green-500',
    600: 'green-600',
    700: 'green-700',
  },

  // Error colors (red)
  error: {
    50: 'red-50',
    100: 'red-100',
    400: 'red-400',
    500: 'red-500',
    600: 'red-600',
    700: 'red-700',
  },

  // Warning colors (amber)
  warning: {
    50: 'amber-50',
    100: 'amber-100',
    300: 'amber-300',
    500: 'amber-500',
    600: 'amber-600',
  },

  // Neutral colors (gray)
  neutral: {
    50: 'gray-50',
    100: 'gray-100',
    200: 'gray-200',
    300: 'gray-300',
    400: 'gray-400',
    500: 'gray-500',
    600: 'gray-600',
    700: 'gray-700',
    800: 'gray-800',
    900: 'gray-900',
  },

  // Visitor/special colors (purple)
  visitor: {
    50: 'purple-50',
    100: 'purple-100',
    200: 'purple-200',
    300: 'purple-300',
    500: 'purple-500',
    600: 'purple-600',
    700: 'purple-700',
  },

  // Special colors for gradients
  emerald: {
    50: 'emerald-50',
    500: 'emerald-500',
  },
  orange: {
    500: 'orange-500',
  },
} as const;

// Theme object - all properties reference the base colors above
export const theme = {
  // Export colors for direct access if needed
  colors,

  // Gradient combinations
  gradients: {
    // Main app background gradient
    background: `bg-gradient-to-br from-${colors.primary[500]} via-${colors.primary[600]} to-${colors.secondary[600]}`,

    // Primary action button gradient
    primaryButton: `bg-gradient-to-r from-${colors.primary[600]} to-${colors.secondary[600]}`,
    primaryButtonHover: `hover:from-${colors.primary[700]} hover:to-${colors.secondary[700]}`,

    // Secondary/neutral button
    neutralButton: `bg-gradient-to-r from-${colors.neutral[100]} to-${colors.neutral[200]}`,
    neutralButtonHover: `hover:from-${colors.neutral[200]} hover:to-${colors.neutral[300]}`,

    // Success button
    successButton: `bg-gradient-to-r from-${colors.success[500]} to-${colors.success[600]}`,
    successButtonHover: `hover:from-${colors.success[600]} hover:to-${colors.success[700]}`,

    // Error/danger button
    errorButton: `bg-gradient-to-r from-${colors.error[500]} to-${colors.error[600]}`,
    errorButtonHover: `hover:from-${colors.error[600]} hover:to-${colors.error[700]}`,

    // Card/surface backgrounds
    cardPrimary: `bg-gradient-to-r from-${colors.primary[50]} to-${colors.primary[100]}`,
    cardHighlight: `bg-gradient-to-br from-${colors.primary[50]} to-${colors.secondary[50]}`,
    cardNeutral: `bg-gradient-to-r from-${colors.white} to-${colors.primary[50]}/30`,

    // Progress bar
    progress: `bg-gradient-to-r from-${colors.primary[500]} via-${colors.primary[600]} to-${colors.secondary[600]}`,

    // Selected/active states
    selectedItem: `bg-gradient-to-r from-${colors.primary[100]} to-${colors.primary[50]}`,
    activeItem: `bg-gradient-to-br from-${colors.primary[500]} to-${colors.primary[600]}`,

    // Badge
    badge: `bg-gradient-to-r from-${colors.primary[500]} to-${colors.secondary[500]}`,

    // Lesson type badges
    lessonRegular: `bg-gradient-to-r from-${colors.success[500]} to-${colors.emerald[500]}`,
    lessonSpecial: `bg-gradient-to-r from-${colors.warning[500]} to-${colors.orange[500]}`,

    // Dev login hover
    devCardHover: `hover:from-${colors.emerald[50]} hover:to-${colors.primary[50]}`,
  },

  // Text colors
  text: {
    // Base colors
    white: `text-${colors.white}`,
    whiteHover: `hover:text-${colors.white}/80`,
    whiteTransparent: `text-${colors.white}/90`,

    // Primary colors
    primary: `text-${colors.primary[600]}`,
    primaryDark: `text-${colors.primary[700]}`,
    primaryDarker: `text-${colors.primary[800]}`,
    primaryLight: `text-${colors.primary[50]}`,

    // Secondary colors
    secondary: `text-${colors.secondary[600]}`,
    secondaryDark: `text-${colors.secondary[700]}`,

    // Status colors
    success: `text-${colors.success[600]}`,
    error: `text-${colors.error[600]}`,
    warning: `text-${colors.warning[600]}`,

    // Neutral colors
    neutral: `text-${colors.neutral[600]}`,
    neutralLight: `text-${colors.neutral[400]}`,
    neutralMedium: `text-${colors.neutral[500]}`,
    neutralDark: `text-${colors.neutral[700]}`,
    neutralDarker: `text-${colors.neutral[800]}`,
    neutralDarkest: `text-${colors.neutral[900]}`,

    // Visitor colors
    visitor: `text-${colors.visitor[700]}`,
    visitorDev: `text-${colors.visitor[600]}`,
  },

  // Border colors
  borders: {
    // Primary colors
    primary: `border-${colors.primary[300]}`,
    primaryLight: `border-${colors.primary[200]}`,
    primaryFocus: `focus:border-${colors.primary[500]}`,
    primaryHover: `hover:border-${colors.primary[400]}`,
    primaryHoverLight: `hover:border-${colors.primary[300]}`,

    // Secondary colors
    secondary: `border-${colors.secondary[500]}`,

    // Neutral colors
    neutral: `border-${colors.neutral[300]}`,
    neutralLight: `border-${colors.neutral[200]}`,

    // Status colors
    success: `border-${colors.success[400]}`,
    successLight: `border-${colors.success[300]}`,
    error: `border-${colors.error[400]}`,

    // Visitor colors
    visitor: `border-${colors.visitor[300]}`,
    visitorLight: `border-${colors.visitor[200]}`,
    visitorFocus: `focus:border-${colors.visitor[500]}`,
  },

  // Background colors
  backgrounds: {
    // Base colors
    white: `bg-${colors.white}`,
    whiteTransparent: `bg-${colors.white}/50`,
    whiteTransparent90: `bg-${colors.white}/90`,
    whiteHover: `hover:bg-${colors.white}/20`,

    // Primary colors
    primary: `bg-${colors.primary[600]}`,
    primaryLight: `bg-${colors.primary[100]}`,
    primaryLighter: `bg-${colors.primary[50]}`,
    primaryHover: `hover:bg-${colors.primary[50]}`,
    primaryActive: `hover:bg-${colors.primary[700]}`,

    // Secondary colors
    secondary: `bg-${colors.secondary[600]}`,
    secondaryLight50: `bg-${colors.secondary[50]}`,
    secondaryLight100: `bg-${colors.secondary[100]}`,
    secondaryHover: `hover:bg-${colors.secondary[100]}`,

    // Status colors
    success: `bg-${colors.success[100]}`,
    successLight: `bg-${colors.success[50]}`,
    successMedium: `bg-${colors.success[500]}`,
    error: `bg-${colors.error[100]}`,
    errorLight: `bg-${colors.error[50]}`,
    errorMedium: `bg-${colors.error[500]}`,
    errorDark: `bg-${colors.error[600]}`,
    warning: `bg-${colors.warning[100]}`,
    warningLight: `bg-${colors.warning[50]}`,
    warningMedium: `bg-${colors.warning[500]}`,

    // Neutral colors
    neutral: `bg-${colors.neutral[100]}`,
    neutralLight: `bg-${colors.neutral[50]}`,
    neutralHover: `hover:bg-${colors.neutral[50]}`,

    // Visitor colors
    visitor: `bg-${colors.visitor[100]}`,
    visitorLight: `bg-${colors.visitor[50]}`,
    visitorHover: `hover:bg-${colors.visitor[700]}`,
  },

  // Ring/focus colors
  rings: {
    primary: `focus:ring-${colors.primary[400]}`,
  },

  // Status indicator circles (for attendance stats)
  indicators: {
    present: `bg-${colors.success[500]}`,
    absent: `bg-${colors.error[500]}`,
    late: `bg-${colors.warning[500]}`,
    excused: `bg-${colors.secondary[500]}`,
    visitor: `bg-${colors.primary[500]}`,
  },

  // Semantic status configurations
  status: {
    present: {
      text: `text-${colors.success[600]}`,
      bg: `bg-${colors.success[50]}`,
      bgMedium: `bg-${colors.success[100]}`,
      indicator: `bg-${colors.success[500]}`,
      border: `border-${colors.success[300]}`,
    },
    absent: {
      text: `text-${colors.error[600]}`,
      bg: `bg-${colors.error[50]}`,
      bgMedium: `bg-${colors.error[100]}`,
      indicator: `bg-${colors.error[500]}`,
      border: `border-${colors.error[400]}`,
    },
    late: {
      text: `text-${colors.warning[600]}`,
      bg: `bg-${colors.warning[50]}`,
      bgMedium: `bg-${colors.warning[100]}`,
      indicator: `bg-${colors.warning[500]}`,
      border: `border-${colors.warning[300]}`,
    },
    excused: {
      text: `text-${colors.secondary[600]}`,
      bg: `bg-${colors.secondary[50]}`,
      bgMedium: `bg-${colors.secondary[100]}`,
      indicator: `bg-${colors.secondary[500]}`,
      border: `border-${colors.secondary[300]}`,
    },
  },

  // Student status badges
  studentStatus: {
    active: {
      bg: `bg-${colors.success[100]}`,
      text: `text-${colors.success[700]}`,
      border: `border-${colors.success[300]}`,
    },
    inactive: {
      bg: `bg-${colors.neutral[100]}`,
      text: `text-${colors.neutral[700]}`,
      border: `border-${colors.neutral[300]}`,
    },
    'aged-out': {
      bg: `bg-${colors.warning[100]}`,
      text: `text-${colors.warning[700]}`,
      border: `border-${colors.warning[300]}`,
    },
    moved: {
      bg: `bg-${colors.secondary[100]}`,
      text: `text-${colors.secondary[700]}`,
      border: `border-${colors.secondary[300]}`,
    },
    visitor: {
      bg: `bg-${colors.visitor[100]}`,
      text: `text-${colors.visitor[700]}`,
      border: `border-${colors.visitor[200]}`,
    },
  },
} as const;

/**
 * Helper function to get complete button class string
 */
export const buttonClasses = {
  primary: `${theme.gradients.primaryButton} ${theme.text.white} rounded-xl font-bold shadow-md ${theme.gradients.primaryButtonHover} hover:shadow-lg active:scale-95 transition-all`,

  secondary: `${theme.gradients.neutralButton} ${theme.text.neutralDark} rounded-xl font-bold ${theme.borders.neutral} border-2 ${theme.gradients.neutralButtonHover} hover:shadow-md active:scale-95 transition-all`,

  success: `${theme.gradients.successButton} ${theme.text.white} rounded-xl font-bold shadow-md ${theme.gradients.successButtonHover} hover:shadow-lg active:scale-95 transition-all`,

  danger: `${theme.gradients.errorButton} ${theme.text.white} rounded-xl font-bold shadow-md ${theme.gradients.errorButtonHover} hover:shadow-lg active:scale-95 transition-all`,
} as const;

/**
 * Helper function to get complete input class string
 */
export const inputClasses = `border-2 ${theme.borders.primary} rounded-xl focus:outline-none focus:ring-4 ${theme.rings.primary} ${theme.borders.primaryFocus} ${theme.gradients.cardNeutral} shadow-md ${theme.text.neutralDarkest}`;
