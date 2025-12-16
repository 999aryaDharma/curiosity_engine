// src/screens/main/QuickSparkScreen.tsx - UPDATED

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
import CustomAlert from "@components/common/CustomAlert";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  ANIMATION,
} from "@constants/colors";

interface QuickSparkScreenProps {
  navigation: any;
}

export const QuickSparkScreen: React.FC<QuickSparkScreenProps> = ({
  navigation,
}) => {
  const { dailyTags, selectedTagForGenerate, loadDailyTags } = useTagStore();
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
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Cancel",
    showCancel: false,
    type: "default" as "default" | "warning" | "error" | "success",
    confirmStyle: "default" as "default" | "destructive",
    onConfirm: () => {},
    onCancel: () => {},
  });
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  const insightAnim = React.useRef(new Animated.Value(0)).current;

  const showAlert = (
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    options: {
      confirmText?: string;
      cancelText?: string;
      showCancel?: boolean;
      type?: "default" | "warning" | "error" | "success";
      confirmStyle?: "default" | "destructive";
    } = {}
  ) => {
    setAlertConfig({
      title,
      message,
      confirmText: options.confirmText || "OK",
      cancelText: options.cancelText || "Cancel",
      showCancel: options.showCancel ?? false,
      type: options.type || "default",
      confirmStyle: options.confirmStyle || "default",
      onConfirm: onConfirm || (() => {}),
      onCancel: onCancel || (() => {}),
    });
    setAlertVisible(true);
  };

  useEffect(() => {
    loadDailyTags();
  }, []);

  useEffect(() => {
    if (currentSpark) {
      markAsViewed(currentSpark.id);

      if (previousSparkId !== currentSpark.id) {
        setShowInsight(false);
        setPreviousSparkId(currentSpark.id);
      }

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
    // UPDATED: Use selected tag or all daily tags
    const safeDailyTags = Array.isArray(dailyTags) ? dailyTags : [];

    if (safeDailyTags.length === 0) {
      showAlert("No Tags", "Please wait for tags to load", undefined, undefined, { type: "warning" });
      return;
    }

    // Filter to selected tag if one is chosen
    let tagsForGenerate = safeDailyTags;
    if (selectedTagForGenerate) {
      const selectedTag = safeDailyTags.find(
        (t) => t.id === selectedTagForGenerate
      );
      if (selectedTag) {
        tagsForGenerate = [selectedTag];
        console.log(
          `[QuickSpark] Generating with selected tag: ${selectedTag.name}`
        );
      }
    } else {
      console.log(
        `[QuickSpark] Generating with all ${tagsForGenerate.length} daily tags`
      );
    }

    setShowInsight(false);
    setPreviousSparkId(null);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.95);

    try {
      await generateQuickSpark(tagsForGenerate, settings.difficultyLevel);
    } catch (err: any) {
      showAlert("Error", err.message || "Failed to generate spark", undefined, undefined, { type: "error" });
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

  const safeDailyTags = Array.isArray(dailyTags) ? dailyTags : [];
  const displayedTags = selectedTagForGenerate
    ? safeDailyTags.filter((t) => t.id === selectedTagForGenerate)
    : safeDailyTags.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={() => {
          alertConfig.onConfirm();
          setAlertVisible(false);
        }}
        onCancel={() => {
          alertConfig.onCancel();
          setAlertVisible(false);
        }}
        showCancel={alertConfig.showCancel}
        type={alertConfig.type}
        confirmStyle={alertConfig.confirmStyle}
      />

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
              Generate a quick curiosity boost
              {selectedTagForGenerate
                ? " using your selected tag"
                : " using today's themes"}
            </Text>

            <SoftCard style={styles.infoCard}>
              <Text style={styles.infoTitle}>Settings</Text>
              <Text style={styles.infoItem}>
                Difficulty Level: {Math.round(settings.difficultyLevel * 100)}%
              </Text>
              {selectedTagForGenerate && (
                <Text style={styles.infoItem}>
                  Using tag:{" "}
                  {
                    safeDailyTags.find((t) => t.id === selectedTagForGenerate)
                      ?.name
                  }
                </Text>
              )}
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
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsScroll}
            >
              {displayedTags.map((tag, index) => (
                <TagChip
                  key={tag.id}
                  label={tag.name}
                  selected
                  color={["mint", "coral", "sunny"][index % 3] as any}
                  size="medium"
                  style={styles.tag}
                />
              ))}
            </ScrollView>

            <ModeCard color="mint" style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View style={styles.cloudIcon}>
                  <Text style={styles.cloudText}>☁</Text>
                </View>
                <Text style={styles.questionLabel}>Today's Question</Text>
              </View>

              <Text style={styles.questionText}>{currentSpark.text}</Text>
            </ModeCard>

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
                {currentSpark.funFact && (
                  <SoftCard style={styles.insightCard}>
                    <Text style={styles.insightLabel}>Fun Fact</Text>
                    <Text style={styles.insightText}>
                      {currentSpark.funFact}
                    </Text>
                  </SoftCard>
                )}

                {currentSpark.application && (
                  <SoftCard style={styles.insightCard}>
                    <Text style={styles.insightLabel}>Real Application</Text>
                    <Text style={styles.insightText}>
                      {currentSpark.application}
                    </Text>
                  </SoftCard>
                )}

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

            {currentSpark.conceptLinks &&
              Array.isArray(currentSpark.conceptLinks) &&
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
    borderRadius: 16,
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
    textAlign: "justify",
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
    borderRadius: SPACING.xxl,
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
