// src/stores/threadStore.ts

import { create } from "zustand";
import {
  ConceptNode,
  ConceptLink,
  ConceptCluster,
  ThreadGraph,
} from "@type/thread.types";
import conceptGraphEngine from "@services/thread-engine/conceptGraph";
import clusterEngine from "@services/thread-engine/clusterEngine";

interface ThreadState {
  nodes: ConceptNode[];
  links: ConceptLink[];
  clusters: ConceptCluster[];
  selectedCluster: ConceptCluster | null;
  isLoading: boolean;
  error: string | null;

  // Stats for thread graph
  stats: {
    totalConcepts: number;
    totalLinks: number;
    totalClusters: number;
  };

  loadGraph: () => Promise<void>;
  refreshGraph: () => Promise<void>;
  detectClusters: () => Promise<void>;
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

      set({
        nodes,
        links,
        clusters,
        stats: {
          totalConcepts: nodes.length,
          totalLinks: links.length,
          totalClusters: clusters.length,
        }
      });
    } catch (error: any) {
      set({ error: error.message });
      console.error("[ThreadStore] Load graph failed:", error);
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
      const state = get();
      set({
        clusters,
        stats: {
          ...state.stats,
          totalClusters: clusters.length,
          totalConcepts: state.nodes.length,
          totalLinks: state.links.length
        }
      });
    } catch (error: any) {
      set({ error: error.message });
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
    }
  },

  deselectCluster: () => {
    set({ selectedCluster: null });
  },

  getMostConnected: async (limit = 10) => {
    try {
      return await conceptGraphEngine.getMostConnectedConcepts(limit);
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
        }
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
