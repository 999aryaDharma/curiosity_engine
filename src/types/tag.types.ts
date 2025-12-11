// src/types/tag.types.ts

export interface Tag {
  id: string;
  name: string;
  cluster: string | null;
  usageCount: number;
  lastUsed: number | null;
  isDefault: boolean;
  createdAt: number;
}

export interface DailyTagSelection {
  id: string;
  date: string; // YYYY-MM-DD format
  tags: string[]; // Array of tag IDs
  isManuallyEdited: boolean;
  createdAt: number;
}

export interface TagCluster {
  id: string;
  name: string;
  description?: string;
  tags: string[]; // Array of tag IDs
  weight: number; // 0-1, how strong this cluster is
  lastUpdated: number;
}

export type TagSelectionStrategy =
  | "history"
  | "wildcard"
  | "deep-dive"
  | "random";

export interface TagSelectionConfig {
  historyWeight: number; // 0.4 (40%)
  wildcardWeight: number; // 0.3 (30%)
  deepDiveWeight: number; // 0.2 (20%)
  randomWeight: number; // 0.1 (10%)
  totalTagsPerDay: number; // 4-6
}

export interface TagHistory {
  tagId: string;
  usedAt: number;
  strategy: TagSelectionStrategy;
}

export interface CreateTagInput {
  name: string;
  cluster?: string;
  isDefault?: boolean;
}

export interface UpdateTagInput {
  id: string;
  name?: string;
  cluster?: string;
}

export interface TagStatistics {
  tagId: string;
  tagName: string;
  totalUsage: number;
  lastUsed: number | null;
  usageByWeek: number[];
  clusterAssignment: string | null;
}
