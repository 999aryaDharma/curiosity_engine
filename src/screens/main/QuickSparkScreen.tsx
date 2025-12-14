// src/screens/main/QuickSparkScreen.tsx - FRESH QUICK SPARK

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTagStore } from "@stores/tagStore";
import { useSparkStore } from "@stores/sparkStore";
import { useSettingsStore } from "@stores/settingsStore";
import Button from "@components/common/Button";
import { ModeCard, SoftCard } from "@components/common/Card";
import TagChip from "@components/tags/TagChip";
import LoadingSpinner from "@components/common/LoadingSpinner";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
  ANIMATION,
} from "@constants/colors";

interface QuickSparkScreenProps {
  navigation: any;
}

export const QuickSparkScreen: React.FC<QuickSparkScreenProps> = ({
  navigation,
}) => {
  const { dailyTags, loadDailyTags } = useTagStore();
  const {
    currentSpark,
    isGenerating,
    error,
    generateQuickSpark,
    toggleSaved,
    markAsViewed,
  } = useSparkStore();
  const { settings } = useSettingsStore();

  const [showInsight, setShowInsight] = useState(false);
  const [previousSparkId, setPreviousSparkId] = useState<string | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  const insightAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDailyTags();
  }, []);

  useEffect(() => {
    if (currentSpark) {
      markAsViewed(currentSpark.id);

      // Only reset showInsight if this is a new spark (different from previous)
      if (previousSparkId !== currentSpark.id) {
        setShowInsight(false);
        setPreviousSparkId(currentSpark.id);
      }

      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION.slow,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          speed: 10,
          bounciness: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentSpark, previousSparkId]);

  const handleGenerate = async () => {
    if (dailyTags.length === 0) {
      Alert.alert("No Tags", "Please select tags first");
      return;
    }

    setShowInsight(false);
    setPreviousSparkId(null); // Reset previous spark ID
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.95);

    try {
      await generateQuickSpark(dailyTags, settings.difficultyLevel);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to generate spark");
    }
  };

  const handleRevealInsight = () => {
    setShowInsight(true);

    Animated.spring(insightAnim, {
      toValue: 1,
      speed: 10,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleSave = async () => {
    if (currentSpark) {
      await toggleSaved(currentSpark.id);
    }
  };

  if (isGenerating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner
            variant="dots"
            size="large"
            message="Generating your spark..."
          />
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Quick Spark ⚡</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {!currentSpark ? (
          // Empty State
          <Animated.View
            style={[
              styles.emptyState,
              {
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              },
            ]}
          >
            <Text style={styles.emptyEmoji}>✨💡⚡</Text>
            <Text style={styles.emptyTitle}>Ready to Spark?</Text>
            <Text style={styles.emptyDescription}>
              Generate a quick curiosity boost based on today's tags
            </Text>

            <SoftCard style={styles.infoCard}>
              <Text style={styles.infoTitle}>Settings</Text>
              <Text style={styles.infoItem}>
                Difficulty Level: {Math.round(settings.difficultyLevel * 100)}%
              </Text>
              <Text style={styles.infoItem}>
                {settings.difficultyLevel < 0.3
                  ? "Focused mode"
                  : settings.difficultyLevel < 0.6
                  ? "Balanced exploration"
                  : settings.difficultyLevel < 0.8
                  ? "Creative connections"
                  : "Maximum creativity"}
              </Text>
            </SoftCard>

            <Button
              title="Generate Spark"
              onPress={handleGenerate}
              variant="gradient"
              size="large"
              fullWidth
              style={styles.generateButton}
            />
          </Animated.View>
        ) : (
          // Spark View
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            {/* Tags */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsScroll}
            >
              {dailyTags && Array.isArray(dailyTags) ? dailyTags.slice(0, 3).map((tag, index) => (
                <TagChip
                  key={tag.id}
                  label={tag.name}
                  selected
                  color={["mint", "coral", "sunny"][index % 3] as any}
                  size="medium"
                  style={styles.tag}
                />
              )) : null}
            </ScrollView>

            {/* Question Card */}
            <ModeCard color="mint" style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View style={styles.cloudIcon}>
                  <Text style={styles.cloudText}>☁</Text>
                </View>
                <Text style={styles.questionLabel}>Today's Question</Text>
              </View>

              <Text style={styles.questionText}>{currentSpark.text}</Text>
            </ModeCard>

            {/* Reveal Insight Button */}
            {!showInsight ? (
              <Button
                title="Reveal Insight"
                onPress={handleRevealInsight}
                variant="outline"
                size="large"
                fullWidth
                style={styles.revealButton}
              />
            ) : (
              // Insight Content
              <Animated.View
                style={{
                  opacity: insightAnim,
                  transform: [
                    {
                      translateY: insightAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
              >
                {/* Fun Fact */}
                {currentSpark.funFact && (
                  <SoftCard style={styles.insightCard}>
                    <Text style={styles.insightLabel}>Fun Fact</Text>
                    <Text style={styles.insightText}>
                      {currentSpark.funFact}
                    </Text>
                  </SoftCard>
                )}

                {/* Application */}
                {currentSpark.application && (
                  <SoftCard style={styles.insightCard}>
                    <Text style={styles.insightLabel}>Real Application</Text>
                    <Text style={styles.insightText}>
                      {currentSpark.application}
                    </Text>
                  </SoftCard>
                )}

                {/* Knowledge (if exists) */}
                {currentSpark.knowledge && (
                  <SoftCard style={styles.insightCard}>
                    <Text style={styles.insightLabel}>Learn More</Text>
                    <Text style={styles.insightText}>
                      {currentSpark.knowledge}
                    </Text>
                  </SoftCard>
                )}
              </Animated.View>
            )}

            {/* Concept Links */}
            {currentSpark.conceptLinks && Array.isArray(currentSpark.conceptLinks) &&
              currentSpark.conceptLinks.length > 0 && (
                <View style={styles.conceptsSection}>
                  <Text style={styles.conceptsTitle}>Related Concepts</Text>
                  <View style={styles.conceptsGrid}>
                    {currentSpark.conceptLinks.map((concept, index) => (
                      <View key={index} style={styles.conceptChip}>
                        <Text style={styles.conceptText}>{concept}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Generate Another"
                onPress={handleGenerate}
                variant="gradient"
                size="large"
                fullWidth
                style={styles.actionButton}
              />
            </View>
          </Animated.View>
        )}

        <View style={{ height: SPACING.huge }} />
      </ScrollView>

      {/* Bottom Actions (Save & Share) */}
      {currentSpark && (
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.bottomButton} onPress={handleSave}>
            <Text style={styles.bottomButtonIcon}>
              {currentSpark.saved ? "❤" : "🤍"}
            </Text>
            <Text style={styles.bottomButtonText}>Save</Text>
          </TouchableOpacity>

          <View style={styles.bottomDivider} />

          <TouchableOpacity style={styles.bottomButton}>
            <Text style={styles.bottomButtonIcon}>📤</Text>
            <Text style={styles.bottomButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      )}
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
  },
  generateButton: {
    marginTop: SPACING.md,
  },
  tagsScroll: {
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tag: {
    marginRight: SPACING.sm,
  },
  questionCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    minHeight: 200,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.base,
  },
  cloudIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  cloudText: {
    fontSize: 18,
  },
  questionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.white,
    opacity: 0.9,
  },
  questionText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.white,
    lineHeight: FONT_SIZES.xl * 1.4,
  },
  revealButton: {
    marginBottom: SPACING.lg,
  },
  insightCard: {
    marginBottom: SPACING.md,
    padding: SPACING.base,
  },
  insightLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.primary.main,
    marginBottom: SPACING.xs,
  },
  insightText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray700,
    lineHeight: FONT_SIZES.sm * 1.5,
    textAlign: 'justify',
  },
  conceptsSection: {
    marginTop: SPACING.base,
    marginBottom: SPACING.lg,
  },
  conceptsTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.black,
    marginBottom: SPACING.md,
  },
  conceptsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -SPACING.xs,
  },
  conceptChip: {
    backgroundColor: COLORS.primary.light,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    margin: SPACING.xs,
  },
  conceptText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary.main,
    fontWeight: FONT_WEIGHTS.medium,
  },
  actions: {
    marginTop: SPACING.lg,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
  bottomActions: {
    flexDirection: "row",
    backgroundColor: COLORS.neutral.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.gray200,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  bottomButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
  },
  bottomButtonIcon: {
    fontSize: 20,
    marginRight: SPACING.xs,
  },
  bottomButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.neutral.gray700,
  },
  bottomDivider: {
    width: 1,
    backgroundColor: COLORS.neutral.gray200,
    marginHorizontal: SPACING.sm,
  },
});

export default QuickSparkScreen;
