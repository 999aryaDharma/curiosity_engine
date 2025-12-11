import llmClient from "@services/llm/llmClient";
import promptBuilder from "@services/llm/promptBuilder";
import responseValidator from "@services/llm/responseValidator";
import {
  Spark,
  SparkMode,
  QuickSparkResponse,
  DeepDiveResponse,
  ThreadSparkResponse,
  SparkLayer,
} from "@type/spark.types";
import { Tag } from "@type/tag.types";
import { ConceptCluster } from "@type/thread.types";
import sqliteService from "@services/storage/sqliteService";
import { v4 as uuidv4 } from "uuid";
import { LLM_CONFIG } from "@constants/config";
import { safeJSONParse, safeJSONStringify } from "@utils/jsonUtils";

class SparkGenerator {
  async generateQuickSpark(tags: Tag[], chaos: number = 0.5): Promise<Spark> {
    const { system, user } = promptBuilder.buildQuickSparkPrompt(tags, chaos);

    const startTime = Date.now();
    const llmResponse = await llmClient.generateWithRetry({
      prompt: user,
      systemPrompt: system,
      temperature: 0.7 + chaos * 0.2,
      maxTokens: 500,
    });
    const duration = Date.now() - startTime;

    console.log(`[SparkGenerator] Quick spark generated in ${duration}ms`);

    const sanitized = responseValidator.sanitizeResponse(llmResponse.content);
    const validation = responseValidator.validateQuickSpark(sanitized);

    if (!validation.isValid) {
      console.error("[SparkGenerator] Validation failed:", validation.errors);
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const data = validation.data as QuickSparkResponse;

    const spark: Spark = {
      id: uuidv4(),
      text: data.spark,
      tags: tags.map((t) => t.id),
      mode: 1,
      followUp: data.followUp,
      conceptLinks: data.conceptLinks,
      createdAt: Date.now(),
      viewed: false,
      saved: false,
    };

    await this.saveSpark(spark);

    return spark;
  }

  async generateDeepDive(
    tags: Tag[],
    layers: number = 4,
    chaos: number = 0.5
  ): Promise<Spark> {
    const { system, user } = promptBuilder.buildDeepDivePrompt(
      tags,
      chaos,
      layers
    );

    const startTime = Date.now();
    const llmResponse = await llmClient.generateWithRetry({
      prompt: user,
      systemPrompt: system,
      temperature: 0.7 + chaos * 0.2,
      maxTokens: 1000,
    });
    const duration = Date.now() - startTime;

    console.log(`[SparkGenerator] Deep dive generated in ${duration}ms`);

    const sanitized = responseValidator.sanitizeResponse(llmResponse.content);
    const validation = responseValidator.validateDeepDive(sanitized);

    if (!validation.isValid) {
      console.error("[SparkGenerator] Validation failed:", validation.errors);
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const data = validation.data as DeepDiveResponse;

    const sparkLayers: SparkLayer[] = data.layers.map((layer) => ({
      layer: layer.layer,
      spark: layer.spark,
      branches: layer.branches.map((branchText, idx) => ({
        id: `branch_${layer.layer}_${idx}`,
        text: branchText,
      })),
    }));

    const spark: Spark = {
      id: uuidv4(),
      text: data.layers[0].spark,
      tags: tags.map((t) => t.id),
      mode: 2,
      layers: sparkLayers,
      conceptLinks: [],
      createdAt: Date.now(),
      viewed: false,
      saved: false,
    };

    await this.saveSpark(spark);

    return spark;
  }

  async generateThreadSpark(
    tags: Tag[],
    clusters: ConceptCluster[],
    recentSparks: Spark[],
    chaos: number = 0.5
  ): Promise<Spark> {
    const { system, user } = promptBuilder.buildThreadSparkPrompt(
      tags,
      clusters,
      recentSparks,
      chaos
    );

    const startTime = Date.now();
    const llmResponse = await llmClient.generateWithRetry({
      prompt: user,
      systemPrompt: system,
      temperature: 0.7 + chaos * 0.2,
      maxTokens: 600,
    });
    const duration = Date.now() - startTime;

    console.log(`[SparkGenerator] Thread spark generated in ${duration}ms`);

    const sanitized = responseValidator.sanitizeResponse(llmResponse.content);
    const validation = responseValidator.validateThreadSpark(sanitized);

    if (!validation.isValid) {
      console.error("[SparkGenerator] Validation failed:", validation.errors);
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const data = validation.data as ThreadSparkResponse;

    const spark: Spark = {
      id: uuidv4(),
      text: data.newSpark,
      tags: tags.map((t) => t.id),
      mode: 3,
      conceptLinks: data.conceptReinforcement,
      createdAt: Date.now(),
      viewed: false,
      saved: false,
    };

    await this.saveSpark(spark);

    return spark;
  }

  async generateByMode(
    mode: SparkMode,
    tags: Tag[],
    options?: {
      layers?: number;
      clusters?: ConceptCluster[];
      recentSparks?: Spark[];
      chaos?: number;
    }
  ): Promise<Spark> {
    const chaos = options?.chaos ?? 0.5;

    switch (mode) {
      case 1:
        return await this.generateQuickSpark(tags, chaos);

      case 2:
        return await this.generateDeepDive(tags, options?.layers || 4, chaos);

      case 3:
        return await this.generateThreadSpark(
          tags,
          options?.clusters || [],
          options?.recentSparks || [],
          chaos
        );

      default:
        throw new Error(`Invalid spark mode: ${mode}`);
    }
  }

  private async saveSpark(spark: Spark): Promise<void> {
    await sqliteService.insert("sparks", {
      id: spark.id,
      text: spark.text,
      tags: safeJSONStringify(spark.tags, "[]"),
      mode: spark.mode,
      layers: spark.layers ? safeJSONStringify(spark.layers, "null") : null,
      concept_links: safeJSONStringify(spark.conceptLinks, "[]"),
      follow_up: spark.followUp || null,
      created_at: spark.createdAt,
      viewed: spark.viewed ? 1 : 0,
      saved: spark.saved ? 1 : 0,
    });

    console.log(`[SparkGenerator] Spark saved: ${spark.id}`);
  }

  async getSparkById(id: string): Promise<Spark | null> {
    const rows = await sqliteService.query<any>(
      `SELECT * FROM sparks WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapRowToSpark(rows[0]);
  }

  async getAllSparks(): Promise<Spark[]> {
    const rows = await sqliteService.query<any>(
      `SELECT * FROM sparks ORDER BY created_at DESC`
    );

    return rows.map((row) => this.mapRowToSpark(row));
  }

  async getRecentSparks(limit: number = 20): Promise<Spark[]> {
    const rows = await sqliteService.query<any>(
      `SELECT * FROM sparks ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );

    return rows.map((row) => this.mapRowToSpark(row));
  }

  async getSparksByMode(mode: SparkMode): Promise<Spark[]> {
    const rows = await sqliteService.query<any>(
      `SELECT * FROM sparks WHERE mode = ? ORDER BY created_at DESC`,
      [mode]
    );

    return rows.map((row) => this.mapRowToSpark(row));
  }

  async markSparkAsViewed(id: string): Promise<void> {
    await sqliteService.update("sparks", { viewed: 1 }, "id = ?", [id]);
  }

  async toggleSparkSaved(id: string): Promise<boolean> {
    const spark = await this.getSparkById(id);
    if (!spark) throw new Error("Spark not found");

    const newSavedState = !spark.saved;
    await sqliteService.update(
      "sparks",
      { saved: newSavedState ? 1 : 0 },
      "id = ?",
      [id]
    );

    return newSavedState;
  }

  private mapRowToSpark(row: any): Spark {
    return {
      id: row.id,
      text: row.text,
      tags: safeJSONParse(row.tags, []),
      mode: row.mode,
      layers: row.layers ? safeJSONParse(row.layers, undefined) : undefined,
      conceptLinks: safeJSONParse(row.concept_links, []),
      followUp: row.follow_up,
      createdAt: row.created_at,
      viewed: Boolean(row.viewed),
      saved: Boolean(row.saved),
    };
  }
}

export default new SparkGenerator();
