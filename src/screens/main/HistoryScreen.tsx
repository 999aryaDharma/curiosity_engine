// src/screens/main/HistoryScreen.tsx - FRESH HISTORY VIEW

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSparkStore } from "@stores/sparkStore";
import { SparkMode } from "@type/spark.types";
import SparkCard from "@components/spark/SparkCard";
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

interface HistoryScreenProps {
  navigation: any;
}

type FilterType = "all" | "saved";

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const {
    recentSparks,
    savedSparks,
    loadRecentSparks,
    loadSavedSparks,
    toggleSaved,
  } = useSparkStore();

  const [filter, setFilter] = useState<FilterType>("all");
  const [modeFilter, setModeFilter] = useState<SparkMode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await loadRecentSparks(50);
    await loadSavedSparks();
    setIsLoading(false);

    // Animate
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: ANIMATION.slow,
      useNativeDriver: true,
    }).start();
  };

  const getFilteredSparks = () => {
    let sparks = filter === "saved" ? savedSparks : recentSparks;

    if (modeFilter !== null) {
      sparks = sparks.filter((s) => s.mode === modeFilter);
    }

    return sparks;
  };

  const handleSave = async (sparkId: string) => {
    await toggleSaved(sparkId);
    await loadSavedSparks();
    await loadRecentSparks(50);
  };

  const handleFilterChange = (newFilter: FilterType) => {
    fadeAnim.setValue(0);
    setFilter(newFilter);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: ANIMATION.normal,
      useNativeDriver: true,
    }).start();
  };

  const handleModeFilterChange = (mode: SparkMode | null) => {
    fadeAnim.setValue(0);
    setModeFilter(mode);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: ANIMATION.normal,
      useNativeDriver: true,
    }).start();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner
            variant="dots"
            size="large"
            message="Loading history..."
          />
        </View>
      </SafeAreaView>
    );
  }

  const filteredSparks = getFilteredSparks();

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
        <Text style={styles.headerTitle}>Recent Sparks 📚</Text>
        <View style={styles.backButton} />
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {/* All / Saved */}
          <TagChip
            label="All"
            selected={filter === "all"}
            onPress={() => handleFilterChange("all")}
            color="mint"
            size="medium"
            style={styles.filterChip}
          />
          <TagChip
            label={`Saved (${savedSparks.length})`}
            selected={filter === "saved"}
            onPress={() => handleFilterChange("saved")}
            color="rose"
            size="medium"
            style={styles.filterChip}
          />

          {/* Divider */}
          <View style={styles.filterDivider} />

          {/* Mode Filters */}
          <View style={styles.modeBadge}>
            <TouchableOpacity
              onPress={() =>
                handleModeFilterChange(modeFilter === 1 ? null : 1)
              }
              style={[
                styles.modeChip,
                modeFilter === 1 && styles.modeChipActive,
              ]}
            >
              <Text
                style={[
                  styles.modeChipText,
                  modeFilter === 1 && styles.modeChipTextActive,
                ]}
              >
                ⚡ Quick
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modeBadge}>
            <TouchableOpacity
              onPress={() =>
                handleModeFilterChange(modeFilter === 2 ? null : 2)
              }
              style={[
                styles.modeChip,
                modeFilter === 2 && styles.modeChipActive,
                modeFilter === 2 && { backgroundColor: COLORS.secondary.main },
              ]}
            >
              <Text
                style={[
                  styles.modeChipText,
                  modeFilter === 2 && styles.modeChipTextActive,
                ]}
              >
                🌊 Deep
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modeBadge}>
            <TouchableOpacity
              onPress={() =>
                handleModeFilterChange(modeFilter === 3 ? null : 3)
              }
              style={[
                styles.modeChip,
                modeFilter === 3 && styles.modeChipActive,
                modeFilter === 3 && { backgroundColor: COLORS.info.main },
              ]}
            >
              <Text
                style={[
                  styles.modeChipText,
                  modeFilter === 3 && styles.modeChipTextActive,
                ]}
              >
                🧵 Thread
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Sparks List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {filteredSparks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>
                {filter === "saved"
                  ? "No saved sparks yet"
                  : "No sparks match your filters"}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.countContainer}>
                <Text style={styles.countText}>
                  {filteredSparks.length}{" "}
                  {filteredSparks.length === 1 ? "spark" : "sparks"}
                </Text>
              </View>

              {filteredSparks.map((spark, index) => (
                <Animated.View
                  key={spark.id}
                  style={{
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20 * Math.min(index + 1, 5), 0],
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
                    onSave={() => handleSave(spark.id)}
                  />
                </Animated.View>
              ))}
            </>
          )}

          <View style={{ height: SPACING.xxxl }} />
        </Animated.View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersSection: {
    backgroundColor: COLORS.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.gray200,
    paddingVertical: SPACING.md,
  },
  filtersScroll: {
    paddingHorizontal: SPACING.base,
    alignItems: "center",
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  filterDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.neutral.gray300,
    marginHorizontal: SPACING.sm,
  },
  modeBadge: {
    marginRight: SPACING.sm,
  },
  modeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral.gray100,
    borderWidth: 1.5,
    borderColor: COLORS.neutral.gray200,
  },
  modeChipActive: {
    backgroundColor: COLORS.primary.main,
    borderColor: COLORS.primary.main,
  },
  modeChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.gray600,
  },
  modeChipTextActive: {
    color: COLORS.neutral.white,
  },
  scrollContent: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
  },
  countContainer: {
    marginBottom: SPACING.md,
  },
  countText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray600,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING.huge,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.neutral.gray500,
    textAlign: "center",
  },
});

export default HistoryScreen;
