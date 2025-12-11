// src/services/storage/mmkvService.ts

import { MMKV } from "react-native-mmkv";

// Workaround for a persistent module resolution issue.
// We use `require` to get the actual constructor value, bypassing ES module import problems.
const MMKVConstructor = require("react-native-mmkv").MMKV;

class MMKVService {
  private storage: MMKV;

  constructor() {
    this.storage = new MMKVConstructor({
      id: "curiosity-engine-storage",
      encryptionKey: "curiosity-engine-secure-key-2024",
    });
  }

  set(key: string, value: any): void {
    try {
      if (typeof value === "string") {
        this.storage.set(key, value);
      } else if (typeof value === "number") {
        this.storage.set(key, value);
      } else if (typeof value === "boolean") {
        this.storage.set(key, value);
      } else {
        this.storage.set(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`[MMKV] Error setting key ${key}:`, error);
      throw error;
    }
  }

  get(key: string): any {
    try {
      const value = this.storage.getString(key);

      if (value === undefined) {
        return null;
      }

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`[MMKV] Error getting key ${key}:`, error);
      return null;
    }
  }

  getString(key: string): string | null {
    try {
      return this.storage.getString(key) ?? null;
    } catch (error) {
      console.error(`[MMKV] Error getting string ${key}:`, error);
      return null;
    }
  }

  getNumber(key: string): number | null {
    try {
      return this.storage.getNumber(key) ?? null;
    } catch (error) {
      console.error(`[MMKV] Error getting number ${key}:`, error);
      return null;
    }
  }

  getBoolean(key: string): boolean | null {
    try {
      return this.storage.getBoolean(key) ?? null;
    } catch (error) {
      console.error(`[MMKV] Error getting boolean ${key}:`, error);
      return null;
    }
  }

  delete(key: string): void {
    try {
      this.storage.remove(key);
    } catch (error) {
      console.error(`[MMKV] Error deleting key ${key}:`, error);
      throw error;
    }
  }

  contains(key: string): boolean {
    try {
      return this.storage.contains(key);
    } catch (error) {
      console.error(`[MMKV] Error checking key ${key}:`, error);
      return false;
    }
  }

  getAllKeys(): string[] {
    try {
      return this.storage.getAllKeys();
    } catch (error) {
      console.error("[MMKV] Error getting all keys:", error);
      return [];
    }
  }

  clearAll(): void {
    try {
      this.storage.clearAll();
      console.log("[MMKV] All data cleared");
    } catch (error) {
      console.error("[MMKV] Error clearing all data:", error);
      throw error;
    }
  }

  getSettings(): any {
    return this.get("app_settings");
  }

  setSettings(settings: any): void {
    this.set("app_settings", settings);
  }

  getOnboardingComplete(): boolean {
    return this.getBoolean("onboarding_complete") ?? false;
  }

  setOnboardingComplete(complete: boolean): void {
    this.set("onboarding_complete", complete);
  }

  getLastDailyTagRefresh(): number | null {
    return this.getNumber("last_daily_tag_refresh");
  }

  setLastDailyTagRefresh(timestamp: number): void {
    this.set("last_daily_tag_refresh", timestamp);
  }

  getCachedSpark(): any {
    return this.get("cached_spark");
  }

  setCachedSpark(spark: any): void {
    this.set("cached_spark", spark);
  }

  clearCachedSpark(): void {
    this.delete("cached_spark");
  }

  getSelectedTags(): string[] {
    return this.get("selected_tags") || [];
  }

  setSelectedTags(tags: string[]): void {
    this.set("selected_tags", tags);
  }

  getUserPreferences(): Record<string, any> {
    return this.get("user_preferences") || {};
  }

  setUserPreferences(prefs: Record<string, any>): void {
    this.set("user_preferences", prefs);
  }

  updateUserPreference(key: string, value: any): void {
    const prefs = this.getUserPreferences();
    prefs[key] = value;
    this.setUserPreferences(prefs);
  }

  getAppVersion(): string | null {
    return this.getString("app_version");
  }

  setAppVersion(version: string): void {
    this.set("app_version", version);
  }

  getAnalyticsEnabled(): boolean {
    return this.getBoolean("analytics_enabled") ?? false;
  }

  setAnalyticsEnabled(enabled: boolean): void {
    this.set("analytics_enabled", enabled);
  }

  getDarkModeEnabled(): boolean {
    return this.getBoolean("dark_mode_enabled") ?? false;
  }

  setDarkModeEnabled(enabled: boolean): void {
    this.set("dark_mode_enabled", enabled);
  }

  getLanguage(): "en" | "id" {
    return (this.getString("language") as "en" | "id") || "en";
  }

  setLanguage(lang: "en" | "id"): void {
    this.set("language", lang);
  }

  export(): Record<string, any> {
    const keys = this.getAllKeys();
    const data: Record<string, any> = {};

    keys.forEach((key) => {
      data[key] = this.get(key);
    });

    return data;
  }

  import(data: Record<string, any>): void {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value);
    });
  }
}

export default new MMKVService();
