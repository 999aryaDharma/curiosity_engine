// src/services/llm/responseValidator.ts

import {
  QuickSparkResponse,
  DeepDiveResponse,
  ThreadSparkResponse,
  SparkValidationResult,
  SparkMode,
} from "@type/spark.types";
import { ThreadPackResponse } from "@type/thread.types";
import { APP_CONFIG } from "@constants/config";
import { safeJSONParse } from "@/utils/jsonUtils";

class ResponseValidator {
  validateQuickSpark(response: string): SparkValidationResult {
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

    if (!parsed.spark || typeof parsed.spark !== "string") {
      errors.push('Missing or invalid "spark" field');
    } else if (parsed.spark.length > APP_CONFIG.MAX_SPARK_LENGTH) {
      errors.push(
        `Spark too long (${parsed.spark.length} > ${APP_CONFIG.MAX_SPARK_LENGTH})`
      );
    } else if (parsed.spark.length < APP_CONFIG.MIN_SPARK_LENGTH) {
      errors.push(
        `Spark too short (${parsed.spark.length} < ${APP_CONFIG.MIN_SPARK_LENGTH})`
      );
    }

    if (!parsed.followUp || typeof parsed.followUp !== "string") {
      errors.push('Missing or invalid "followUp" field');
    }

    if (!Array.isArray(parsed.conceptLinks)) {
      errors.push('Missing or invalid "conceptLinks" field');
    } else if (
      parsed.conceptLinks.length < 2 ||
      parsed.conceptLinks.length > 5
    ) {
      errors.push("conceptLinks must have 2-5 items");
    } else if (!parsed.conceptLinks.every((c: any) => typeof c === "string")) {
      errors.push("All conceptLinks must be strings");
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const data: QuickSparkResponse = {
      spark: parsed.spark,
      followUp: parsed.followUp,
      conceptLinks: parsed.conceptLinks,
    };

    return { isValid: true, errors: [], data };
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

  validateThreadSpark(response: string): SparkValidationResult {
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

    if (!Array.isArray(parsed.conceptReinforcement)) {
      errors.push('Missing or invalid "conceptReinforcement" field');
    } else if (
      parsed.conceptReinforcement.length < 2 ||
      parsed.conceptReinforcement.length > 5
    ) {
      errors.push("conceptReinforcement must have 2-5 items");
    } else if (
      !parsed.conceptReinforcement.every((c: any) => typeof c === "string")
    ) {
      errors.push("All conceptReinforcement items must be strings");
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const data: ThreadSparkResponse = {
      clusterSummary: parsed.clusterSummary,
      newSpark: parsed.newSpark,
      conceptReinforcement: parsed.conceptReinforcement,
    };

    return { isValid: true, errors: [], data };
  }

  validateByMode(response: string, mode: SparkMode): SparkValidationResult {
    switch (mode) {
      case 1:
        return this.validateQuickSpark(response);
      case 2:
        return this.validateDeepDive(response);
      case 3:
        return this.validateThreadSpark(response);
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
}

export default new ResponseValidator();
