// src/constants/config.ts - KNOWLEDGE-BASED CONFIG

export const APP_CONFIG = {
  APP_NAME: "Curiosity Engine",
  VERSION: "2.0.0", // Major version bump for knowledge transformation
  BUILD_NUMBER: 1,

  DEFAULT_LANGUAGE: "en" as const,
  SUPPORTED_LANGUAGES: ["en", "id"] as const,

  DATABASE_NAME: "curiosity_engine.db",
  MMKV_INSTANCE_ID: "curiosity-engine-storage",

  MAX_SPARK_LENGTH: 280,
  MIN_SPARK_LENGTH: 50,

  // NEW: Knowledge field constraints
  MIN_KNOWLEDGE_LENGTH: 80, // words for factual explanation
  MAX_KNOWLEDGE_LENGTH: 600, // characters

  DEEP_DIVE_MIN_LAYERS: 3,
  DEEP_DIVE_MAX_LAYERS: 6,
  DEEP_DIVE_BRANCHES_PER_LAYER: 2,

  THREAD_MAX_CONCEPTS: 100,
  THREAD_MIN_LINK_STRENGTH: 0.3,
  THREAD_CLUSTER_COHERENCE_THRESHOLD: 0.6,

  SPARK_GENERATION_TIMEOUT: 30000, // 30 seconds
  LLM_RESPONSE_TIMEOUT: 4000, // 4 seconds target
  RETRY_ATTEMPTS: 2,

  CACHE_SPARK_COUNT: 10,
  HISTORY_PAGE_SIZE: 20,

  ANALYTICS_ENABLED: false,
  DEBUG_MODE: __DEV__,
} as const;

export const LLM_CONFIG = {
  GEMINI: {
    MODEL: "gemini-2.5-flash-lite",
    TEMPERATURE: 0.7,
    BASE_URL: "https://generativelanguage.googleapis.com/v1",
  },

  TIMEOUT: 30000,
  RETRY_DELAY: 1000,
  MAX_RETRIES: 2,
} as const;

export const SPARK_MODES = {
  QUICK_LEARN: 1, // Renamed from QUICK_SPARK
  DEEP_DIVE: 2,
  KNOWLEDGE_GRAPH: 3, // Renamed from THREAD
} as const;

// NEW: Difficulty levels (replaces CHAOS_LEVELS)
export const DIFFICULTY_LEVELS = {
  BEGINNER: 0.0, // Basic facts, simple explanations
  ELEMENTARY: 0.25, // Fundamental concepts
  INTERMEDIATE: 0.5, // Technical depth
  ADVANCED: 0.75, // Complex systems
  EXPERT: 1.0, // Cutting-edge knowledge
} as const;

// Legacy alias for backward compatibility
export const CHAOS_LEVELS = DIFFICULTY_LEVELS;

export const ERROR_CODES = {
  DATABASE_ERROR: "DB_ERROR",
  LLM_ERROR: "LLM_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: "onboarding_complete",
  USER_PREFERENCES: "user_preferences",
  APP_SETTINGS: "app_settings",
  SELECTED_TAGS: "selected_tags",
  CACHED_SPARK: "cached_spark",
  LAST_DAILY_TAG_REFRESH: "last_daily_tag_refresh",
  DARK_MODE: "dark_mode_enabled",
  LANGUAGE: "language",
  ANALYTICS_ENABLED: "analytics_enabled",
  APP_VERSION: "app_version",
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800,
} as const;

export const HAPTIC_FEEDBACK = {
  LIGHT: "light",
  MEDIUM: "medium",
  HEAVY: "heavy",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
} as const;

export const DEFAULT_SETTINGS = {
  theme: "auto" as const,
  language: "en" as const,
  notificationsEnabled: false,
  dailyReminderTime: "09:00",
  defaultSparkMode: SPARK_MODES.QUICK_LEARN,
  difficultyLevel: DIFFICULTY_LEVELS.INTERMEDIATE, // Renamed from chaosLevel
  maxDeepDiveLayers: 4,
  tagSelectionConfig: {
    historyWeight: 0.4,
    wildcardWeight: 0.3,
    deepDiveWeight: 0.2,
    randomWeight: 0.1,
  },
};
