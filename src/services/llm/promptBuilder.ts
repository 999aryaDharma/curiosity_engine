// src/services/llm/promptBuilder.ts - KNOWLEDGE-BASED VERSION

import { Tag } from "@type/tag.types";
import { Spark } from "@type/spark.types";
import { ConceptCluster, ConceptNode } from "@type/thread.types";
import { DeepDiveLayer } from "@/types/deepdive.types";

class PromptBuilder {
  buildQuickLearnPrompt(
    tags: Tag[],
    difficulty: number // 0.0-1.0 (0=beginner, 1=expert)
  ): { system: string; user: string } {
    const system = `You are an educational knowledge generator. Your task is to create FACTUAL, EDUCATIONAL content that teaches specific knowledge.

YOUR OUTPUT FORMAT (STRICT JSON):
{
  "question": "Clear factual question in Indonesian",
  "knowledge": "Factual explanation 80-150 words in Indonesian",
  "funFact": "Interesting trivia related to the topic in Indonesian",
  "application": "How this knowledge is useful in real life in Indonesian",
  "conceptLinks": ["concept1", "concept2", "concept3"]
}

RULES - CRITICAL:
1. Question MUST be answerable with FACTS, not opinions
2. Knowledge MUST contain verified information, specific data, concrete examples
3. Avoid philosophical speculation - focus on WHAT IS, HOW IT WORKS, WHY IT HAPPENS
4. Use clear, educational language
5. Fun fact must be surprising but TRUE
6. Application must be practical and relevant
7. ALL TEXT MUST BE IN INDONESIAN
8. conceptLinks MUST be 2-4 concrete concepts (not abstract)

DIFFICULTY LEVEL: ${this.describeDifficultyLevel(difficulty)}

BANNED PHRASES: "mungkin", "bisa jadi", "seandainya", "bagaimana jika"
USE INSTEAD: "adalah", "terjadi karena", "berfungsi dengan", "menghasilkan"`;

    const tagNames = tags.map((t) => t.name).join(", ");
    const difficultyLabel = this.describeDifficultyLevel(difficulty);

    const user = `Generate educational content about: ${tagNames}

Difficulty: ${difficultyLabel}
${
  difficulty < 0.3
    ? "Focus on basic facts and fundamental concepts suitable for beginners."
    : difficulty < 0.7
    ? "Include intermediate-level details with some technical depth."
    : "Provide advanced insights with complex mechanisms and edge cases."
}

EXAMPLES OF GOOD QUESTIONS:
- "Mengapa air mendidih pada suhu 100°C?"
- "Bagaimana antibiotik membunuh bakteri?"
- "Apa yang menyebabkan aurora borealis?"

BAD QUESTIONS (DO NOT GENERATE):
- "Apakah kesadaran manusia itu nyata?"
- "Bagaimana kita mendefinisikan kebahagiaan?"

Remember: Output ONLY the JSON object. NO explanations outside JSON.`;

    return { system, user };
  }

  buildDeepDivePrompt(
    tags: Tag[],
    difficulty: number,
    layers: number
  ): { system: string; user: string } {
    const system = `You are creating a PROGRESSIVE KNOWLEDGE JOURNEY with ${layers} layers of increasing depth.

Each layer builds factual understanding step-by-step:
- Layer 1: Basic facts and definitions
- Layer 2: How it works (mechanisms)
- Layer 3: Real-world examples and applications
- Layer 4+: Advanced insights, exceptions, cutting-edge knowledge

OUTPUT FORMAT (STRICT JSON):
{
  "layers": [
    {
      "layer": 1,
      "spark": "Foundational question in Indonesian",
      "branches": ["Branch A: specific angle in Indonesian", "Branch B: alternative angle in Indonesian"]
    }
  ]
}

RULES:
- Each spark MUST be educational and factual
- Branches offer different aspects to explore (not just opinions)
- Progressive depth: each layer goes deeper than the last
- Use concrete examples, data, and verified information
- ALL TEXT IN INDONESIAN
- Difficulty: ${this.describeDifficultyLevel(difficulty)}`;

    const tagNames = tags.map((t) => t.name).join(", ");

    const user = `Create a ${layers}-layer knowledge journey about: ${tagNames}

Difficulty: ${this.describeDifficultyLevel(difficulty)}

Structure example:
Layer 1: "Apa itu fotosintesis?" → Branches: [how it works, why it matters]
Layer 2: "Bagaimana klorofil menangkap cahaya?" → Branches: [light absorption, energy conversion]
Layer 3: "Mengapa tanaman berbeda warna?" → Branches: [pigments, adaptations]
Layer 4: "Bagaimana C4 plants lebih efisien?" → Branches: [mechanism, evolution]

Each layer should naturally deepen understanding.

Output ONLY the JSON object.`;

    return { system, user };
  }

  buildKnowledgeGraphPrompt(
    tags: Tag[],
    clusters: ConceptCluster[],
    recentSparks: Spark[],
    difficulty: number
  ): { system: string; user: string } {
    const system = `You generate KNOWLEDGE CONNECTIONS - showing how different fields of knowledge relate through FACTS.

YOUR TASK:
1. Analyze existing knowledge domains the user has explored
2. Identify a meaningful connection between 2+ domains
3. Create a question that bridges these domains with FACTUAL relationships
4. Provide concrete examples of how these fields interconnect

OUTPUT FORMAT (STRICT JSON):
{
  "clusterSummary": "Brief analysis of knowledge domains in Indonesian (1-2 sentences)",
  "newSpark": "A question connecting multiple domains in Indonesian",
  "conceptReinforcement": ["concept1", "concept2", "new_connecting_concept"]
}

RULES:
- Connection must be FACTUAL and verifiable
- Show real-world examples where domains intersect
- Avoid vague philosophical connections
- Focus on HOW knowledge from one field APPLIES to another
- ALL TEXT IN INDONESIAN
- conceptReinforcement: 2-4 items (concrete concepts only)`;

    const tagNames = tags.map((t) => t.name).join(", ");
    const clusterSummary = clusters
      .map((c) => `${c.name}: ${c.concepts.length} konsep`)
      .join(", ");

    const recentSparksSummary = recentSparks
      .slice(0, 3)
      .map((s) => `- ${s.text.substring(0, 80)}...`)
      .join("\n");

    const user = `Current knowledge domains: ${tagNames}

Explored clusters:
${clusterSummary || "No clusters yet"}

Recent learning:
${recentSparksSummary || "No recent sparks"}

Difficulty: ${this.describeDifficultyLevel(difficulty)}

EXAMPLE OF GOOD KNOWLEDGE GRAPH QUESTION:
"Bagaimana prinsip aerodinamika (Physics) digunakan dalam evolusi burung (Biology) 
 dan menginspirasi desain pesawat (Engineering)?"

Generate a question that CONNECTS different knowledge domains with factual relationships.

Output ONLY the JSON object.`;

    return { system, user };
  }

  buildKnowledgeGraphFromClusterPrompt(
    cluster: ConceptCluster,
    conceptNodes: ConceptNode[],
    historySparks: Spark[],
    difficulty: number
  ): { system: string; user: string } {
    const system = `You are continuing a KNOWLEDGE JOURNEY within the "${
      cluster.name
    }" domain.

Your task:
1. Build on existing knowledge in this cluster
2. Introduce NEW factual information that extends understanding
3. Maintain ${Math.round(cluster.coherence * 100)}% coherence with the theme
4. Add ${Math.round(difficulty * 100)}% difficulty/depth

OUTPUT FORMAT (STRICT JSON):
{
  "clusterSummary": "Brief 1-sentence analysis of this knowledge domain in Indonesian",
  "newSpark": "Educational question extending this domain in Indonesian (under 280 chars)",
  "conceptReinforcement": ["existing_concept1", "existing_concept2", "new_concept"]
}

RULES:
- Reference at least 2 concepts already in this cluster
- Introduce 1 NEW factual concept that enriches the domain
- Question must be EDUCATIONAL and FACTUAL
- ALL TEXT IN INDONESIAN
- This is knowledge chapter ${cluster.sparkCount + 1}`;

    const conceptNames = conceptNodes.map((n) => n.name).join(", ");
    const dominantConcepts = conceptNodes
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map((n) => n.name)
      .join(", ");

    const recentSparksSummary =
      historySparks.length > 0
        ? historySparks
            .slice(0, 3)
            .map((s, i) => `${i + 1}. "${s.text.substring(0, 80)}..."`)
            .join("\n")
        : "No previous learning in this domain yet.";

    const user = `KNOWLEDGE DOMAIN: "${cluster.name}"
Coherence: ${Math.round(cluster.coherence * 100)}%
Learning progress: ${cluster.sparkCount} sparks explored
Concepts: ${conceptNames}

DOMINANT THEMES:
${dominantConcepts}

RECENT LEARNING:
${recentSparksSummary}

DIFFICULTY: ${this.describeDifficultyLevel(difficulty)}

Generate educational content that:
- Builds on concepts: ${dominantConcepts.split(", ")[0]}, ${
      dominantConcepts.split(", ")[1] || conceptNames.split(", ")[0]
    }
- Introduces 1 new related concept with factual information
- Maintains domain coherence while adding depth

Output ONLY the JSON object.`;

    return { system, user };
  }

  buildConceptExtractionPrompt(sparkText: string): {
    system: string;
    user: string;
  } {
    const system = `You extract KEY KNOWLEDGE CONCEPTS from educational content in Indonesian.

Identify 2-5 concrete concepts that represent the main knowledge areas.
Concepts should be:
- Specific and concrete (e.g., "fotosintesis", "hukum gravitasi", "DNA")
- Knowledge domains or fields (e.g., "biologi sel", "mekanika klasik")
- NOT vague or abstract (avoid "kesadaran", "eksistensi")
- Factual terms that can be studied

OUTPUT ONLY valid JSON:
{
  "concepts": ["concept1", "concept2", "concept3"]
}`;

    const user = `Extract key knowledge concepts from this Indonesian spark:

"${sparkText}"

Remember: Output ONLY the JSON object with 2-5 concrete concepts.`;

    return { system, user };
  }

  private describeDifficultyLevel(difficulty: number): string {
    if (difficulty < 0.2)
      return "Beginner - Basic facts and simple explanations";
    if (difficulty < 0.4)
      return "Elementary - Fundamental concepts with some detail";
    if (difficulty < 0.6)
      return "Intermediate - Technical depth with mechanisms";
    if (difficulty < 0.8) return "Advanced - Complex systems and edge cases";
    return "Expert - Cutting-edge knowledge and specialized insights";
  }

  buildSystemPromptForMode(mode: 1 | 2 | 3): string {
    switch (mode) {
      case 1:
        return "You generate factual, educational flashcard-style content.";
      case 2:
        return "You generate progressive knowledge layers building from basics to advanced.";
      case 3:
        return "You generate questions connecting multiple knowledge domains with facts.";
      default:
        return "You generate educational knowledge content.";
    }
  }

  buildThreadPackPrompt(
    cluster: ConceptCluster,
    conceptNodes: ConceptNode[],
    historySparks: Spark[],
    difficulty: number
  ): { system: string; user: string } {
    const system = `You are generating a KNOWLEDGE PACK - 4 connected educational questions continuing a learning journey.

STRUCTURE:
1. CONTINUATION SPARK - Direct next step building on recent learning
2. DERIVED SPARK 1 - Alternative angle exploring the same domain
3. DERIVED SPARK 2 - Another perspective on the domain
4. WILDCARD SPARK - Connection to a different but related field (${Math.round(
      difficulty * 100
    )}% difficulty)

ALL sparks must:
- Be FACTUAL and EDUCATIONAL
- Build on cluster "${cluster.name}" theme
- Reference existing concepts
- Teach something NEW and CONCRETE
- ALL IN INDONESIAN
- Each under 280 characters

OUTPUT ONLY valid JSON:
{
  "clusterSummary": "Brief analysis of knowledge domain in Indonesian",
  "continuationSpark": "Main next step question in Indonesian",
  "derivedSparks": [
    "Alternative angle in Indonesian",
    "Another perspective in Indonesian"
  ],
  "wildcardSpark": "Cross-domain connection in Indonesian",
  "conceptReinforcement": ["concept1", "concept2", "new_concept"]
}

RULES:
- Continuation builds directly on most recent learning
- Derived sparks offer parallel explorations of the same domain
- Wildcard introduces controlled novelty from related field
- All 4 sparks = one cohesive learning journey
- ALL TEXT IN INDONESIAN`;

    const conceptNames = conceptNodes.map((n) => n.name).join(", ");
    const dominantConcepts = conceptNodes
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map((n) => n.name)
      .join(", ");

    const recentSparksSummary =
      historySparks.length > 0
        ? historySparks
            .slice(0, 3)
            .map((s, i) => `${i + 1}. "${s.text.substring(0, 80)}..."`)
            .join("\n")
        : "No previous learning in this domain yet.";

    const mostRecentSpark = historySparks[0]?.text || "No previous spark";

    const user = `KNOWLEDGE DOMAIN: "${cluster.name}"
Coherence: ${Math.round(cluster.coherence * 100)}%
Learning progress: ${cluster.sparkCount} sparks explored
Concepts: ${conceptNames}

DOMINANT THEMES:
${dominantConcepts}

MOST RECENT LEARNING:
"${mostRecentSpark}"

PREVIOUS LEARNING:
${recentSparksSummary}

DIFFICULTY: ${this.describeDifficultyLevel(difficulty)}

Generate a Knowledge Pack of 4 connected educational questions:
1. CONTINUATION: Natural next learning step after most recent
2. DERIVED 1: Alternative angle on same theme (factual)
3. DERIVED 2: Another perspective on theme (factual)
4. WILDCARD: Connection to related domain (factual)

Make them feel like one cohesive learning journey with 4 chapters.

Output ONLY the JSON object.`;

    return { system, user };
  }

  buildDeepDiveLayerPrompt(
    seedSparkText: string,
    currentLayer: number,
    previousLayers: DeepDiveLayer[],
    difficulty: number
  ): { system: string; user: string } {
    const system = `You are creating KNOWLEDGE LAYER ${currentLayer} - deepening understanding progressively.

LAYER ${currentLayer} STRUCTURE:
{
  "explanation": "Factual explanation in Indonesian (150-250 words)",
  "questions": ["Question 1 in Indonesian", "Question 2 in Indonesian"],
  "analogy": "Helpful analogy in Indonesian (optional)",
  "observation": "Interesting insight in Indonesian"
}

PROGRESSION BY LAYER:
- Layer 1: Basic facts + definitions (what it is)
- Layer 2: Mechanisms + how it works (why it happens)
- Layer 3: Real-world examples + applications (where we see it)
- Layer 4+: Advanced concepts + edge cases (complex scenarios)

RULES:
- Explanation MUST contain FACTUAL information
- Use specific data, numbers, examples
- Questions should guide further learning
- NEVER repeat previous layers
- ALL TEXT IN INDONESIAN
- Difficulty: ${this.describeDifficultyLevel(difficulty)}`;

    const previousContent =
      previousLayers.length > 0
        ? previousLayers
            .map(
              (l) =>
                `LAYER ${l.layer}:
Explanation: ${l.explanation.substring(0, 100)}...
Questions: ${l.questions.join(", ")}`
            )
            .join("\n\n")
        : "No previous layers.";

    const user = `SEED TOPIC:
"${seedSparkText}"

CURRENT LAYER: ${currentLayer}
${previousLayers.length > 0 ? "PREVIOUS LAYERS:\n" + previousContent : ""}

DIFFICULTY: ${this.describeDifficultyLevel(difficulty)}

Generate Layer ${currentLayer} that:
- Goes deeper than Layer ${currentLayer - 1 || 1}
- Does NOT repeat previous content
${
  currentLayer === 1
    ? "- Explains the BASIC FACTS clearly with definitions"
    : currentLayer === 2
    ? "- Reveals MECHANISMS and WHY things work this way"
    : currentLayer === 3
    ? "- Provides REAL EXAMPLES and WHERE we see this"
    : "- Explores ADVANCED concepts, EDGE CASES, and complex scenarios"
}

Output ONLY the JSON object.`;

    return { system, user };
  }

  buildDeepDiveSynthesisPrompt(
    seedSparkText: string,
    allLayers: DeepDiveLayer[]
  ): { system: string; user: string } {
    const system = `You are synthesizing a KNOWLEDGE JOURNEY. Create a closing summary that ties everything together.

OUTPUT STRUCTURE:
{
  "summary": "2-3 sentence recap of knowledge gained in Indonesian",
  "bigIdea": "The ONE key takeaway in Indonesian (1 sentence)",
  "nextSteps": ["Related topic 1", "Related topic 2", "Related topic 3"],
  "clusterConnection": "Optional: which knowledge domain this relates to"
}

This is the ENDING of a learning journey. Make it feel complete.
ALL TEXT IN INDONESIAN.

Output ONLY valid JSON.`;

    const layersSummary = allLayers
      .map(
        (l) =>
          `Layer ${l.layer}: ${l.explanation.substring(
            0,
            80
          )}...\nKey questions: ${l.questions.join(", ")}`
      )
      .join("\n\n");

    const user = `SEED TOPIC:
"${seedSparkText}"

COMPLETE LEARNING JOURNEY:
${layersSummary}

Create a synthesis that:
- Summarizes what we learned (factual recap)
- Captures the BIG TAKEAWAY (most important concept)
- Suggests WHERE to learn next (related topics)
- (Optional) Links to relevant knowledge domain

Output ONLY the JSON object.`;

    return { system, user };
  }
}

export default new PromptBuilder();
