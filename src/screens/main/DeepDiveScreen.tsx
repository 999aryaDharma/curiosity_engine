// src/screens/main/DeepDiveScreen.tsx - COMPLETE REWRITE

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
import { LinearGradient } from "expo-linear-gradient";
import { useSparkStore } from "@stores/sparkStore";
import { useSettingsStore } from "@stores/settingsStore";
import { Spark } from "@type/spark.types";
import { DeepDiveSession, DeepDiveLayer } from "@type/deepdive.types";
import deepDiveService from "@/services/deepdive/deepDiveService";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "@constants/colors";

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
  const [selectedSeed, setSelectedSeed] = useState<Spark | null>(null);
  const [currentSession, setCurrentSession] = useState<DeepDiveSession | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRecentSparks(20);

    // Jika ada sparkText dari route params, langsung buat session
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
    setSelectedSeed(spark);
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
        settings.chaosLevel
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
        settings.chaosLevel
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

  const handleBranchIdea = async (
    layerNumber: number,
    questionIndex: number
  ) => {
    if (!currentSession) return;

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
                currentSession.id,
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
    setSelectedSeed(null);
    setScreenState("seed_selection");
    fadeAnim.setValue(0);
  };

  if (isGenerating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner
            variant="gradient"
            size="large"
            message={
              screenState === "seed_view"
                ? "Preparing Deep Dive..."
                : screenState === "synthesis"
                ? "Creating synthesis..."
                : "Diving deeper... 🌊"
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#FFFFFF", "#F3F0FF"]} style={styles.gradient}>
        {/* Header */}
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
          <Text style={styles.headerTitle}>🌊 Deep Dive</Text>
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

          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

// SUB-COMPONENTS

const SeedSelectionView: React.FC<{
  recentSparks: Spark[];
  onSelectSeed: (spark: Spark) => void;
}> = ({ recentSparks, onSelectSeed }) => (
  <View>
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🔍🌊✨</Text>
      <Text style={styles.emptyTitle}>Choose a Spark to Explore</Text>
      <Text style={styles.emptyDescription}>
        Select a spark from your history to dive deep into its layers
      </Text>
    </View>

    <Text style={styles.sectionTitle}>Recent Sparks</Text>
    {(!recentSparks || recentSparks.length === 0) ? (
      <Card variant="outlined" style={styles.emptyCard}>
        <Text style={styles.emptyText}>
          No sparks yet. Generate a Quick Spark first!
        </Text>
      </Card>
    ) : (
      recentSparks.slice(0, 10).map((spark) => (
        <TouchableOpacity key={spark.id} onPress={() => onSelectSeed(spark)}>
          <Card variant="outlined" style={styles.sparkCard}>
            <Text style={styles.sparkText} numberOfLines={3}>
              {spark.text}
            </Text>
            <View style={styles.sparkMeta}>
              <Text style={styles.sparkMode}>
                {spark.mode === 1
                  ? "⚡ Quick"
                  : spark.mode === 2
                  ? "🌊 Deep"
                  : "🧵 Thread"}
              </Text>
              <Text style={styles.sparkDate}>
                {new Date(spark.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </Card>
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
    <Card variant="gradient" style={styles.seedCard}>
      <Text style={styles.seedLabel}>Seed Spark</Text>
      <Text style={styles.seedText}>{session.seedSparkText}</Text>

      <View style={styles.seedMeta}>
        <View style={styles.seedMetaItem}>
          <Text style={styles.seedMetaLabel}>Max Layers</Text>
          <Text style={styles.seedMetaValue}>{session.maxLayers}</Text>
        </View>
        <View style={styles.seedMetaItem}>
          <Text style={styles.seedMetaLabel}>Progress</Text>
          <Text style={styles.seedMetaValue}>
            {session.currentLayer}/{session.maxLayers}
          </Text>
        </View>
      </View>
    </Card>

    <Card variant="outlined" style={styles.infoCard}>
      <Text style={styles.infoTitle}>🎯 What to Expect:</Text>
      <Text style={styles.infoItem}>
        • Layer 1: Core explanation + questions
      </Text>
      <Text style={styles.infoItem}>
        • Layer 2: Mechanisms + contradictions
      </Text>
      <Text style={styles.infoItem}>• Layer 3: Real scenarios + parallels</Text>
      <Text style={styles.infoItem}>• Layer 4+: Abstract insights</Text>
    </Card>

    <Button
      title="Open Layer 1 🌊"
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
      {/* Progress */}
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>
          Layer {session.currentLayer} of {session.maxLayers}
        </Text>
        <View style={styles.progressBar}>
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

      {/* Current Layer */}
      <Card variant="elevated" style={styles.layerCard}>
        <LinearGradient
          colors={COLORS.gradients.twilight as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.layerBadge}
        >
          <Text style={styles.layerBadgeText}>Layer {currentLayer.layer}</Text>
        </LinearGradient>

        {/* Explanation */}
        <Text style={styles.layerSectionTitle}>💡 Explanation</Text>
        <Text style={styles.layerExplanation}>{currentLayer.explanation}</Text>

        {/* Questions */}
        <Text style={styles.layerSectionTitle}>❓ Questions</Text>
        {currentLayer.questions && Array.isArray(currentLayer.questions) ?
          currentLayer.questions.map((q, i) => (
            <View key={i} style={styles.questionContainer}>
              <Text style={styles.questionText}>{q}</Text>
              <TouchableOpacity
                style={styles.branchButton}
                onPress={() => onBranchIdea(currentLayer.layer, i)}
              >
                <Text style={styles.branchButtonText}>Branch →</Text>
              </TouchableOpacity>
            </View>
          )) : null
        }

        {/* Analogy */}
        {currentLayer.analogy && (
          <>
            <Text style={styles.layerSectionTitle}>🎨 Analogy</Text>
            <Text style={styles.layerAnalogy}>{currentLayer.analogy}</Text>
          </>
        )}

        {/* Observation */}
        {currentLayer.observation && (
          <>
            <Text style={styles.layerSectionTitle}>👁️ Observation</Text>
            <Text style={styles.layerObservation}>
              {currentLayer.observation}
            </Text>
          </>
        )}
      </Card>

      {/* Navigation */}
      <Button
        title={canGoDeeper ? "Go Deeper 🌊" : "Generate Synthesis ✨"}
        onPress={onGoDeeper}
        variant="gradient"
        size="large"
        fullWidth
        style={styles.actionButton}
      />

      {/* Previous Layers */}
      {session.layers.length > 1 && (
        <>
          <Text style={styles.sectionTitle}>Previous Layers</Text>
          {session.layers
            .slice(0, -1)
            .reverse()
            .map((layer) => (
              <Card
                key={layer.layer}
                variant="outlined"
                style={styles.prevLayerCard}
              >
                <Text style={styles.prevLayerTitle}>Layer {layer.layer}</Text>
                <Text style={styles.prevLayerExplanation} numberOfLines={2}>
                  {layer.explanation}
                </Text>
              </Card>
            ))}
        </>
      )}
    </View>
  );
};

const SynthesisView: React.FC<{
  synthesis: any;
  onBackToSelection: () => void;
}> = ({ synthesis, onBackToSelection }) => (
  <View>
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🎯✨</Text>
      <Text style={styles.emptyTitle}>Journey Complete</Text>
    </View>

    <Card variant="gradient" style={styles.synthesisCard}>
      <Text style={styles.synthesisLabel}>Summary</Text>
      <Text style={styles.synthesisText}>{synthesis.summary}</Text>
    </Card>

    <Card variant="elevated" style={styles.bigIdeaCard}>
      <Text style={styles.bigIdeaLabel}>💡 The Big Idea</Text>
      <Text style={styles.bigIdeaText}>{synthesis.bigIdea}</Text>
    </Card>

    <Card variant="outlined" style={styles.nextStepsCard}>
      <Text style={styles.nextStepsTitle}>🚀 Where to Go Next</Text>
      {synthesis.nextSteps && Array.isArray(synthesis.nextSteps) ?
        synthesis.nextSteps.map((step: string, i: number) => (
          <Text key={i} style={styles.nextStepItem}>
            {i + 1}. {step}
          </Text>
        )) : null
      }
    </Card>

    <Button
      title="Start New Deep Dive"
      onPress={onBackToSelection}
      variant="gradient"
      size="large"
      fullWidth
      style={styles.actionButton}
    />
  </View>
);

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
    paddingVertical: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "bold",
    color: COLORS.neutral.black,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.neutral.gray600,
    textAlign: "center",
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "bold",
    color: COLORS.neutral.black,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  emptyCard: {
    padding: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray600,
    textAlign: "center",
  },
  sparkCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  sparkText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.neutral.gray800,
    marginBottom: SPACING.sm,
  },
  sparkMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sparkMode: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary.main,
    fontWeight: "600",
  },
  sparkDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.gray500,
  },
  seedCard: {
    marginBottom: SPACING.lg,
  },
  seedLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.white,
    opacity: 0.9,
    marginBottom: SPACING.sm,
  },
  seedText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "600",
    color: COLORS.neutral.white,
    lineHeight: FONT_SIZES.xl * 1.4,
    marginBottom: SPACING.lg,
  },
  seedMeta: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  seedMetaItem: {
    alignItems: "center",
  },
  seedMetaLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.white,
    opacity: 0.8,
  },
  seedMetaValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "bold",
    color: COLORS.neutral.white,
  },
  infoCard: {
    marginBottom: SPACING.lg,
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
  progressSection: {
    marginBottom: SPACING.lg,
  },
  progressLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.neutral.gray600,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  progressBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
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
  layerCard: {
    marginBottom: SPACING.lg,
  },
  layerBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.lg,
  },
  layerBadgeText: {
    color: COLORS.neutral.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
  },
  layerSectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.neutral.black,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  layerExplanation: {
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * 1.6,
    color: COLORS.neutral.gray800,
  },
  questionContainer: {
    backgroundColor: COLORS.neutral.gray50,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  questionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray800,
    marginBottom: SPACING.sm,
  },
  branchButton: {
    alignSelf: "flex-start",
  },
  branchButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.primary.main,
  },
  layerAnalogy: {
    fontSize: FONT_SIZES.sm,
    lineHeight: FONT_SIZES.sm * 1.5,
    color: COLORS.neutral.gray700,
    fontStyle: "italic",
  },
  layerObservation: {
    fontSize: FONT_SIZES.sm,
    lineHeight: FONT_SIZES.sm * 1.5,
    color: COLORS.neutral.gray700,
  },
  actionButton: {
    marginTop: SPACING.md,
  },
  prevLayerCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  prevLayerTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    color: COLORS.primary.main,
    marginBottom: SPACING.xs,
  },
  prevLayerExplanation: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray600,
  },
  synthesisCard: {
    marginBottom: SPACING.lg,
  },
  synthesisLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.white,
    opacity: 0.9,
    marginBottom: SPACING.sm,
  },
  synthesisText: {
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * 1.5,
    color: COLORS.neutral.white,
  },
  bigIdeaCard: {
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent.yellow,
  },
  bigIdeaLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.neutral.black,
    marginBottom: SPACING.sm,
  },
  bigIdeaText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    lineHeight: FONT_SIZES.lg * 1.4,
    color: COLORS.neutral.gray800,
  },
  nextStepsCard: {
    marginBottom: SPACING.lg,
  },
  nextStepsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.neutral.black,
    marginBottom: SPACING.md,
  },
  nextStepItem: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray700,
    marginBottom: SPACING.sm,
    lineHeight: FONT_SIZES.sm * 1.4,
  },
});

export default DeepDiveScreen;
