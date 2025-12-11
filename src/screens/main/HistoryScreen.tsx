// src/screens/main/HistoryScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { useSparkStore } from "@stores/sparkStore";
import { SparkMode } from "@type/spark.types";
import SparkCard from "@components/spark/SparkCard";
import TagChip from "@components/tags/TagChip";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "@constants/colors";

interface HistoryScreenProps {
  navigation: any;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const {
    recentSparks,
    savedSparks,
    loadRecentSparks,
    loadSavedSparks,
    toggleSaved,
  } = useSparkStore();

  const [filter, setFilter] = useState<"all" | "saved">("all");
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
      duration: 500,
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📚 History</Text>
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
            onPress={() => setFilter("all")}
            size="medium"
            variant={filter === "all" ? "gradient" : "outlined"}
            style={styles.filterChip}
          />
          <TagChip
            label={`Saved (${savedSparks.length})`}
            selected={filter === "saved"}
            onPress={() => setFilter("saved")}
            size="medium"
            variant={filter === "saved" ? "gradient" : "outlined"}
            style={styles.filterChip}
          />

          {/* Mode Filters */}
          <TagChip
            label="⚡ Quick"
            selected={modeFilter === 1}
            onPress={() => setModeFilter(modeFilter === 1 ? null : 1)}
            size="medium"
            variant={modeFilter === 1 ? "gradient" : "outlined"}
            color={COLORS.sparkModes.quick}
            style={styles.filterChip}
          />
          <TagChip
            label="🌊 Deep Dive"
            selected={modeFilter === 2}
            onPress={() => setModeFilter(modeFilter === 2 ? null : 2)}
            size="medium"
            variant={modeFilter === 2 ? "gradient" : "outlined"}
            color={COLORS.sparkModes.deepDive}
            style={styles.filterChip}
          />
          <TagChip
            label="🧵 Thread"
            selected={modeFilter === 3}
            onPress={() => setModeFilter(modeFilter === 3 ? null : 3)}
            size="medium"
            variant={modeFilter === 3 ? "gradient" : "outlined"}
            color={COLORS.sparkModes.thread}
            style={styles.filterChip}
          />
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
              <Text style={styles.countText}>
                {filteredSparks.length}{" "}
                {filteredSparks.length === 1 ? "spark" : "sparks"}
              </Text>

              {filteredSparks.map((spark) => (
                <SparkCard
                  key={spark.id}
                  spark={spark}
                  compact
                  onPress={() =>
                    navigation.navigate("SparkDetail", { sparkId: spark.id })
                  }
                  onSave={() => handleSave(spark.id)}
                />
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
    backgroundColor: COLORS.neutral.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.gray200,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersSection: {
    backgroundColor: COLORS.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.gray200,
  },
  filtersScroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  countText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray600,
    marginBottom: SPACING.md,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.neutral.gray500,
    textAlign: "center",
  },
});

export default HistoryScreen;
