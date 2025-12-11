// src/constants/defaultTags.ts

import { Tag } from "@type/tag.types";

export const DEFAULT_TAG_CLUSTERS = {
  PHILOSOPHY: "philosophy",
  SCIENCE: "science",
  ARTS: "arts",
  TECHNOLOGY: "technology",
  PSYCHOLOGY: "psychology",
  SOCIETY: "society",
  NATURE: "nature",
  HISTORY: "history",
  MATHEMATICS: "mathematics",
  LANGUAGE: "language",
  ECONOMICS: "economics",
  HEALTH: "health",
} as const;

export const DEFAULT_TAGS_LIST: Omit<
  Tag,
  "id" | "usageCount" | "lastUsed" | "createdAt"
>[] = [
  // Philosophy
  {
    name: "Consciousness",
    cluster: DEFAULT_TAG_CLUSTERS.PHILOSOPHY,
    isDefault: true,
  },
  { name: "Ethics", cluster: DEFAULT_TAG_CLUSTERS.PHILOSOPHY, isDefault: true },
  {
    name: "Existentialism",
    cluster: DEFAULT_TAG_CLUSTERS.PHILOSOPHY,
    isDefault: true,
  },
  { name: "Logic", cluster: DEFAULT_TAG_CLUSTERS.PHILOSOPHY, isDefault: true },
  {
    name: "Metaphysics",
    cluster: DEFAULT_TAG_CLUSTERS.PHILOSOPHY,
    isDefault: true,
  },
  {
    name: "Free Will",
    cluster: DEFAULT_TAG_CLUSTERS.PHILOSOPHY,
    isDefault: true,
  },

  // Science
  {
    name: "Quantum Physics",
    cluster: DEFAULT_TAG_CLUSTERS.SCIENCE,
    isDefault: true,
  },
  { name: "Evolution", cluster: DEFAULT_TAG_CLUSTERS.SCIENCE, isDefault: true },
  { name: "Astronomy", cluster: DEFAULT_TAG_CLUSTERS.SCIENCE, isDefault: true },
  { name: "Chemistry", cluster: DEFAULT_TAG_CLUSTERS.SCIENCE, isDefault: true },
  { name: "Biology", cluster: DEFAULT_TAG_CLUSTERS.SCIENCE, isDefault: true },
  {
    name: "Neuroscience",
    cluster: DEFAULT_TAG_CLUSTERS.SCIENCE,
    isDefault: true,
  },
  { name: "Climate", cluster: DEFAULT_TAG_CLUSTERS.SCIENCE, isDefault: true },

  // Arts
  { name: "Music Theory", cluster: DEFAULT_TAG_CLUSTERS.ARTS, isDefault: true },
  { name: "Visual Arts", cluster: DEFAULT_TAG_CLUSTERS.ARTS, isDefault: true },
  { name: "Literature", cluster: DEFAULT_TAG_CLUSTERS.ARTS, isDefault: true },
  { name: "Cinema", cluster: DEFAULT_TAG_CLUSTERS.ARTS, isDefault: true },
  { name: "Architecture", cluster: DEFAULT_TAG_CLUSTERS.ARTS, isDefault: true },
  { name: "Design", cluster: DEFAULT_TAG_CLUSTERS.ARTS, isDefault: true },
  { name: "Poetry", cluster: DEFAULT_TAG_CLUSTERS.ARTS, isDefault: true },

  // Technology
  {
    name: "Artificial Intelligence",
    cluster: DEFAULT_TAG_CLUSTERS.TECHNOLOGY,
    isDefault: true,
  },
  {
    name: "Cryptography",
    cluster: DEFAULT_TAG_CLUSTERS.TECHNOLOGY,
    isDefault: true,
  },
  {
    name: "Robotics",
    cluster: DEFAULT_TAG_CLUSTERS.TECHNOLOGY,
    isDefault: true,
  },
  {
    name: "Virtual Reality",
    cluster: DEFAULT_TAG_CLUSTERS.TECHNOLOGY,
    isDefault: true,
  },
  {
    name: "Blockchain",
    cluster: DEFAULT_TAG_CLUSTERS.TECHNOLOGY,
    isDefault: true,
  },
  {
    name: "Internet",
    cluster: DEFAULT_TAG_CLUSTERS.TECHNOLOGY,
    isDefault: true,
  },

  // Psychology
  {
    name: "Cognitive Bias",
    cluster: DEFAULT_TAG_CLUSTERS.PSYCHOLOGY,
    isDefault: true,
  },
  { name: "Memory", cluster: DEFAULT_TAG_CLUSTERS.PSYCHOLOGY, isDefault: true },
  {
    name: "Emotions",
    cluster: DEFAULT_TAG_CLUSTERS.PSYCHOLOGY,
    isDefault: true,
  },
  {
    name: "Perception",
    cluster: DEFAULT_TAG_CLUSTERS.PSYCHOLOGY,
    isDefault: true,
  },
  {
    name: "Decision Making",
    cluster: DEFAULT_TAG_CLUSTERS.PSYCHOLOGY,
    isDefault: true,
  },
  {
    name: "Creativity",
    cluster: DEFAULT_TAG_CLUSTERS.PSYCHOLOGY,
    isDefault: true,
  },
  {
    name: "Learning",
    cluster: DEFAULT_TAG_CLUSTERS.PSYCHOLOGY,
    isDefault: true,
  },

  // Society
  { name: "Culture", cluster: DEFAULT_TAG_CLUSTERS.SOCIETY, isDefault: true },
  { name: "Politics", cluster: DEFAULT_TAG_CLUSTERS.SOCIETY, isDefault: true },
  { name: "Religion", cluster: DEFAULT_TAG_CLUSTERS.SOCIETY, isDefault: true },
  { name: "Education", cluster: DEFAULT_TAG_CLUSTERS.SOCIETY, isDefault: true },
  { name: "Justice", cluster: DEFAULT_TAG_CLUSTERS.SOCIETY, isDefault: true },
  { name: "Media", cluster: DEFAULT_TAG_CLUSTERS.SOCIETY, isDefault: true },
  { name: "Identity", cluster: DEFAULT_TAG_CLUSTERS.SOCIETY, isDefault: true },

  // Nature
  { name: "Ecology", cluster: DEFAULT_TAG_CLUSTERS.NATURE, isDefault: true },
  {
    name: "Biodiversity",
    cluster: DEFAULT_TAG_CLUSTERS.NATURE,
    isDefault: true,
  },
  { name: "Genetics", cluster: DEFAULT_TAG_CLUSTERS.NATURE, isDefault: true },
  { name: "Ocean", cluster: DEFAULT_TAG_CLUSTERS.NATURE, isDefault: true },
  { name: "Forest", cluster: DEFAULT_TAG_CLUSTERS.NATURE, isDefault: true },
  { name: "Animals", cluster: DEFAULT_TAG_CLUSTERS.NATURE, isDefault: true },

  // History
  {
    name: "Ancient Civilizations",
    cluster: DEFAULT_TAG_CLUSTERS.HISTORY,
    isDefault: true,
  },
  {
    name: "World Wars",
    cluster: DEFAULT_TAG_CLUSTERS.HISTORY,
    isDefault: true,
  },
  {
    name: "Renaissance",
    cluster: DEFAULT_TAG_CLUSTERS.HISTORY,
    isDefault: true,
  },
  {
    name: "Industrial Revolution",
    cluster: DEFAULT_TAG_CLUSTERS.HISTORY,
    isDefault: true,
  },
  {
    name: "Colonialism",
    cluster: DEFAULT_TAG_CLUSTERS.HISTORY,
    isDefault: true,
  },

  // Mathematics
  {
    name: "Calculus",
    cluster: DEFAULT_TAG_CLUSTERS.MATHEMATICS,
    isDefault: true,
  },
  {
    name: "Statistics",
    cluster: DEFAULT_TAG_CLUSTERS.MATHEMATICS,
    isDefault: true,
  },
  {
    name: "Geometry",
    cluster: DEFAULT_TAG_CLUSTERS.MATHEMATICS,
    isDefault: true,
  },
  {
    name: "Number Theory",
    cluster: DEFAULT_TAG_CLUSTERS.MATHEMATICS,
    isDefault: true,
  },
  {
    name: "Chaos Theory",
    cluster: DEFAULT_TAG_CLUSTERS.MATHEMATICS,
    isDefault: true,
  },
  {
    name: "Infinity",
    cluster: DEFAULT_TAG_CLUSTERS.MATHEMATICS,
    isDefault: true,
  },

  // Language
  {
    name: "Linguistics",
    cluster: DEFAULT_TAG_CLUSTERS.LANGUAGE,
    isDefault: true,
  },
  {
    name: "Semantics",
    cluster: DEFAULT_TAG_CLUSTERS.LANGUAGE,
    isDefault: true,
  },
  {
    name: "Writing Systems",
    cluster: DEFAULT_TAG_CLUSTERS.LANGUAGE,
    isDefault: true,
  },
  {
    name: "Translation",
    cluster: DEFAULT_TAG_CLUSTERS.LANGUAGE,
    isDefault: true,
  },
  {
    name: "Communication",
    cluster: DEFAULT_TAG_CLUSTERS.LANGUAGE,
    isDefault: true,
  },

  // Economics
  {
    name: "Game Theory",
    cluster: DEFAULT_TAG_CLUSTERS.ECONOMICS,
    isDefault: true,
  },
  {
    name: "Behavioral Economics",
    cluster: DEFAULT_TAG_CLUSTERS.ECONOMICS,
    isDefault: true,
  },
  { name: "Markets", cluster: DEFAULT_TAG_CLUSTERS.ECONOMICS, isDefault: true },
  { name: "Trade", cluster: DEFAULT_TAG_CLUSTERS.ECONOMICS, isDefault: true },
  {
    name: "Inequality",
    cluster: DEFAULT_TAG_CLUSTERS.ECONOMICS,
    isDefault: true,
  },

  // Health
  { name: "Nutrition", cluster: DEFAULT_TAG_CLUSTERS.HEALTH, isDefault: true },
  {
    name: "Mental Health",
    cluster: DEFAULT_TAG_CLUSTERS.HEALTH,
    isDefault: true,
  },
  { name: "Medicine", cluster: DEFAULT_TAG_CLUSTERS.HEALTH, isDefault: true },
  { name: "Exercise", cluster: DEFAULT_TAG_CLUSTERS.HEALTH, isDefault: true },
  { name: "Sleep", cluster: DEFAULT_TAG_CLUSTERS.HEALTH, isDefault: true },
  { name: "Longevity", cluster: DEFAULT_TAG_CLUSTERS.HEALTH, isDefault: true },
];

export const TAG_SELECTION_CONFIG = {
  TOTAL_TAGS_PER_DAY: 5,
  MIN_TAGS: 4,
  MAX_TAGS: 6,

  HISTORY_WEIGHT: 0.4,
  WILDCARD_WEIGHT: 0.3,
  DEEP_DIVE_WEIGHT: 0.2,
  RANDOM_WEIGHT: 0.1,

  HISTORY_LOOKBACK_DAYS: 7,
  AVOID_REPETITION_DAYS: 3,
} as const;

export const getDefaultTagsWithIds = (): Tag[] => {
  const now = Date.now();

  return DEFAULT_TAGS_LIST.map((tag, index) => ({
    id: `tag_${index.toString().padStart(3, "0")}`,
    ...tag,
    usageCount: 0,
    lastUsed: null,
    createdAt: now,
  }));
};
