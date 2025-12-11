// src/types/thread.types.ts

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
