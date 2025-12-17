// src/screens/main/HomeScreen.tsx - UPDATED

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTagStore } from "@stores/tagStore";
import { useSparkStore } from "@stores/sparkStore";
import { Tag } from "@type/tag.types";
import notificationService from "@/services/notifications/notificationService";
import TagChip from "@components/tags/TagChip";
import SparkCard from "@components/spark/SparkCard";
import { ModeCard } from "@components/common/Card";
import { TagReplacementModal } from "@components/tags/TagReplacementModal";
import { CustomAlert } from "@components/common/CustomAlert";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  ANIMATION,
} from "@constants/colors";
import { getSplitGreeting } from "@utils/greetingUtils";

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const {
    dailyTags,
    selectedTagForGenerate,
    loadDailyTags,
    generateDailyTags,
    replaceDailyTag,
    selectTagForGenerate,
    isLoading: tagsLoading,
  } = useTagStore();

  const { recentSparks, loadRecentSparks } = useSparkStore();

  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [showTagReplacement, setShowTagReplacement] = useState(false);
  const [tagToReplace, setTagToReplace] = useState<Tag | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Cancel",
    showCancel: true,
    type: "default" as "default" | "warning" | "error" | "success",
    confirmStyle: "default" as "default" | "destructive",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

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
      showCancel: options.showCancel ?? true,
      type: options.type || "default",
      confirmStyle: options.confirmStyle || "default",
      onConfirm: onConfirm || (() => {}),
      onCancel: onCancel || (() => {}),
    });
    setAlertVisible(true);
  };

  useEffect(() => {
    // Set the greeting when component mounts
    const { greeting: greetingText, subject: subjectText } = getSplitGreeting();
    setGreeting(greetingText);
    setSubject(subjectText);

    loadData();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION.slow,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 10,
        bounciness: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadData = async () => {
    try {
      await loadDailyTags();
      await loadRecentSparks(5);
      await notificationService.scheduleSparkReminder();
    } catch (error) {
      console.error("[HomeScreen] Load data failed:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleShuffleTags = async () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: ANIMATION.fast,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION.normal,
        useNativeDriver: true,
      }),
    ]).start();

    await generateDailyTags(true);
  };

  const handleTagLongPress = (tag: Tag) => {
    console.log(`[HomeScreen] Long press on tag: ${tag.name}`);

    showAlert(
      "Replace Tag",
      `Replace "${tag.name}" with another tag?`,
      () => {
        console.log(`[HomeScreen] User confirmed replacement for: ${tag.name}`);
        setTagToReplace(tag);
        setShowTagReplacement(true);
      },
      undefined, // onCancel - will use default empty function
      {
        confirmText: "Replace",
        cancelText: "Cancel",
        type: "default",
      }
    );
  };

  const handleTagPress = (tag: Tag) => {
    console.log(`[HomeScreen] Short press on tag: ${tag.name}`);
    // Toggle selection for generate
    if (selectedTagForGenerate === tag.id) {
      selectTagForGenerate(null); // Deselect
    } else {
      selectTagForGenerate(tag.id); // Select
    }
  };

  const handleTagReplace = async (newTag: Tag) => {
    console.log(
      `[HomeScreen] Replacing tag. Old: ${tagToReplace?.name}, New: ${newTag.name}`
    );
    if (tagToReplace) {
      try {
        await replaceDailyTag(tagToReplace.id, newTag.id);
        setShowTagReplacement(false);
        setTagToReplace(null);

        console.log("[HomeScreen] Tag replacement successful");

        // Re-animate
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (error: any) {
        console.error("[HomeScreen] Tag replacement failed:", error);
        showAlert("Error", error.message, undefined, undefined, {
          type: "error",
        });
      }
    }
  };

  const handleModePress = (mode: 1 | 2 | 3) => {
    switch (mode) {
      case 1:
        navigation.navigate("QuickSpark");
        break;
      case 2:
        navigation.navigate("DeepDive");
        break;
      case 3:
        navigation.navigate("Thread");
        break;
    }
  };

  // DEFENSIVE: Ensure arrays are valid
  const safeDailyTags = Array.isArray(dailyTags) ? dailyTags : [];
  const safeRecentSparks = Array.isArray(recentSparks) ? recentSparks : [];

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary.main}
            colors={[COLORS.primary.main]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{greeting} 👋</Text>
              <Text style={styles.subject}>{subject}</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate("Settings")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.settingsIcon}>⚙</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Today's Themes */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Today's Themes</Text>
              <Text style={styles.sectionSubtitle}>
                {selectedTagForGenerate
                  ? "Tap to deselect • Hold to replace"
                  : "Tap to select • Hold to replace"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleShuffleTags}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.shuffleButton}>Shuffle</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsScroll}
          >
            {safeDailyTags.length > 0 ? (
              safeDailyTags.map((tag, index) => {
                const isSelectedForGenerate = selectedTagForGenerate === tag.id;
                return (
                  <Animated.View
                    key={tag.id}
                    style={{
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateX: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50 * (index + 1), 0],
                          }),
                        },
                        {
                          scale: isSelectedForGenerate
                            ? fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.05],
                              })
                            : 1,
                        },
                      ],
                    }}
                  >
                    <TagChip
                      label={tag.name}
                      selected={isSelectedForGenerate}
                      onPress={() => handleTagPress(tag)}
                      onLongPress={() => handleTagLongPress(tag)}
                      color={
                        isSelectedForGenerate
                          ? "coral"
                          : (["mint", "sunny", "sky", "rose"][index % 4] as any)
                      }
                      size="medium"
                      style={styles.tag}
                      animated
                    />
                  </Animated.View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>
                {tagsLoading ? "Loading themes..." : "No themes available"}
              </Text>
            )}
          </ScrollView>

          {selectedTagForGenerate && (
            <View style={styles.selectionHint}>
              <Text style={styles.selectionHintIcon}>✨</Text>
              <Text style={styles.selectionHintText}>
                Next spark will be generated using:{" "}
                <Text style={styles.selectionHintTag}>
                  {
                    safeDailyTags.find((t) => t.id === selectedTagForGenerate)
                      ?.name
                  }
                </Text>
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Explore Modes */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.exploreTitle}>Explore</Text>

          {/* Quick Spark Card */}
          <Animated.View
            style={{
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              onPress={() => handleModePress(1)}
              activeOpacity={0.9}
            >
              <ModeCard color="mint" style={styles.modeCard}>
                <View style={styles.modeIcon}>
                  <Text style={styles.modeIconText}>⚡</Text>
                </View>
                <Text style={styles.modeTitle}>Quick Spark</Text>
                <Text style={styles.modeDescription}>
                  Get instant ideas and thought starters
                </Text>
              </ModeCard>
            </TouchableOpacity>
          </Animated.View>

          {/* Deep Dive Card */}
          <Animated.View
            style={{
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              onPress={() => handleModePress(2)}
              activeOpacity={0.9}
            >
              <ModeCard color="coral" style={styles.modeCard}>
                <View style={styles.modeIcon}>
                  <Text style={styles.modeIconText}>🌊</Text>
                </View>
                <Text style={styles.modeTitle}>Deep Dive</Text>
                <Text style={styles.modeDescription}>
                  Explore topics layer by layer
                </Text>
              </ModeCard>
            </TouchableOpacity>
          </Animated.View>

          {/* Thread Card */}
          <Animated.View
            style={{
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              onPress={() => handleModePress(3)}
              activeOpacity={0.9}
            >
              <ModeCard color="sky" style={styles.modeCard}>
                <View style={styles.modeIcon}>
                  <Text style={styles.modeIconText}>🧵</Text>
                </View>
                <Text style={styles.modeTitle}>Thread</Text>
                <Text style={styles.modeDescription}>
                  Connect ideas and build knowledge
                </Text>
              </ModeCard>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Recent Sparks */}
        {safeRecentSparks.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Sparks</Text>
              <TouchableOpacity onPress={() => navigation.navigate("History")}>
                <Text style={styles.viewAllButton}>See all</Text>
              </TouchableOpacity>
            </View>

            {safeRecentSparks.slice(0, 3).map((spark, index) => (
              <Animated.View
                key={spark.id}
                style={{
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30 * (index + 1), 0],
                      }),
                    },
                  ],
                }}
              >
                <SparkCard
                  spark={spark}
                  compact
                  onPress={() =>
                    navigation.navigate("SparkDetail", { sparkId: spark.id })
                  }
                  onSave={async () => {
                    const { toggleSaved } = useSparkStore.getState();
                    await toggleSaved(spark.id);
                    await loadRecentSparks(5); // Reload recent sparks to reflect changes
                  }}
                  onShare={() => {
                    // Share functionality
                    console.log("Share spark:", spark.id);
                    // In a real implementation, you would integrate with sharing APIs
                  }}
                />
              </Animated.View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* Tag Replacement Modal */}
      <TagReplacementModal
        visible={showTagReplacement}
        currentTag={tagToReplace}
        onClose={() => {
          setShowTagReplacement(false);
          setTagToReplace(null);
        }}
        onReplace={handleTagReplace}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.offWhite,
  },
  scrollContent: {
    paddingBottom: SPACING.xs * 0,
  },
  header: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
    marginBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingContainer: {
    alignItems: "flex-start",
    marginTop: SPACING.sm
  },
  greeting: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
    lineHeight: FONT_SIZES.xl * 1.2,
  },
  subject: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.gray600,
    fontWeight: FONT_WEIGHTS.light,
    lineHeight: FONT_SIZES.base * 1.2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: COLORS.neutral.white,
  },
  settingsIcon: {
    fontSize: 20,
  },
  section: {
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  exploreTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
    marginBottom: SPACING.md + 3,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.gray600,
    marginTop: SPACING.xs / 2,
  },
  shuffleButton: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary.main,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  viewAllButton: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary.main,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  tagsScroll: {
    paddingVertical: SPACING.xs,
  },
  tag: {
    marginRight: SPACING.sm,
  },
  emptyText: {
    color: COLORS.neutral.gray500,
    fontSize: FONT_SIZES.sm,
  },
  selectionHint: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary.light,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.md,
    marginTop: SPACING.md,
  },
  selectionHintIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  selectionHintText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray700,
    lineHeight: FONT_SIZES.sm * 1.4,
  },
  selectionHintTag: {
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.secondary.main,
  },
  modeCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    minHeight: 140,
  },
  modeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  modeIconText: {
    fontSize: 32,
  },
  modeTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
  },
  modeDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.white,
    opacity: 0.9,
    lineHeight: FONT_SIZES.sm * 1.4,
  },
});

export default HomeScreen;
