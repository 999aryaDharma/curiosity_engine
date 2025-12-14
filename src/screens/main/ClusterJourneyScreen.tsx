// src/screens/main/ClusterJourneyScreen.tsx - ULTRA SAFE

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@navigation/AppNavigation";
import { useThreadStore } from "@stores/threadStore";
import { ConceptCluster, ConceptNode } from "@type/thread.types";
import { Spark } from "@type/spark.types";
import { ModeCard, SoftCard } from "@components/common/Card";
import Button from "@components/common/Button";
import LoadingSpinner from "@components/common/LoadingSpinner";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
} from "@constants/colors";
import conceptGraphEngine from "@services/thread-engine/conceptGraph";
import sparkGenerator from "@services/spark-engine/sparkGenerator";

type ClusterJourneyScreenRouteProp = RouteProp<
  RootStackParamList,
  "ClusterJourney"
>;

type ClusterJourneyScreenProps = {
  route: ClusterJourneyScreenRouteProp;
  navigation: NavigationProp<RootStackParamList>;
};

export const ClusterJourneyScreen: React.FC<ClusterJourneyScreenProps> = ({
  route,
  navigation,
}) => {
  const { clusterId } = route.params;
  const [cluster, setCluster] = useState<ConceptCluster | null>(null);
  const [concepts, setConcepts] = useState<ConceptNode[]>([]);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadClusterData();
  }, [clusterId]);

  const loadClusterData = async () => {
    setIsLoading(true);
    try {
      const clusterEngine = (
        await import("@services/thread-engine/clusterEngine")
      ).default;
      const clusterData = await clusterEngine.getClusterById(clusterId);

      if (!clusterData) {
        navigation.goBack();
        return;
      }

      setCluster(clusterData);

      // DEFENSIVE: Ensure concepts is array
      const safeConceptIds = Array.isArray(clusterData.concepts)
        ? clusterData.concepts
        : [];

      const conceptNodes = await Promise.all(
        safeConceptIds.map((id) => conceptGraphEngine.getConceptById(id))
      );
      const validNodes = conceptNodes.filter(
        (n): n is ConceptNode => n !== null && n !== undefined
      );
      setConcepts(validNodes.sort((a, b) => b.weight - a.weight));

      // DEFENSIVE: Collect spark IDs safely
      const allSparkIds = new Set<string>();
      validNodes.forEach((node) => {
        if (node && Array.isArray(node.sparkIds)) {
          node.sparkIds.forEach((id) => allSparkIds.add(id));
        }
      });

      const sparkData = await Promise.all(
        Array.from(allSparkIds).map((id) => sparkGenerator.getSparkById(id))
      );
      const validSparks = sparkData
        .filter((s): s is Spark => s !== null && s !== undefined)
        .sort((a, b) => b.createdAt - a.createdAt);
      setSparks(validSparks);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("[ClusterJourney] Load failed:", error);
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueThread = () => {
    navigation.navigate("ThreadPackView", { clusterId });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner
            variant="pulse"
            size="large"
            message="Loading journey..."
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!cluster) return null;

  // DEFENSIVE: Ensure arrays
  const safeConcepts = Array.isArray(concepts) ? concepts : [];
  const safeSparks = Array.isArray(sparks) ? sparks : [];

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
        <Text style={styles.headerTitle}>Cluster Journey</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Hero Card */}
          <ModeCard color="mint" style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.iconBadge}>
                <Text style={styles.iconBadgeText}>🧠</Text>
              </View>
            </View>
            <Text style={styles.clusterName}>{cluster.name}</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{safeConcepts.length}</Text>
                <Text style={styles.statLabel}>Concepts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{safeSparks.length}</Text>
                <Text style={styles.statLabel}>Sparks</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {Math.round((cluster.coherence || 0) * 100)}%
                </Text>
                <Text style={styles.statLabel}>Coherence</Text>
              </View>
            </View>
          </ModeCard>

          {/* Dominant Concepts */}
          <Text style={styles.sectionTitle}>Key Concepts</Text>
          <View style={styles.conceptsGrid}>
            {safeConcepts.length === 0 ? (
              <Text style={styles.emptyText}>No concepts yet</Text>
            ) : (
              safeConcepts.slice(0, 6).map((concept) => (
                <View key={concept.id} style={styles.conceptPill}>
                  <Text style={styles.conceptName}>{concept.name}</Text>
                  <View style={styles.conceptWeightBadge}>
                    <Text style={styles.conceptWeight}>
                      {Math.round((concept.weight || 0) * 100)}%
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Recent Sparks */}
          <Text style={styles.sectionTitle}>Recent Sparks</Text>
          {safeSparks.length === 0 ? (
            <SoftCard style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>✨</Text>
              <Text style={styles.emptyText}>
                No sparks yet. This is the beginning of your journey!
              </Text>
            </SoftCard>
          ) : (
            <View style={styles.sparksTimeline}>
              {safeSparks.slice(0, 4).map((spark, index) => (
                <View key={spark.id} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  {index < safeSparks.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                  <SoftCard style={styles.sparkCard}>
                    <Text style={styles.sparkText} numberOfLines={2}>
                      {spark.text}
                    </Text>
                    <Text style={styles.sparkDate}>
                      {new Date(spark.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </SoftCard>
                </View>
              ))}
            </View>
          )}

          {/* CTA Card */}
          <ModeCard color="coral" style={styles.ctaCard}>
            <Text style={styles.ctaEmoji}>🚀</Text>
            <Text style={styles.ctaTitle}>Continue the Journey</Text>
            <Text style={styles.ctaDescription}>
              Generate 4 connected sparks that build on your exploration
            </Text>
            <Button
              title="Generate Thread Pack"
              onPress={handleContinueThread}
              variant="soft"
              size="large"
              fullWidth
              style={styles.ctaButton}
            />
          </ModeCard>

          <View style={{ height: SPACING.huge }} />
        </Animated.View>
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
  scrollContent: {
    paddingHorizontal: SPACING.base,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroCard: {
    marginBottom: SPACING.xl,
    padding: SPACING.xl,
    minHeight: 200,
  },
  heroHeader: {
    marginBottom: SPACING.md,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.xxxl,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBadgeText: {
    fontSize: 32,
  },
  clusterName: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.xl,
  },
  statsGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs / 2,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.white,
    opacity: 0.9,
    fontWeight: FONT_WEIGHTS.medium,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.neutral.white,
    opacity: 0.3,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  conceptsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -SPACING.xs,
    marginBottom: SPACING.lg,
  },
  conceptPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary.light,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingLeft: SPACING.base,
    paddingRight: SPACING.xs,
    margin: SPACING.xs,
  },
  conceptName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.primary.main,
    marginRight: SPACING.xs,
  },
  conceptWeightBadge: {
    backgroundColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
  },
  conceptWeight: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.white,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.neutral.gray600,
    textAlign: "center",
    lineHeight: FONT_SIZES.base * 1.5,
  },
  sparksTimeline: {
    marginBottom: SPACING.lg,
  },
  timelineItem: {
    position: "relative",
    paddingLeft: SPACING.xxl,
    marginBottom: SPACING.md,
  },
  timelineDot: {
    position: "absolute",
    left: 0,
    top: SPACING.base,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary.main,
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },
  timelineLine: {
    position: "absolute",
    left: 7,
    top: SPACING.base + 16,
    width: 2,
    height: "100%",
    backgroundColor: COLORS.neutral.gray200,
  },
  sparkCard: {
    padding: SPACING.base,
  },
  sparkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray800,
    lineHeight: FONT_SIZES.sm * 1.5,
    marginBottom: SPACING.xs,
  },
  sparkDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.gray500,
    fontWeight: FONT_WEIGHTS.medium,
  },
  ctaCard: {
    marginTop: SPACING.lg,
    padding: SPACING.xl,
    alignItems: "center",
  },
  ctaEmoji: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  ctaTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  ctaDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.white,
    opacity: 0.9,
    textAlign: "center",
    marginBottom: SPACING.lg,
    lineHeight: FONT_SIZES.sm * 1.5,
  },
  ctaButton: {
    marginTop: SPACING.md,
  },
});

export default ClusterJourneyScreen;
