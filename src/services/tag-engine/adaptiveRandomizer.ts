// src/services/tag-engine/adaptiveRandomizer.ts

import { Tag, TagSelectionStrategy } from "@type/tag.types";
import { TAG_SELECTION_CONFIG } from "@constants/defaultTags";
import tagRepository from "./tagRepository";
import {sqliteService} from "@services/storage/sqliteService";
import { safeJSONParse } from "@utils/jsonUtils";

class AdaptiveRandomizer {
  async selectDailyTags(
    count: number = TAG_SELECTION_CONFIG.TOTAL_TAGS_PER_DAY
  ): Promise<Tag[]> {
    const allTags = await tagRepository.getAllTags();

    if (allTags.length === 0) {
      throw new Error("No tags available");
    }

    const historyCount = Math.floor(
      count * TAG_SELECTION_CONFIG.HISTORY_WEIGHT
    );
    const wildcardCount = Math.floor(
      count * TAG_SELECTION_CONFIG.WILDCARD_WEIGHT
    );
    const deepDiveCount = Math.floor(
      count * TAG_SELECTION_CONFIG.DEEP_DIVE_WEIGHT
    );
    const randomCount = count - historyCount - wildcardCount - deepDiveCount;

    const selectedTags: Tag[] = [];
    const usedIds = new Set<string>();

    const historyTags = await this.selectFromHistory(
      historyCount,
      allTags,
      usedIds
    );
    selectedTags.push(...historyTags);
    historyTags.forEach((t) => usedIds.add(t.id));

    const wildcardTags = await this.selectWildcard(
      wildcardCount,
      allTags,
      usedIds
    );
    selectedTags.push(...wildcardTags);
    wildcardTags.forEach((t) => usedIds.add(t.id));

    const deepDiveTags = await this.selectFromDeepDive(
      deepDiveCount,
      allTags,
      usedIds
    );
    selectedTags.push(...deepDiveTags);
    deepDiveTags.forEach((t) => usedIds.add(t.id));

    const randomTags = await this.selectRandom(randomCount, allTags, usedIds);
    selectedTags.push(...randomTags);

    return this.shuffleArray(selectedTags);
  }

  private async selectFromHistory(
    count: number,
    allTags: Tag[],
    excludeIds: Set<string>
  ): Promise<Tag[]> {
    const now = Date.now();
    const lookbackTime =
      now - TAG_SELECTION_CONFIG.HISTORY_LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
    const avoidTime =
      now - TAG_SELECTION_CONFIG.AVOID_REPETITION_DAYS * 24 * 60 * 60 * 1000;

    const historyRows = await sqliteService.query<{
      tag_id: string;
      count: number;
    }>(
      `SELECT tag_id, COUNT(*) as count 
       FROM tag_history 
       WHERE used_at >= ? AND used_at < ?
       GROUP BY tag_id 
       ORDER BY count DESC`,
      [lookbackTime, avoidTime]
    );

    const eligibleTags = historyRows
      .map((row) => allTags.find((t) => t.id === row.tag_id))
      .filter((t): t is Tag => t !== undefined && !excludeIds.has(t.id));

    return this.selectTopN(eligibleTags, count);
  }

  private async selectWildcard(
    count: number,
    allTags: Tag[],
    excludeIds: Set<string>
  ): Promise<Tag[]> {
    const recentClusters = await this.getRecentClusters();

    const eligibleTags = allTags.filter(
      (tag) =>
        !excludeIds.has(tag.id) &&
        tag.cluster &&
        !recentClusters.includes(tag.cluster)
    );

    if (eligibleTags.length === 0) {
      return this.selectRandom(count, allTags, excludeIds);
    }

    const clusterGroups = this.groupByCluster(eligibleTags);
    const selectedClusters = this.shuffleArray(
      Object.keys(clusterGroups)
    ).slice(0, count);

    const selected: Tag[] = [];
    for (const cluster of selectedClusters) {
      const tagsInCluster = clusterGroups[cluster];
      const randomTag =
        tagsInCluster[Math.floor(Math.random() * tagsInCluster.length)];
      selected.push(randomTag);
    }

    return selected;
  }

  private async selectFromDeepDive(
    count: number,
    allTags: Tag[],
    excludeIds: Set<string>
  ): Promise<Tag[]> {
    const recentSparks = await sqliteService.query<{ tags: string }>(
      `SELECT tags FROM sparks WHERE mode = 2 ORDER BY created_at DESC LIMIT 10`
    );

    const deepDiveTagIds = new Set<string>();
    recentSparks.forEach((spark) => {
      const tagIds = safeJSONParse(spark.tags, []);
      tagIds.forEach((id: string) => deepDiveTagIds.add(id));
    });

    const eligibleTags = allTags.filter(
      (tag) => deepDiveTagIds.has(tag.id) && !excludeIds.has(tag.id)
    );

    if (eligibleTags.length === 0) {
      return this.selectRandom(count, allTags, excludeIds);
    }

    return this.selectTopN(eligibleTags, count);
  }

  private async selectRandom(
    count: number,
    allTags: Tag[],
    excludeIds: Set<string>
  ): Promise<Tag[]> {
    const eligibleTags = allTags.filter((tag) => !excludeIds.has(tag.id));

    if (eligibleTags.length === 0) {
      return [];
    }

    const shuffled = this.shuffleArray([...eligibleTags]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  private async getRecentClusters(): Promise<string[]> {
    const now = Date.now();
    const lookbackTime = now - 7 * 24 * 60 * 60 * 1000;

    const rows = await sqliteService.query<{ tag_id: string }>(
      `SELECT DISTINCT tag_id FROM tag_history WHERE used_at >= ?`,
      [lookbackTime]
    );

    const tagIds = rows.map((r) => r.tag_id);
    if (tagIds.length === 0) return [];

    const tags = await tagRepository.getTagsByIds(tagIds);
    const clusters = tags
      .map((t) => t.cluster)
      .filter((c): c is string => c !== null);

    return [...new Set(clusters)];
  }

  private groupByCluster(tags: Tag[]): Record<string, Tag[]> {
    const groups: Record<string, Tag[]> = {};

    tags.forEach((tag) => {
      if (!tag.cluster) return;
      if (!groups[tag.cluster]) {
        groups[tag.cluster] = [];
      }
      groups[tag.cluster].push(tag);
    });

    return groups;
  }

  private selectTopN(tags: Tag[], n: number): Tag[] {
    return tags.slice(0, Math.min(n, tags.length));
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async recordTagUsage(
    tagIds: string[],
    strategy: TagSelectionStrategy
  ): Promise<void> {
    const now = Date.now();

    for (const tagId of tagIds) {
      await sqliteService.insert("tag_history", {
        id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tag_id: tagId,
        used_at: now,
        strategy,
      });
    }
  }
}

export default new AdaptiveRandomizer();
