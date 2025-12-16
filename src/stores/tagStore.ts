// src/stores/tagStore.ts - UPDATED

import { create } from "zustand";
import { Tag, DailyTagSelection } from "@type/tag.types";
import tagEngine from "@services/tag-engine/tagEngine";
import tagRepository from "@/services/tag-engine/tagRepository";

interface TagState {
  allTags: Tag[];
  dailyTags: Tag[];
  dailySelection: DailyTagSelection | null;
  selectedTags: string[];
  selectedTagForGenerate: string | null; // NEW: Single tag selection
  isLoading: boolean;
  error: string | null;

  initializeTags: () => Promise<void>;
  loadAllTags: () => Promise<void>;
  loadDailyTags: () => Promise<void>;
  generateDailyTags: (force?: boolean) => Promise<void>;
  updateDailyTags: (tagIds: string[]) => Promise<void>;

  // NEW: Tag replacement
  replaceDailyTag: (oldTagId: string, newTagId: string) => Promise<void>;

  // Selection methods
  selectTag: (tagId: string) => void;
  deselectTag: (tagId: string) => void;
  clearSelection: () => void;

  // NEW: Single tag selection for generate
  selectTagForGenerate: (tagId: string | null) => void;

  searchTags: (query: string) => Promise<Tag[]>;
  createCustomTag: (name: string, cluster?: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  refreshTags: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useTagStore = create<TagState>((set, get) => ({
  allTags: [],
  dailyTags: [],
  dailySelection: null,
  selectedTags: [],
  selectedTagForGenerate: null,
  isLoading: false,
  error: null,

  initializeTags: async () => {
    set({ isLoading: true, error: null });
    try {
      const { getDefaultTagsWithIds } = await import("@constants/defaultTags");
      const defaultTags = getDefaultTagsWithIds();
      await tagEngine.initializeDefaultTags(defaultTags);
      await get().loadAllTags();
    } catch (error: any) {
      set({ error: error.message });
      console.error("[TagStore] Initialize failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadAllTags: async () => {
    set({ isLoading: true, error: null });
    try {
      const tags = await tagEngine.getAllTags();
      set({ allTags: Array.isArray(tags) ? tags : [] });
    } catch (error: any) {
      set({ error: error.message, allTags: [] });
      console.error("[TagStore] Load all tags failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadDailyTags: async () => {
    set({ isLoading: true, error: null });
    try {
      const selection = await tagEngine.getDailyTags();
      if (selection) {
        const tags = await tagRepository.getTagsByIds(selection.tags);
        set({
          dailyTags: Array.isArray(tags) ? tags : [],
          dailySelection: selection,
        });
      } else {
        await get().generateDailyTags();
      }
    } catch (error: any) {
      set({ error: error.message, dailyTags: [] });
      console.error("[TagStore] Load daily tags failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  generateDailyTags: async (force = false) => {
    set({ isLoading: true, error: null });
    try {
      const selection = await tagEngine.generateDailyTags(force);
      const tags = await tagRepository.getTagsByIds(selection.tags);
      set({
        dailyTags: Array.isArray(tags) ? tags : [],
        dailySelection: selection,
        selectedTagForGenerate: null, // Reset selection when regenerating
      });
    } catch (error: any) {
      set({ error: error.message, dailyTags: [] });
      console.error("[TagStore] Generate daily tags failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateDailyTags: async (tagIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const safeTagIds = Array.isArray(tagIds) ? tagIds : [];
      const selection = await tagEngine.updateDailyTags(safeTagIds);
      const tags = await tagRepository.getTagsByIds(selection.tags);
      set({
        dailyTags: Array.isArray(tags) ? tags : [],
        dailySelection: selection,
      });
    } catch (error: any) {
      set({ error: error.message });
      console.error("[TagStore] Update daily tags failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // NEW: Replace a daily tag
  replaceDailyTag: async (oldTagId: string, newTagId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { dailySelection } = get();
      if (!dailySelection) {
        throw new Error("No daily selection available");
      }

      // Replace in the tags array
      const updatedTagIds = dailySelection.tags.map((id) =>
        id === oldTagId ? newTagId : id
      );

      // Update daily selection
      await get().updateDailyTags(updatedTagIds);

      // If the replaced tag was selected for generate, reset selection
      if (get().selectedTagForGenerate === oldTagId) {
        set({ selectedTagForGenerate: null });
      }

      console.log(`[TagStore] Replaced tag ${oldTagId} with ${newTagId}`);
    } catch (error: any) {
      set({ error: error.message });
      console.error("[TagStore] Replace daily tag failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  selectTag: (tagId: string) => {
    set((state) => {
      const currentSelected = Array.isArray(state.selectedTags)
        ? state.selectedTags
        : [];
      if (currentSelected.includes(tagId)) {
        return state;
      }
      return { selectedTags: [...currentSelected, tagId] };
    });
  },

  deselectTag: (tagId: string) => {
    set((state) => {
      const currentSelected = Array.isArray(state.selectedTags)
        ? state.selectedTags
        : [];
      return {
        selectedTags: currentSelected.filter((id) => id !== tagId),
      };
    });
  },

  clearSelection: () => {
    set({ selectedTags: [] });
  },

  // NEW: Select single tag for generate
  selectTagForGenerate: (tagId: string | null) => {
    set({ selectedTagForGenerate: tagId });
    console.log(
      `[TagStore] Selected tag for generate: ${tagId || "none (use all)"}`
    );
  },

  searchTags: async (query: string) => {
    try {
      const results = await tagEngine.searchTags(query);
      return Array.isArray(results) ? results : [];
    } catch (error: any) {
      console.error("[TagStore] Search failed:", error);
      return [];
    }
  },

  createCustomTag: async (name: string, cluster?: string) => {
    set({ isLoading: true, error: null });
    try {
      await tagEngine.createCustomTag(name, cluster);
      await get().loadAllTags();
    } catch (error: any) {
      set({ error: error.message });
      console.error("[TagStore] Create tag failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTag: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await tagEngine.deleteTag(id);
      await get().loadAllTags();
    } catch (error: any) {
      set({ error: error.message });
      console.error("[TagStore] Delete tag failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshTags: async () => {
    await get().loadAllTags();
    await get().loadDailyTags();
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
