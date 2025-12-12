// src/types/spark.types.ts

import {
  DeepDiveLayerResponse,
  DeepDiveSynthesisResponse,
} from "./deepdive.types";
import { ThreadPackResponse } from "./thread.types";

export type SparkMode = 1 | 2 | 3; // 1: Quick, 2: Deep Dive, 3: Thread

export interface Spark {
  id: string;
  text: string;
  tags: string[]; // Array of tag IDs
  mode: SparkMode;
  layers?: SparkLayer[];
  conceptLinks: string[]; // Array of concept IDs
  followUp?: string;
  createdAt: number;
  viewed: boolean;
  saved: boolean;
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

export interface QuickSparkResponse {
  spark: string;
  followUp: string;
  conceptLinks: string[];
}

export interface DeepDiveResponse {
  layers: {
    layer: number;
    spark: string;
    branches: string[];
  }[];
}

export interface ThreadSparkResponse {
  clusterSummary: string;
  newSpark: string;
  conceptReinforcement: string[];
}

export interface SparkGenerationInput {
  mode: SparkMode;
  tags: string[];
  cluster?: Record<string, any>;
  history?: Spark[];
  chaos: number; // 0.0-1.0
}

export interface SparkValidationResult {
  isValid: boolean;
  errors: string[];
  data?:
    | QuickSparkResponse
    | DeepDiveResponse
    | ThreadSparkResponse
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
}

export interface SparkStatistics {
  totalSparks: number;
  sparksByMode: Record<SparkMode, number>;
  sparksByTag: Record<string, number>;
  averageDepth: number;
  mostViewedTags: string[];
}
