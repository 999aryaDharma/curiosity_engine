// src/types/thread.types.ts
import { Spark } from "./spark.types";

export interface ConceptNode {
  id: string;
  name: string;
  description?: string;
  cluster: string;
  weight: number; // 0-1, importance of this concept
  sparkIds: string[]; // Sparks that generated this concept
  createdAt: number;
  lastUpdated: number;
}

export interface ConceptLink {
  id: string;
  conceptA: string; // Concept ID
  conceptB: string; // Concept ID
  strength: number; // 0-1, relationship strength
  linkType?: "semantic" | "temporal" | "causal" | "associative";
  lastUpdate: number;
  sparkIds: string[]; // Sparks that reinforced this link
}

export interface ConceptCluster {
  id: string;
  name: string;
  description?: string;
  concepts: string[]; // Array of concept IDs
  coherence: number; // 0-1, how related concepts are
  sparkCount: number;
  lastUpdated: number;
}

export interface ThreadGraph {
  nodes: ConceptNode[];
  links: ConceptLink[];
  clusters: ConceptCluster[];
  lastUpdated: number;
}

export interface ConceptExtractionResult {
  concepts: string[];
  relationships: {
    from: string;
    to: string;
    strength: number;
  }[];
}

export interface ClusterAnalysisResult {
  clusterId: string;
  clusterName: string;
  dominantConcepts: string[];
  weakConcepts: string[];
  suggestedMerges?: string[]; // Other cluster IDs to potentially merge
  suggestedSplits?: {
    newClusterName: string;
    concepts: string[];
  }[];
}

export interface ThreadRecommendation {
  type: "explore" | "deepen" | "connect" | "diverge";
  clusterId?: string;
  conceptIds: string[];
  reason: string;
  suggestedTags: string[];
}

export interface ThreadStatistics {
  totalConcepts: number;
  totalLinks: number;
  totalClusters: number;
  averageClusterSize: number;
  mostConnectedConcepts: {
    conceptId: string;
    connectionCount: number;
  }[];
  isolatedConcepts: string[];
}

export interface ThreadSpark {
  id: string;
  text: string;
  type: "continuation" | "derived" | "wildcard";
  conceptLinks: string[];
  parentSparkId?: string;
}

export interface ThreadPack {
  id: string;
  clusterId: string;
  clusterName: string;
  continuationSpark: ThreadSpark;
  derivedSparks: ThreadSpark[];
  wildcardSpark: ThreadSpark;
  relations: ThreadSparkRelation[];
  generatedAt: number;
}

export interface ThreadSparkRelation {
  fromSparkId: string;
  toSparkId: string;
  relationType: "continuation" | "derivation" | "wildcard";
}

export interface ThreadPackResponse {
  clusterSummary: string;
  continuationSpark: string;
  derivedSparks: string[];
  wildcardSpark: string;
  conceptReinforcement: string[];
}

export interface ClusterJourney {
  cluster: ConceptCluster;
  sparkHistory: Spark[];
  dominantConcepts: ConceptNode[];
  lastUpdated: number;
}
