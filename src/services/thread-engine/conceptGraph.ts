// src/services/thread-engine/conceptGraph.ts

import {
  ConceptNode,
  ConceptLink,
  ConceptExtractionResult,
} from "@type/thread.types";
import sqliteService from "@services/storage/sqliteService";
import llmClient from "@services/llm/llmClient";
import promptBuilder from "@services/llm/promptBuilder";
import responseValidator from "@services/llm/responseValidator";
import { v4 as uuidv4 } from "uuid";

class ConceptGraphEngine {
  async extractConceptsFromSpark(sparkText: string): Promise<string[]> {
    const { system, user } =
      promptBuilder.buildConceptExtractionPrompt(sparkText);

    try {
      const llmResponse = await llmClient.generateWithRetry({
        prompt: user,
        systemPrompt: system,
        temperature: 0.3,
        maxTokens: 200,
      });

      const sanitized = responseValidator.sanitizeResponse(llmResponse.content);
      const parsed = JSON.parse(sanitized);

      if (!Array.isArray(parsed.concepts)) {
        throw new Error("Invalid concept extraction response");
      }

      return parsed.concepts.filter((c: any) => typeof c === "string");
    } catch (error) {
      console.error("[ConceptGraph] Extraction failed:", error);
      return [];
    }
  }

  async addOrUpdateConcept(
    name: string,
    sparkId: string,
    cluster: string = "uncategorized"
  ): Promise<ConceptNode> {
    const existing = await this.getConceptByName(name);

    if (existing) {
      const sparkIds = [...existing.sparkIds, sparkId];
      const newWeight = Math.min(1.0, existing.weight + 0.1);

      await sqliteService.update(
        "concept_nodes",
        {
          spark_ids: JSON.stringify(sparkIds),
          weight: newWeight,
          last_updated: Date.now(),
        },
        "id = ?",
        [existing.id]
      );

      return {
        ...existing,
        sparkIds,
        weight: newWeight,
        lastUpdated: Date.now(),
      };
    }

    const newConcept: ConceptNode = {
      id: uuidv4(),
      name,
      cluster,
      weight: 0.5,
      sparkIds: [sparkId],
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    await sqliteService.insert("concept_nodes", {
      id: newConcept.id,
      name: newConcept.name,
      description: null,
      cluster: newConcept.cluster,
      weight: newConcept.weight,
      spark_ids: JSON.stringify(newConcept.sparkIds),
      created_at: newConcept.createdAt,
      last_updated: newConcept.lastUpdated,
    });

    return newConcept;
  }

  async createOrUpdateLink(
    conceptA: string,
    conceptB: string,
    sparkId: string,
    strengthIncrement: number = 0.1
  ): Promise<ConceptLink> {
    const [nodeA, nodeB] = await Promise.all([
      this.getConceptByName(conceptA),
      this.getConceptByName(conceptB),
    ]);

    if (!nodeA || !nodeB) {
      throw new Error("One or both concepts not found");
    }

    const [idA, idB] = [nodeA.id, nodeB.id].sort();

    const existing = await this.getLinkByConcepts(idA, idB);

    if (existing) {
      const sparkIds = [...existing.sparkIds, sparkId];
      const newStrength = Math.min(1.0, existing.strength + strengthIncrement);

      await sqliteService.update(
        "concept_links",
        {
          spark_ids: JSON.stringify(sparkIds),
          strength: newStrength,
          last_update: Date.now(),
        },
        "id = ?",
        [existing.id]
      );

      return {
        ...existing,
        sparkIds,
        strength: newStrength,
        lastUpdate: Date.now(),
      };
    }

    const newLink: ConceptLink = {
      id: uuidv4(),
      conceptA: idA,
      conceptB: idB,
      strength: 0.3,
      linkType: "semantic",
      lastUpdate: Date.now(),
      sparkIds: [sparkId],
    };

    await sqliteService.insert("concept_links", {
      id: newLink.id,
      concept_a: newLink.conceptA,
      concept_b: newLink.conceptB,
      strength: newLink.strength,
      link_type: newLink.linkType,
      last_update: newLink.lastUpdate,
      spark_ids: JSON.stringify(newLink.sparkIds),
    });

    return newLink;
  }

  async processSparkConcepts(
    sparkId: string,
    sparkText: string
  ): Promise<void> {
    const concepts = await this.extractConceptsFromSpark(sparkText);

    if (concepts.length === 0) {
      console.log("[ConceptGraph] No concepts extracted");
      return;
    }

    const nodes = await Promise.all(
      concepts.map((concept) => this.addOrUpdateConcept(concept, sparkId))
    );

    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        await this.createOrUpdateLink(concepts[i], concepts[j], sparkId);
      }
    }

    console.log(
      `[ConceptGraph] Processed ${concepts.length} concepts, ${
        (concepts.length * (concepts.length - 1)) / 2
      } links`
    );
  }

  async getConceptByName(name: string): Promise<ConceptNode | null> {
    const rows = await sqliteService.query<any>(
      `SELECT * FROM concept_nodes WHERE LOWER(name) = LOWER(?) LIMIT 1`,
      [name]
    );

    if (rows.length === 0) return null;

    return this.mapRowToNode(rows[0]);
  }

  async getConceptById(id: string): Promise<ConceptNode | null> {
    const rows = await sqliteService.query<any>(
      `SELECT * FROM concept_nodes WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapRowToNode(rows[0]);
  }

  async getAllConcepts(): Promise<ConceptNode[]> {
    const rows = await sqliteService.query<any>(
      `SELECT * FROM concept_nodes ORDER BY weight DESC`
    );

    return rows.map(this.mapRowToNode);
  }

  async getLinkByConcepts(
    conceptA: string,
    conceptB: string
  ): Promise<ConceptLink | null> {
    const [idA, idB] = [conceptA, conceptB].sort();

    const rows = await sqliteService.query<any>(
      `SELECT * FROM concept_links WHERE concept_a = ? AND concept_b = ? LIMIT 1`,
      [idA, idB]
    );

    if (rows.length === 0) return null;

    return this.mapRowToLink(rows[0]);
  }

  async getLinksForConcept(conceptId: string): Promise<ConceptLink[]> {
    const rows = await sqliteService.query<any>(
      `SELECT * FROM concept_links WHERE concept_a = ? OR concept_b = ? ORDER BY strength DESC`,
      [conceptId, conceptId]
    );

    return rows.map(this.mapRowToLink);
  }

  async getAllLinks(): Promise<ConceptLink[]> {
    const rows = await sqliteService.query<any>(
      `SELECT * FROM concept_links ORDER BY strength DESC`
    );

    return rows.map(this.mapRowToLink);
  }

  async getStrongLinks(threshold: number = 0.5): Promise<ConceptLink[]> {
    const rows = await sqliteService.query<any>(
      `SELECT * FROM concept_links WHERE strength >= ? ORDER BY strength DESC`,
      [threshold]
    );

    return rows.map(this.mapRowToLink);
  }

  async getMostConnectedConcepts(limit: number = 10): Promise<ConceptNode[]> {
    const rows = await sqliteService.query<any>(
      `SELECT cn.*, COUNT(cl.id) as connection_count
       FROM concept_nodes cn
       LEFT JOIN concept_links cl ON cn.id = cl.concept_a OR cn.id = cl.concept_b
       GROUP BY cn.id
       ORDER BY connection_count DESC, cn.weight DESC
       LIMIT ?`,
      [limit]
    );

    return rows.map(this.mapRowToNode);
  }

  async deleteConcept(id: string): Promise<void> {
    await sqliteService.delete("concept_nodes", "id = ?", [id]);
    await sqliteService.delete(
      "concept_links",
      "concept_a = ? OR concept_b = ?",
      [id, id]
    );
  }

  async deleteLink(id: string): Promise<void> {
    await sqliteService.delete("concept_links", "id = ?", [id]);
  }

  async resetGraph(): Promise<void> {
    await sqliteService.execute("DELETE FROM concept_nodes");
    await sqliteService.execute("DELETE FROM concept_links");
    await sqliteService.execute("DELETE FROM concept_clusters");
    console.log("[ConceptGraph] Graph reset complete");
  }

  private mapRowToNode(row: any): ConceptNode {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      cluster: row.cluster,
      weight: row.weight,
      sparkIds: JSON.parse(row.spark_ids),
      createdAt: row.created_at,
      lastUpdated: row.last_updated,
    };
  }

  private mapRowToLink(row: any): ConceptLink {
    return {
      id: row.id,
      conceptA: row.concept_a,
      conceptB: row.concept_b,
      strength: row.strength,
      linkType: row.link_type,
      lastUpdate: row.last_update,
      sparkIds: JSON.parse(row.spark_ids),
    };
  }
}

export default new ConceptGraphEngine();
