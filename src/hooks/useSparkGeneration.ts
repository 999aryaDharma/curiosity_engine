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
  const [customChaos, setCustomChaos] = useState<number | null>(null);

  const generate = useCallback(
    async (
      mode: SparkMode,
      tags: Tag[],
      options?: {
        layers?: number;
        chaos?: number;
      }
    ) => {
      if (tags.length === 0) {
        throw new Error("At least one tag is required");
      }

      const chaos = options?.chaos ?? customChaos ?? settings.chaosLevel;

      clearCurrentSpark();

      switch (mode) {
        case 1:
          await generateQuickSpark(tags, chaos);
          break;

        case 2:
          const layers = options?.layers ?? settings.maxDeepDiveLayers;
          await generateDeepDive(tags, layers, chaos);
          break;

        case 3:
          await generateThreadSpark(tags, chaos);
          break;

        default:
          throw new Error(`Invalid mode: ${mode}`);
      }
    },
    [
      customChaos,
      settings.chaosLevel,
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

  const updateChaos = useCallback((chaos: number) => {
    const clamped = Math.max(0, Math.min(1, chaos));
    setCustomChaos(clamped);
  }, []);

  const resetChaos = useCallback(() => {
    setCustomChaos(null);
  }, []);

  return {
    currentSpark,
    isGenerating,
    error,
    chaos: customChaos ?? settings.chaosLevel,
    generate,
    generateWithMode,
    regenerate,
    updateChaos,
    resetChaos,
    clearSpark: clearCurrentSpark,
  };
};
