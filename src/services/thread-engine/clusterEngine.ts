// src/services/thread-engine/clusterEngine.ts

import {
  ConceptCluster,
  ConceptNode,
  ConceptLink,
  ClusterAnalysisResult,
} from "@type/thread.types";
import {sqliteService} from "@services/storage/sqliteService";
import conceptGraphEngine from "./conceptGraph";
import { safeJSONParse, safeJSONStringify } from "@utils/jsonUtils";
import { v4 as uuidv4 } from "uuid";

class ClusterEngine {
  async detectClusters(): Promise<ConceptCluster[]> {
    const nodes = await conceptGraphEngine.getAllConcepts();
    const links = await conceptGraphEngine.getAllLinks();

    if (nodes.length === 0) return [];

    const clusters = this.clusterByDensity(nodes, links);

    for (const cluster of clusters) {
      await this.saveCluster(cluster);
    }

    return clusters;
  }

  private clusterByDensity(
    nodes: ConceptNode[],
    links: ConceptLink[]
  ): ConceptCluster[] {
    const adjacencyMap = new Map<string, Set<string>>();

    nodes.forEach((node) => {
      adjacencyMap.set(node.id, new Set());
    });

    links.forEach((link) => {
      if (link.strength >= 0.3) {
        adjacencyMap.get(link.conceptA)?.add(link.conceptB);
        adjacencyMap.get(link.conceptB)?.add(link.conceptA);
      }
    });

    const visited = new Set<string>();
    const clusters: ConceptCluster[] = [];

    for (const node of nodes) {
      if (visited.has(node.id)) continue;

      const clusterNodes = this.expandCluster(node.id, adjacencyMap, visited);

      if (clusterNodes.size > 1) {
        const clusterName = this.generateClusterName(clusterNodes, nodes);

        const coherence = this.calculateCoherence(clusterNodes, links);

        clusters.push({
          id: uuidv4(),
          name: clusterName,
          concepts: Array.from(clusterNodes),
          coherence,
          sparkCount: this.calculateSparkCount(clusterNodes, nodes),
          lastUpdated: Date.now(),
        });
      }
    }

    return clusters;
  }

  private expandCluster(
    startNodeId: string,
    adjacencyMap: Map<string, Set<string>>,
    visited: Set<string>
  ): Set<string> {
    const cluster = new Set<string>();
    const queue = [startNodeId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      if (visited.has(currentId)) continue;

      visited.add(currentId);
      cluster.add(currentId);

      const neighbors = adjacencyMap.get(currentId);
      if (neighbors) {
        neighbors.forEach((neighborId) => {
          if (!visited.has(neighborId)) {
            queue.push(neighborId);
          }
        });
      }
    }

    return cluster;
  }

  private generateClusterName(
    conceptIds: Set<string>,
    allNodes: ConceptNode[]
  ): string {
    const clusterNodes = allNodes.filter((n) => conceptIds.has(n.id));
    clusterNodes.sort((a, b) => b.weight - a.weight);

    const topConcepts = clusterNodes.slice(0, 3).map((n) => n.name);

    return topConcepts.join(" & ");
  }

  private calculateCoherence(
    conceptIds: Set<string>,
    allLinks: ConceptLink[]
  ): number {
    const relevantLinks = allLinks.filter(
      (link) => conceptIds.has(link.conceptA) && conceptIds.has(link.conceptB)
    );

    if (relevantLinks.length === 0) return 0.5;

    const avgStrength =
      relevantLinks.reduce((sum, link) => sum + link.strength, 0) /
      relevantLinks.length;

    const maxPossibleLinks = (conceptIds.size * (conceptIds.size - 1)) / 2;
    const linkDensity = relevantLinks.length / maxPossibleLinks;

    return avgStrength * 0.7 + linkDensity * 0.3;
  }

  private calculateSparkCount(
    conceptIds: Set<string>,
    allNodes: ConceptNode[]
  ): number {
    const clusterNodes = allNodes.filter((n) => conceptIds.has(n.id));
    const allSparkIds = new Set<string>();

    clusterNodes.forEach((node) => {
      node.sparkIds.forEach((id) => allSparkIds.add(id));
    });

    return allSparkIds.size;
  }

  async saveCluster(cluster: ConceptCluster): Promise<void> {
    const existing = await this.getClusterByName(cluster.name);

    if (existing) {
      await sqliteService.update(
        "concept_clusters",
        {
          concepts: JSON.stringify(cluster.concepts),
          coherence: cluster.coherence,
          spark_count: cluster.sparkCount,
          last_updated: cluster.lastUpdated,
        },
        "id = ?",
        [existing.id]
      );
    } else {
      await sqliteService.insert("concept_clusters", {
        id: cluster.id,
        name: cluster.name,
        description: cluster.description || null,
        concepts: JSON.stringify(cluster.concepts),
        coherence: cluster.coherence,
        spark_count: cluster.sparkCount,
        last_updated: cluster.lastUpdated,
      });
    }
  }

  async getClusterById(id: string): Promise<ConceptCluster | null> {
    const rows = await sqliteService.query<any>(
      `SELECT * FROM concept_clusters WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapRowToCluster(rows[0]);
  }

  async getClusterByName(name: string): Promise<ConceptCluster | null> {
    const rows = await sqliteService.query<any>(
      `SELECT * FROM concept_clusters WHERE name = ? LIMIT 1`,
      [name]
    );

    if (rows.length === 0) return null;

    return this.mapRowToCluster(rows[0]);
  }

  async getAllClusters(): Promise<ConceptCluster[]> {
    const rows = await sqliteService.query<any>(
      `SELECT * FROM concept_clusters ORDER BY coherence DESC, spark_count DESC`
    );

    return rows.map(this.mapRowToCluster);
  }

  async analyzeCluster(
    clusterId: string
  ): Promise<ClusterAnalysisResult | null> {
    const cluster = await this.getClusterById(clusterId);
    if (!cluster) return null;

    const nodes = await Promise.all(
      cluster.concepts.map((id) => conceptGraphEngine.getConceptById(id))
    );

    const validNodes = nodes.filter((n): n is ConceptNode => n !== null);

    validNodes.sort((a, b) => b.weight - a.weight);

    const dominantConcepts = validNodes.slice(0, 3).map((n) => n.name);

    const weakConcepts = validNodes.slice(-3).map((n) => n.name);

    return {
      clusterId: cluster.id,
      clusterName: cluster.name,
      dominantConcepts,
      weakConcepts,
    };
  }

  async rebalanceClusters(): Promise<void> {
    const clusters = await this.getAllClusters();

    for (const cluster of clusters) {
      const nodes = await Promise.all(
        cluster.concepts.map((id) => conceptGraphEngine.getConceptById(id))
      );

      const validNodes = nodes.filter((n): n is ConceptNode => n !== null);

      const avgWeight =
        validNodes.reduce((sum, n) => sum + n.weight, 0) / validNodes.length;
      const variance =
        validNodes.reduce(
          (sum, n) => sum + Math.pow(n.weight - avgWeight, 2),
          0
        ) / validNodes.length;

      if (variance > 0.3) {
        console.log(
          `[ClusterEngine] High variance in cluster ${cluster.name}, consider splitting`
        );
      }
    }
  }

  async deleteCluster(id: string): Promise<void> {
    await sqliteService.delete("concept_clusters", "id = ?", [id]);
  }

  private mapRowToCluster(row: any): ConceptCluster {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      concepts: safeJSONParse(row.concepts, []),
      coherence: row.coherence,
      sparkCount: row.spark_count,
      lastUpdated: row.last_updated,
    };
  }
}

export default new ClusterEngine();
