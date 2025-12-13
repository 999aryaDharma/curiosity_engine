// src/screens/main/HomeScreen.tsx - FRESH MINT HOME

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTagStore } from "@stores/tagStore";
import { useSparkStore } from "@stores/sparkStore";
import notificationService from "@/services/notifications/notificationService";
import TagChip from "@components/tags/TagChip";
import SparkCard from "@components/spark/SparkCard";
import Button from "@components/common/Button";
import { ModeCard } from "@components/common/Card";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
} from "@constants/colors";

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const {
    dailyTags,
    loadDailyTags,
    generateDailyTags,
    isLoading: tagsLoading,
  } = useTagStore();

  const { recentSparks, loadRecentSparks } = useSparkStore();

  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
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
    await loadDailyTags();
    await loadRecentSparks(5);
    await notificationService.scheduleSparkReminder();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleShuffleTags = async () => {
    // Animate shuffle
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
            <Text style={styles.greeting}>Curiosity Engine</Text>
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
            <Text style={styles.sectionTitle}>Today's Themes</Text>
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
            {dailyTags && Array.isArray(dailyTags) && dailyTags.length > 0 ? (
              dailyTags.map((tag, index) => (
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
                    ],
                  }}
                >
                  <TagChip
                    label={tag.name}
                    selected
                    color={
                      ["mint", "coral", "sunny", "sky", "rose"][
                        index % 5
                      ] as any
                    }
                    size="medium"
                    style={styles.tag}
                  />
                </Animated.View>
              ))
            ) : (
              <Text style={styles.emptyText}>Loading themes...</Text>
            )}
          </ScrollView>
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
          <Text style={styles.sectionTitle}>Explore</Text>

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
        {recentSparks && Array.isArray(recentSparks) && recentSparks.length > 0 && (
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

            {recentSparks.slice(0, 3).map((spark, index) => (
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
                />
              </Animated.View>
            ))}
          </Animated.View>
        )}

        <View style={{ height: SPACING.huge }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.offWhite,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
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
  greeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral.white,
    ...SHADOWS.soft,
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
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
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
  modeCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    minHeight: 140,
  },
  modeIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.xxl,
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
