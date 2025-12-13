// src/screens/main/DeepDiveScreen.tsx - FRESH DESIGN (Following Reference)

import React, { useState, useEffect } from "react";
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
import { useSparkStore } from "@stores/sparkStore";
import { useSettingsStore } from "@stores/settingsStore";
import { Spark } from "@type/spark.types";
import { DeepDiveSession, DeepDiveLayer } from "@type/deepdive.types";
import deepDiveService from "@/services/deepdive/deepDiveService";
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
import { formatDate } from "@utils/dateUtils";

interface DeepDiveScreenProps {
  navigation: any;
  route: any;
}

type ScreenState = "seed_selection" | "seed_view" | "layer_view" | "synthesis";

export const DeepDiveScreen: React.FC<DeepDiveScreenProps> = ({
  navigation,
  route,
}) => {
  const { recentSparks, loadRecentSparks } = useSparkStore();
  const { settings } = useSettingsStore();

  const [screenState, setScreenState] = useState<ScreenState>("seed_selection");
  const [currentSession, setCurrentSession] = useState<DeepDiveSession | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRecentSparks(20);
    if (route.params?.sparkText) {
      handleCreateSessionFromText(route.params.sparkText);
    }
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [screenState]);

  const handleCreateSessionFromText = async (text: string) => {
    setIsGenerating(true);
    try {
      const session = await deepDiveService.createSession(
        "custom",
        text,
        settings.maxDeepDiveLayers
      );
      setCurrentSession(session);
      setScreenState("seed_view");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSeed = async (spark: Spark) => {
    setIsGenerating(true);
    try {
      const session = await deepDiveService.createSession(
        spark.id,
        spark.text,
        settings.maxDeepDiveLayers
      );
      setCurrentSession(session);
      setScreenState("seed_view");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenLayer1 = async () => {
    if (!currentSession) return;
    setIsGenerating(true);
    try {
      await deepDiveService.generateNextLayer(
        currentSession.id,
        settings.difficultyLevel
      );
      const updated = await deepDiveService.getSession(currentSession.id);
      setCurrentSession(updated);
      setScreenState("layer_view");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGoDeeper = async () => {
    if (!currentSession) return;
    if (currentSession.currentLayer >= currentSession.maxLayers) {
      handleGenerateSynthesis();
      return;
    }
    setIsGenerating(true);
    try {
      await deepDiveService.generateNextLayer(
        currentSession.id,
        settings.difficultyLevel
      );
      const updated = await deepDiveService.getSession(currentSession.id);
      setCurrentSession(updated);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSynthesis = async () => {
    if (!currentSession) return;
    setIsGenerating(true);
    try {
      await deepDiveService.generateSynthesis(currentSession.id);
      const updated = await deepDiveService.getSession(currentSession.id);
      setCurrentSession(updated);
      setScreenState("synthesis");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBranchIdea = (layerNumber: number, questionIndex: number) => {
    Alert.alert(
      "Branch This Idea",
      "Create a new Deep Dive from this question?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Branch",
          onPress: async () => {
            try {
              const newSession = await deepDiveService.branchFromLayer(
                currentSession!.id,
                layerNumber,
                questionIndex
              );
              setCurrentSession(newSession);
              setScreenState("seed_view");
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const handleBackToSelection = () => {
    setCurrentSession(null);
    setScreenState("seed_selection");
    fadeAnim.setValue(0);
  };

  if (isGenerating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner
            variant="dots"
            size="large"
            message={
              screenState === "seed_view"
                ? "Preparing dive..."
                : "Diving deeper..."
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            screenState === "seed_selection"
              ? navigation.goBack()
              : handleBackToSelection()
          }
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deep Dive</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {screenState === "seed_selection" && (
            <SeedSelectionView
              recentSparks={recentSparks}
              onSelectSeed={handleSelectSeed}
            />
          )}
          {screenState === "seed_view" && currentSession && (
            <SeedView
              session={currentSession}
              onOpenLayer1={handleOpenLayer1}
            />
          )}
          {screenState === "layer_view" && currentSession && (
            <LayerView
              session={currentSession}
              onGoDeeper={handleGoDeeper}
              onBranchIdea={handleBranchIdea}
            />
          )}
          {screenState === "synthesis" && currentSession?.synthesis && (
            <SynthesisView
              synthesis={currentSession.synthesis}
              onBackToSelection={handleBackToSelection}
            />
          )}
        </Animated.View>
        <View style={{ height: SPACING.huge }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ SUB-COMPONENTS ============

const SeedSelectionView: React.FC<{
  recentSparks: Spark[];
  onSelectSeed: (spark: Spark) => void;
}> = ({ recentSparks, onSelectSeed }) => (
  <View>
    <View style={styles.heroSection}>
      <View style={styles.iconRow}>
        <Text style={styles.heroIcon}>🔍</Text>
        <Text style={styles.heroIcon}>🌊</Text>
        <Text style={styles.heroIcon}>✨</Text>
      </View>
      <Text style={styles.heroTitle}>Choose a Spark to Explore</Text>
      <Text style={styles.heroSubtitle}>
        Select a spark from your history to dive deep into its layers
      </Text>
    </View>

    <Text style={styles.sectionTitle}>Recent Sparks</Text>
    {!recentSparks || recentSparks.length === 0 ? (
      <SoftCard style={styles.emptyCard}>
        <Text style={styles.emptyText}>
          No sparks yet. Generate a Quick Spark first!
        </Text>
      </SoftCard>
    ) : (
      recentSparks.slice(0, 10).map((spark) => (
        <TouchableOpacity
          key={spark.id}
          onPress={() => onSelectSeed(spark)}
          activeOpacity={0.7}
        >
          <SoftCard style={styles.sparkSelectionCard}>
            <Text style={styles.sparkSelectionText} numberOfLines={3}>
              {spark.text}
            </Text>
            <View style={styles.sparkMeta}>
              <View
                style={[
                  styles.modeBadge,
                  {
                    backgroundColor:
                      spark.mode === 1
                        ? COLORS.primary.light
                        : spark.mode === 2
                        ? COLORS.secondary.light
                        : COLORS.info.light,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modeLabel,
                    {
                      color:
                        spark.mode === 1
                          ? COLORS.primary.main
                          : spark.mode === 2
                          ? COLORS.secondary.main
                          : COLORS.info.main,
                    },
                  ]}
                >
                  {spark.mode === 1
                    ? "⚡ Quick"
                    : spark.mode === 2
                    ? "🌊 Deep"
                    : "🧵 Thread"}
                </Text>
              </View>
              <Text style={styles.sparkDate}>
                {formatDate(spark.createdAt, "relative")}
              </Text>
            </View>
          </SoftCard>
        </TouchableOpacity>
      ))
    )}
  </View>
);

const SeedView: React.FC<{
  session: DeepDiveSession;
  onOpenLayer1: () => void;
}> = ({ session, onOpenLayer1 }) => (
  <View>
    <ModeCard color="coral" style={styles.seedCard}>
      <Text style={styles.seedLabel}>Seed Spark</Text>
      <Text style={styles.seedText}>{session.seedSparkText}</Text>

      <View style={styles.seedStatsRow}>
        <View style={styles.seedStat}>
          <Text style={styles.seedStatLabel}>Max Layers</Text>
          <Text style={styles.seedStatValue}>{session.maxLayers}</Text>
        </View>
        <View style={styles.seedStatDivider} />
        <View style={styles.seedStat}>
          <Text style={styles.seedStatLabel}>Progress</Text>
          <Text style={styles.seedStatValue}>
            {session.currentLayer}/{session.maxLayers}
          </Text>
        </View>
      </View>
    </ModeCard>

    <SoftCard style={styles.expectCard}>
      <Text style={styles.expectTitle}>🎯 What to Expect:</Text>
      <Text style={styles.expectItem}>
        • Layer 1: Core explanation + questions
      </Text>
      <Text style={styles.expectItem}>
        • Layer 2: Mechanisms + contradictions
      </Text>
      <Text style={styles.expectItem}>
        • Layer 3: Real scenarios + parallels
      </Text>
      <Text style={styles.expectItem}>• Layer 4+: Abstract insights</Text>
    </SoftCard>

    <Button
      title="Open Layer 1"
      onPress={onOpenLayer1}
      variant="gradient"
      size="large"
      fullWidth
    />
  </View>
);

const LayerView: React.FC<{
  session: DeepDiveSession;
  onGoDeeper: () => void;
  onBranchIdea: (layer: number, questionIndex: number) => void;
}> = ({ session, onGoDeeper, onBranchIdea }) => {
  const currentLayer = session.layers[session.layers.length - 1];
  const canGoDeeper = session.currentLayer < session.maxLayers;

  return (
    <View>
      {/* Progress Indicator */}
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          Layer {session.currentLayer} of {session.maxLayers}
        </Text>
        <View style={styles.progressDotsRow}>
          {Array.from({ length: session.maxLayers }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i < session.currentLayer && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Layer Card */}
      <ModeCard color="mint" style={styles.layerCard}>
        <View style={styles.layerBadge}>
          <Text style={styles.layerBadgeText}>Layer {currentLayer.layer}</Text>
        </View>

        <View style={styles.layerSection}>
          <Text style={styles.layerSectionIcon}>💡</Text>
          <Text style={styles.layerSectionTitle}>Explanation</Text>
          <Text style={styles.layerExplanation}>
            {currentLayer.explanation}
          </Text>
        </View>

        <View style={styles.layerSection}>
          <Text style={styles.layerSectionIcon}>❓</Text>
          <Text style={styles.layerSectionTitle}>Questions</Text>
          {currentLayer.questions &&
            currentLayer.questions.map((q, i) => (
              <SoftCard key={i} style={styles.questionCard}>
                <Text style={styles.questionText}>{q}</Text>
                <TouchableOpacity
                  style={styles.branchButton}
                  onPress={() => onBranchIdea(currentLayer.layer, i)}
                >
                  <Text style={styles.branchButtonText}>Branch →</Text>
                </TouchableOpacity>
              </SoftCard>
            ))}
        </View>

        {currentLayer.analogy && (
          <View style={styles.layerSection}>
            <Text style={styles.layerSectionIcon}>🎨</Text>
            <Text style={styles.layerSectionTitle}>Analogy</Text>
            <Text style={styles.layerAnalogy}>{currentLayer.analogy}</Text>
          </View>
        )}

        {currentLayer.observation && (
          <View style={styles.layerSection}>
            <Text style={styles.layerSectionIcon}>👁</Text>
            <Text style={styles.layerSectionTitle}>Observation</Text>
            <Text style={styles.layerObservation}>
              {currentLayer.observation}
            </Text>
          </View>
        )}
      </ModeCard>

      <Button
        title={canGoDeeper ? "Go Deeper" : "Generate Synthesis"}
        onPress={onGoDeeper}
        variant="gradient"
        size="large"
        fullWidth
        style={styles.actionButton}
      />
    </View>
  );
};

const SynthesisView: React.FC<{
  synthesis: any;
  onBackToSelection: () => void;
}> = ({ synthesis, onBackToSelection }) => (
  <View>
    <View style={styles.heroSection}>
      <Text style={styles.heroIcon}>🎯</Text>
      <Text style={styles.heroTitle}>Journey Complete</Text>
    </View>

    <ModeCard color="sky" style={styles.synthesisCard}>
      <Text style={styles.synthesisLabel}>Summary</Text>
      <Text style={styles.synthesisText}>{synthesis.summary}</Text>
    </ModeCard>

    <SoftCard style={styles.bigIdeaCard}>
      <Text style={styles.bigIdeaLabel}>💡 The Big Idea</Text>
      <Text style={styles.bigIdeaText}>{synthesis.bigIdea}</Text>
    </SoftCard>

    <SoftCard style={styles.nextStepsCard}>
      <Text style={styles.nextStepsTitle}>🚀 Where to Go Next</Text>
      {synthesis.nextSteps &&
        synthesis.nextSteps.map((step: string, i: number) => (
          <Text key={i} style={styles.nextStepItem}>
            {i + 1}. {step}
          </Text>
        ))}
    </SoftCard>

    <Button
      title="Start New Deep Dive"
      onPress={onBackToSelection}
      variant="gradient"
      size="large"
      fullWidth
    />
  </View>
);

// ============ STYLES ============

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.neutral.offWhite },
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
  backIcon: { fontSize: 24, color: COLORS.neutral.black },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
  },
  scrollContent: { paddingHorizontal: SPACING.base },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Hero Section
  heroSection: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  iconRow: { flexDirection: "row", marginBottom: SPACING.md },
  heroIcon: { fontSize: 56, marginHorizontal: SPACING.xs },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.neutral.gray600,
    textAlign: "center",
    paddingHorizontal: SPACING.lg,
    lineHeight: FONT_SIZES.base * 1.5,
  },

  // Section
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
    marginBottom: SPACING.md,
  },

  // Spark Selection
  emptyCard: { padding: SPACING.xl, alignItems: "center" },
  emptyText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.neutral.gray600,
    textAlign: "center",
  },
  sparkSelectionCard: { padding: SPACING.base, marginBottom: SPACING.md },
  sparkSelectionText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.neutral.gray800,
    lineHeight: FONT_SIZES.base * 1.5,
    marginBottom: SPACING.sm,
  },
  sparkMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modeBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  modeLabel: { fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.semibold },
  sparkDate: { fontSize: FONT_SIZES.xs, color: COLORS.neutral.gray500 },

  // Seed View
  seedCard: { marginBottom: SPACING.lg, padding: SPACING.xl },
  seedLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.white,
    opacity: 0.9,
    marginBottom: SPACING.sm,
  },
  seedText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.white,
    lineHeight: FONT_SIZES.xl * 1.4,
    marginBottom: SPACING.xl,
  },
  seedStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  seedStat: { alignItems: "center", flex: 1 },
  seedStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.white,
    opacity: 0.8,
    marginBottom: SPACING.xs / 2,
  },
  seedStatValue: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.white,
  },
  seedStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.neutral.white,
    opacity: 0.3,
  },

  expectCard: { marginBottom: SPACING.lg, padding: SPACING.base },
  expectTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.black,
    marginBottom: SPACING.sm,
  },
  expectItem: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray700,
    marginVertical: SPACING.xs / 2,
    lineHeight: FONT_SIZES.sm * 1.4,
  },

  // Layer View
  progressSection: { alignItems: "center", marginBottom: SPACING.lg },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.gray600,
    marginBottom: SPACING.sm,
  },
  progressDotsRow: { flexDirection: "row", alignItems: "center" },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.neutral.gray300,
    marginHorizontal: SPACING.xs,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary.main,
    width: 16,
    height: 16,
    borderRadius: 8,
  },

  layerCard: { marginBottom: SPACING.lg, padding: SPACING.xl },
  layerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.lg,
  },
  layerBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.white,
  },

  layerSection: { marginBottom: SPACING.lg },
  layerSectionIcon: { fontSize: 20, marginBottom: SPACING.xs },
  layerSectionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.sm,
  },
  layerExplanation: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.white,
    opacity: 0.95,
    lineHeight: FONT_SIZES.sm * 1.6,
  },

  questionCard: { padding: SPACING.md, marginBottom: SPACING.sm },
  questionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray800,
    marginBottom: SPACING.sm,
    lineHeight: FONT_SIZES.sm * 1.5,
  },
  branchButton: { alignSelf: "flex-start" },
  branchButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary.main,
  },

  layerAnalogy: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.white,
    opacity: 0.9,
    fontStyle: "italic",
    lineHeight: FONT_SIZES.sm * 1.5,
  },
  layerObservation: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.white,
    opacity: 0.9,
    lineHeight: FONT_SIZES.sm * 1.5,
  },

  actionButton: { marginTop: SPACING.md },

  // Synthesis
  synthesisCard: { marginBottom: SPACING.lg, padding: SPACING.xl },
  synthesisLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.white,
    opacity: 0.9,
    marginBottom: SPACING.sm,
  },
  synthesisText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.neutral.white,
    lineHeight: FONT_SIZES.base * 1.6,
  },

  bigIdeaCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.base,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent.main,
  },
  bigIdeaLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
    marginBottom: SPACING.sm,
  },
  bigIdeaText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.gray800,
    lineHeight: FONT_SIZES.lg * 1.4,
  },

  nextStepsCard: { marginBottom: SPACING.lg, padding: SPACING.base },
  nextStepsTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
    marginBottom: SPACING.md,
  },
  nextStepItem: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray700,
    marginBottom: SPACING.sm,
    lineHeight: FONT_SIZES.sm * 1.5,
  },
});

export default DeepDiveScreen;
