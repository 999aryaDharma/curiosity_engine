// src/hooks/useSparkGeneration.ts

import { useState, useCallback } from "react";
import { Tag } from "@type/tag.types";
import { SparkMode } from "@type/spark.types";
import { useSparkStore } from "@stores/sparkStore";
import { useSettingsStore } from "@stores/settingsStore";

export const useSparkGeneration = () => {
  const {
    currentSpark,
    isGenerating,
    error,
    generateQuickSpark,
    generateDeepDive,
    generateThreadSpark,
    clearCurrentSpark,
  } = useSparkStore();

  const { settings } = useSettingsStore();

  // Tidak perlu customdifficulty lagi, langsung pakai dari settings
  const generate = useCallback(
    async (
      mode: SparkMode,
      tags: Tag[],
      options?: {
        layers?: number;
        difficulty?: number; // Optional override
      }
    ) => {
      if (tags.length === 0) {
        throw new Error("At least one tag is required");
      }

      // Gunakan difficulty dari options kalau ada, kalau tidak pakai dari settings
      const difficulty = options?.difficulty ?? settings.difficultyLevel;

      clearCurrentSpark();

      switch (mode) {
        case 1:
          await generateQuickSpark(tags, difficulty);
          break;

        case 2:
          // Gunakan layers dari options atau settings
          const layers = options?.layers ?? settings.maxDeepDiveLayers;
          await generateDeepDive(tags, layers, difficulty);
          break;

        case 3:
          await generateThreadSpark(tags, difficulty);
          break;

        default:
          throw new Error(`Invalid mode: ${mode}`);
      }
    },
    [
      settings.difficultyLevel,
      settings.maxDeepDiveLayers,
      generateQuickSpark,
      generateDeepDive,
      generateThreadSpark,
      clearCurrentSpark,
    ]
  );

  const generateWithMode = useCallback(
    async (mode: SparkMode, tags: Tag[]) => {
      await generate(mode, tags);
    },
    [generate]
  );

  const regenerate = useCallback(async () => {
    if (!currentSpark) return;

    const mode = currentSpark.mode;
    const tags = currentSpark.tags;

    await generate(mode, tags as any);
  }, [currentSpark, generate]);

  return {
    currentSpark,
    isGenerating,
    error,
    difficulty: settings.difficultyLevel,
    maxLayers: settings.maxDeepDiveLayers,
    generate,
    generateWithMode,
    regenerate,
    clearSpark: clearCurrentSpark,
  };
};
