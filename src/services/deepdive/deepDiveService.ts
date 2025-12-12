// src/services/deepdive/deepDiveService.ts

import llmClient from "@services/llm/llmClient";
import promptBuilder from "@services/llm/promptBuilder";
import responseValidator from "@services/llm/responseValidator";
import {sqliteService} from "@services/storage/sqliteService";
import {
  DeepDiveSession,
  DeepDiveLayer,
  DeepDiveSynthesis,
  DeepDiveLayerResponse,
  DeepDiveSynthesisResponse,
} from "@type/deepdive.types";
import { safeJSONParse, safeJSONStringify } from "@utils/jsonUtils";
import { v4 as uuidv4 } from "uuid";

class DeepDiveService {
  async createSession(
    seedSparkId: string,
    seedSparkText: string,
    maxLayers: number = 4
  ): Promise<DeepDiveSession> {
    const session: DeepDiveSession = {
      id: uuidv4(),
      seedSparkId,
      seedSparkText,
      layers: [],
      currentLayer: 0,
      maxLayers,
      isComplete: false,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    await this.saveSession(session);
    return session;
  }

  async generateNextLayer(
    sessionId: string,
    chaos: number = 0.5
  ): Promise<DeepDiveLayer> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    if (session.currentLayer >= session.maxLayers) {
      throw new Error("Max layers reached");
    }

    const nextLayerNumber = session.currentLayer + 1;

    const { system, user } = promptBuilder.buildDeepDiveLayerPrompt(
      session.seedSparkText,
      nextLayerNumber,
      session.layers,
      chaos
    );

    const llmResponse = await llmClient.generateWithRetry({
      prompt: user,
      systemPrompt: system,
      temperature: 0.7 + chaos * 0.2,
      maxTokens: 800,
    });

    const sanitized = responseValidator.sanitizeResponse(llmResponse.content);
    const validation = responseValidator.validateDeepDiveLayer(sanitized);

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const data = validation.data as DeepDiveLayerResponse;

    const layer: DeepDiveLayer = {
      layer: nextLayerNumber,
      explanation: data.explanation,
      questions: data.questions,
      analogy: data.analogy,
      observation: data.observation,
      createdAt: Date.now(),
    };

    session.layers.push(layer);
    session.currentLayer = nextLayerNumber;
    session.lastUpdated = Date.now();

    await this.updateSession(session);

    return layer;
  }

  async generateSynthesis(sessionId: string): Promise<DeepDiveSynthesis> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    if (session.layers.length === 0) {
      throw new Error("No layers to synthesize");
    }

    const { system, user } = promptBuilder.buildDeepDiveSynthesisPrompt(
      session.seedSparkText,
      session.layers
    );

    const llmResponse = await llmClient.generateWithRetry({
      prompt: user,
      systemPrompt: system,
      temperature: 0.7,
      maxTokens: 600,
    });

    const sanitized = responseValidator.sanitizeResponse(llmResponse.content);
    const validation = responseValidator.validateDeepDiveSynthesis(sanitized);

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const data = validation.data as DeepDiveSynthesisResponse;

    const synthesis: DeepDiveSynthesis = {
      summary: data.summary,
      bigIdea: data.bigIdea,
      nextSteps: data.nextSteps,
      threadLink: data.clusterConnection,
    };

    session.synthesis = synthesis;
    session.isComplete = true;
    session.lastUpdated = Date.now();

    await this.updateSession(session);

    return synthesis;
  }

  async branchFromLayer(
    sessionId: string,
    layerNumber: number,
    questionIndex: number
  ): Promise<DeepDiveSession> {
    const originalSession = await this.getSession(sessionId);
    if (!originalSession) throw new Error("Session not found");

    const layer = originalSession.layers.find((l) => l.layer === layerNumber);
    if (!layer) throw new Error("Layer not found");

    const question = layer.questions[questionIndex];
    if (!question) throw new Error("Question not found");

    const newSession = await this.createSession(
      originalSession.seedSparkId,
      question,
      originalSession.maxLayers
    );

    return newSession;
  }

  private async saveSession(session: DeepDiveSession): Promise<void> {
    await sqliteService.execute(
      `INSERT OR REPLACE INTO deepdive_sessions 
       (id, seed_spark_id, seed_spark_text, layers, synthesis, current_layer, max_layers, is_complete, created_at, last_updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.id,
        session.seedSparkId,
        session.seedSparkText,
        safeJSONStringify(session.layers, "[]"),
        session.synthesis ? safeJSONStringify(session.synthesis, "null") : null,
        session.currentLayer,
        session.maxLayers,
        session.isComplete ? 1 : 0,
        session.createdAt,
        session.lastUpdated,
      ]
    );
  }

  private async updateSession(session: DeepDiveSession): Promise<void> {
    await this.saveSession(session);
  }

  async getSession(id: string): Promise<DeepDiveSession | null> {
    const rows = await sqliteService.query<any>(
      `SELECT * FROM deepdive_sessions WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      seedSparkId: row.seed_spark_id,
      seedSparkText: row.seed_spark_text,
      layers: safeJSONParse(row.layers, []),
      synthesis: row.synthesis
        ? safeJSONParse(row.synthesis, undefined)
        : undefined,
      currentLayer: row.current_layer,
      maxLayers: row.max_layers,
      isComplete: Boolean(row.is_complete),
      createdAt: row.created_at,
      lastUpdated: row.last_updated,
    };
  }

  async getRecentSessions(limit: number = 10): Promise<DeepDiveSession[]> {
    const rows = await sqliteService.query<any>(
      `SELECT * FROM deepdive_sessions ORDER BY last_updated DESC LIMIT ?`,
      [limit]
    );

    return rows.map((row) => ({
      id: row.id,
      seedSparkId: row.seed_spark_id,
      seedSparkText: row.seed_spark_text,
      layers: safeJSONParse(row.layers, []),
      synthesis: row.synthesis
        ? safeJSONParse(row.synthesis, undefined)
        : undefined,
      currentLayer: row.current_layer,
      maxLayers: row.max_layers,
      isComplete: Boolean(row.is_complete),
      createdAt: row.created_at,
      lastUpdated: row.last_updated,
    }));
  }

  async deleteSession(id: string): Promise<void> {
    await sqliteService.execute(`DELETE FROM deepdive_sessions WHERE id = ?`, [
      id,
    ]);
  }
}

export default new DeepDiveService();
