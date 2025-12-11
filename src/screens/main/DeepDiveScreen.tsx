// src/screens/main/DeepDiveScreen.tsx

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
import { useTagStore } from "@stores/tagStore";
import { useSparkStore } from "@stores/sparkStore";
import { useSettingsStore } from "@stores/settingsStore";
import { SparkLayer } from "@type/spark.types";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "@constants/colors";

interface DeepDiveScreenProps {
  navigation: any;
}

export const DeepDiveScreen: React.FC<DeepDiveScreenProps> = ({
  navigation,
}) => {
  const { dailyTags } = useTagStore();
  const { currentSpark, isGenerating, generateWithMode, clearCurrentSpark } = useSparkStore();
  const { settings } = useSettingsStore();

  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [selectedBranches, setSelectedBranches] = useState<
    Record<number, string>
  >({});
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // If there's no current spark or it's not a Deep Dive, load daily tags and prepare for generation
    if (!currentSpark || currentSpark.mode !== 2) {
      if (currentSpark && currentSpark.mode !== 2) {
        clearCurrentSpark(); // Clear non-DeepDive sparks
      }
      // Load daily tags for potential generation
      useTagStore.getState().loadDailyTags();
    } else if (currentSpark?.layers) {
      // Animate if we have a proper deep dive
      animateEntrance();
    }
  }, [currentSpark, currentLayerIndex, clearCurrentSpark]);

  const animateEntrance = () => {
    fadeAnim.setValue(0);
    Animated.spring(fadeAnim, {
      toValue: 1,
      speed: 12,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

  const handleGenerate = async () => {
    if (dailyTags.length === 0) {
      Alert.alert("No Tags", "Please select tags first");
      return;
    }

    try {
      await generateWithMode(2, dailyTags, {
        layers: settings.maxDeepDiveLayers,
      });
      setCurrentLayerIndex(0);
      setSelectedBranches({});
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to generate deep dive");
    }
  };

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranches({
      ...selectedBranches,
      [currentLayerIndex]: branchId,
    });

    // Move to next layer if available
    if (
      currentSpark?.layers &&
      currentLayerIndex < currentSpark.layers.length - 1
    ) {
      setTimeout(() => {
        setCurrentLayerIndex(currentLayerIndex + 1);
      }, 300);
    }
  };

  const handleGoToLayer = (index: number) => {
    setCurrentLayerIndex(index);
  };

  if (isGenerating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner
            variant="gradient"
            size="large"
            message="Creating your deep dive... 🌊"
          />
        </View>
      </SafeAreaView>
    );
  }

  const currentLayer = currentSpark?.layers?.[currentLayerIndex];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#FFFFFF", "#F3F0FF"]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
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
          {!currentSpark || currentSpark.mode !== 2 ? (
            // Initial State
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🌊🧭✨</Text>
              <Text style={styles.emptyTitle}>Dive Deep</Text>
              <Text style={styles.emptyDescription}>
                Explore {settings.maxDeepDiveLayers} layers of curiosity with
                branching paths
              </Text>

              <Card variant="elevated" style={styles.infoCard}>
                <Text style={styles.infoTitle}>🎯 How it works:</Text>
                <Text style={styles.infoItem}>
                  • Start with a spark question
                </Text>
                <Text style={styles.infoItem}>
                  • Choose branch A or B to explore
                </Text>
                <Text style={styles.infoItem}>
                  • Dive {settings.maxDeepDiveLayers} layers deep
                </Text>
                <Text style={styles.infoItem}>• Build your unique path</Text>
              </Card>

              <Button
                title="Start Deep Dive 🌊"
                onPress={handleGenerate}
                variant="gradient"
                size="large"
                fullWidth
              />
            </View>
          ) : (
            <>
              {/* Progress Bar - only show if current spark is a Deep Dive */}
              {currentSpark?.mode === 2 && currentSpark.layers && (
                <View style={styles.progressSection}>
                  <Text style={styles.progressLabel}>
                    Layer {currentLayerIndex + 1} of{" "}
                    {currentSpark.layers?.length || 0}
                  </Text>
                  <View style={styles.progressBar}>
                    {currentSpark.layers?.map((_, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() =>
                          index <= currentLayerIndex && handleGoToLayer(index)
                        }
                        style={
                          index <= currentLayerIndex
                            ? [styles.progressDot, styles.progressDotActive]
                            : styles.progressDot
                        }
                      >
                        {selectedBranches[index] && (
                          <Text style={styles.progressDotCheck}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Current Layer */}
              {currentLayer && (
                <Animated.View style={{ opacity: fadeAnim }}>
                  <Card variant="elevated" style={styles.layerCard}>
                    <LinearGradient
                      colors={
                        COLORS.gradients.twilight as [
                          string,
                          string,
                          ...string[]
                        ]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.layerBadge}
                    >
                      <Text style={styles.layerBadgeText}>
                        Layer {currentLayer.layer}
                      </Text>
                    </LinearGradient>

                    <Text style={styles.layerSpark}>{currentLayer.spark}</Text>

                    {/* Branches */}
                    <View style={styles.branchesContainer}>
                      <Text style={styles.branchesTitle}>
                        Choose your path:
                      </Text>

                      {currentLayer.branches.map((branch, index) => {
                        const isSelected =
                          selectedBranches[currentLayerIndex] === branch.id;
                        const branchLetter = String.fromCharCode(65 + index); // A, B, C...

                        return (
                          <TouchableOpacity
                            key={branch.id}
                            onPress={() =>
                              !selectedBranches[currentLayerIndex] &&
                              handleBranchSelect(branch.id)
                            }
                            activeOpacity={0.8}
                            disabled={
                              selectedBranches[currentLayerIndex] !==
                                undefined && !isSelected
                            }
                          >
                            <Card
                              variant={isSelected ? "gradient" : "outlined"}
                              gradientColors={COLORS.gradients.ocean}
                              style={StyleSheet.flatten([
                                styles.branchCard,
                                selectedBranches[currentLayerIndex] &&
                                !isSelected
                                  ? styles.branchCardDisabled
                                  : null,
                              ])}
                            >
                              <Text
                                style={
                                  isSelected
                                    ? [
                                        styles.branchLetter,
                                        styles.branchLetterSelected,
                                      ]
                                    : styles.branchLetter
                                }
                              >
                                {branchLetter}
                              </Text>
                              <Text
                                style={
                                  isSelected
                                    ? [
                                        styles.branchText,
                                        styles.branchTextSelected,
                                      ]
                                    : styles.branchText
                                }
                              >
                                {branch.text}
                              </Text>
                            </Card>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </Card>
                </Animated.View>
              )}

              {/* Navigation Buttons */}
              <View style={styles.navigation}>
                {currentLayerIndex > 0 && (
                  <Button
                    title="← Previous"
                    onPress={() => setCurrentLayerIndex(currentLayerIndex - 1)}
                    variant="outline"
                    size="medium"
                    style={styles.navButton}
                  />
                )}

                {currentLayerIndex < (currentSpark.layers?.length || 0) - 1 &&
                  selectedBranches[currentLayerIndex] && (
                    <Button
                      title="Next →"
                      onPress={() =>
                        setCurrentLayerIndex(currentLayerIndex + 1)
                      }
                      variant="primary"
                      size="medium"
                      style={styles.navButton}
                    />
                  )}

                {currentLayerIndex ===
                  (currentSpark.layers?.length || 0) - 1 && (
                  <Button
                    title="New Dive 🌊"
                    onPress={handleGenerate}
                    variant="gradient"
                    size="medium"
                    fullWidth
                  />
                )}
              </View>
            </>
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
  progressSection: {
    marginBottom: SPACING.xl,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.neutral.gray200,
    marginHorizontal: SPACING.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  progressDotActive: {
    backgroundColor: COLORS.primary.main,
  },
  progressDotCheck: {
    color: COLORS.neutral.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: "bold",
  },
  layerCard: {
    marginBottom: SPACING.lg,
  },
  layerBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  layerBadgeText: {
    color: COLORS.neutral.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
  },
  layerSpark: {
    fontSize: FONT_SIZES.xl,
    lineHeight: FONT_SIZES.xl * 1.4,
    color: COLORS.neutral.black,
    fontWeight: "500",
    marginBottom: SPACING.lg,
  },
  branchesContainer: {
    marginTop: SPACING.md,
  },
  branchesTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.neutral.gray600,
    marginBottom: SPACING.md,
  },
  branchCard: {
    marginBottom: SPACING.md,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  branchCardDisabled: {
    opacity: 0.4,
  },
  branchLetter: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "bold",
    color: COLORS.primary.main,
    marginRight: SPACING.md,
    width: 32,
  },
  branchLetterSelected: {
    color: COLORS.neutral.white,
  },
  branchText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * 1.4,
    color: COLORS.neutral.gray700,
  },
  branchTextSelected: {
    color: COLORS.neutral.white,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.lg,
  },
  navButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default DeepDiveScreen;
