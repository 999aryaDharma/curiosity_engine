// src/screens/onboarding/OnboardingScreen.tsx - ULTRA SAFE

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTagStore } from "@stores/tagStore";
import { Tag } from "@type/tag.types";
import TagChip from "@components/tags/TagChip";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "@constants/colors";
import { mmkvService } from "@services/storage/mmkvService";
import ErrorTracker from "@utils/errorTracker";
import { CustomAlert } from "@components/common/CustomAlert";

interface OnboardingScreenProps {
  navigation: any;
}

type SelectionMode = "manual" | "auto";

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  navigation,
}) => {
  ErrorTracker.track("OnboardingScreen.render");

  const { allTags, selectTag, deselectTag, loadAllTags } = useTagStore();

  const [selectionMode, setSelectionMode] = useState<SelectionMode>("manual");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initScreen();
  }, []);

  const initScreen = async () => {
    try {
      ErrorTracker.track("OnboardingScreen.initScreen");
      setIsLoading(true);

      await loadAllTags();

      ErrorTracker.track("OnboardingScreen.tagsLoaded", {
        count: allTags?.length || 0,
      });

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      setIsLoading(false);
    } catch (err: any) {
      ErrorTracker.error("OnboardingScreen.initScreen", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleTagPress = (tagId: string) => {
    try {
      if (selectionMode === "auto") return;

      if (selectedTags.includes(tagId)) {
        setSelectedTags(selectedTags.filter((id) => id !== tagId));
        deselectTag(tagId);
      } else {
        if (selectedTags.length < 10) {
          setSelectedTags([...selectedTags, tagId]);
          selectTag(tagId);
        }
      }
    } catch (err: any) {
      ErrorTracker.error("OnboardingScreen.handleTagPress", err, { tagId });
    }
  };

  const handleContinue = async () => {
    try {
      if (selectedTags.length >= 5) {
        await mmkvService.set("onboarding_complete", true);
        navigation.replace("Home");
      }
    } catch (err: any) {
      ErrorTracker.error("OnboardingScreen.handleContinue", err);
      showAlert("Error", "Failed to complete onboarding", undefined, undefined, { type: "error" });
    }
  };

  // DEFENSIVE: Ensure allTags is array
  const safeTags = Array.isArray(allTags) ? allTags : [];
  ErrorTracker.track("OnboardingScreen.safeTags", { count: safeTags.length });

  // Group tags by cluster
  const groupedTags = safeTags.reduce((acc, tag) => {
    const cluster = tag.cluster || "Other";
    if (!acc[cluster]) acc[cluster] = [];
    acc[cluster].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  const progress = (selectedTags.length / 10) * 100;
  const canContinue = selectedTags.length >= 5;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.main} />
          <Text style={styles.loadingText}>Loading tags...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Error Loading Tags</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Retry"
            onPress={initScreen}
            variant="gradient"
            size="medium"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (safeTags.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>📭</Text>
          <Text style={styles.errorTitle}>No Tags Available</Text>
          <Text style={styles.errorText}>
            Failed to load tags. Please restart the app.
          </Text>
          <Button
            title="Retry"
            onPress={initScreen}
            variant="gradient"
            size="medium"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to{"\n"}Curiosity Engine</Text>
            <Text style={styles.subtitle}>
              Select 5-10 topics that interest you
            </Text>
          </View>

          {/* Progress */}
          <Card variant="elevated" style={styles.progressCard}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {selectedTags.length}/10 selected
            </Text>
          </Card>

          {/* Tags by Cluster */}
          {Object.entries(groupedTags).map(([cluster, tags]) => {
            // DEFENSIVE CHECK
            if (!Array.isArray(tags)) {
              ErrorTracker.error(
                "OnboardingScreen.render",
                new Error("Tags not array"),
                { cluster, tags }
              );
              return null;
            }

            return (
              <View key={cluster} style={styles.clusterSection}>
                <Text style={styles.clusterName}>{cluster}</Text>
                <View style={styles.tagsGrid}>
                  {tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <TagChip
                        key={tag.id}
                        label={tag.name}
                        selected={isSelected}
                        onPress={() => handleTagPress(tag.id)}
                        color="mint"
                        size="medium"
                        style={styles.tag}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* Continue Button */}
      <Animated.View style={[styles.floatingButton, { opacity: fadeAnim }]}>
        <Button
          title={
            !canContinue
              ? `Select ${5 - selectedTags.length} more`
              : "Let's Start!"
          }
          onPress={handleContinue}
          variant="gradient"
          size="large"
          fullWidth
          disabled={!canContinue}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.neutral.gray600,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "bold",
    color: COLORS.neutral.black,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.neutral.gray600,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: "bold",
    color: COLORS.neutral.black,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.neutral.gray600,
    textAlign: "center",
  },
  progressCard: {
    marginBottom: SPACING.xl,
    padding: SPACING.base,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.neutral.gray200,
    borderRadius: BORDER_RADIUS.full,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.primary.main,
    textAlign: "center",
  },
  clusterSection: {
    marginBottom: SPACING.xl,
  },
  clusterName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "bold",
    color: COLORS.neutral.black,
    marginBottom: SPACING.md,
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -SPACING.xs,
  },
  tag: {
    margin: SPACING.xs,
  },
  floatingButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.neutral.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.gray200,
  },
});

export default OnboardingScreen;
