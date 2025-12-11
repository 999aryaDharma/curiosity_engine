// src/types/common.types.ts

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface AppSettings {
  theme: "light" | "dark" | "auto";
  language: "en" | "id";
  notificationsEnabled: boolean;
  dailyReminderTime?: string; // HH:mm format
  defaultSparkMode: 1 | 2 | 3;
  chaosLevel: number; // 0.0-1.0
  maxDeepDiveLayers: number; // 3-6
  tagSelectionConfig: {
    historyWeight: number;
    wildcardWeight: number;
    deepDiveWeight: number;
    randomWeight: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface LLMConfig {
  provider: "openai" | "anthropic" | "gemini" | "custom";
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number; // milliseconds
  retryAttempts: number;
}

export interface StorageMetadata {
  version: string;
  lastMigration: string;
  totalRecords: number;
  databaseSize: number; // bytes
  lastBackup?: number;
}

export interface NavigationParams {
  OnboardingScreen: undefined;
  HomeScreen: undefined;
  QuickSparkScreen: {
    autoGenerate?: boolean;
  };
  DeepDiveScreen: {
    initialLayer?: number;
  };
  ThreadScreen: {
    clusterId?: string;
  };
  HistoryScreen: {
    filter?: {
      mode?: 1 | 2 | 3;
      date?: string;
    };
  };
  SettingsScreen: undefined;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number; // 0-100
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
  retry?: () => void;
}

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading"; message?: string }
  | { status: "success"; data: T }
  | { status: "error"; error: ApiError };

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
