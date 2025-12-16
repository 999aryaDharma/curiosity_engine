// src/screens/main/SparkDetailScreen.tsx - FRESH SPARK DETAIL

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { RouteProp } from "@react-navigation/native";
import { useSparkStore } from "@stores/sparkStore";
import { Spark, SparkMode } from "@type/spark.types";
import { ModeCard, SoftCard } from "@components/common/Card";
import Button from "@components/common/Button";
import LoadingSpinner from "@components/common/LoadingSpinner";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
} from "@constants/colors";
import { formatDate } from "@utils/dateUtils";
import { RootStackParamList } from "@navigation/AppNavigation";

type SparkDetailScreenRouteProp = RouteProp<RootStackParamList, "SparkDetail">;

interface SparkDetailScreenProps {
  route: SparkDetailScreenRouteProp;
  navigation: any;
}

export const SparkDetailScreen: React.FC<SparkDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { sparkId } = route.params;
  const { loadSparkById, toggleSaved, markAsViewed } = useSparkStore();

  const [spark, setSpark] = useState<Spark | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [knowledgeRevealed, setKnowledgeRevealed] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const knowledgeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSparkData();
  }, [sparkId]);

  const loadSparkData = async () => {
    try {
      setIsLoading(true);
      await loadSparkById(sparkId);
      const sparkStore = useSparkStore.getState();
      const loadedSpark = sparkStore.currentSpark;

      if (loadedSpark) {
        setSpark(loadedSpark);
        setKnowledgeRevealed(loadedSpark.knowledgeRevealed || false);
        await markAsViewed(sparkId);

        // Entrance animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION.slow,
          useNativeDriver: true,
        }).start();
      } else {
        Alert.alert("Error", "Spark not found");
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevealKnowledge = () => {
    setKnowledgeRevealed(true);
    Animated.spring(knowledgeAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 10,
      bounciness: 8,
    }).start();
  };

  const handleSave = async () => {
    if (!spark) return;
    await toggleSaved(spark.id);
    setSpark({ ...spark, saved: !spark.saved });
  };

  const handleShare = async () => {
    if (!spark) return;
    try {
      await Share.share({
        message: `${spark.text}\n\nFrom Curiosity Engine`,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleExploreMore = () => {
    navigation.navigate("DeepDive", { sparkText: spark?.text });
  };

  const getModeConfig = (mode: SparkMode) => {
    switch (mode) {
      case 1:
        return {
          gradient: COLORS.gradients.mint,
          icon: "⚡",
          label: "Quick Spark",
          color: COLORS.primary.main,
          light: COLORS.primary.light,
        };
      case 2:
        return {
          gradient: COLORS.gradients.coral,
          icon: "🌊",
          label: "Deep Dive",
          color: COLORS.secondary.main,
          light: COLORS.secondary.light,
        };
      case 3:
        return {
          gradient: COLORS.gradients.sky,
          icon: "🧵",
          label: "Thread",
          color: COLORS.info.main,
          light: COLORS.info.light,
        };
      default:
        return {
          gradient: COLORS.gradients.mint,
          icon: "✨",
          label: "Spark",
          color: COLORS.primary.main,
          light: COLORS.primary.light,
        };
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner
            variant="gradient"
            size="large"
            message="Loading spark..."
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!spark) return null;

  const config = getModeConfig(spark.mode);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spark Detail</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.saveIcon}>{spark.saved ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={config.gradient as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              {/* Mode Badge */}
              <View style={styles.modeBadge}>
                <Text style={styles.modeIcon}>{config.icon}</Text>
                <Text style={styles.modeLabel}>{config.label}</Text>
              </View>

              {/* Question */}
              <Text style={styles.questionText}>{spark.text}</Text>

              {/* Date */}
              <Text style={styles.dateText}>
                {formatDate(spark.createdAt, "long")}
              </Text>
            </LinearGradient>
          </View>

          {/* Knowledge Section (Reveal) */}
          {spark.knowledge && (
            <View style={styles.section}>
              {!knowledgeRevealed ? (
                <SoftCard style={styles.revealCard}>
                  <Text style={styles.revealIcon}>🔒</Text>
                  <Text style={styles.revealTitle}>Knowledge Inside</Text>
                  <Text style={styles.revealDescription}>
                    Tap to reveal the detailed explanation
                  </Text>
                  <Button
                    title="Reveal Knowledge"
                    onPress={handleRevealKnowledge}
                    variant="gradient"
                    size="medium"
                    fullWidth
                    style={styles.revealButton}
                  />
                </SoftCard>
              ) : (
                <Animated.View
                  style={{
                    opacity: knowledgeAnim,
                    transform: [
                      {
                        translateY: knowledgeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <SoftCard style={styles.knowledgeCard}>
                    <View style={styles.knowledgeHeader}>
                      <Text style={styles.knowledgeIcon}>📚</Text>
                      <Text style={styles.knowledgeTitle}>Knowledge</Text>
                    </View>
                    <Text style={styles.knowledgeText}>{spark.knowledge}</Text>
                  </SoftCard>
                </Animated.View>
              )}
            </View>
          )}

          {/* Fun Fact */}
          {spark.funFact && (
            <View style={styles.section}>
              <SoftCard style={styles.factCard}>
                <View style={styles.factHeader}>
                  <Text style={styles.factIcon}>💡</Text>
                  <Text style={styles.factTitle}>Fun Fact</Text>
                </View>
                <Text style={styles.factText}>{spark.funFact}</Text>
              </SoftCard>
            </View>
          )}

          {/* Application */}
          {spark.application && (
            <View style={styles.section}>
              <SoftCard style={styles.applicationCard}>
                <View style={styles.applicationHeader}>
                  <Text style={styles.applicationIcon}>🎯</Text>
                  <Text style={styles.applicationTitle}>Real Application</Text>
                </View>
                <Text style={styles.applicationText}>{spark.application}</Text>
              </SoftCard>
            </View>
          )}

          {/* Concept Links */}
          {spark.conceptLinks && spark.conceptLinks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Related Concepts</Text>
              <View style={styles.conceptsGrid}>
                {spark.conceptLinks.map((concept, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.conceptChip,
                      { backgroundColor: config.light },
                    ]}
                  >
                    <Text style={[styles.conceptText, { color: config.color }]}>
                      {concept}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Explore More</Text>

            <Button
              title="Start Deep Dive"
              onPress={handleExploreMore}
              variant="gradient"
              size="large"
              fullWidth
              style={styles.actionButton}
            />

            <Button
              title="Share This Spark"
              onPress={handleShare}
              variant="soft"
              size="large"
              fullWidth
              style={styles.actionButton}
            />
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>👁️</Text>
                <Text style={styles.statLabel}>
                  {spark.viewed ? "Viewed" : "New"}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>{spark.saved ? "❤️" : "🤍"}</Text>
                <Text style={styles.statLabel}>
                  {spark.saved ? "Saved" : "Not Saved"}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🎚️</Text>
                <Text style={styles.statLabel}>
                  {Math.round((spark.difficulty || 0.5) * 100)}%
                </Text>
              </View>
            </View>
          </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  saveButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  saveIcon: {
    fontSize: 24,
  },
  scrollContent: {
    paddingHorizontal: SPACING.base,
  },
  heroCard: {
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xxxl,
    overflow: "hidden",
    ...SHADOWS.elevated,
  },
  heroGradient: {
    padding: SPACING.xl,
    minHeight: 200,
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.lg,
  },
  modeIcon: {
    fontSize: FONT_SIZES.base,
    marginRight: SPACING.xs,
  },
  modeLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.white,
  },
  questionText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.white,
    lineHeight: FONT_SIZES.xxl * 1.3,
    marginBottom: SPACING.lg,
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.white,
    opacity: 0.9,
    fontWeight: FONT_WEIGHTS.medium,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
    marginBottom: SPACING.md,
  },
  revealCard: {
    padding: SPACING.xl,
    alignItems: "center",
  },
  revealIcon: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  revealTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
    marginBottom: SPACING.sm,
  },
  revealDescription: {
    fontSize: FONT_SIZES.base,
    color: COLORS.neutral.gray600,
    textAlign: "center",
    marginBottom: SPACING.lg,
    lineHeight: FONT_SIZES.base * 1.5,
  },
  revealButton: {
    marginTop: SPACING.md,
  },
  knowledgeCard: {
    padding: SPACING.base,
  },
  knowledgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  knowledgeIcon: {
    fontSize: FONT_SIZES.xl,
    marginRight: SPACING.sm,
  },
  knowledgeTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
  },
  knowledgeText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.neutral.gray700,
    lineHeight: FONT_SIZES.base * 1.6,
  },
  factCard: {
    padding: SPACING.base,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent.main,
  },
  factHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  factIcon: {
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.sm,
  },
  factTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
  },
  factText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray700,
    lineHeight: FONT_SIZES.sm * 1.5,
  },
  applicationCard: {
    padding: SPACING.base,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary.main,
  },
  applicationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  applicationIcon: {
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.sm,
  },
  applicationTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
  },
  applicationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray700,
    lineHeight: FONT_SIZES.sm * 1.5,
  },
  conceptsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  conceptChip: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  conceptText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  actionsSection: {
    marginBottom: SPACING.lg,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
  statsSection: {
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: "row",
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.base,
    ...SHADOWS.soft,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIcon: {
    fontSize: FONT_SIZES.xl,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.gray600,
    fontWeight: FONT_WEIGHTS.medium,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.neutral.gray200,
    marginHorizontal: SPACING.sm,
  },
});

export default SparkDetailScreen;
