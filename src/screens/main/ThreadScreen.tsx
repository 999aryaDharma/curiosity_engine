// src/screens/main/ThreadScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThreadStore } from "@stores/threadStore";
import { useSparkStore } from "@stores/sparkStore";
import { useTagStore } from "@stores/tagStore";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "@constants/colors";

interface ThreadScreenProps {
  navigation: any;
}

export const ThreadScreen: React.FC<ThreadScreenProps> = ({ navigation }) => {
  const { clusters, stats, isLoading, loadGraph, detectClusters } = useThreadStore();
  const { generateWithMode, isGenerating } = useSparkStore();
  const { dailyTags } = useTagStore();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await loadGraph();
    if (clusters.length === 0) {
      await detectClusters();
    }

    // Animate entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const handleGenerateFromCluster = async (clusterId: string) => {
    if (dailyTags.length === 0) {
      Alert.alert("No Tags", "Please select tags first");
      return;
    }

    try {
      await generateWithMode(3, dailyTags);
      // Navigate to result or show success
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner
            variant="pulse"
            size="large"
            message="Loading your concept map... 🧵"
          />
        </View>
      </SafeAreaView>
    );
  }

  const isEmpty = stats.totalConcepts === 0;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#FFFFFF", "#FEF3F7"]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🧵 Thread</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {isEmpty ? (
            // Empty State
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🧵🔗✨</Text>
              <Text style={styles.emptyTitle}>Build Your Thread</Text>
              <Text style={styles.emptyDescription}>
                Generate sparks to build a concept map that connects your
                curiosities
              </Text>

              <Card variant="elevated" style={styles.infoCard}>
                <Text style={styles.infoTitle}>🎯 How it works:</Text>
                <Text style={styles.infoItem}>
                  • Generate sparks in any mode
                </Text>
                <Text style={styles.infoItem}>
                  • Concepts are automatically extracted
                </Text>
                <Text style={styles.infoItem}>
                  • Related ideas form clusters
                </Text>
                <Text style={styles.infoItem}>
                  • Get recommendations based on your graph
                </Text>
              </Card>

              <Button
                title="Generate First Spark 🚀"
                onPress={() => navigation.navigate("QuickSpark")}
                variant="gradient"
                size="large"
                fullWidth
              />
            </View>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Stats Overview */}
              <Card
                variant="gradient"
                gradientColors={COLORS.gradients.candy}
                style={styles.statsCard}
              >
                <Text style={styles.statsTitle}>Your Concept Map 🗺️</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.totalConcepts}</Text>
                    <Text style={styles.statLabel}>Concepts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.totalLinks}</Text>
                    <Text style={styles.statLabel}>Connections</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.totalClusters}</Text>
                    <Text style={styles.statLabel}>Clusters</Text>
                  </View>
                </View>
              </Card>

              {/* Clusters */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Concept Clusters 🌟</Text>
                <Text style={styles.sectionSubtitle}>
                  Your ideas organized by themes
                </Text>

                {clusters.map((cluster) => {
                  const coherencePercent = Math.round(cluster.coherence * 100);
                  const clusterColor =
                    COLORS.clusters[
                      cluster.name.toLowerCase() as keyof typeof COLORS.clusters
                    ] || COLORS.primary.main;

                  return (
                    <TouchableOpacity
                      key={cluster.id}
                      onPress={() => handleGenerateFromCluster(cluster.id)}
                      activeOpacity={0.8}
                    >
                      <Card variant="elevated" style={styles.clusterCard}>
                        <View style={styles.clusterHeader}>
                          <View
                            style={[
                              styles.clusterDot,
                              { backgroundColor: clusterColor },
                            ]}
                          />
                          <Text style={styles.clusterName}>{cluster.name}</Text>
                        </View>

                        <View style={styles.clusterStats}>
                          <View style={styles.clusterStatItem}>
                            <Text style={styles.clusterStatNumber}>
                              {cluster.concepts.length}
                            </Text>
                            <Text style={styles.clusterStatLabel}>
                              concepts
                            </Text>
                          </View>
                          <View style={styles.clusterStatItem}>
                            <Text style={styles.clusterStatNumber}>
                              {cluster.sparkCount}
                            </Text>
                            <Text style={styles.clusterStatLabel}>sparks</Text>
                          </View>
                          <View style={styles.clusterStatItem}>
                            <Text
                              style={[
                                styles.clusterStatNumber,
                                { color: clusterColor },
                              ]}
                            >
                              {coherencePercent}%
                            </Text>
                            <Text style={styles.clusterStatLabel}>
                              coherence
                            </Text>
                          </View>
                        </View>

                        <View style={styles.clusterProgress}>
                          <View style={styles.progressTrack}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${coherencePercent}%`,
                                  backgroundColor: clusterColor,
                                },
                              ]}
                            />
                          </View>
                        </View>

                        <TouchableOpacity
                          style={styles.exploreButton}
                          onPress={() => handleGenerateFromCluster(cluster.id)}
                        >
                          <Text
                            style={[
                              styles.exploreButtonText,
                              { color: clusterColor },
                            ]}
                          >
                            Generate from this cluster →
                          </Text>
                        </TouchableOpacity>
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Button
                  title="Generate Thread Spark 🧵"
                  onPress={() => handleGenerateFromCluster(clusters[0]?.id)}
                  variant="gradient"
                  size="large"
                  fullWidth
                  loading={isGenerating}
                />

                <Button
                  title="Refresh Clusters"
                  onPress={async () => {
                    await detectClusters();
                    await loadGraph();
                  }}
                  variant="outline"
                  size="medium"
                  fullWidth
                  style={styles.refreshButton}
                />
              </View>
            </Animated.View>
          )}

          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
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
    fontWeight: "bold",
    color: COLORS.neutral.black,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: "bold",
    color: COLORS.neutral.black,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.neutral.gray600,
    textAlign: "center",
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  infoCard: {
    width: "100%",
    marginBottom: SPACING.xl,
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.neutral.black,
    marginBottom: SPACING.sm,
  },
  infoItem: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray600,
    marginVertical: SPACING.xs,
  },
  statsCard: {
    marginBottom: SPACING.xl,
  },
  statsTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "bold",
    color: COLORS.neutral.white,
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: "bold",
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.white,
    opacity: 0.9,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "bold",
    color: COLORS.neutral.black,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray600,
    marginBottom: SPACING.lg,
  },
  clusterCard: {
    marginBottom: SPACING.md,
  },
  clusterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  clusterDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  clusterName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.neutral.black,
  },
  clusterStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: SPACING.md,
  },
  clusterStatItem: {
    alignItems: "center",
  },
  clusterStatNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "bold",
    color: COLORS.neutral.black,
  },
  clusterStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.gray500,
  },
  clusterProgress: {
    marginBottom: SPACING.md,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.neutral.gray200,
    borderRadius: BORDER_RADIUS.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: BORDER_RADIUS.full,
  },
  exploreButton: {
    paddingVertical: SPACING.sm,
    alignItems: "center",
  },
  exploreButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
  },
  actions: {
    marginTop: SPACING.lg,
  },
  refreshButton: {
    marginTop: SPACING.md,
  },
});

export default ThreadScreen;
