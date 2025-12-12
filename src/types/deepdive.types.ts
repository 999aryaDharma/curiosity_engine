// src/types/deepdive.types.ts

export interface DeepDiveLayer {
  layer: number;
  explanation: string; // Penjelasan inti (1 paragraf)
  questions: string[]; // 1-2 pertanyaan pemicu
  analogy?: string; // Analogi ilustratif
  observation?: string; // Observation path / insight
  createdAt: number;
}

export interface DeepDiveSynthesis {
  summary: string; // Ringkasan 2-3 kalimat
  bigIdea: string; // Ide besar yang dipetik
  nextSteps: string[]; // Rekomendasi eksplorasi lanjutan
  threadLink?: string; // Link ke cluster terkait (optional)
}

export interface DeepDiveSession {
  id: string;
  seedSparkId: string;
  seedSparkText: string;
  layers: DeepDiveLayer[];
  synthesis?: DeepDiveSynthesis;
  currentLayer: number;
  maxLayers: number;
  isComplete: boolean;
  createdAt: number;
  lastUpdated: number;
}

export interface DeepDiveLayerResponse {
  explanation: string;
  questions: string[];
  analogy?: string;
  observation?: string;
}

export interface DeepDiveSynthesisResponse {
  summary: string;
  bigIdea: string;
  nextSteps: string[];
  clusterConnection?: string;
}
