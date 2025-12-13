// src/hooks/useTagSelection.ts

import { useState, useEffect, useCallback } from "react";
import { Tag } from "@type/tag.types";
import { useTagStore } from "@stores/tagStore";

export const useTagSelection = (initialTags?: string[]) => {
  const {
    dailyTags,
    allTags,
    loadDailyTags,
    generateDailyTags,
    updateDailyTags,
    isLoading,
    error,
  } = useTagStore();

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialTags || []
  );
  const [shuffleCount, setShuffleCount] = useState(0);

  useEffect(() => {
    if (dailyTags.length === 0) {
      loadDailyTags();
    }
  }, []);

  useEffect(() => {
    if (initialTags) {
      setSelectedTagIds(initialTags);
    } else if (dailyTags && Array.isArray(dailyTags) && dailyTags.length > 0 && selectedTagIds.length === 0) {
      setSelectedTagIds(dailyTags.map((t) => t.id));
    }
  }, [dailyTags, initialTags]);

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      }
      return [...prev, tagId];
    });
  }, []);

  const replaceTag = useCallback((oldTagId: string, newTagId: string) => {
    setSelectedTagIds((prev) =>
      prev.map((id) => (id === oldTagId ? newTagId : id))
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedTagIds(dailyTags && Array.isArray(dailyTags) ? dailyTags.map((t) => t.id) : []);
  }, [dailyTags]);

  const clearAll = useCallback(() => {
    setSelectedTagIds([]);
  }, []);

  const shuffle = useCallback(async () => {
    if (shuffleCount >= 1) {
      return;
    }

    await generateDailyTags(true);
    setShuffleCount((prev) => prev + 1);
  }, [shuffleCount, generateDailyTags]);

  const accept = useCallback(async () => {
    if (selectedTagIds.length === 0) {
      return;
    }

    await updateDailyTags(selectedTagIds);
  }, [selectedTagIds, updateDailyTags]);

  const getSelectedTags = useCallback((): Tag[] => {
    return (allTags && Array.isArray(allTags) ? allTags : []).filter((tag) => selectedTagIds.includes(tag.id));
  }, [allTags, selectedTagIds]);

  const canShuffle = shuffleCount < 1;
  const hasSelection = selectedTagIds.length > 0;

  return {
    dailyTags,
    selectedTagIds,
    selectedTags: getSelectedTags(),
    isLoading,
    error,
    canShuffle,
    hasSelection,
    toggleTag,
    replaceTag,
    selectAll,
    clearAll,
    shuffle,
    accept,
  };
};
