// src/screens/main/HomeScreen.tsx

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
import { LinearGradient } from "expo-linear-gradient";
import { useTagStore } from "@stores/tagStore";
import { useSparkStore } from "@stores/sparkStore";
import notificationService from "@/services/notifications/notificationService";
import TagChip from "@components/tags/TagChip";
import SparkCard from "@components/spark/SparkCard";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  SHADOWS,
} from "@constants/colors";
import { formatDate } from "@utils/dateUtils";

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const {
    dailyTags,
    dailySelection,
    loadDailyTags,
    generateDailyTags,
    isLoading: tagsLoading,
  } = useTagStore();

  const { recentSparks, loadRecentSparks } = useSparkStore();

  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadData();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 6,
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

  const getModeGradient = (mode: number) => {
    switch (mode) {
      case 1:
        return COLORS.gradients.forest;
      case 2:
        return COLORS.gradients.twilight;
      case 3:
        return COLORS.gradients.candy;
      default:
        return COLORS.gradients.ocean;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
            <View>
              <Text style={styles.greeting}>Good day!</Text>
              <Text style={styles.date}>{formatDate(Date.now(), "long")}</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate("Settings")}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

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
            <Text style={styles.sectionTitle}>Today's Tags</Text>
            <TouchableOpacity onPress={handleShuffleTags}>
              <Text style={styles.shuffleButton}>Shuffle</Text>
            </TouchableOpacity>
          </View>

          <Card variant="elevated" style={styles.tagsCard}>
            <View style={styles.tagsContainer}>
              {dailyTags.length > 0 ? (
                dailyTags.map((tag) => (
                  <TagChip
                    key={tag.id}
                    label={tag.name}
                    selected
                    variant="gradient"
                    size="medium"
                    style={styles.tag}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>Loading tags...</Text>
              )}
            </View>
          </Card>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Choose Your Journey</Text>

          <View style={styles.modesGrid}>
            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => handleModePress(1)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={getModeGradient(1) as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modeGradient}
              >
                <Text style={styles.modeEmoji}>⚡</Text>
                <Text style={styles.modeTitle}>Quick Spark</Text>
                <Text style={styles.modeDescription}>Fast curiosity boost</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => handleModePress(2)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={getModeGradient(2) as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modeGradient}
              >
                <Text style={styles.modeEmoji}>🌊</Text>
                <Text style={styles.modeTitle}>Deep Dive</Text>
                <Text style={styles.modeDescription}>
                  Multi-layer exploration
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => handleModePress(3)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={getModeGradient(3) as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modeGradient}
              >
                <Text style={styles.modeEmoji}>🧵</Text>
                <Text style={styles.modeTitle}>Thread</Text>
                <Text style={styles.modeDescription}>Connected concepts</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {recentSparks.length > 0 && (
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
                <Text style={styles.viewAllButton}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentSparks.slice(0, 3).map((spark) => (
              <SparkCard
                key={spark.id}
                spark={spark}
                compact
                onPress={() =>
                  navigation.navigate("SparkDetail", { sparkId: spark.id })
                }
              />
            ))}
          </Animated.View>
        )}

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: "bold",
    color: COLORS.neutral.black,
    marginBottom: SPACING.xs,
  },
  date: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray500,
  },
  settingsButton: {
    padding: SPACING.sm,
  },
  settingsIcon: {
    fontSize: 24,
  },
  section: {
    paddingHorizontal: SPACING.lg,
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
    fontWeight: "bold",
    color: COLORS.neutral.black,
  },
  shuffleButton: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary.main,
    fontWeight: "600",
  },
  viewAllButton: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary.main,
    fontWeight: "600",
  },
  tagsCard: {
    padding: SPACING.md,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -SPACING.xs,
  },
  tag: {
    margin: SPACING.xs,
  },
  emptyText: {
    color: COLORS.neutral.gray500,
    fontSize: FONT_SIZES.sm,
    textAlign: "center",
    padding: SPACING.lg,
  },
  modesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -SPACING.xs,
  },
  modeCard: {
    width: "48%",
    margin: "1%",
    marginBottom: SPACING.md,
  },
  modeGradient: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    minHeight: 140,
    justifyContent: "center",
    ...SHADOWS.medium,
  },
  modeEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  modeTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "bold",
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  modeDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.white,
    opacity: 0.9,
    textAlign: "center",
  },
});

export default HomeScreen;
