// src/services/llm/responseValidator.ts - KNOWLEDGE-BASED VALIDATION

import {
  QuickLearnResponse,
  DeepDiveResponse,
  KnowledgeGraphResponse,
  SparkValidationResult,
  SparkMode,
} from "@type/spark.types";
import { ThreadPackResponse } from "@type/thread.types";
import { APP_CONFIG } from "@constants/config";
import { safeJSONParse } from "@/utils/jsonUtils";

class ResponseValidator {
  validateQuickLearn(response: string): SparkValidationResult {
    const errors: string[] = [];

    let parsed: any;
    try {
      parsed = JSON.parse(response);
    } catch (e) {
      return {
        isValid: false,
        errors: ["Invalid JSON format"],
      };
    }

    // Validate question
    if (!parsed.question || typeof parsed.question !== "string") {
      errors.push('Missing or invalid "question" field');
    } else if (parsed.question.length > APP_CONFIG.MAX_SPARK_LENGTH) {
      errors.push(
        `Question too long (${parsed.question.length} > ${APP_CONFIG.MAX_SPARK_LENGTH})`
      );
    } else if (parsed.question.length < APP_CONFIG.MIN_SPARK_LENGTH) {
      errors.push(
        `Question too short (${parsed.question.length} < ${APP_CONFIG.MIN_SPARK_LENGTH})`
      );
    }

    // NEW: Validate philosophical/opinion language (should NOT exist)
    if (parsed.question) {
      const bannedPhrases = [
        "mungkin",
        "bisa jadi",
        "seandainya",
        "bagaimana jika",
        "menurut anda",
      ];
      const hasBannedPhrase = bannedPhrases.some((phrase) =>
        parsed.question.toLowerCase().includes(phrase)
      );
      if (hasBannedPhrase) {
        errors.push(
          "Question contains speculative/opinion language - must be factual"
        );
      }
    }

    // Validate knowledge (factual explanation)
    // if (!parsed.knowledge || typeof parsed.knowledge !== "string") {
    //   errors.push('Missing or invalid "knowledge" field');
    // } else if (parsed.knowledge.length < 80) {
    //   errors.push(
    //     `Knowledge too short (${parsed.knowledge.length} < 80 words)`
    //   );
    // } else if (parsed.knowledge.length > 600) {
    //   errors.push(
    //     `Knowledge too long (${parsed.knowledge.length} > 600 chars)`
    //   );
    // }

    // Validate funFact
    if (!parsed.funFact || typeof parsed.funFact !== "string") {
      errors.push('Missing or invalid "funFact" field');
    } else if (parsed.funFact.length < 20) {
      errors.push("Fun fact too short");
    }

    // Validate application
    if (!parsed.application || typeof parsed.application !== "string") {
      errors.push('Missing or invalid "application" field');
    } else if (parsed.application.length < 20) {
      errors.push("Application too short");
    }

    // Validate conceptLinks
    if (!Array.isArray(parsed.conceptLinks)) {
      errors.push('Missing or invalid "conceptLinks" field');
    } else if (
      parsed.conceptLinks.length < 2 ||
      parsed.conceptLinks.length > 4
    ) {
      errors.push("conceptLinks must have 2-4 items");
    } else if (!parsed.conceptLinks.every((c: any) => typeof c === "string")) {
      errors.push("All conceptLinks must be strings");
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const data: QuickLearnResponse = {
      question: parsed.question,
      knowledge: parsed.knowledge,
      funFact: parsed.funFact,
      application: parsed.application,
      conceptLinks: parsed.conceptLinks,
    };

    return { isValid: true, errors: [], data };
  }

  // Alias for backward compatibility
  validateQuickSpark(response: string): SparkValidationResult {
    return this.validateQuickLearn(response);
  }

  validateDeepDive(response: string): SparkValidationResult {
    const errors: string[] = [];

    let parsed: any;
    try {
      parsed = JSON.parse(response);
    } catch (e) {
      return {
        isValid: false,
        errors: ["Invalid JSON format"],
      };
    }

    if (!Array.isArray(parsed.layers)) {
      return {
        isValid: false,
        errors: ['Missing or invalid "layers" field'],
      };
    }

    if (parsed.layers.length < APP_CONFIG.DEEP_DIVE_MIN_LAYERS) {
      errors.push(
        `Too few layers (${parsed.layers.length} < ${APP_CONFIG.DEEP_DIVE_MIN_LAYERS})`
      );
    }

    if (parsed.layers.length > APP_CONFIG.DEEP_DIVE_MAX_LAYERS) {
      errors.push(
        `Too many layers (${parsed.layers.length} > ${APP_CONFIG.DEEP_DIVE_MAX_LAYERS})`
      );
    }

    parsed.layers.forEach((layer: any, index: number) => {
      if (typeof layer.layer !== "number") {
        errors.push(`Layer ${index}: missing or invalid "layer" number`);
      }

      if (!layer.spark || typeof layer.spark !== "string") {
        errors.push(`Layer ${index}: missing or invalid "spark" field`);
      } else if (layer.spark.length > APP_CONFIG.MAX_SPARK_LENGTH) {
        errors.push(`Layer ${index}: spark too long`);
      }

      // NEW: Check for factual language
      if (layer.spark) {
        const bannedPhrases = ["mungkin", "bisa jadi", "seandainya"];
        const hasBannedPhrase = bannedPhrases.some((phrase) =>
          layer.spark.toLowerCase().includes(phrase)
        );
        if (hasBannedPhrase) {
          errors.push(`Layer ${index}: contains speculative language`);
        }
      }

      if (!Array.isArray(layer.branches)) {
        errors.push(`Layer ${index}: missing or invalid "branches" field`);
      } else if (
        layer.branches.length !== APP_CONFIG.DEEP_DIVE_BRANCHES_PER_LAYER
      ) {
        errors.push(
          `Layer ${index}: must have exactly ${APP_CONFIG.DEEP_DIVE_BRANCHES_PER_LAYER} branches`
        );
      } else if (!layer.branches.every((b: any) => typeof b === "string")) {
        errors.push(`Layer ${index}: all branches must be strings`);
      }
    });

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const data: DeepDiveResponse = {
      layers: parsed.layers,
    };

    return { isValid: true, errors: [], data };
  }

  validateKnowledgeGraph(response: string): SparkValidationResult {
    const errors: string[] = [];

    let parsed: any;
    try {
      parsed = JSON.parse(response);
    } catch (e) {
      return {
        isValid: false,
        errors: ["Invalid JSON format"],
      };
    }

    if (!parsed.clusterSummary || typeof parsed.clusterSummary !== "string") {
      errors.push('Missing or invalid "clusterSummary" field');
    }

    if (!parsed.newSpark || typeof parsed.newSpark !== "string") {
      errors.push('Missing or invalid "newSpark" field');
    } else if (parsed.newSpark.length > APP_CONFIG.MAX_SPARK_LENGTH) {
      errors.push(
        `Spark too long (${parsed.newSpark.length} > ${APP_CONFIG.MAX_SPARK_LENGTH})`
      );
    }

    // NEW: Validate factual language
    if (parsed.newSpark) {
      const bannedPhrases = [
        "mungkin",
        "bisa jadi",
        "seandainya",
        "bagaimana jika",
      ];
      const hasBannedPhrase = bannedPhrases.some((phrase) =>
        parsed.newSpark.toLowerCase().includes(phrase)
      );
      if (hasBannedPhrase) {
        errors.push("Spark contains speculative language - must connect facts");
      }
    }

    if (!Array.isArray(parsed.conceptReinforcement)) {
      errors.push('Missing or invalid "conceptReinforcement" field');
    } else if (
      parsed.conceptReinforcement.length < 1 ||
      parsed.conceptReinforcement.length > 10
    ) {
      if (parsed.conceptReinforcement.length === 0) {
        errors.push("conceptReinforcement must have at least 1 item");
      }
    } else if (
      !parsed.conceptReinforcement.every((c: any) => typeof c === "string")
    ) {
      errors.push("All conceptReinforcement items must be strings");
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // Ensure 2-4 concepts
    let finalConceptReinforcement = parsed.conceptReinforcement;
    if (finalConceptReinforcement.length < 2) {
      const needed = 2 - finalConceptReinforcement.length;
      for (let i = 0; i < needed; i++) {
        finalConceptReinforcement.push(`concept-${Date.now()}-${i}`);
      }
    } else if (finalConceptReinforcement.length > 4) {
      finalConceptReinforcement = finalConceptReinforcement.slice(0, 4);
    }

    const data: KnowledgeGraphResponse = {
      clusterSummary: parsed.clusterSummary,
      newSpark: parsed.newSpark,
      conceptReinforcement: finalConceptReinforcement,
    };

    return { isValid: true, errors: [], data };
  }

  // Alias for backward compatibility
  validateThreadSpark(response: string): SparkValidationResult {
    return this.validateKnowledgeGraph(response);
  }

  validateByMode(response: string, mode: SparkMode): SparkValidationResult {
    switch (mode) {
      case 1:
        return this.validateQuickLearn(response);
      case 2:
        return this.validateDeepDive(response);
      case 3:
        return this.validateKnowledgeGraph(response);
      default:
        return {
          isValid: false,
          errors: [`Invalid mode: ${mode}`],
        };
    }
  }

  extractJSON(text: string): string {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    return text;
  }

  sanitizeResponse(response: string): string {
    let cleaned = response.trim();

    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/^```\s*/i, "");
    cleaned = cleaned.replace(/```\s*$/i, "");

    cleaned = this.extractJSON(cleaned);

    return cleaned;
  }

  validateThreadPack(response: string): SparkValidationResult {
    const errors: string[] = [];

    let parsed: any;
    try {
      parsed = safeJSONParse(response, { throwOnError: true });
    } catch (e) {
      return {
        isValid: false,
        errors: ["Invalid JSON format"],
      };
    }

    if (!parsed.clusterSummary || typeof parsed.clusterSummary !== "string") {
      errors.push('Missing or invalid "clusterSummary" field');
    }

    if (
      !parsed.continuationSpark ||
      typeof parsed.continuationSpark !== "string"
    ) {
      errors.push('Missing or invalid "continuationSpark" field');
    } else if (parsed.continuationSpark.length > APP_CONFIG.MAX_SPARK_LENGTH) {
      errors.push(`Continuation spark too long`);
    }

    if (!Array.isArray(parsed.derivedSparks)) {
      errors.push('Missing or invalid "derivedSparks" field');
    } else if (parsed.derivedSparks.length !== 2) {
      errors.push("Must have exactly 2 derived sparks");
    } else {
      parsed.derivedSparks.forEach((spark: string, i: number) => {
        if (typeof spark !== "string") {
          errors.push(`Derived spark ${i + 1} must be string`);
        } else if (spark.length > APP_CONFIG.MAX_SPARK_LENGTH) {
          errors.push(`Derived spark ${i + 1} too long`);
        }
      });
    }

    if (!parsed.wildcardSpark || typeof parsed.wildcardSpark !== "string") {
      errors.push('Missing or invalid "wildcardSpark" field');
    } else if (parsed.wildcardSpark.length > APP_CONFIG.MAX_SPARK_LENGTH) {
      errors.push(`Wildcard spark too long`);
    }

    if (!Array.isArray(parsed.conceptReinforcement)) {
      errors.push('Missing or invalid "conceptReinforcement" field');
    } else if (
      parsed.conceptReinforcement.length < 2 ||
      parsed.conceptReinforcement.length > 5
    ) {
      errors.push("conceptReinforcement must have 2-5 items");
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const data: ThreadPackResponse = {
      clusterSummary: parsed.clusterSummary,
      continuationSpark: parsed.continuationSpark,
      derivedSparks: parsed.derivedSparks,
      wildcardSpark: parsed.wildcardSpark,
      conceptReinforcement: parsed.conceptReinforcement,
    };

    return { isValid: true, errors: [], data };
  }

  validateDeepDiveLayer(response: string): SparkValidationResult {
    const errors: string[] = [];

    let parsed: any;
    try {
      parsed = JSON.parse(response);
    } catch (e) {
      return { isValid: false, errors: ["Invalid JSON format"] };
    }

    if (!parsed.explanation || typeof parsed.explanation !== "string") {
      errors.push('Missing or invalid "explanation" field');
    } else if (parsed.explanation.length < 150) {
      errors.push("Explanation too short (min 150 chars for factual depth)");
    }

    if (!Array.isArray(parsed.questions)) {
      errors.push('Missing or invalid "questions" field');
    } else if (parsed.questions.length < 1 || parsed.questions.length > 2) {
      errors.push("Must have 1-2 questions");
    } else if (!parsed.questions.every((q: any) => typeof q === "string")) {
      errors.push("All questions must be strings");
    }

    if (parsed.analogy && typeof parsed.analogy !== "string") {
      errors.push("Analogy must be string if provided");
    }

    if (!parsed.observation || typeof parsed.observation !== "string") {
      errors.push('Missing or invalid "observation" field');
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [], data: parsed };
  }

  validateDeepDiveSynthesis(response: string): SparkValidationResult {
    const errors: string[] = [];

    let parsed: any;
    try {
      parsed = JSON.parse(response);
    } catch (e) {
      return { isValid: false, errors: ["Invalid JSON format"] };
    }

    if (!parsed.summary || typeof parsed.summary !== "string") {
      errors.push('Missing or invalid "summary" field');
    }

    if (!parsed.bigIdea || typeof parsed.bigIdea !== "string") {
      errors.push('Missing or invalid "bigIdea" field');
    }

    if (!Array.isArray(parsed.nextSteps)) {
      errors.push('Missing or invalid "nextSteps" field');
    } else if (parsed.nextSteps.length < 2 || parsed.nextSteps.length > 4) {
      errors.push("Must have 2-4 next steps");
    }

    if (
      parsed.clusterConnection &&
      typeof parsed.clusterConnection !== "string"
    ) {
      errors.push("clusterConnection must be string if provided");
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [], data: parsed };
  }
}

export default new ResponseValidator();
