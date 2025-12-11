// src/constants/colors.ts

export const COLORS = {
  // Primary colors - Vibrant Purple/Blue
  primary: {
    main: "#8B5CF6", // Vivid purple
    light: "#A78BFA",
    dark: "#7C3AED",
    contrast: "#FFFFFF",
  },

  // Secondary colors - Cheerful Pink
  secondary: {
    main: "#F472B6", // Bright pink
    light: "#FBCFE8",
    dark: "#EC4899",
    contrast: "#FFFFFF",
  },

  // Accent colors - Fun & Vibrant
  accent: {
    yellow: "#FCD34D", // Sunny yellow
    orange: "#FB923C", // Warm orange
    green: "#34D399", // Fresh green
    blue: "#60A5FA", // Sky blue
    purple: "#C084FC", // Soft purple
  },

  // Neutral colors - Soft & Clean
  neutral: {
    white: "#FFFFFF",
    black: "#1F2937",
    gray50: "#FAFAFA",
    gray100: "#F5F5F5",
    gray200: "#E5E5E5",
    gray300: "#D4D4D4",
    gray400: "#A3A3A3",
    gray500: "#737373",
    gray600: "#525252",
    gray700: "#404040",
    gray800: "#262626",
    gray900: "#171717",
  },

  // Status colors
  success: {
    main: "#10B981",
    light: "#34D399",
    dark: "#059669",
    background: "#D1FAE5",
  },

  error: {
    main: "#EF4444",
    light: "#F87171",
    dark: "#DC2626",
    background: "#FEE2E2",
  },

  warning: {
    main: "#F59E0B",
    light: "#FBBF24",
    dark: "#D97706",
    background: "#FEF3C7",
  },

  info: {
    main: "#3B82F6",
    light: "#60A5FA",
    dark: "#2563EB",
    background: "#DBEAFE",
  },

  // Spark mode colors - Fun & Distinctive
  sparkModes: {
    quick: "#10B981", // Energetic green
    deepDive: "#8B5CF6", // Deep purple
    thread: "#F472B6", // Creative pink
  },

  // Cluster colors - Playful palette
  clusters: {
    philosophy: "#A78BFA", // Thoughtful purple
    science: "#60A5FA", // Discovery blue
    arts: "#F472B6", // Creative pink
    technology: "#34D399", // Modern green
    psychology: "#FBBF24", // Warm yellow
    society: "#FB923C", // Social orange
    nature: "#10B981", // Natural green
    history: "#F87171", // Heritage red
    mathematics: "#818CF8", // Logical indigo
    language: "#A3E635", // Expressive lime
    economics: "#C084FC", // Strategic purple
    health: "#2DD4BF", // Vital teal
  },

  // Gradient backgrounds - Cheerful combinations
  gradients: {
    sunrise: ["#FCD34D", "#FB923C", "#F472B6"],
    ocean: ["#60A5FA", "#3B82F6", "#8B5CF6"],
    forest: ["#34D399", "#10B981", "#059669"],
    twilight: ["#C084FC", "#8B5CF6", "#7C3AED"],
    candy: ["#F472B6", "#EC4899", "#DB2777"],
  },
};

export const LIGHT_THEME = {
  background: {
    primary: "#FFFFFF",
    secondary: "#FAFAFA",
    tertiary: "#F5F5F5",
    elevated: "#FFFFFF",
    gradient: "linear-gradient(135deg, #FAFAFA 0%, #F0F9FF 100%)",
  },

  text: {
    primary: "#1F2937",
    secondary: "#525252",
    tertiary: "#737373",
    disabled: "#A3A3A3",
    inverse: "#FFFFFF",
  },

  border: {
    primary: "#E5E5E5",
    secondary: "#D4D4D4",
    focus: "#8B5CF6",
  },

  card: {
    background: "#FFFFFF",
    border: "#E5E5E5",
    shadow: "rgba(139, 92, 246, 0.1)", // Purple tint shadow
    hover: "#FAFAFA",
  },

  button: {
    primary: "#8B5CF6",
    primaryHover: "#7C3AED",
    secondary: "#F5F5F5",
    secondaryHover: "#E5E5E5",
    disabled: "#D4D4D4",
  },

  status: {
    success: "#34D399",
    error: "#F87171",
    warning: "#FBBF24",
    info: "#60A5FA",
  },

  overlay: "rgba(0, 0, 0, 0.3)",
};

export const DARK_THEME = {
  background: {
    primary: "#1F2937",
    secondary: "#111827",
    tertiary: "#374151",
    elevated: "#1F2937",
    gradient: "linear-gradient(135deg, #1F2937 0%, #111827 100%)",
  },

  text: {
    primary: "#F9FAFB",
    secondary: "#D1D5DB",
    tertiary: "#9CA3AF",
    disabled: "#6B7280",
    inverse: "#111827",
  },

  border: {
    primary: "#374151",
    secondary: "#4B5563",
    focus: "#A78BFA",
  },

  card: {
    background: "#1F2937",
    border: "#374151",
    shadow: "rgba(139, 92, 246, 0.2)", // Purple glow
    hover: "#374151",
  },

  button: {
    primary: "#A78BFA",
    primaryHover: "#8B5CF6",
    secondary: "#374151",
    secondaryHover: "#4B5563",
    disabled: "#4B5563",
  },

  status: {
    success: "#34D399",
    error: "#F87171",
    warning: "#FBBF24",
    info: "#60A5FA",
  },

  overlay: "rgba(0, 0, 0, 0.6)",
};

export const SHADOWS = {
  small: {
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  medium: {
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  large: {
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },

  xlarge: {
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },

  colored: {
    purple: {
      shadowColor: "#8B5CF6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    pink: {
      shadowColor: "#F472B6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    green: {
      shadowColor: "#34D399",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BORDER_RADIUS = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  full: 9999,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 48,
};

export const FONT_WEIGHTS = {
  light: "300" as const,
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const LINE_HEIGHTS = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
};
