// src/stores/threadStore.ts - FIXED VERSION

import { create } from "zustand";
import { ConceptNode, ConceptLink, ConceptCluster } from "@type/thread.types";
import conceptGraphEngine from "@services/thread-engine/conceptGraph";
import clusterEngine from "@services/thread-engine/clusterEngine";

interface ThreadState {
  nodes: ConceptNode[];
  links: ConceptLink[];
  clusters: ConceptCluster[];
  selectedCluster: ConceptCluster | null;
  isLoading: boolean;
  error: string | null;

  stats: {
    totalConcepts: number;
    totalLinks: number;
    totalClusters: number;
  };

  loadGraph: () => Promise<void>;
  refreshGraph: () => Promise<void>;
  detectClusters: () => Promise<void>;
  loadStatsOnly: () => Promise<void>;
  selectCluster: (clusterId: string) => Promise<void>;
  deselectCluster: () => void;
  getMostConnected: (limit?: number) => Promise<ConceptNode[]>;
  resetGraph: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useThreadStore = create<ThreadState>((set, get) => ({
  nodes: [],
  links: [],
  clusters: [],
  selectedCluster: null,
  isLoading: false,
  error: null,
  stats: {
    totalConcepts: 0,
    totalLinks: 0,
    totalClusters: 0,
  },

  loadGraph: async () => {
    set({ isLoading: true, error: null });
    try {
      const [nodes, links, clusters] = await Promise.all([
        conceptGraphEngine.getAllConcepts(),
        conceptGraphEngine.getAllLinks(),
        clusterEngine.getAllClusters(),
      ]);

      // DEFENSIVE: Ensure all are arrays
      const safeNodes = Array.isArray(nodes) ? nodes : [];
      const safeLinks = Array.isArray(links) ? links : [];
      const safeClusters = Array.isArray(clusters) ? clusters : [];

      set({
        nodes: safeNodes,
        links: safeLinks,
        clusters: safeClusters,
        stats: {
          totalConcepts: safeNodes.length,
          totalLinks: safeLinks.length,
          totalClusters: safeClusters.length,
        },
      });
    } catch (error: any) {
      set({
        error: error.message,
        nodes: [],
        links: [],
        clusters: [],
        stats: {
          totalConcepts: 0,
          totalLinks: 0,
          totalClusters: 0,
        },
      });
      console.error("[ThreadStore] Load graph failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // New method to load lightweight stats only
  loadStatsOnly: async () => {
    set({ isLoading: true, error: null });
    try {
      // Get only the counts to improve initial loading performance
      const [nodeCount, linkCount, clusters] = await Promise.all([
        conceptGraphEngine.getConceptCount(),
        conceptGraphEngine.getLinkCount(),
        clusterEngine.getAllClusters(),
      ]);

      const safeClusters = Array.isArray(clusters) ? clusters : [];

      // Update with just the stats and clusters to make UI responsive quickly
      set({
        clusters: safeClusters,
        stats: {
          totalConcepts: nodeCount,
          totalLinks: linkCount,
          totalClusters: safeClusters.length,
        },
      });
    } catch (error: any) {
      set({ error: error.message });
      console.error("[ThreadStore] Load stats only failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshGraph: async () => {
    await get().loadGraph();
  },

  detectClusters: async () => {
    set({ isLoading: true, error: null });
    try {
      const clusters = await clusterEngine.detectClusters();
      const safeClusters = Array.isArray(clusters) ? clusters : [];

      const state = get();
      set({
        clusters: safeClusters,
        stats: {
          ...state.stats,
          totalClusters: safeClusters.length,
        },
      });
    } catch (error: any) {
      set({ error: error.message, clusters: [] });
      console.error("[ThreadStore] Detect clusters failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  selectCluster: async (clusterId: string) => {
    try {
      const cluster = await clusterEngine.getClusterById(clusterId);
      set({ selectedCluster: cluster });
    } catch (error: any) {
      console.error("[ThreadStore] Select cluster failed:", error);
      set({ selectedCluster: null });
    }
  },

  deselectCluster: () => {
    set({ selectedCluster: null });
  },

  getMostConnected: async (limit = 10) => {
    try {
      const results = await conceptGraphEngine.getMostConnectedConcepts(limit);
      return Array.isArray(results) ? results : [];
    } catch (error: any) {
      console.error("[ThreadStore] Get most connected failed:", error);
      return [];
    }
  },

  resetGraph: async () => {
    set({ isLoading: true, error: null });
    try {
      await conceptGraphEngine.resetGraph();
      set({
        nodes: [],
        links: [],
        clusters: [],
        selectedCluster: null,
        stats: {
          totalConcepts: 0,
          totalLinks: 0,
          totalClusters: 0,
        },
      });
    } catch (error: any) {
      set({ error: error.message });
      console.error("[ThreadStore] Reset graph failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
