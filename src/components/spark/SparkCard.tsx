// src/components/spark/SparkCard.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Spark, SparkMode } from "@type/spark.types";
import {
  COLORS,
  SHADOWS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZES,
} from "@constants/colors";
import { formatDate } from "@utils/dateUtils";

interface SparkCardProps {
  spark: Spark;
  onPress?: () => void;
  onSave?: () => void;
  showMode?: boolean;
  compact?: boolean;
}

export const SparkCard: React.FC<SparkCardProps> = ({
  spark,
  onPress,
  onSave,
  showMode = true,
  compact = false,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 6,
    }).start();
  };

  const getModeColor = (mode: SparkMode): string[] => {
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

  const getModeLabel = (mode: SparkMode): string => {
    switch (mode) {
      case 1:
        return "Quick Spark";
      case 2:
        return "Deep Dive";
      case 3:
        return "Thread";
      default:
        return "Spark";
    }
  };

  const getModeIcon = (mode: SparkMode): string => {
    switch (mode) {
      case 1:
        return "⚡";
      case 2:
        return "🌊";
      case 3:
        return "🧵";
      default:
        return "✨";
    }
  };

  const truncateText = (text: string, maxLength: number = 120): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const displayText =
    compact && !isExpanded ? truncateText(spark.text) : spark.text;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={[styles.card, compact && styles.compactCard]}>
          {/* Mode Badge with Gradient */}
          {showMode && (
            <LinearGradient
              colors={getModeColor(spark.mode) as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modeBadge}
            >
              <Text style={styles.modeIcon}>{getModeIcon(spark.mode)}</Text>
              <Text style={styles.modeLabel}>{getModeLabel(spark.mode)}</Text>
            </LinearGradient>
          )}

          {/* Spark Text */}
          <Text style={styles.sparkText}>{displayText}</Text>

          {/* Expand/Collapse for compact mode */}
          {compact && spark.text.length > 120 && (
            <TouchableOpacity
              onPress={() => setIsExpanded(!isExpanded)}
              style={styles.expandButton}
            >
              <Text style={styles.expandText}>
                {isExpanded ? "Show less" : "Read more"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Follow-up question if exists */}
          {spark.followUp && !compact && (
            <View style={styles.followUpContainer}>
              <Text style={styles.followUpLabel}>💭 Follow-up:</Text>
              <Text style={styles.followUpText}>{spark.followUp}</Text>
            </View>
          )}

          {/* Concept Links */}
          {spark.conceptLinks && spark.conceptLinks.length > 0 && !compact && (
            <View style={styles.conceptsContainer}>
              {spark.conceptLinks.slice(0, 3).map((concept, index) => (
                <View key={index} style={styles.conceptChip}>
                  <Text style={styles.conceptText}>{concept}</Text>
                </View>
              ))}
              {spark.conceptLinks.length > 3 && (
                <View style={styles.conceptChip}>
                  <Text style={styles.conceptText}>
                    +{spark.conceptLinks.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.timestamp}>
              {formatDate(spark.createdAt, "relative")}
            </Text>

            <View style={styles.actions}>
              {/* Viewed indicator */}
              {spark.viewed && <Text style={styles.viewedIcon}>👁️</Text>}

              {/* Save button */}
              <TouchableOpacity
                onPress={onSave}
                style={styles.saveButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.saveIcon}>{spark.saved ? "❤️" : "🤍"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
    ...SHADOWS.medium,
  },
  compactCard: {
    padding: SPACING.md,
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
  },
  modeIcon: {
    fontSize: FONT_SIZES.sm,
    marginRight: SPACING.xs,
  },
  modeLabel: {
    color: COLORS.neutral.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
  },
  sparkText: {
    fontSize: FONT_SIZES.lg,
    lineHeight: FONT_SIZES.lg * 1.5,
    color: COLORS.neutral.black,
    fontWeight: "500",
    marginBottom: SPACING.md,
  },
  expandButton: {
    alignSelf: "flex-start",
    marginBottom: SPACING.sm,
  },
  expandText: {
    color: COLORS.primary.main,
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
  },
  followUpContainer: {
    backgroundColor: COLORS.neutral.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  followUpLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
    color: COLORS.neutral.gray600,
    marginBottom: SPACING.xs,
  },
  followUpText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray700,
    lineHeight: FONT_SIZES.sm * 1.4,
  },
  conceptsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: SPACING.sm,
  },
  conceptChip: {
    backgroundColor: COLORS.accent.purple + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  conceptText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary.dark,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.gray500,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewedIcon: {
    fontSize: FONT_SIZES.sm,
    marginRight: SPACING.sm,
  },
  saveButton: {
    padding: SPACING.xs,
  },
  saveIcon: {
    fontSize: FONT_SIZES.lg,
  },
});

export default SparkCard;
