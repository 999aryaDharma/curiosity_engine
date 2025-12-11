// src/screens/main/ThreadScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useThreadStore } from "@stores/threadStore";
import { useSparkStore } from "@stores/sparkStore";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "@constants/colors";

interface ThreadScreenProps {
  navigation: any;
}

export const ThreadScreen: React.FC<ThreadScreenProps> = ({ navigation }) => {
  const { clusters, stats, isLoading, loadGraph, detectClusters } =
    useThreadStore();
  const { currentSpark, generateThreadSparkFromCluster, isGenerating } =
    useSparkStore();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(
    null
  );

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

  // FIXED: Memanggil generateThreadSparkFromCluster dengan clusterId
  const handleGenerateFromCluster = async (clusterId: string) => {
    setSelectedClusterId(clusterId);

    try {
      console.log(`[ThreadScreen] Generating spark from cluster: ${clusterId}`);

      // Ini yang benar: memanggil fungsi yang menerima clusterId
      await generateThreadSparkFromCluster(clusterId);

      // Show success message
      Alert.alert(
        "Spark Generated! ✨",
        "A new thread spark has been created from this cluster.",
        [
          {
            text: "View Spark",
            onPress: () => navigation.navigate("QuickSpark"),
          },
          { text: "Stay Here", style: "cancel" },
        ]
      );
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSelectedClusterId(null);
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

              {/* Explanation Banner */}
              <Card variant="outlined" style={styles.explainCard}>
                <Text style={styles.explainText}>
                  💡 <Text style={styles.explainBold}>Tap a cluster</Text> to
                  generate a new spark that continues exploring that theme.
                </Text>
              </Card>

              {/* Current Spark Display - if exists and mode 3 */}
              {currentSpark && currentSpark.mode === 3 && (
                <Card variant="elevated" style={styles.currentSparkCard}>
                  <View style={styles.sparkHeader}>
                    <Text style={styles.currentSparkTitle}>
                      Latest Thread Spark
                    </Text>
                    <View style={styles.sparkBadge}>
                      <Text style={styles.sparkBadgeText}>NEW</Text>
                    </View>
                  </View>
                  <Text style={styles.currentSparkText}>
                    {currentSpark.text}
                  </Text>
                  <View style={styles.currentSparkActions}>
                    <Button
                      title="View Details"
                      onPress={() => navigation.navigate("QuickSpark")}
                      variant="outline"
                      size="small"
                    />
                  </View>
                </Card>
              )}

              {/* Clusters */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Concept Clusters 🌟</Text>
                <Text style={styles.sectionSubtitle}>
                  Tap to continue exploring
                </Text>

                {clusters.map((cluster) => {
                  const coherencePercent = Math.round(cluster.coherence * 100);
                  const clusterColor =
                    COLORS.clusters[
                      cluster.name.toLowerCase() as keyof typeof COLORS.clusters
                    ] || COLORS.primary.main;

                  const isGeneratingThis =
                    isGenerating && selectedClusterId === cluster.id;

                  return (
                    <TouchableOpacity
                      key={cluster.id}
                      onPress={() => handleGenerateFromCluster(cluster.id)}
                      activeOpacity={0.8}
                      disabled={isGenerating}
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

                        {isGeneratingThis ? (
                          <View style={styles.generatingContainer}>
                            <LoadingSpinner variant="dots" size="small" />
                            <Text style={styles.generatingText}>
                              Generating spark...
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.exploreButton}>
                            <Text
                              style={[
                                styles.exploreButtonText,
                                { color: clusterColor },
                              ]}
                            >
                              Continue exploring this thread →
                            </Text>
                          </View>
                        )}
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Button
                  title="Refresh Clusters 🔄"
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
    marginBottom: SPACING.md,
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
  explainCard: {
    marginBottom: SPACING.lg,
    borderColor: COLORS.primary.main,
    borderWidth: 2,
  },
  explainText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray700,
    lineHeight: FONT_SIZES.sm * 1.4,
  },
  explainBold: {
    fontWeight: "700",
    color: COLORS.primary.main,
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
  generatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
  },
  generatingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray600,
    marginLeft: SPACING.sm,
  },
  actions: {
    marginTop: SPACING.lg,
  },
  refreshButton: {
    marginTop: SPACING.md,
  },
  currentSparkCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.accent.purple,
  },
  sparkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  currentSparkTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.neutral.black,
  },
  sparkBadge: {
    backgroundColor: COLORS.accent.purple,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  sparkBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.neutral.white,
  },
  currentSparkText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.neutral.gray800,
    lineHeight: FONT_SIZES.md * 1.4,
    marginBottom: SPACING.md,
  },
  currentSparkActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});

export default ThreadScreen;
