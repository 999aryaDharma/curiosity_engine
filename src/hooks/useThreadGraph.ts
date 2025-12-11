// src/hooks/useThreadGraph.ts

import { useEffect, useCallback, useMemo } from "react";
import { useThreadStore } from "@stores/threadStore";
import { ConceptNode, ConceptLink } from "@type/thread.types";

export const useThreadGraph = () => {
  const {
    nodes,
    links,
    clusters,
    selectedCluster,
    isLoading,
    error,
    loadGraph,
    detectClusters,
    selectCluster,
    deselectCluster,
    getMostConnected,
    resetGraph,
  } = useThreadStore();

  useEffect(() => {
    loadGraph();
  }, []);

  const stats = useMemo(() => {
    const totalConcepts = nodes.length;
    const totalLinks = links.length;
    const totalClusters = clusters.length;

    const avgWeight =
      nodes.length > 0
        ? nodes.reduce((sum, n) => sum + n.weight, 0) / nodes.length
        : 0;

    const avgStrength =
      links.length > 0
        ? links.reduce((sum, l) => sum + l.strength, 0) / links.length
        : 0;

    const avgCoherence =
      clusters.length > 0
        ? clusters.reduce((sum, c) => sum + c.coherence, 0) / clusters.length
        : 0;

    return {
      totalConcepts,
      totalLinks,
      totalClusters,
      avgWeight,
      avgStrength,
      avgCoherence,
    };
  }, [nodes, links, clusters]);

  const getConceptNeighbors = useCallback(
    (conceptId: string): ConceptNode[] => {
      const neighborIds = new Set<string>();

      links.forEach((link) => {
        if (link.conceptA === conceptId) {
          neighborIds.add(link.conceptB);
        } else if (link.conceptB === conceptId) {
          neighborIds.add(link.conceptA);
        }
      });

      return nodes.filter((node) => neighborIds.has(node.id));
    },
    [nodes, links]
  );

  const getConceptLinks = useCallback(
    (conceptId: string): ConceptLink[] => {
      return links.filter(
        (link) => link.conceptA === conceptId || link.conceptB === conceptId
      );
    },
    [links]
  );

  const getStrongLinks = useCallback(
    (threshold: number = 0.5): ConceptLink[] => {
      return links.filter((link) => link.strength >= threshold);
    },
    [links]
  );

  const findPath = useCallback(
    (fromId: string, toId: string, maxDepth: number = 3): string[] | null => {
      const visited = new Set<string>();
      const queue: { id: string; path: string[] }[] = [
        { id: fromId, path: [fromId] },
      ];

      while (queue.length > 0) {
        const { id, path } = queue.shift()!;

        if (id === toId) {
          return path;
        }

        if (path.length > maxDepth) {
          continue;
        }

        visited.add(id);

        const neighbors = getConceptNeighbors(id);
        neighbors.forEach((neighbor) => {
          if (!visited.has(neighbor.id)) {
            queue.push({
              id: neighbor.id,
              path: [...path, neighbor.id],
            });
          }
        });
      }

      return null;
    },
    [getConceptNeighbors]
  );

  const refreshAndDetectClusters = useCallback(async () => {
    await loadGraph();
    await detectClusters();
  }, [loadGraph, detectClusters]);

  const isEmpty = nodes.length === 0;
  const hasData = nodes.length > 0;

  return {
    nodes,
    links,
    clusters,
    selectedCluster,
    isLoading,
    error,
    stats,
    isEmpty,
    hasData,
    loadGraph,
    detectClusters,
    selectCluster,
    deselectCluster,
    getMostConnected,
    getConceptNeighbors,
    getConceptLinks,
    getStrongLinks,
    findPath,
    refreshAndDetectClusters,
    resetGraph,
  };
};
