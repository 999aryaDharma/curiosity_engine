// src/stores/settingsStore.ts

import { create } from "zustand";
import { AppSettings } from "@type/common.types";
import {mmkvService} from "@services/storage/mmkvService";
import { DEFAULT_SETTINGS } from "@constants/config";

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;

  loadSettings: () => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;

  setTheme: (theme: "light" | "dark" | "auto") => void;
  setLanguage: (language: "en" | "id") => void;
  setNotifications: (enabled: boolean) => void;
  setDailyReminderTime: (time: string) => void;
  setDefaultSparkMode: (mode: 1 | 2 | 3) => void;
  setDifficultyLevel: (level: number) => void;
  setMaxDeepDiveLayers: (layers: number) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,

  loadSettings: () => {
    set({ isLoading: true });
    try {
      const saved = mmkvService.getSettings();
      if (saved) {
        set({ settings: { ...DEFAULT_SETTINGS, ...saved } });
      } else {
        set({ settings: DEFAULT_SETTINGS });
        mmkvService.setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error("[SettingsStore] Load settings failed:", error);
      set({ settings: DEFAULT_SETTINGS });
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: (updates: Partial<AppSettings>) => {
    const current = get().settings;
    const newSettings = { ...current, ...updates };

    set({ settings: newSettings });
    mmkvService.setSettings(newSettings);
  },

  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS });
    mmkvService.setSettings(DEFAULT_SETTINGS);
  },

  setTheme: (theme: "light" | "dark" | "auto") => {
    get().updateSettings({ theme });
  },

  setLanguage: (language: "en" | "id") => {
    get().updateSettings({ language });
  },

  setNotifications: (enabled: boolean) => {
    get().updateSettings({ notificationsEnabled: enabled });
  },

  setDailyReminderTime: (time: string) => {
    get().updateSettings({ dailyReminderTime: time });
  },

  setDefaultSparkMode: (mode: 1 | 2 | 3) => {
    get().updateSettings({ defaultSparkMode: mode });
  },

  setChaosLevel: (level: number) => {
    const clamped = Math.max(0, Math.min(1, level));
    get().updateSettings({ chaosLevel: clamped });
  },

  setMaxDeepDiveLayers: (layers: number) => {
    const clamped = Math.max(3, Math.min(6, layers));
    get().updateSettings({ maxDeepDiveLayers: clamped });
  },
}));
