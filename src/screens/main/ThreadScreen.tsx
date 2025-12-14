// src/screens/main/ThreadScreen.tsx - ULTRA SAFE VERSION

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThreadStore } from "@stores/threadStore";
import { SoftCard, ModeCard } from "@components/common/Card";
import Button from "@components/common/Button";
import LoadingSpinner from "@components/common/LoadingSpinner";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
} from "@constants/colors";

interface ThreadScreenProps {
  navigation: any;
}

export const ThreadScreen: React.FC<ThreadScreenProps> = ({ navigation }) => {
  const { clusters, stats, isLoading, loadGraph, detectClusters } =
    useThreadStore();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [animatedStats, setAnimatedStats] = useState({
    clusters: 0,
    concepts: 0,
    sparks: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading && stats.totalConcepts > 0) {
      animateStats();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, stats]);

  const loadData = async () => {
    try {
      await loadGraph();
      if (!clusters || clusters.length === 0) {
        await detectClusters();
      }
    } catch (error) {
      console.error("[ThreadScreen] Load failed:", error);
    }
  };

  const animateStats = () => {
    const duration = 1000;
    const steps = 30;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      // DEFENSIVE: Ensure clusters is array
      const safeClusters = Array.isArray(clusters) ? clusters : [];

      setAnimatedStats({
        clusters: Math.round(stats.totalClusters * progress),
        concepts: Math.round(stats.totalConcepts * progress),
        sparks: Math.round(
          (safeClusters.reduce((sum, c) => sum + (c?.sparkCount || 0), 0) ||
            0) * progress
        ),
      });

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedStats({
          clusters: stats.totalClusters,
          concepts: stats.totalConcepts,
          sparks: safeClusters.reduce(
            (sum, c) => sum + (c?.sparkCount || 0),
            0
          ),
        });
      }
    }, interval);
  };

  const handleClusterPress = (clusterId: string) => {
    navigation.navigate("ClusterJourney", { clusterId });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner
            variant="pulse"
            size="large"
            message="Loading your concept map..."
          />
        </View>
      </SafeAreaView>
    );
  }

  const isEmpty = stats.totalConcepts === 0;
  const clusterColors = ["mint", "coral", "sky", "rose", "sunny"] as const;

  // DEFENSIVE: Ensure clusters is ALWAYS an array
  const safeClusters = Array.isArray(clusters) ? clusters : [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thread 🧵</Text>
        <TouchableOpacity
          style={styles.addButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isEmpty ? (
          // Empty State
          <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
            <Text style={styles.emptyEmoji}>✨🧵💡</Text>
            <Text style={styles.emptyTitle}>Build Your Thread</Text>
            <Text style={styles.emptyDescription}>
              Generate sparks to build a concept map that connects your
              curiosities
            </Text>

            <SoftCard style={styles.infoCard}>
              <Text style={styles.infoTitle}>How it works:</Text>
              <Text style={styles.infoItem}>• Generate sparks in any mode</Text>
              <Text style={styles.infoItem}>
                • Concepts are automatically extracted
              </Text>
              <Text style={styles.infoItem}>• Related ideas form clusters</Text>
              <Text style={styles.infoItem}>
                • Continue exploring with Thread Packs
              </Text>
            </SoftCard>

            <Button
              title="Generate First Spark"
              onPress={() => navigation.navigate("QuickSpark")}
              variant="gradient"
              size="large"
              fullWidth
            />
          </Animated.View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <SoftCard style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Text style={styles.statEmoji}>🎯</Text>
                </View>
                <Text style={styles.statNumber}>{animatedStats.clusters}</Text>
                <Text style={styles.statLabel}>Clusters</Text>
              </SoftCard>

              <SoftCard style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Text style={styles.statEmoji}>💡</Text>
                </View>
                <Text style={styles.statNumber}>{animatedStats.concepts}</Text>
                <Text style={styles.statLabel}>Concepts</Text>
              </SoftCard>

              <SoftCard style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Text style={styles.statEmoji}>✨</Text>
                </View>
                <Text style={styles.statNumber}>{animatedStats.sparks}</Text>
                <Text style={styles.statLabel}>Sparks</Text>
              </SoftCard>
            </View>

            {/* Your Clusters Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Clusters</Text>

              {/* DEFENSIVE CHECK: Only map if safeClusters has items */}
              {safeClusters.length === 0 ? (
                <SoftCard style={styles.emptyCard}>
                  <Text style={styles.emptyText}>
                    No clusters yet. Keep generating sparks!
                  </Text>
                </SoftCard>
              ) : (
                safeClusters.map((cluster, index) => {
                  // DEFENSIVE: Ensure cluster exists
                  if (!cluster || !cluster.id) {
                    console.warn(
                      "[ThreadScreen] Invalid cluster at index:",
                      index
                    );
                    return null;
                  }

                  const coherencePercent = Math.round(
                    (cluster.coherence || 0) * 100
                  );
                  const colorIndex = index % clusterColors.length;
                  const color = clusterColors[colorIndex];

                  return (
                    <Animated.View
                      key={cluster.id}
                      style={{
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateY: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [30 * (index + 1), 0],
                            }),
                          },
                        ],
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => handleClusterPress(cluster.id)}
                        activeOpacity={0.9}
                      >
                        <ModeCard color={color} style={styles.clusterCard}>
                          <View style={styles.clusterHeader}>
                            <View style={styles.clusterIconContainer}>
                              <Text style={styles.clusterIcon}>🧠</Text>
                            </View>
                            <View style={styles.clusterTitleContainer}>
                              <Text style={styles.clusterName}>
                                {cluster.name || "Unnamed Cluster"}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.clusterStats}>
                            <View style={styles.clusterStatItem}>
                              <Text style={styles.clusterStatNumber}>
                                {Array.isArray(cluster.concepts)
                                  ? cluster.concepts.length
                                  : 0}
                              </Text>
                              <Text style={styles.clusterStatLabel}>
                                concepts
                              </Text>
                            </View>

                            <View style={styles.clusterStatDivider} />

                            <View style={styles.clusterStatItem}>
                              <Text style={styles.clusterStatNumber}>
                                {cluster.sparkCount || 0}
                              </Text>
                              <Text style={styles.clusterStatLabel}>
                                sparks
                              </Text>
                            </View>
                          </View>

                          {/* Progress Bar */}
                          <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                              <Animated.View
                                style={[
                                  styles.progressFill,
                                  {
                                    width: `${coherencePercent}%`,
                                    opacity: fadeAnim,
                                  },
                                ]}
                              />
                            </View>
                            <Text style={styles.progressText}>
                              {coherencePercent}% coherence
                            </Text>
                          </View>

                          <View style={styles.exploreRow}>
                            <Text style={styles.exploreText}>
                              Tap to view journey →
                            </Text>
                          </View>
                        </ModeCard>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Refresh Clusters"
                onPress={async () => {
                  fadeAnim.setValue(0);
                  await detectClusters();
                  await loadGraph();
                }}
                variant="soft"
                size="medium"
                fullWidth
                style={styles.refreshButton}
              />
            </View>
          </Animated.View>
        )}

        <View style={{ height: SPACING.huge }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.offWhite,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.neutral.black,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary.main,
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    fontSize: 24,
    color: COLORS.neutral.white,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  scrollContent: {
    paddingHorizontal: SPACING.base,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING.huge,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.base,
    color: COLORS.neutral.gray600,
    textAlign: "center",
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    lineHeight: FONT_SIZES.base * 1.5,
  },
  infoCard: {
    width: "100%",
    marginBottom: SPACING.xl,
    padding: SPACING.base,
  },
  infoTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.black,
    marginBottom: SPACING.sm,
  },
  infoItem: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray600,
    marginVertical: SPACING.xs / 2,
    lineHeight: FONT_SIZES.sm * 1.4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    padding: SPACING.md,
    alignItems: "center",
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.xxl,
    backgroundColor: COLORS.neutral.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  statEmoji: {
    fontSize: 24,
  },
  statNumber: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
    marginBottom: SPACING.xs / 2,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.gray600,
    fontWeight: FONT_WEIGHTS.medium,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
    marginBottom: SPACING.md,
  },
  emptyCard: {
    padding: SPACING.lg,
    alignItems: "center",
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray600,
    textAlign: "center",
  },
  clusterCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  clusterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  clusterIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.xxl,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  clusterIcon: {
    fontSize: 24,
  },
  clusterTitleContainer: {
    flex: 1,
  },
  clusterName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.white,
  },
  clusterStats: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  clusterStatItem: {
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  clusterStatNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.white,
  },
  clusterStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.white,
    opacity: 0.8,
    fontWeight: FONT_WEIGHTS.medium,
  },
  clusterStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.neutral.white,
    opacity: 0.3,
  },
  progressContainer: {
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: BORDER_RADIUS.full,
    overflow: "hidden",
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.white,
    opacity: 0.8,
    textAlign: "center",
    fontWeight: FONT_WEIGHTS.medium,
  },
  exploreRow: {
    alignItems: "center",
    marginTop: SPACING.xs,
  },
  exploreText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.white,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  actions: {
    marginTop: SPACING.lg,
  },
  refreshButton: {
    marginBottom: SPACING.sm,
  },
});

export default ThreadScreen;
