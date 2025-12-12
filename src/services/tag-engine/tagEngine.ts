// src/services/tag-engine/tagEngine.ts

import { Tag, DailyTagSelection } from "@type/tag.types";
import tagRepository from "./tagRepository";
import adaptiveRandomizer from "./adaptiveRandomizer";
import { sqliteService } from "../storage/sqliteService";
import { safeJSONParse, safeJSONStringify } from "@utils/jsonUtils";
import { mmkvService } from "@services/storage/mmkvService";
import { v4 as uuidv4 } from "uuid";

class TagEngine {
  async initializeDefaultTags(tags: Tag[]): Promise<void> {
    const existingCount = await tagRepository.getTagCount();

    if (existingCount > 0) {
      console.log("[TagEngine] Tags already initialized");
      return;
    }

    console.log("[TagEngine] Initializing default tags...");
    await tagRepository.bulkCreateTags(
      tags.map((tag) => ({
        name: tag.name,
        cluster: tag.cluster || undefined,
        isDefault: tag.isDefault,
      }))
    );

    console.log(`[TagEngine] Initialized ${tags.length} default tags`);
  }

  async getDailyTags(): Promise<DailyTagSelection | null> {
    const today = this.getTodayString();

    const rows = await sqliteService.query<DailyTagSelection>(
      `SELECT * FROM daily_tag_selections WHERE date = ? LIMIT 1`,
      [today]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      date: row.date,
      tags: safeJSONParse(row.tags as unknown as string, []),
      isManuallyEdited: Boolean(row.isManuallyEdited),
      createdAt: row.createdAt,
    };
  }

  async generateDailyTags(force: boolean = false): Promise<DailyTagSelection> {
    const today = this.getTodayString();
    const existing = await this.getDailyTags();

    if (existing && !force) {
      console.log("[TagEngine] Daily tags already generated for today");
      return existing;
    }

    console.log("[TagEngine] Generating new daily tags...");
    const selectedTags = await adaptiveRandomizer.selectDailyTags();
    const tagIds = selectedTags.map((t) => t.id);

    await tagRepository.incrementUsageCountBatch(tagIds);

    if (existing) {
      await sqliteService.delete("daily_tag_selections", "date = ?", [today]);
    }

    const dailySelection: DailyTagSelection = {
      id: uuidv4(),
      date: today,
      tags: tagIds,
      isManuallyEdited: false,
      createdAt: Date.now(),
    };

    await sqliteService.insert("daily_tag_selections", {
      id: dailySelection.id,
      date: dailySelection.date,
      tags: safeJSONStringify(dailySelection.tags, "[]"),
      is_manually_edited: 0,
      created_at: dailySelection.createdAt,
    });

    await adaptiveRandomizer.recordTagUsage(tagIds, "history");

    console.log("[TagEngine] Daily tags generated:", tagIds);
    return dailySelection;
  }

  async updateDailyTags(tagIds: string[]): Promise<DailyTagSelection> {
    const today = this.getTodayString();
    const existing = await this.getDailyTags();

    if (!existing) {
      throw new Error("No daily tags to update");
    }

    await sqliteService.update(
      "daily_tag_selections",
      {
        tags: safeJSONStringify(tagIds, "[]"),
        is_manually_edited: 1,
      },
      "date = ?",
      [today]
    );

    return {
      ...existing,
      tags: tagIds,
      isManuallyEdited: true,
    };
  }

  async getTodaysTags(): Promise<Tag[]> {
    const dailySelection = await this.getDailyTags();

    if (!dailySelection) {
      const newSelection = await this.generateDailyTags();
      return await tagRepository.getTagsByIds(newSelection.tags);
    }

    return await tagRepository.getTagsByIds(dailySelection.tags);
  }

  async shouldRefreshDailyTags(): Promise<boolean> {
    const today = this.getTodayString();
    const existing = await this.getDailyTags();

    return !existing || existing.date !== today;
  }

  async getTagById(id: string): Promise<Tag | null> {
    return await tagRepository.getTagById(id);
  }

  async getAllTags(): Promise<Tag[]> {
    return await tagRepository.getAllTags();
  }

  async searchTags(query: string): Promise<Tag[]> {
    return await tagRepository.searchTags(query);
  }

  async getTagsByCluster(cluster: string): Promise<Tag[]> {
    return await tagRepository.getTagsByCluster(cluster);
  }

  async getMostUsedTags(limit: number = 10): Promise<Tag[]> {
    return await tagRepository.getMostUsedTags(limit);
  }

  async createCustomTag(name: string, cluster?: string): Promise<Tag> {
    return await tagRepository.createTag({
      name,
      cluster,
      isDefault: false,
    });
  }

  async deleteTag(id: string): Promise<boolean> {
    return await tagRepository.deleteTag(id);
  }

  async getClusterDistribution(): Promise<Record<string, number>> {
    return await tagRepository.getClusterDistribution();
  }

  async resetTagUsage(): Promise<void> {
    await tagRepository.resetAllUsageCounts();
    await sqliteService.execute(`DELETE FROM tag_history`);
    console.log("[TagEngine] All tag usage data reset");
  }

  private getTodayString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

export default new TagEngine();
