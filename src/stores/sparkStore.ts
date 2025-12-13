// src/stores/sparkStore.ts

import { create } from "zustand";
import { Spark, SparkMode } from "@type/spark.types";
import { Tag } from "@type/tag.types";
import { ConceptCluster } from "@type/thread.types";
import sparkGenerator from "@services/spark-engine/sparkGenerator";
import conceptGraphEngine from "@services/thread-engine/conceptGraph";
import notificationService from "@/services/notifications/notificationService";

interface SparkState {
  currentSpark: Spark | null;
  recentSparks: Spark[];
  savedSparks: Spark[];
  isGenerating: boolean;
  error: string | null;

  generateWithMode: {
    (mode: 1 | 3, tags: Tag[]): Promise<void>;
    (mode: 2, tags: Tag[]): Promise<void>;
    (
      mode: 1 | 2 | 3,
      tags: Tag[],
      options?: { difficulty?: number; layers?: number }
    ): Promise<void>;
  };
  generateQuickSpark: (tags: Tag[], difficulty?: number) => Promise<void>;
  generateDeepDive: (
    tags: Tag[],
    layers?: number,
    difficulty?: number
  ) => Promise<void>;
  generateThreadSpark: (tags: Tag[], difficulty?: number) => Promise<void>;
  generateThreadSparkFromCluster: (
    clusterId: string,
    difficulty?: number
  ) => Promise<void>;

  loadRecentSparks: (limit?: number) => Promise<void>;
  loadSavedSparks: () => Promise<void>;
  loadSparkById: (id: string) => Promise<void>;
  markAsViewed: (id: string) => Promise<void>;
  toggleSaved: (id: string) => Promise<void>;
  clearCurrentSpark: () => void;
  setError: (error: string | null) => void;
}

export const useSparkStore = create<SparkState>((set, get) => ({
  currentSpark: null,
  recentSparks: [],
  savedSparks: [],
  isGenerating: false,
  error: null,

  generateQuickSpark: async (tags: Tag[], difficulty = 0.5) => {
    set({ isGenerating: true, error: null });
    try {
      const spark = await sparkGenerator.generateQuickSpark(tags, difficulty);
      await conceptGraphEngine.processSparkConcepts(spark.id, spark.text);
      set({ currentSpark: spark });
      await get().loadRecentSparks();

      await notificationService.cancelScheduledReminder();
    } catch (error: any) {
      set({ error: error.message });
      console.error("[SparkStore] Generate quick spark failed:", error);
    } finally {
      set({ isGenerating: false });
    }
  },

  generateDeepDive: async (tags: Tag[], layers = 4, difficulty = 0.5) => {
    set({ isGenerating: true, error: null });
    try {
      const spark = await sparkGenerator.generateDeepDive(tags, layers, difficulty);
      await conceptGraphEngine.processSparkConcepts(spark.id, spark.text);
      set({ currentSpark: spark });
      await get().loadRecentSparks();

      await notificationService.cancelScheduledReminder();
    } catch (error: any) {
      set({ error: error.message });
      console.error("[SparkStore] Generate deep dive failed:", error);
    } finally {
      set({ isGenerating: false });
    }
  },

  generateThreadSpark: async (tags: Tag[], difficulty = 0.5) => {
    set({ isGenerating: true, error: null });
    try {
      const { useThreadStore } = await import("./threadStore");
      const { clusters } = useThreadStore.getState();
      const recentSparks = await sparkGenerator.getRecentSparks(10);

      const spark = await sparkGenerator.generateThreadSpark(
        tags,
        clusters,
        recentSparks,
        difficulty
      );

      await conceptGraphEngine.processSparkConcepts(spark.id, spark.text);
      set({ currentSpark: spark });
      await get().loadRecentSparks();

      const threadStore = useThreadStore.getState();
      await threadStore.refreshGraph();

      await notificationService.cancelScheduledReminder();
    } catch (error: any) {
      set({ error: error.message });
      console.error("[SparkStore] Generate thread spark failed:", error);
    } finally {
      set({ isGenerating: false });
    }
  },

  generateThreadSparkFromCluster: async (clusterId: string, difficulty = 0.5) => {
    set({ isGenerating: true, error: null });
    try {
      const spark = await sparkGenerator.generateThreadSparkFromCluster(
        clusterId,
        difficulty
      );

      await conceptGraphEngine.processSparkConcepts(spark.id, spark.text);
      set({ currentSpark: spark });
      await get().loadRecentSparks();

      const { useThreadStore } = await import("./threadStore");
      const threadStore = useThreadStore.getState();
      await threadStore.refreshGraph();
      await threadStore.detectClusters();

      await notificationService.cancelScheduledReminder();
    } catch (error: any) {
      set({ error: error.message });
      console.error(
        "[SparkStore] Generate thread spark from cluster failed:",
        error
      );
    } finally {
      set({ isGenerating: false });
    }
  },

  loadRecentSparks: async (limit = 20) => {
    try {
      const sparks = await sparkGenerator.getRecentSparks(limit);
      set({ recentSparks: sparks });
    } catch (error: any) {
      console.error("[SparkStore] Load recent sparks failed:", error);
    }
  },

  loadSavedSparks: async () => {
    try {
      const allSparks = await sparkGenerator.getAllSparks();
      const saved = allSparks.filter((s) => s.saved);
      set({ savedSparks: saved });
    } catch (error: any) {
      console.error("[SparkStore] Load saved sparks failed:", error);
    }
  },

  loadSparkById: async (id: string) => {
    try {
      const spark = await sparkGenerator.getSparkById(id);
      if (spark) {
        set({ currentSpark: spark });
      }
    } catch (error: any) {
      console.error("[SparkStore] Load spark failed:", error);
    }
  },

  markAsViewed: async (id: string) => {
    try {
      await sparkGenerator.markSparkAsViewed(id);

      const current = get().currentSpark;
      if (current && current.id === id) {
        set({ currentSpark: { ...current, viewed: true } });
      }

      await get().loadRecentSparks();
    } catch (error: any) {
      console.error("[SparkStore] Mark as viewed failed:", error);
    }
  },

  toggleSaved: async (id: string) => {
    try {
      const newSavedState = await sparkGenerator.toggleSparkSaved(id);

      const current = get().currentSpark;
      if (current && current.id === id) {
        set({ currentSpark: { ...current, saved: newSavedState } });
      }

      await get().loadRecentSparks();
      await get().loadSavedSparks();
    } catch (error: any) {
      console.error("[SparkStore] Toggle saved failed:", error);
    }
  },

  clearCurrentSpark: () => {
    set({ currentSpark: null });
  },

  generateWithMode: async (
    mode: 1 | 2 | 3,
    tags: Tag[],
    options?: { difficulty?: number; layers?: number } | undefined
  ) => {
    set({ isGenerating: true, error: null });
    const difficulty = options?.difficulty ?? 0.5;
    const layers = options?.layers;

    try {
      switch (mode) {
        case 1:
          await get().generateQuickSpark(tags, difficulty);
          break;
        case 2:
          await get().generateDeepDive(tags, layers, difficulty);
          break;
        case 3:
          await get().generateThreadSpark(tags, difficulty);
          break;
        default:
          throw new Error(`Invalid mode: ${mode}`);
      }
    } catch (error: any) {
      set({ error: error.message });
      console.error("[SparkStore] Generate with mode failed:", error);
    } finally {
      set({ isGenerating: false });
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
