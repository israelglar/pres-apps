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
    // Text colors for this theme
    text: {
      // Text to use on primary colored backgrounds (buttons, headers, etc)
      onPrimary: 'white',
      onPrimaryHover: 'white',
      // Text to use on secondary colored backgrounds
      onSecondary: 'white',
      // Text to use on light/card backgrounds
      onLight: 'gray-900',
      onLightSecondary: 'gray-600',
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
    text: {
      onPrimary: 'white',
      onPrimaryHover: 'sky-50',
      onSecondary: 'white',
      onLight: 'gray-900',
      onLightSecondary: 'gray-600',
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
    text: {
      onPrimary: 'white',
      onPrimaryHover: 'blue-50',
      onSecondary: 'white',
      onLight: 'gray-900',
      onLightSecondary: 'gray-600',
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
    text: {
      onPrimary: 'white',
      onPrimaryHover: 'teal-50',
      onSecondary: 'white',
      onLight: 'gray-900',
      onLightSecondary: 'gray-600',
    },
  },
} as const;

// Get active theme variant
const activeTheme = themeVariants[getCurrentTheme()];

// Pre-computed literal class mappings for each theme
// ALL class names must be literal strings for Tailwind JIT compilation
const themeClasses = {
  ocean: {
    // Background colors
    bgPrimary: 'bg-cyan-600',
    bgPrimaryHover: 'hover:bg-cyan-700',
    bgPrimaryActive: 'hover:bg-cyan-700',
    bgPrimaryLight: 'bg-cyan-50',
    bgPrimaryLighter: 'bg-cyan-50',
    bgPrimary100: 'bg-cyan-100',
    bgPrimary200: 'bg-cyan-200',
    hoverBgPrimary: 'hover:bg-cyan-50',
    hoverBgPrimaryLight: 'hover:bg-cyan-50',
    devCardHover: 'hover:bg-cyan-50',
    bgSecondary: 'bg-blue-600',
    bgSecondary50: 'bg-blue-50',
    bgSecondary100: 'bg-blue-100',
    hoverBgSecondary: 'hover:bg-blue-100',
    bgPrimary500: 'bg-cyan-500',
    bgSecondary500: 'bg-blue-500',

    // Text colors
    textPrimary: 'text-cyan-600',
    textPrimaryDark: 'text-cyan-700',
    textPrimaryDarker: 'text-cyan-800',
    textPrimaryLight: 'text-cyan-50',
    textSecondary: 'text-blue-600',
    textSecondaryDark: 'text-blue-700',
    textOnPrimaryHover: 'hover:text-white',

    // Border colors
    borderPrimary: 'border-cyan-300',
    borderPrimaryLight: 'border-cyan-200',
    borderPrimaryHover: 'hover:border-cyan-400',
    borderPrimaryHoverLight: 'hover:border-cyan-300',
    focusBorderPrimary: 'focus:border-cyan-500',
    borderSecondary: 'border-blue-500',
    borderSecondary300: 'border-blue-300',

    // Ring colors
    ringPrimary: 'focus:ring-cyan-400',
  },
  sky: {
    // Background colors
    bgPrimary: 'bg-sky-700',
    bgPrimaryHover: 'hover:bg-sky-800',
    bgPrimaryActive: 'hover:bg-sky-800',
    bgPrimaryLight: 'bg-sky-50',
    bgPrimaryLighter: 'bg-sky-50',
    bgPrimary100: 'bg-sky-100',
    bgPrimary200: 'bg-sky-200',
    hoverBgPrimary: 'hover:bg-sky-50',
    hoverBgPrimaryLight: 'hover:bg-sky-50',
    devCardHover: 'hover:bg-sky-50',
    bgSecondary: 'bg-cyan-700',
    bgSecondary50: 'bg-cyan-50',
    bgSecondary100: 'bg-cyan-100',
    hoverBgSecondary: 'hover:bg-cyan-100',
    bgPrimary500: 'bg-sky-600',
    bgSecondary500: 'bg-cyan-600',

    // Text colors
    textPrimary: 'text-sky-700',
    textPrimaryDark: 'text-sky-800',
    textPrimaryDarker: 'text-sky-900',
    textPrimaryLight: 'text-sky-50',
    textSecondary: 'text-cyan-700',
    textSecondaryDark: 'text-cyan-800',
    textOnPrimaryHover: 'hover:text-sky-50',

    // Border colors
    borderPrimary: 'border-sky-300',
    borderPrimaryLight: 'border-sky-200',
    borderPrimaryHover: 'hover:border-sky-400',
    borderPrimaryHoverLight: 'hover:border-sky-300',
    focusBorderPrimary: 'focus:border-sky-500',
    borderSecondary: 'border-cyan-500',
    borderSecondary300: 'border-cyan-300',

    // Ring colors
    ringPrimary: 'focus:ring-sky-400',
  },
  deep: {
    // Background colors
    bgPrimary: 'bg-blue-800',
    bgPrimaryHover: 'hover:bg-blue-900',
    bgPrimaryActive: 'hover:bg-blue-900',
    bgPrimaryLight: 'bg-blue-50',
    bgPrimaryLighter: 'bg-blue-50',
    bgPrimary100: 'bg-blue-100',
    bgPrimary200: 'bg-blue-200',
    hoverBgPrimary: 'hover:bg-blue-50',
    hoverBgPrimaryLight: 'hover:bg-blue-50',
    devCardHover: 'hover:bg-blue-50',
    bgSecondary: 'bg-indigo-800',
    bgSecondary50: 'bg-indigo-50',
    bgSecondary100: 'bg-indigo-100',
    hoverBgSecondary: 'hover:bg-indigo-100',
    bgPrimary500: 'bg-blue-700',
    bgSecondary500: 'bg-indigo-700',

    // Text colors
    textPrimary: 'text-blue-800',
    textPrimaryDark: 'text-blue-900',
    textPrimaryDarker: 'text-blue-950',
    textPrimaryLight: 'text-blue-50',
    textSecondary: 'text-indigo-800',
    textSecondaryDark: 'text-indigo-900',
    textOnPrimaryHover: 'hover:text-blue-50',

    // Border colors
    borderPrimary: 'border-blue-300',
    borderPrimaryLight: 'border-blue-200',
    borderPrimaryHover: 'hover:border-blue-400',
    borderPrimaryHoverLight: 'hover:border-blue-300',
    focusBorderPrimary: 'focus:border-blue-500',
    borderSecondary: 'border-indigo-500',
    borderSecondary300: 'border-indigo-300',

    // Ring colors
    ringPrimary: 'focus:ring-blue-400',
  },
  tropical: {
    // Background colors
    bgPrimary: 'bg-teal-700',
    bgPrimaryHover: 'hover:bg-teal-800',
    bgPrimaryActive: 'hover:bg-teal-800',
    bgPrimaryLight: 'bg-teal-50',
    bgPrimaryLighter: 'bg-teal-50',
    bgPrimary100: 'bg-teal-100',
    bgPrimary200: 'bg-teal-200',
    hoverBgPrimary: 'hover:bg-teal-50',
    hoverBgPrimaryLight: 'hover:bg-teal-50',
    devCardHover: 'hover:bg-teal-50',
    bgSecondary: 'bg-cyan-700',
    bgSecondary50: 'bg-cyan-50',
    bgSecondary100: 'bg-cyan-100',
    hoverBgSecondary: 'hover:bg-cyan-100',
    bgPrimary500: 'bg-teal-600',
    bgSecondary500: 'bg-cyan-600',

    // Text colors
    textPrimary: 'text-teal-700',
    textPrimaryDark: 'text-teal-800',
    textPrimaryDarker: 'text-teal-900',
    textPrimaryLight: 'text-teal-50',
    textSecondary: 'text-cyan-700',
    textSecondaryDark: 'text-cyan-800',
    textOnPrimaryHover: 'hover:text-teal-50',

    // Border colors
    borderPrimary: 'border-teal-300',
    borderPrimaryLight: 'border-teal-200',
    borderPrimaryHover: 'hover:border-teal-400',
    borderPrimaryHoverLight: 'hover:border-teal-300',
    focusBorderPrimary: 'focus:border-teal-500',
    borderSecondary: 'border-cyan-500',
    borderSecondary300: 'border-cyan-300',

    // Ring colors
    ringPrimary: 'focus:ring-teal-400',
  },
} as const;

const currentThemeClasses = themeClasses[getCurrentTheme()];

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

  // Theme-specific text colors (dynamic based on theme)
  themeText: activeTheme.text,

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
  // Using pre-computed literal class names
  solids: {
    // Main app background
    background: currentThemeClasses.bgPrimary,

    // Primary action button
    primaryButton: currentThemeClasses.bgPrimary,
    primaryButtonHover: currentThemeClasses.bgPrimaryHover,

    // Secondary/neutral button
    neutralButton: 'bg-gray-100',
    neutralButtonHover: 'hover:bg-gray-200',

    // Success button
    successButton: 'bg-green-600',
    successButtonHover: 'hover:bg-green-700',

    // Error/danger button
    errorButton: 'bg-red-600',
    errorButtonHover: 'hover:bg-red-700',

    // Card/surface backgrounds
    cardPrimary: currentThemeClasses.bgPrimaryLight,
    cardHighlight: currentThemeClasses.bgPrimaryLight,
    cardNeutral: 'bg-white',

    // Progress bar
    progress: currentThemeClasses.bgPrimary,

    // Selected/active states
    selectedItem: currentThemeClasses.bgPrimary100,
    activeItem: currentThemeClasses.bgPrimary,

    // Badge
    badge: currentThemeClasses.bgPrimary,

    // Lesson type badges
    lessonRegular: 'bg-green-500',
    lessonSpecial: 'bg-amber-500',

    // Dev login hover
    devCardHover: currentThemeClasses.devCardHover,
  },

  // Text colors - MUST use literal class names
  text: {
    // Base colors
    white: 'text-white',
    whiteHover: 'hover:text-white/80',
    whiteTransparent: 'text-white/90',

    // Theme-aware text colors (change with theme variant)
    onPrimary: 'text-white',               // Text on primary backgrounds (all themes use white)
    onPrimaryHover: currentThemeClasses.textOnPrimaryHover,
    onSecondary: 'text-white',           // Text on secondary backgrounds
    onLight: 'text-gray-900',                   // Text on light/card backgrounds
    onLightSecondary: 'text-gray-600', // Secondary text on light backgrounds

    // Primary colors (from theme)
    primary: currentThemeClasses.textPrimary,
    primaryDark: currentThemeClasses.textPrimaryDark,
    primaryDarker: currentThemeClasses.textPrimaryDarker,
    primaryLight: currentThemeClasses.textPrimaryLight,

    // Secondary colors (from theme)
    secondary: currentThemeClasses.textSecondary,
    secondaryDark: currentThemeClasses.textSecondaryDark,

    // Status colors
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-amber-600',

    // Neutral colors
    neutral: 'text-gray-600',
    neutralLight: 'text-gray-400',
    neutralMedium: 'text-gray-500',
    neutralDark: 'text-gray-700',
    neutralDarker: 'text-gray-800',
    neutralDarkest: 'text-gray-900',

    // Visitor colors
    visitor: 'text-purple-700',
    visitorDev: 'text-purple-600',
  },

  // Border colors
  borders: {
    // Primary colors (from theme)
    primary: currentThemeClasses.borderPrimary,
    primaryLight: currentThemeClasses.borderPrimaryLight,
    primaryFocus: currentThemeClasses.focusBorderPrimary,
    primaryHover: currentThemeClasses.borderPrimaryHover,
    primaryHoverLight: currentThemeClasses.borderPrimaryHoverLight,

    // Secondary colors (from theme)
    secondary: currentThemeClasses.borderSecondary,

    // Neutral colors
    neutral: 'border-gray-300',
    neutralLight: 'border-gray-200',

    // Status colors
    success: 'border-green-400',
    successLight: 'border-green-300',
    error: 'border-red-400',
    warning: 'border-amber-300',

    // Visitor colors
    visitor: 'border-purple-300',
    visitorLight: 'border-purple-200',
    visitorFocus: 'focus:border-purple-500',
  },

  // Background colors
  backgrounds: {
    // Base colors
    white: 'bg-white',
    whiteTransparent: 'bg-white/50',
    whiteTransparent90: 'bg-white/90',
    whiteHover: 'hover:bg-white/20',

    // Primary colors (from theme)
    primary: currentThemeClasses.bgPrimary,
    primaryLight: currentThemeClasses.bgPrimary100,
    primaryLighter: currentThemeClasses.bgPrimaryLighter,
    primaryHover: currentThemeClasses.hoverBgPrimary,
    primaryActive: currentThemeClasses.bgPrimaryActive,

    // Secondary colors (from theme)
    secondary: currentThemeClasses.bgSecondary,
    secondaryLight50: currentThemeClasses.bgSecondary50,
    secondaryLight100: currentThemeClasses.bgSecondary100,
    secondaryHover: currentThemeClasses.hoverBgSecondary,

    // Status colors
    success: 'bg-green-100',
    successLight: 'bg-green-50',
    successMedium: 'bg-green-500',
    error: 'bg-red-100',
    errorLight: 'bg-red-50',
    errorMedium: 'bg-red-500',
    errorDark: 'bg-red-600',
    warning: 'bg-amber-100',
    warningLight: 'bg-amber-50',
    warningMedium: 'bg-amber-500',

    // Neutral colors
    neutral: 'bg-gray-100',
    neutralLight: 'bg-gray-50',
    neutralHover: 'hover:bg-gray-50',

    // Visitor colors
    visitor: 'bg-purple-100',
    visitorLight: 'bg-purple-50',
    visitorHover: 'hover:bg-purple-700',
  },

  // Ring/focus colors
  rings: {
    primary: currentThemeClasses.ringPrimary,
  },

  // Status indicator circles (for attendance stats)
  indicators: {
    present: 'bg-green-500',
    absent: 'bg-red-500',
    late: 'bg-amber-500',
    excused: currentThemeClasses.bgSecondary500,
    visitor: currentThemeClasses.bgPrimary500,
  },

  // Semantic status configurations
  status: {
    present: {
      text: 'text-green-600',
      bg: 'bg-green-50',
      bgMedium: 'bg-green-100',
      indicator: 'bg-green-500',
      border: 'border-green-300',
    },
    absent: {
      text: 'text-red-600',
      bg: 'bg-red-50',
      bgMedium: 'bg-red-100',
      indicator: 'bg-red-500',
      border: 'border-red-400',
    },
    late: {
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      bgMedium: 'bg-amber-100',
      indicator: 'bg-amber-500',
      border: 'border-amber-300',
    },
    excused: {
      text: currentThemeClasses.textSecondary,
      bg: currentThemeClasses.bgSecondary50,
      bgMedium: currentThemeClasses.bgSecondary100,
      indicator: currentThemeClasses.bgSecondary500,
      border: currentThemeClasses.borderSecondary300,
    },
  },

  // Student status badges
  studentStatus: {
    active: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
    },
    inactive: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
    },
    'aged-out': {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-300',
    },
    moved: {
      bg: currentThemeClasses.bgSecondary100,
      text: currentThemeClasses.textSecondaryDark,
      border: currentThemeClasses.borderSecondary300,
    },
    visitor: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-200',
    },
  },
} as const;

/**
 * Helper function to get complete button class string
 */
export const buttonClasses = {
  primary: `${theme.solids.primaryButton} ${theme.text.onPrimary} rounded-xl font-bold shadow-md ${theme.solids.primaryButtonHover} hover:shadow-lg active:scale-95 transition-all`,

  secondary: `${theme.solids.neutralButton} ${theme.text.onLight} rounded-xl font-bold ${theme.borders.neutral} border-2 ${theme.solids.neutralButtonHover} hover:shadow-md active:scale-95 transition-all`,

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
