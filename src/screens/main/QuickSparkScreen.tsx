// src/screens/main/QuickSparkScreen.tsx

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
import { LinearGradient } from "expo-linear-gradient";
import { useTagStore } from "@stores/tagStore";
import { useSparkStore } from "@stores/sparkStore";
import { useSettingsStore } from "@stores/settingsStore";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "@constants/colors";

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
    generateWithMode,
    toggleSaved,
    markAsViewed,
  } = useSparkStore();
  const { settings } = useSettingsStore();

  const [showAnswer, setShowAnswer] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadDailyTags();
  }, []);

  useEffect(() => {
    if (currentSpark) {
      // Mark as viewed
      markAsViewed(currentSpark.id);

      // Animate entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          speed: 12,
          bounciness: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentSpark]);

  const handleGenerate = async () => {
    if (dailyTags.length === 0) {
      Alert.alert("No Tags", "Please select tags first");
      return;
    }

    setShowAnswer(false);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);

    try {
      await generateWithMode(1, dailyTags);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to generate spark");
    }
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
    Animated.spring(fadeAnim, {
      toValue: 1,
      speed: 12,
      bounciness: 6,
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
            variant="gradient"
            size="large"
            message="Generating your spark... ✨"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#FFFFFF", "#F0F9FF"]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚡ Quick Spark</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {!currentSpark ? (
            // Initial State
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>⚡✨💭</Text>
              <Text style={styles.emptyTitle}>Ready to Spark?</Text>
              <Text style={styles.emptyDescription}>
                Generate a quick curiosity boost based on today's tags
              </Text>

              <Card variant="elevated" style={styles.infoCard}>
                <Text style={styles.infoTitle}>🎯 What you'll get:</Text>
                <Text style={styles.infoItem}>
                  • A thought-provoking question
                </Text>
                <Text style={styles.infoItem}>• A follow-up to go deeper</Text>
                <Text style={styles.infoItem}>
                  • Related concepts to explore
                </Text>
              </Card>

              <Button
                title="Generate Spark ⚡"
                onPress={handleGenerate}
                variant="gradient"
                size="large"
                fullWidth
                style={styles.generateButton}
              />
            </View>
          ) : (
            // Spark Display
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }}
            >
              {/* Main Spark */}
              <Card variant="elevated" style={styles.sparkCard}>
                <LinearGradient
                  colors={COLORS.gradients.forest as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sparkBadge}
                >
                  <Text style={styles.sparkBadgeText}>✨ Your Spark</Text>
                </LinearGradient>

                <Text style={styles.sparkText}>{currentSpark.text}</Text>

                {/* Actions */}
                <View style={styles.sparkActions}>
                  <TouchableOpacity
                    onPress={handleSave}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionIcon}>
                      {currentSpark.saved ? "❤️" : "🤍"}
                    </Text>
                    <Text style={styles.actionLabel}>
                      {currentSpark.saved ? "Saved" : "Save"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {}}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionIcon}>📤</Text>
                    <Text style={styles.actionLabel}>Share</Text>
                  </TouchableOpacity>
                </View>
              </Card>

              {/* Follow-up Question */}
              {currentSpark.followUp && (
                <Card variant="outlined" style={styles.followUpCard}>
                  <View style={styles.followUpHeader}>
                    <Text style={styles.followUpIcon}>💭</Text>
                    <Text style={styles.followUpTitle}>Dig Deeper</Text>
                  </View>

                  {!showAnswer ? (
                    <View>
                      <Text style={styles.followUpText}>
                        {currentSpark.followUp}
                      </Text>
                      <Button
                        title="Reveal Answer 👀"
                        onPress={handleRevealAnswer}
                        variant="secondary"
                        size="medium"
                        style={styles.revealButton}
                      />
                    </View>
                  ) : (
                    <Animated.View style={{ opacity: fadeAnim }}>
                      <Text style={styles.followUpText}>
                        {currentSpark.followUp}
                      </Text>
                      <View style={styles.answerContainer}>
                        <Text style={styles.answerLabel}>💡 Think about:</Text>
                        <Text style={styles.answerText}>
                          Explore how these concepts connect to your own
                          experiences and what new questions emerge from this
                          spark.
                        </Text>
                      </View>
                    </Animated.View>
                  )}
                </Card>
              )}

              {/* Concept Links */}
              {currentSpark.conceptLinks &&
                currentSpark.conceptLinks.length > 0 && (
                  <Card variant="glass" style={styles.conceptsCard}>
                    <Text style={styles.conceptsTitle}>
                      🔗 Related Concepts
                    </Text>
                    <View style={styles.conceptsGrid}>
                      {currentSpark.conceptLinks.map((concept, index) => (
                        <View key={index} style={styles.conceptChip}>
                          <Text style={styles.conceptText}>{concept}</Text>
                        </View>
                      ))}
                    </View>
                  </Card>
                )}

              {/* Generate Another */}
              <Button
                title="Generate Another ⚡"
                onPress={handleGenerate}
                variant="outline"
                size="large"
                fullWidth
                style={styles.anotherButton}
              />
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
  generateButton: {
    marginTop: SPACING.md,
  },
  sparkCard: {
    marginBottom: SPACING.lg,
  },
  sparkBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  sparkBadgeText: {
    color: COLORS.neutral.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
  },
  sparkText: {
    fontSize: FONT_SIZES.xxl,
    lineHeight: FONT_SIZES.xxl * 1.4,
    color: COLORS.neutral.black,
    fontWeight: "500",
    marginBottom: SPACING.lg,
  },
  sparkActions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.gray200,
    paddingTop: SPACING.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.xl,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: SPACING.xs,
  },
  actionLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray600,
    fontWeight: "600",
  },
  followUpCard: {
    marginBottom: SPACING.lg,
  },
  followUpHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  followUpIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  followUpTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.neutral.black,
  },
  followUpText: {
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * 1.5,
    color: COLORS.neutral.gray700,
    marginBottom: SPACING.md,
  },
  revealButton: {
    marginTop: SPACING.sm,
  },
  answerContainer: {
    backgroundColor: COLORS.accent.yellow + "20",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  answerLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.neutral.black,
    marginBottom: SPACING.xs,
  },
  answerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray700,
    lineHeight: FONT_SIZES.sm * 1.4,
  },
  conceptsCard: {
    marginBottom: SPACING.lg,
  },
  conceptsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.neutral.black,
    marginBottom: SPACING.md,
  },
  conceptsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -SPACING.xs,
  },
  conceptChip: {
    backgroundColor: COLORS.accent.purple + "20",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    margin: SPACING.xs,
  },
  conceptText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary.dark,
    fontWeight: "600",
  },
  anotherButton: {
    marginTop: SPACING.md,
  },
});

export default QuickSparkScreen;
