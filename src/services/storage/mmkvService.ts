// src/services/storage/mmkvService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppSettings } from "@type/common.types";

class MMKVService {
  async set(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value != null ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys]; // Convert readonly array to mutable array
    } catch (error) {
      console.error("Error getting all keys:", error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }

  // Utility methods
  async setString(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async getString(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  }

  async setNumber(key: string, value: number): Promise<void> {
    await AsyncStorage.setItem(key, value.toString());
  }

  async getNumber(key: string): Promise<number | null> {
    const value = await AsyncStorage.getItem(key);
    return value != null ? parseFloat(value) : null;
  }

  async setBoolean(key: string, value: boolean): Promise<void> {
    await AsyncStorage.setItem(key, value.toString());
  }

  async getBoolean(key: string): Promise<boolean | null> {
    const value = await AsyncStorage.getItem(key);
    return value != null ? value === "true" : null;
  }

  async getOnboardingComplete(): Promise<boolean> {
    const value = await this.getBoolean("onboarding_complete");
    return value ?? false;
  }

  // Settings-specific methods
  async setSettings(settings: AppSettings): Promise<void> {
    await this.set("app_settings", settings);
  }

  async getSettings(): Promise<AppSettings | null> {
    return await this.get<AppSettings>("app_settings");
  }
}

export const mmkvService = new MMKVService();
