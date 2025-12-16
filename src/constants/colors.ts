// src/constants/colors.ts - FRESH MINT THEME

export const COLORS = {
  // Primary - Fresh Mint (Teal/Aqua)
  primary: {
    main: "#2EAB89", // Fresh mint
    light: "#E6F7F2", // Very light mint tint
    lighter: "#C4EFE1", // Light mint
    dark: "#1F8A6B", // Darker mint
    glow: "#3DC9A5", // Lighter variant for glow
    contrast: "#FFFFFF",
  },

  // Secondary - Warm Coral
  secondary: {
    main: "#F08C5A", // Warm coral/orange
    light: "#FFF3ED", // Very light coral tint
    lighter: "#FFDCC8", // Light coral
    dark: "#E8805C", // Darker coral
    contrast: "#FFFFFF",
  },

  // Accent - Sunny Yellow
  accent: {
    main: "#FCCD52", // Bright sunny yellow
    light: "#FFF8E1", // Very light yellow tint
    lighter: "#FEE9B8", // Light yellow
    dark: "#F0C04D", // Darker yellow
    contrast: "#8B6914", // Dark text on yellow
  },

  // Info - Sky Blue
  info: {
    main: "#47B8E0", // Sky blue
    light: "#E3F5FC", // Very light blue tint
    lighter: "#B8E5F7", // Light blue
    dark: "#5BBCE0", // Darker blue
    contrast: "#FFFFFF",
  },

  // Rose - Soft Pink
  rose: {
    main: "#F08C9E", // Soft pink/rose
    light: "#FFF0F3", // Very light pink tint
    lighter: "#FCCCD6", // Light pink
    dark: "#E87D90", // Darker pink
    contrast: "#FFFFFF",
  },

  // Neutral - Clean & Soft
  neutral: {
    white: "#FFFFFF",
    offWhite: "#FAFAF8", // Warm off-white
    black: "#2D3748", // Soft black (blue-gray)
    gray50: "#F9FAFB",
    gray100: "#F3F4F6",
    gray200: "#E5E7EB",
    gray300: "#D1D5DB",
    gray400: "#9CA3AF",
    gray500: "#6B7280",
    gray600: "#4B5563",
    gray700: "#374151",
    gray800: "#1F2937",
    gray900: "#111827",
  },

  // Status colors
  success: {
    main: "#10B981",
    light: "#D1FAE5",
    dark: "#059669",
  },

  error: {
    main: "#EF4444",
    light: "#FEE2E2",
    dark: "#DC2626",
  },

  warning: {
    main: "#F59E0B",
    light: "#FEF3C7",
    dark: "#D97706",
  },

  // Spark mode colors - Updated
  sparkModes: {
    quickSpark: "#2EAB89", // Fresh mint
    deepDive: "#F08C5A", // Warm coral
    thread: "#47B8E0", // Sky blue
  },

  // Gradients - Fresh & Vibrant
  gradients: {
    mint: ["#2EAB89", "#3DC9A5"], // Primary mint gradient
    coral: ["#F08C5A", "#FFB088"], // Warm coral gradient
    sunny: ["#FCCD52", "#FFE082"], // Sunny yellow gradient
    sky: ["#47B8E0", "#6DD5FA"], // Sky blue gradient
    rose: ["#F08C9E", "#FFA8B8"], // Soft pink gradient
    dreamy: ["#A78BFA", "#6DD5FA"], // Purple to blue
    twilight: ["#2EAB89", "#3DC9A5", "#47B8E0"], // Mint to blue (3 colors)
    background: ["#FAFAF8", "#F5F5F3"], // Subtle background gradient
  },
};

// Light Theme
export const LIGHT_THEME = {
  background: {
    primary: "#FFFFFF",
    secondary: "#FAFAF8", // Warm off-white
    tertiary: "#F9FAFB",
    elevated: "#FFFFFF",
    gradient: "linear-gradient(180deg, #FAFAF8 0%, #F5F5F3 100%)",
    card: "#FFFFFF",
  },

  text: {
    primary: "#2D3748", // Soft black
    secondary: "#4B5563", // Medium gray
    tertiary: "#6B7280", // Light gray
    disabled: "#9CA3AF",
    inverse: "#FFFFFF",
    accent: "#2EAB89", // Mint for links/emphasis
  },

  border: {
    primary: "#E5E7EB",
    secondary: "#D1D5DB",
    focus: "#2EAB89", // Mint focus ring
    light: "#F3F4F6",
  },

  card: {
    background: "#FFFFFF",
    border: "#E5E7EB",
    shadow: "rgba(46, 171, 137, 0.08)", // Mint tinted shadow
    hover: "#FAFAF8",
  },

  button: {
    primary: "#2EAB89",
    primaryHover: "#1F8A6B",
    secondary: "#F3F4F6",
    secondaryHover: "#E5E7EB",
    disabled: "#D1D5DB",
  },

  status: {
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#47B8E0",
  },

  overlay: "rgba(0, 0, 0, 0.4)",
  glass: "rgba(255, 255, 255, 0.8)", // For glassmorphism
};

// Dark Theme - Softer, easier on eyes
export const DARK_THEME = {
  background: {
    primary: "#1A202C", // Deep blue-gray
    secondary: "#2D3748", // Lighter blue-gray
    tertiary: "#374151",
    elevated: "#2D3748",
    gradient: "linear-gradient(180deg, #1A202C 0%, #0F1419 100%)",
    card: "#2D3748",
  },

  text: {
    primary: "#F9FAFB",
    secondary: "#D1D5DB",
    tertiary: "#9CA3AF",
    disabled: "#6B7280",
    inverse: "#1A202C",
    accent: "#3DC9A5", // Brighter mint for dark mode
  },

  border: {
    primary: "#374151",
    secondary: "#4B5563",
    focus: "#3DC9A5",
    light: "#2D3748",
  },

  card: {
    background: "#2D3748",
    border: "#374151",
    shadow: "rgba(61, 201, 165, 0.15)", // Mint glow in dark
    hover: "#374151",
  },

  button: {
    primary: "#3DC9A5",
    primaryHover: "#2EAB89",
    secondary: "#374151",
    secondaryHover: "#4B5563",
    disabled: "#4B5563",
  },

  status: {
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#47B8E0",
  },

  overlay: "rgba(0, 0, 0, 0.6)",
  glass: "rgba(45, 55, 72, 0.8)", // Dark glassmorphism
};

// Shadows with colored tints
export const SHADOWS = {
  // Soft shadows for subtle elevation
  soft: {
    shadowColor: "#2EAB89",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },

  // Card shadows
  card: {
    shadowColor: "#2EAB89",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },

  // Elevated shadows for floating elements
  elevated: {
    shadowColor: "#2EAB89",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
  },

  // Colored glows for special elements
  glow: {
    mint: {
      shadowColor: "#2EAB89",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 6,
    },
    coral: {
      shadowColor: "#F08C5A",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 6,
    },
    sunny: {
      shadowColor: "#FCCD52",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 6,
    },
  },

  // None
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

// Spacing - Generous & Breathable
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16, // Standard unit
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
  full: "100%",
};

// Border Radius - Heavily Rounded
export const BORDER_RADIUS = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 32,
  full: 9999,
};

// Font Sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
  display: 40,
};

// Font Weights
export const FONT_WEIGHTS = {
  light: "300" as const,
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};

// Line Heights
export const LINE_HEIGHTS = {
  tight: 1.2,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.6,
  loose: 1.75,
};

// Animation Durations (ms)
export const ANIMATION = {
  fast: 150,
  normal: 250,
  medium: 350,
  slow: 500,
  verySlow: 700,
};
