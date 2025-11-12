/**
 * Centralized Theme Configuration - Professional Blue Palette
 *
 * Color Palette:
 * - Primary: Blue-600 (#2563EB) - professional, clear action color
 * - Background: Gray-50 (#F9FAFB) - clean neutral base
 * - Surface: White (#FFFFFF) - card backgrounds
 * - Borders: Gray-200 (#E5E7EB) - subtle separation
 * - Text: Gray-900 (#111827) for headings, Gray-600 (#6B7280) for secondary
 * - Success: Green-600 (#16A34A)
 * - Warning: Amber-700 (#B45309) on Amber-50 (#FFFBEB) background
 */

// Theme object - all color tokens
export const theme = {
  // Background colors
  backgrounds: {
    // Base backgrounds
    white: 'bg-white',
    page: 'bg-gray-50',

    // Primary action backgrounds
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    primaryActive: 'active:bg-blue-800',

    // Light primary backgrounds (for cards/highlights)
    primaryLight: 'bg-blue-100',
    primaryLighter: 'bg-blue-50',

    // Neutral backgrounds
    neutral: 'bg-gray-100',
    neutralLight: 'bg-gray-50',
    neutralHover: 'hover:bg-gray-50',

    // Status colors
    success: 'bg-green-100',
    successLight: 'bg-green-50',
    successMedium: 'bg-green-600',
    error: 'bg-red-100',
    errorLight: 'bg-red-50',
    errorMedium: 'bg-red-600',
    errorDark: 'bg-red-700',
    warning: 'bg-amber-50',
    warningLight: 'bg-amber-50',
    warningMedium: 'bg-amber-500',

    // Transparent overlays
    whiteTransparent: 'bg-white/50',
    whiteTransparent90: 'bg-white/90',
    whiteHover: 'hover:bg-white/20',

    // Secondary backgrounds (for variety)
    secondary: 'bg-blue-600',
    secondaryLight50: 'bg-blue-50',
    secondaryLight100: 'bg-blue-100',
    secondaryHover: 'hover:bg-blue-100',

    // Visitor colors
    visitor: 'bg-purple-100',
    visitorLight: 'bg-purple-50',
    visitorHover: 'hover:bg-purple-700',
  },

  // Text colors
  text: {
    // Base text colors
    white: 'text-white',
    whiteHover: 'hover:text-white/80',
    whiteTransparent: 'text-white/90',

    // Theme-aware text (for backgrounds)
    onPrimary: 'text-white',          // Text on blue-600 backgrounds
    onPrimaryButton: 'text-white',    // Text on buttons (always white)
    onPrimaryHover: 'hover:text-white',
    onSecondary: 'text-white',        // Text on secondary backgrounds
    onLight: 'text-gray-900',         // Main text on white/light backgrounds
    onLightSecondary: 'text-gray-600', // Secondary text on light backgrounds

    // Primary colors
    primary: 'text-blue-600',
    primaryDark: 'text-blue-700',
    primaryDarker: 'text-blue-800',
    primaryLight: 'text-blue-100',

    // Secondary colors
    secondary: 'text-blue-600',
    secondaryDark: 'text-blue-700',

    // Status colors
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-amber-700',

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
    // Primary colors
    primary: 'border-blue-600',
    primaryLight: 'border-blue-200',
    primaryFocus: 'focus:border-blue-500',
    primaryHover: 'hover:border-blue-500',
    primaryHoverLight: 'hover:border-blue-300',

    // Secondary colors
    secondary: 'border-blue-500',

    // Neutral colors
    neutral: 'border-gray-300',
    neutralLight: 'border-gray-200',

    // Status colors
    success: 'border-green-600',
    successLight: 'border-green-300',
    error: 'border-red-400',
    warning: 'border-amber-300',

    // Visitor colors
    visitor: 'border-purple-300',
    visitorLight: 'border-purple-200',
    visitorFocus: 'focus:border-purple-500',
  },

  // Ring/focus colors
  rings: {
    primary: 'focus:ring-blue-500/50',
  },

  // Solid color combinations (backward compatibility)
  solids: {
    // Main app background
    background: 'bg-blue-600',

    // Buttons
    primaryButton: 'bg-blue-600',
    primaryButtonHover: 'hover:bg-blue-700',
    neutralButton: 'bg-gray-100',
    neutralButtonHover: 'hover:bg-gray-200',
    successButton: 'bg-green-600',
    successButtonHover: 'hover:bg-green-700',
    errorButton: 'bg-red-600',
    errorButtonHover: 'hover:bg-red-700',

    // Cards
    cardPrimary: 'bg-blue-50',
    cardHighlight: 'bg-blue-50',
    cardNeutral: 'bg-white',

    // States
    selectedItem: 'bg-blue-100',
    activeItem: 'bg-blue-600',
    progress: 'bg-blue-600',
    badge: 'bg-blue-600',

    // Lesson types
    lessonRegular: 'bg-green-500',
    lessonSpecial: 'bg-amber-500',

    // Dev tools
    devCardHover: 'hover:bg-gray-50',
  },

  // Status indicator circles (for attendance stats)
  indicators: {
    present: 'bg-green-500',
    absent: 'bg-red-500',
    late: 'bg-amber-500',
    excused: 'bg-blue-500',
    visitor: 'bg-blue-500',
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
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      bgMedium: 'bg-blue-100',
      indicator: 'bg-blue-500',
      border: 'border-blue-300',
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
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-300',
    },
    visitor: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-200',
    },
  },
} as const;

/**
 * Pre-built button class strings
 */
export const buttonClasses = {
  primary: `bg-blue-600 text-white rounded-xl font-semibold shadow-sm hover:bg-blue-700 active:bg-blue-800 hover:shadow-md active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-blue-500`,

  secondary: `bg-gray-100 text-gray-800 rounded-xl font-semibold border-2 border-gray-200 hover:bg-gray-200 hover:shadow-sm active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-blue-500`,

  success: `bg-green-600 text-white rounded-xl font-semibold shadow-sm hover:bg-green-700 hover:shadow-md active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-green-500`,

  danger: `bg-red-600 text-white rounded-xl font-semibold shadow-sm hover:bg-red-700 hover:shadow-md active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-red-500`,
} as const;

/**
 * Pre-built input class string
 */
export const inputClasses = `border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white shadow-sm text-gray-900`;

/**
 * Theme management stub (for backward compatibility)
 */
export const themeManager = {
  getCurrentTheme: () => 'professional' as const,
  getThemes: () => ({
    professional: {
      name: 'Professional Blue',
      description: 'Clean blue-600 palette with neutral grays'
    }
  }),
  setTheme: (_variant: string) => {
    // Theme is now fixed to professional palette
    // This function exists for backward compatibility only
  },
};
