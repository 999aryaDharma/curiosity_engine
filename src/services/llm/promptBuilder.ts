// src/services/llm/promptBuilder.ts

import { Tag } from "@type/tag.types";
import { Spark, SparkMode } from "@type/spark.types";
import { ConceptCluster, ConceptNode } from "@type/thread.types";

class PromptBuilder {
  buildQuickSparkPrompt(
    tags: Tag[],
    chaos: number
  ): { system: string; user: string } {
    const system = `You are the Curiosity Engine, designed to generate thought-provoking questions that spark intellectual curiosity.

Your task is to create a single "spark" - a question or observation that:
- Connects multiple concepts in unexpected ways
- Encourages deep thinking without being overwhelming
- Is concise (under 280 characters)
- Feels fresh and non-obvious
- Includes a brief context or "why this matters"
- MUST BE IN INDONESIAN LANGUAGE

Output ONLY valid JSON with this exact structure:
{
  "spark": "The main curiosity-triggering question or observation in Indonesian",
  "followUp": "A deeper follow-up question to explore further in Indonesian",
  "conceptLinks": ["concept1", "concept2", "concept3"]
}

Rules:
- spark must be under 280 characters
- followUp should dig one layer deeper
- conceptLinks should be 2-4 abstract concepts
- Be creative and unexpected
- Avoid clichés and obvious connections
- ALL TEXT MUST BE IN INDONESIAN LANGUAGE`;

    const tagNames = tags.map((t) => t.name).join(", ");
    const chaosLevel = this.describeChaosLevel(chaos);

    const user = `Generate a curiosity spark using these tags: ${tagNames}

Chaos level: ${chaosLevel}
${
  chaos > 0.5
    ? "Make unexpected connections between seemingly unrelated concepts."
    : "Focus on coherent, related concepts."
}

Remember: Output ONLY the JSON object, no explanations.`;

    return { system, user };
  }

  buildDeepDivePrompt(
    tags: Tag[],
    chaos: number,
    layers: number
  ): { system: string; user: string } {
    const system = `You are the Curiosity Engine's Deep Dive mode, creating multi-layer exploratory paths.

Generate a sequence of ${layers} layers, where each layer:
- Builds on the previous layer's concept
- Offers 2 branching paths for exploration
- Gets progressively more specific or abstract
- Maintains intellectual coherence
- MUST BE IN INDONESIAN LANGUAGE

Output ONLY valid JSON with this exact structure:
{
  "layers": [
    {
      "layer": 1,
      "spark": "Initial question or observation in Indonesian",
      "branches": ["Path A: description in Indonesian", "Path B: description in Indonesian"]
    },
    {
      "layer": 2,
      "spark": "Deeper question building on layer 1 in Indonesian",
      "branches": ["Path A: description in Indonesian", "Path B: description in Indonesian"]
    }
  ]
}

Rules:
- Each spark under 280 characters
- Branches should represent genuinely different directions
- Later layers should feel like going down a rabbit hole
- Maintain curiosity throughout
- ALL TEXT MUST BE IN INDONESIAN LANGUAGE`;

    const tagNames = tags.map((t) => t.name).join(", ");
    const chaosLevel = this.describeChaosLevel(chaos);

    const user = `Create a ${layers}-layer deep dive using these tags: ${tagNames}

Chaos level: ${chaosLevel}

Each layer should naturally flow from the previous one while offering distinct paths forward.

Remember: Output ONLY the JSON object.`;

    return { system, user };
  }

  buildThreadSparkPrompt(
    tags: Tag[],
    clusters: ConceptCluster[],
    recentSparks: Spark[],
    chaos: number
  ): { system: string; user: string } {
    const system = `You are the Curiosity Engine's Thread mode, generating sparks based on existing concept clusters.

Your task is to:
- Analyze the user's existing conceptual map
- Identify interesting connections or gaps
- Generate a spark that either:
  * Deepens understanding of a dominant cluster
  * Connects multiple clusters in novel ways
  * Explores an underdeveloped area
- ALL CONTENT MUST BE IN INDONESIAN LANGUAGE

Output ONLY valid JSON with this exact structure:
{
  "clusterSummary": "Brief analysis of the concept landscape in Indonesian (1-2 sentences)",
  "newSpark": "A question or observation that builds on existing concepts in Indonesian",
  "conceptReinforcement": ["existing_concept1", "existing_concept2", "new_concept"]
}

Rules:
- Reference concepts the user has already explored
- Make it feel like a natural continuation of their journey
- Spark should be under 280 characters
- Balance familiarity with novelty
- ALL TEXT MUST BE IN INDONESIAN LANGUAGE`;

    const tagNames = tags.map((t) => t.name).join(", ");
    const clusterSummary = clusters
      .map(
        (c) =>
          `${c.name}: ${
            c.concepts.length
          } concepts, coherence ${c.coherence.toFixed(2)}`
      )
      .join("\n");

    const recentSparksSummary = recentSparks
      .slice(0, 5)
      .map((s) => `- ${s.text.substring(0, 100)}...`)
      .join("\n");

    const user = `Current tags: ${tagNames}

Existing concept clusters:
${clusterSummary || "No clusters yet"}

Recent sparks:
${recentSparksSummary || "No recent sparks"}

Chaos level: ${this.describeChaosLevel(chaos)}

Generate a spark that builds on this conceptual landscape.

Remember: Output ONLY the JSON object.`;

    return { system, user };
  }

  // NEW: Prompt khusus untuk Thread Spark dari Cluster
  buildThreadSparkFromClusterPrompt(
    cluster: ConceptCluster,
    conceptNodes: ConceptNode[],
    historySparks: Spark[],
    chaos: number
  ): { system: string; user: string } {
    const system = `You are the Curiosity Engine's Thread mode, continuing exploration within a specific concept cluster.

Your task is to generate a NEW spark that:
1. BUILDS ON existing concepts in the cluster "${cluster.name}"
2. EXTENDS the thread by introducing related but fresh angles
3. MAINTAINS coherence with cluster theme (${Math.round(
      cluster.coherence * 100
    )}% coherent)
4. ADDS ${Math.round(chaos * 100)}% serendipity to avoid echo chamber
5. MUST BE IN INDONESIAN LANGUAGE

This is NOT a random spark. This is a continuation of an intellectual journey.

Output ONLY valid JSON:
{
  "clusterSummary": "Brief 1-sentence analysis of this cluster's theme in Indonesian",
  "newSpark": "A question that extends this thread in Indonesian (under 280 chars)",
  "conceptReinforcement": ["concept1_from_cluster", "concept2_from_cluster", "new_concept_to_add"]
}

Rules:
- Reference at least 2 existing concepts from this cluster
- Introduce 1 new concept that enriches the cluster
- Keep it intellectually stimulating but not overwhelming
- The spark should feel like "chapter ${
      cluster.sparkCount + 1
    }" of this exploration
- ALL TEXT MUST BE IN INDONESIAN LANGUAGE`;

    // Extract concept names
    const conceptNames = conceptNodes.map((n) => n.name).join(", ");

    // Extract dominant concepts (top 3 by weight)
    const dominantConcepts = conceptNodes
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map((n) => `${n.name} (weight: ${n.weight.toFixed(2)})`)
      .join(", ");

    // Extract recent spark excerpts
    const recentSparksSummary =
      historySparks.length > 0
        ? historySparks
            .slice(0, 3)
            .map((s, i) => `${i + 1}. "${s.text.substring(0, 80)}..."`)
            .join("\n")
        : "No previous sparks in this cluster yet.";

    const user = `CLUSTER: "${cluster.name}"
Coherence: ${Math.round(cluster.coherence * 100)}%
Total sparks: ${cluster.sparkCount}
Concepts (${conceptNodes.length}): ${conceptNames}

DOMINANT CONCEPTS:
${dominantConcepts}

RECENT SPARKS IN THIS CLUSTER:
${recentSparksSummary}

CHAOS LEVEL: ${this.describeChaosLevel(chaos)}

Generate a spark that:
- Continues the exploration of "${cluster.name}"
- References existing concepts: ${dominantConcepts.split(",")[0]}, ${
      dominantConcepts.split(",")[1] || conceptNames.split(",")[0]
    }
- Introduces 1 new related concept
- Maintains ${Math.round((1 - chaos) * 100)}% coherence, ${Math.round(
      chaos * 100
    )}% novelty

Remember: Output ONLY the JSON object.`;

    return { system, user };
  }

  buildConceptExtractionPrompt(sparkText: string): {
    system: string;
    user: string;
  } {
    const system = `You extract key concepts from curiosity sparks in Indonesian.

Identify 2-5 abstract concepts that are central to the question or observation.
Concepts should be:
- Abstract and generalizable (e.g., "time", "identity", "emergence")
- Not too specific (avoid proper nouns unless critical)
- Intellectually meaningful
- Related to the core idea
- When possible, use Indonesian-related concepts or translate concepts to Indonesian

Output ONLY valid JSON:
{
  "concepts": ["concept1", "concept2", "concept3"]
}`;

    const user = `Extract key concepts from this Indonesian spark:

"${sparkText}"

Remember: Output ONLY the JSON object with 2-5 concepts.`;

    return { system, user };
  }

  private describeChaosLevel(chaos: number): string {
    if (chaos < 0.2) return "Minimal - stay close to tag themes";
    if (chaos < 0.5) return "Low - slight creative connections";
    if (chaos < 0.8) return "Medium - unexpected but logical leaps";
    return "High - maximum creative freedom, surprising connections";
  }

  buildSystemPromptForMode(mode: SparkMode): string {
    switch (mode) {
      case 1:
        return "You generate quick, single-layer curiosity sparks.";
      case 2:
        return "You generate deep, multi-layer exploration paths.";
      case 3:
        return "You generate sparks that build on existing concept threads.";
      default:
        return "You generate curiosity sparks.";
    }
  }
}

export default new PromptBuilder();
