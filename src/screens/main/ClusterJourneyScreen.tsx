// src/screens/main/ClusterJourneyScreen.tsx

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
import {
  RouteProp,
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import { RootStackParamList } from "@navigation/AppNavigation";
import { LinearGradient } from "expo-linear-gradient";
import { useThreadStore } from "@stores/threadStore";
import { ConceptCluster, ConceptNode } from "@type/thread.types";
import { Spark } from "@type/spark.types";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "@constants/colors";
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

      const conceptNodes = await Promise.all(
        clusterData.concepts.map((id) => conceptGraphEngine.getConceptById(id))
      );
      const validNodes = conceptNodes.filter(
        (n): n is ConceptNode => n !== null
      );
      setConcepts(validNodes.sort((a, b) => b.weight - a.weight));

      const allSparkIds = new Set<string>();
      validNodes.forEach((node) => {
        node.sparkIds.forEach((id) => allSparkIds.add(id));
      });

      const sparkData = await Promise.all(
        Array.from(allSparkIds).map((id) => sparkGenerator.getSparkById(id))
      );
      const validSparks = sparkData
        .filter((s): s is Spark => s !== null)
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
            message="Loading cluster journey..."
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!cluster) return null;

  const clusterColor =
    COLORS.clusters[
      cluster.name.toLowerCase() as keyof typeof COLORS.clusters
    ] || COLORS.primary.main;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#FFFFFF", "#F0F9FF"]} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
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
            <Card
              variant="gradient"
              gradientColors={[clusterColor, COLORS.primary.light]}
              style={styles.clusterCard}
            >
              <View style={styles.clusterHeader}>
                <View
                  style={[
                    styles.clusterDot,
                    { backgroundColor: COLORS.neutral.white },
                  ]}
                />
                <Text style={styles.clusterName}>{cluster.name}</Text>
              </View>

              <View style={styles.clusterStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{concepts.length}</Text>
                  <Text style={styles.statLabel}>Concepts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{sparks.length}</Text>
                  <Text style={styles.statLabel}>Sparks</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {Math.round(cluster.coherence * 100)}%
                  </Text>
                  <Text style={styles.statLabel}>Coherence</Text>
                </View>
              </View>
            </Card>

            <Text style={styles.sectionTitle}>Dominant Concepts</Text>
            <View style={styles.conceptsContainer}>
              {concepts.slice(0, 5).map((concept) => (
                <View
                  key={concept.id}
                  style={[styles.conceptChip, { borderColor: clusterColor }]}
                >
                  <Text style={[styles.conceptText, { color: clusterColor }]}>
                    {concept.name}
                  </Text>
                  <View
                    style={[
                      styles.weightBadge,
                      { backgroundColor: clusterColor },
                    ]}
                  >
                    <Text style={styles.weightText}>
                      {Math.round(concept.weight * 100)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Spark History</Text>
            {sparks.length === 0 ? (
              <Card variant="outlined" style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No sparks yet. This is the beginning of your journey.
                </Text>
              </Card>
            ) : (
              <View style={styles.sparkTimeline}>
                {sparks.slice(0, 5).map((spark, index) => (
                  <View key={spark.id} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    {index < sparks.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                    <Card variant="outlined" style={styles.sparkCard}>
                      <Text style={styles.sparkText} numberOfLines={3}>
                        {spark.text}
                      </Text>
                      <Text style={styles.sparkDate}>
                        {new Date(spark.createdAt).toLocaleDateString()}
                      </Text>
                    </Card>
                  </View>
                ))}
              </View>
            )}

            <Card variant="elevated" style={styles.ctaCard}>
              <Text style={styles.ctaTitle}>Ready to Continue?</Text>
              <Text style={styles.ctaDescription}>
                Generate a Thread Pack of 4 connected sparks that continue this
                intellectual journey.
              </Text>
              <Button
                title="Continue the Thread"
                onPress={handleContinueThread}
                variant="gradient"
                size="large"
                fullWidth
                style={styles.ctaButton}
              />
            </Card>
          </Animated.View>

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
  clusterCard: {
    marginBottom: SPACING.xl,
  },
  clusterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  clusterDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: SPACING.md,
  },
  clusterName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "bold",
    color: COLORS.neutral.white,
  },
  clusterStats: {
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
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.white,
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "bold",
    color: COLORS.neutral.black,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  conceptsContainer: {
    marginBottom: SPACING.lg,
  },
  conceptChip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  conceptText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    flex: 1,
  },
  weightBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  weightText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.neutral.white,
  },
  emptyCard: {
    padding: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray600,
    textAlign: "center",
  },
  sparkTimeline: {
    marginBottom: SPACING.lg,
  },
  timelineItem: {
    position: "relative",
    paddingLeft: SPACING.xl,
    marginBottom: SPACING.md,
  },
  timelineDot: {
    position: "absolute",
    left: 0,
    top: SPACING.md,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary.main,
  },
  timelineLine: {
    position: "absolute",
    left: 5,
    top: SPACING.md + 12,
    width: 2,
    height: "100%",
    backgroundColor: COLORS.neutral.gray300,
  },
  sparkCard: {
    padding: SPACING.md,
  },
  sparkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray700,
    marginBottom: SPACING.xs,
  },
  sparkDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.gray500,
  },
  ctaCard: {
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  ctaTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "bold",
    color: COLORS.neutral.black,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  ctaDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray600,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  ctaButton: {
    marginTop: SPACING.md,
  },
});

export default ClusterJourneyScreen;
