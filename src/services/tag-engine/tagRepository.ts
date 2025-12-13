// src/services/tag-engine/tagRepository.ts

import { sqliteService } from "@services/storage/sqliteService";
import {
  Tag,
  CreateTagInput,
  UpdateTagInput,
  TagStatistics,
} from "@type/tag.types";
import { v4 as uuidv4 } from "uuid";

class TagRepository {
  async getAllTags(): Promise<Tag[]> {
    const rows = await sqliteService.query<Tag>(
      `SELECT * FROM tags ORDER BY name ASC`
    );

    // FIX: Cek apakah rows benar-benar array sebelum .map
    if (!Array.isArray(rows)) {
      console.warn("[TagRepository] getAllTags returned non-array:", rows);
      return [];
    }

    return rows.map(this.mapRowToTag);
  }

  async getDefaultTags(): Promise<Tag[]> {
    const rows = await sqliteService.query<Tag>(
      `SELECT * FROM tags WHERE is_default = 1 ORDER BY name ASC`
    );

    if (!Array.isArray(rows)) return []; // FIX

    return rows.map(this.mapRowToTag);
  }

  async getTagsByIds(ids: string[]): Promise<Tag[]> {
    if (ids.length === 0) return [];

    const placeholders = ids.map(() => "?").join(",");
    const rows = await sqliteService.query<Tag>(
      `SELECT * FROM tags WHERE id IN (${placeholders})`,
      ids
    );

    if (!Array.isArray(rows)) return []; // FIX
    return rows.map(this.mapRowToTag);
  }

  async getTagsByCluster(cluster: string): Promise<Tag[]> {
    const rows = await sqliteService.query<Tag>(
      `SELECT * FROM tags WHERE cluster = ? ORDER BY usage_count DESC`,
      [cluster]
    );
    if (!Array.isArray(rows)) return []; // FIX

    return rows.map(this.mapRowToTag);
  }

  async getTagById(id: string): Promise<Tag | null> {
    const rows = await sqliteService.query<Tag>(
      `SELECT * FROM tags WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!Array.isArray(rows)) return null; // FIX

    return rows.length > 0 ? this.mapRowToTag(rows[0]) : null;
  }

  async createTag(input: CreateTagInput): Promise<Tag> {
    const id = uuidv4();
    const now = Date.now();

    await sqliteService.insert("tags", {
      id,
      name: input.name,
      cluster: input.cluster || null,
      usage_count: 0,
      last_used: null,
      is_default: input.isDefault ? 1 : 0,
      created_at: now,
    });

    const tag = await this.getTagById(id);
    if (!tag) throw new Error("Failed to create tag");

    return tag;
  }

  async updateTag(input: UpdateTagInput): Promise<Tag> {
    const updates: Record<string, any> = {};

    if (input.name !== undefined) updates.name = input.name;
    if (input.cluster !== undefined) updates.cluster = input.cluster;

    if (Object.keys(updates).length === 0) {
      const tag = await this.getTagById(input.id);
      if (!tag) throw new Error("Tag not found");
      return tag;
    }

    await sqliteService.update("tags", updates, "id = ?", [input.id]);

    const tag = await this.getTagById(input.id);
    if (!tag) throw new Error("Tag not found");

    return tag;
  }

  async deleteTag(id: string): Promise<boolean> {
    const rowsAffected = await sqliteService.delete("tags", "id = ?", [id]);
    return rowsAffected > 0;
  }

  async incrementUsageCount(id: string): Promise<void> {
    const now = Date.now();

    await sqliteService.execute(
      `UPDATE tags SET usage_count = usage_count + 1, last_used = ? WHERE id = ?`,
      [now, id]
    );
  }

  async incrementUsageCountBatch(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    const now = Date.now();
    const placeholders = ids.map(() => "?").join(",");

    await sqliteService.execute(
      `UPDATE tags SET usage_count = usage_count + 1, last_used = ? WHERE id IN (${placeholders})`,
      [now, ...ids]
    );
  }

  async getMostUsedTags(limit: number = 10): Promise<Tag[]> {
    const rows = await sqliteService.query<Tag>(
      `SELECT * FROM tags ORDER BY usage_count DESC LIMIT ?`,
      [limit]
    );

    if (!Array.isArray(rows)) return []; // FIX
    return rows.map(this.mapRowToTag);
  }

  async getRecentlyUsedTags(limit: number = 10): Promise<Tag[]> {
    const rows = await sqliteService.query<Tag>(
      `SELECT * FROM tags WHERE last_used IS NOT NULL ORDER BY last_used DESC LIMIT ?`,
      [limit]
    );

    return rows.map(this.mapRowToTag);
  }

  async getUnusedTags(): Promise<Tag[]> {
    const rows = await sqliteService.query<Tag>(
      `SELECT * FROM tags WHERE usage_count = 0 ORDER BY name ASC`
    );

    return rows.map(this.mapRowToTag);
  }

  async getTagsByUsageRange(
    minUsage: number,
    maxUsage: number
  ): Promise<Tag[]> {
    const rows = await sqliteService.query<Tag>(
      `SELECT * FROM tags WHERE usage_count >= ? AND usage_count <= ? ORDER BY usage_count DESC`,
      [minUsage, maxUsage]
    );

    return rows.map(this.mapRowToTag);
  }

  async searchTags(query: string): Promise<Tag[]> {
    const searchTerm = `%${query.toLowerCase()}%`;

    const rows = await sqliteService.query<Tag>(
      `SELECT * FROM tags WHERE LOWER(name) LIKE ? OR LOWER(cluster) LIKE ? ORDER BY usage_count DESC`,
      [searchTerm, searchTerm]
    );

    return rows.map(this.mapRowToTag);
  }

  async getTagStatistics(tagId: string): Promise<TagStatistics | null> {
    const tag = await this.getTagById(tagId);
    if (!tag) return null;

    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const usageByWeek: number[] = [];

    for (let i = 0; i < 4; i++) {
      const weekStart = now - (i + 1) * oneWeek;
      const weekEnd = now - i * oneWeek;

      const result = await sqliteService.query<{ count: number }>(
        `SELECT COUNT(*) as count FROM tag_history 
         WHERE tag_id = ? AND used_at >= ? AND used_at < ?`,
        [tagId, weekStart, weekEnd]
      );

      usageByWeek.unshift(result[0]?.count || 0);
    }

    return {
      tagId: tag.id,
      tagName: tag.name,
      totalUsage: tag.usageCount,
      lastUsed: tag.lastUsed,
      usageByWeek,
      clusterAssignment: tag.cluster,
    };
  }

  async getClusterDistribution(): Promise<Record<string, number>> {
    const rows = await sqliteService.query<{ cluster: string; count: number }>(
      `SELECT cluster, COUNT(*) as count FROM tags 
       WHERE cluster IS NOT NULL 
       GROUP BY cluster 
       ORDER BY count DESC`
    );

    const distribution: Record<string, number> = {};
    rows.forEach((row) => {
      distribution[row.cluster] = row.count;
    });

    return distribution;
  }

  async bulkCreateTags(tags: CreateTagInput[]): Promise<Tag[]> {
    const createdTags: Tag[] = [];

    for (const tagInput of tags) {
      const tag = await this.createTag(tagInput);
      createdTags.push(tag);
    }

    return createdTags;
  }

  async resetAllUsageCounts(): Promise<void> {
    await sqliteService.execute(
      `UPDATE tags SET usage_count = 0, last_used = NULL`
    );
  }

  async getTagCount(): Promise<number> {
    const result = await sqliteService.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM tags`
    );

    return result[0]?.count || 0;
  }

  private mapRowToTag(row: any): Tag {
    return {
      id: row.id,
      name: row.name,
      cluster: row.cluster,
      usageCount: row.usage_count,
      lastUsed: row.last_used,
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
    };
  }
}

export default new TagRepository();
