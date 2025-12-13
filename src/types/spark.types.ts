// src/types/spark.types.ts - KNOWLEDGE-BASED TYPES

import {
  DeepDiveLayerResponse,
  DeepDiveSynthesisResponse,
} from "./deepdive.types";
import { ThreadPackResponse } from "./thread.types";

export type SparkMode = 1 | 2 | 3; // 1: Quick Learn, 2: Deep Dive, 3: Knowledge Graph

export interface Spark {
  id: string;
  text: string; // The question
  tags: string[]; // Array of tag IDs
  mode: SparkMode;

  // NEW: Knowledge-based fields
  knowledge?: string; // Factual explanation (80-150 words) - HIDDEN initially
  funFact?: string; // Interesting trivia
  application?: string; // Practical use case

  // Deep Dive specific
  layers?: SparkLayer[];

  // Concept tracking
  conceptLinks: string[]; // Array of concept IDs

  // Legacy (for Mode 1 backward compatibility)
  followUp?: string;

  // Metadata
  difficulty?: number; // 0.0-1.0 (replaces chaos)
  createdAt: number;
  viewed: boolean;
  saved: boolean;
  knowledgeRevealed?: boolean; // Track if user has viewed the knowledge explanation
}

export interface SparkLayer {
  layer: number; // 1, 2, 3, etc.
  spark: string;
  branches: SparkBranch[];
  selectedBranch?: string; // ID of selected branch
}

export interface SparkBranch {
  id: string;
  text: string;
  nextLayer?: SparkLayer;
}

// NEW: Quick Learn Response (Mode 1)
export interface QuickLearnResponse {
  question: string; // Educational question
  knowledge: string; // Factual explanation (80-150 words) - HIDDEN initially
  funFact: string; // Interesting trivia
  application: string; // Practical use
  conceptLinks: string[]; // 2-4 concepts
}

// Legacy type alias for backward compatibility
export type QuickSparkResponse = QuickLearnResponse;

export interface DeepDiveResponse {
  layers: {
    layer: number;
    spark: string;
    branches: string[];
  }[];
}

// NEW: Knowledge Graph Response (Mode 3)
export interface KnowledgeGraphResponse {
  clusterSummary: string;
  newSpark: string; // Educational question connecting domains
  conceptReinforcement: string[];
}

// Legacy type alias for backward compatibility
export type ThreadSparkResponse = KnowledgeGraphResponse;

export interface SparkGenerationInput {
  mode: SparkMode;
  tags: string[];
  cluster?: Record<string, any>;
  history?: Spark[];
  difficulty: number; // 0.0-1.0 (replaces chaos - 0=beginner, 1=expert)
}

export interface SparkValidationResult {
  isValid: boolean;
  errors: string[];
  data?:
    | QuickLearnResponse
    | DeepDiveResponse
    | KnowledgeGraphResponse
    | ThreadPackResponse
    | DeepDiveLayerResponse
    | DeepDiveSynthesisResponse;
}

export interface SparkFilter {
  mode?: SparkMode;
  tags?: string[];
  dateFrom?: number;
  dateTo?: number;
  saved?: boolean;
  viewed?: boolean;
  difficulty?: {
    min?: number;
    max?: number;
  };
}

export interface SparkStatistics {
  totalSparks: number;
  sparksByMode: Record<SparkMode, number>;
  sparksByTag: Record<string, number>;
  averageDepth: number;
  mostViewedTags: string[];
  knowledgeDomains: string[]; // Most explored knowledge clusters
  difficultyDistribution: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
}
