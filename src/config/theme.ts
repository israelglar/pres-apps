/**
 * Centralized Theme Configuration
 *
 * This file contains all color and styling tokens used throughout the app.
 * Multiple theme variants are available - switch using setTheme().
 * All theme properties reference the base colors.
 */

// Theme type definition
type ThemeVariant = 'ocean' | 'sky' | 'deep' | 'tropical';

// Default theme variant
const defaultTheme: ThemeVariant = 'ocean';

// Get current theme from localStorage or default to defaultTheme
const getCurrentTheme = (): ThemeVariant => {
  if (typeof window === 'undefined') return defaultTheme;
  const stored = localStorage.getItem('appTheme') as ThemeVariant | null;
  return stored && ['ocean', 'sky', 'deep', 'tropical'].includes(stored)
    ? stored
    : defaultTheme;
};

// Theme variant configurations
const themeVariants = {
  // Original theme - Ocean Blue/Cyan
  ocean: {
    name: 'Ocean Blue',
    description: 'Original cyan and blue theme',
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
  },

  // Option 1 - Light Sky (lighter, airier blue with darker backgrounds for contrast)
  sky: {
    name: 'Light Sky',
    description: 'Lighter sky and cyan tones',
    primary: {
      50: 'sky-50',
      100: 'sky-100',
      200: 'sky-200',
      300: 'sky-300',
      400: 'sky-400',
      500: 'sky-600',     // Use darker shade for backgrounds
      600: 'sky-700',     // Use darker shade for backgrounds
      700: 'sky-800',
      800: 'sky-900',
      900: 'sky-950',
    },
    secondary: {
      50: 'cyan-50',
      100: 'cyan-100',
      200: 'cyan-200',
      300: 'cyan-300',
      400: 'cyan-400',
      500: 'cyan-600',    // Use darker shade for backgrounds
      600: 'cyan-700',    // Use darker shade for backgrounds
      700: 'cyan-800',
      800: 'cyan-900',
      900: 'cyan-950',
    },
  },

  // Option 2 - Deep Waters (darker, richer blue)
  deep: {
    name: 'Deep Waters',
    description: 'Deeper blue and indigo',
    primary: {
      50: 'blue-50',
      100: 'blue-100',
      200: 'blue-200',
      300: 'blue-300',
      400: 'blue-400',
      500: 'blue-700',     // Use darker shade for backgrounds
      600: 'blue-800',     // Use darker shade for backgrounds
      700: 'blue-900',
      800: 'blue-950',
      900: 'blue-950',
    },
    secondary: {
      50: 'indigo-50',
      100: 'indigo-100',
      200: 'indigo-200',
      300: 'indigo-300',
      400: 'indigo-400',
      500: 'indigo-700',   // Use darker shade for backgrounds
      600: 'indigo-800',   // Use darker shade for backgrounds
      700: 'indigo-900',
      800: 'indigo-950',
      900: 'indigo-950',
    },
  },

  // Option 3 - Tropical Sea (teal variation with darker backgrounds for contrast)
  tropical: {
    name: 'Tropical Sea',
    description: 'Teal and cyan blend',
    primary: {
      50: 'teal-50',
      100: 'teal-100',
      200: 'teal-200',
      300: 'teal-300',
      400: 'teal-400',
      500: 'teal-600',    // Use darker shade for backgrounds
      600: 'teal-700',    // Use darker shade for backgrounds
      700: 'teal-800',
      800: 'teal-900',
      900: 'teal-950',
    },
    secondary: {
      50: 'cyan-50',
      100: 'cyan-100',
      200: 'cyan-200',
      300: 'cyan-300',
      400: 'cyan-400',
      500: 'cyan-600',    // Use darker shade for backgrounds
      600: 'cyan-700',    // Use darker shade for backgrounds
      700: 'cyan-800',
      800: 'cyan-900',
      900: 'cyan-950',
    },
  },
} as const;

// Get active theme variant
const activeTheme = themeVariants[getCurrentTheme()];

// Base color definitions - SINGLE SOURCE OF TRUTH
// Change colors here and they propagate throughout the entire theme
const colors = {
  // Base colors
  white: 'white',
  black: 'black',

  // Primary brand colors (dynamic based on theme)
  primary: activeTheme.primary,

  // Secondary colors (dynamic based on theme)
  secondary: activeTheme.secondary,

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
} as const;

// Theme object - all properties reference the base colors above
export const theme = {
  // Export colors for direct access if needed
  colors,

  // Solid color combinations (NO GRADIENTS)
  solids: {
    // Main app background - solid color
    background: `bg-${colors.primary[600]}`,

    // Primary action button - solid color
    primaryButton: `bg-${colors.primary[600]}`,
    primaryButtonHover: `hover:bg-${colors.primary[700]}`,

    // Secondary/neutral button
    neutralButton: `bg-${colors.neutral[100]}`,
    neutralButtonHover: `hover:bg-${colors.neutral[200]}`,

    // Success button
    successButton: `bg-${colors.success[600]}`,
    successButtonHover: `hover:bg-${colors.success[700]}`,

    // Error/danger button
    errorButton: `bg-${colors.error[600]}`,
    errorButtonHover: `hover:bg-${colors.error[700]}`,

    // Card/surface backgrounds
    cardPrimary: `bg-${colors.primary[50]}`,
    cardHighlight: `bg-${colors.primary[50]}`,
    cardNeutral: `bg-${colors.white}`,

    // Progress bar
    progress: `bg-${colors.primary[600]}`,

    // Selected/active states
    selectedItem: `bg-${colors.primary[100]}`,
    activeItem: `bg-${colors.primary[600]}`,

    // Badge
    badge: `bg-${colors.primary[600]}`,

    // Lesson type badges
    lessonRegular: `bg-${colors.success[500]}`,
    lessonSpecial: `bg-${colors.warning[500]}`,

    // Dev login hover
    devCardHover: `hover:bg-${colors.primary[50]}`,
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
    warning: `border-${colors.warning[300]}`,

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
  primary: `${theme.solids.primaryButton} ${theme.text.white} rounded-xl font-bold shadow-md ${theme.solids.primaryButtonHover} hover:shadow-lg active:scale-95 transition-all`,

  secondary: `${theme.solids.neutralButton} ${theme.text.neutralDark} rounded-xl font-bold ${theme.borders.neutral} border-2 ${theme.solids.neutralButtonHover} hover:shadow-md active:scale-95 transition-all`,

  success: `${theme.solids.successButton} ${theme.text.white} rounded-xl font-bold shadow-md ${theme.solids.successButtonHover} hover:shadow-lg active:scale-95 transition-all`,

  danger: `${theme.solids.errorButton} ${theme.text.white} rounded-xl font-bold shadow-md ${theme.solids.errorButtonHover} hover:shadow-lg active:scale-95 transition-all`,
} as const;

/**
 * Helper function to get complete input class string
 */
export const inputClasses = `border-2 ${theme.borders.primary} rounded-xl focus:outline-none focus:ring-4 ${theme.rings.primary} ${theme.borders.primaryFocus} ${theme.solids.cardNeutral} shadow-md ${theme.text.neutralDarkest}`;

/**
 * Theme management functions
 */
export const themeManager = {
  // Get all available themes
  getThemes: () => themeVariants,

  // Get current theme key
  getCurrentTheme: getCurrentTheme,

  // Set theme and reload page to apply
  setTheme: (variant: ThemeVariant) => {
    localStorage.setItem('appTheme', variant);
    window.location.reload();
  },
};
