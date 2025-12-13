// src/components/spark/SparkCard.tsx - FRESH SPARK CARDS

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Spark, SparkMode } from "@type/spark.types";
import {
  COLORS,
  SHADOWS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ANIMATION,
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
      bounciness: 0,
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

  const getModeColor = (mode: SparkMode) => {
    switch (mode) {
      case 1:
        return {
          color: COLORS.primary.main,
          light: COLORS.primary.light,
          gradient: COLORS.gradients.mint,
        };
      case 2:
        return {
          color: COLORS.secondary.main,
          light: COLORS.secondary.light,
          gradient: COLORS.gradients.coral,
        };
      case 3:
        return {
          color: COLORS.info.main,
          light: COLORS.info.light,
          gradient: COLORS.gradients.sky,
        };
      default:
        return {
          color: COLORS.primary.main,
          light: COLORS.primary.light,
          gradient: COLORS.gradients.mint,
        };
    }
  };

  const getModeLabel = (mode: SparkMode): string => {
    switch (mode) {
      case 1:
        return "Quick";
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
  const modeColors = getModeColor(spark.mode);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.card, compact && styles.compactCard]}>
          {/* Mode Badge */}
          {showMode && (
            <View
              style={[styles.modeBadge, { backgroundColor: modeColors.light }]}
            >
              <Text style={styles.modeIcon}>{getModeIcon(spark.mode)}</Text>
              <Text style={[styles.modeLabel, { color: modeColors.color }]}>
                {getModeLabel(spark.mode)}
              </Text>
            </View>
          )}

          {/* Spark Text */}
          <Text style={styles.sparkText}>{displayText}</Text>

          {/* Expand/Collapse for compact mode */}
          {compact && spark.text.length > 120 && (
            <TouchableOpacity
              onPress={() => setIsExpanded(!isExpanded)}
              style={styles.expandButton}
            >
              <Text style={[styles.expandText, { color: modeColors.color }]}>
                {isExpanded ? "Show less" : "Read more"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Concept Links (if not compact) */}
          {!compact && spark.conceptLinks && Array.isArray(spark.conceptLinks) && spark.conceptLinks.length > 0 && (
            <View style={styles.conceptsContainer}>
              {spark.conceptLinks.slice(0, 3).map((concept, index) => (
                <View
                  key={index}
                  style={[
                    styles.conceptChip,
                    { backgroundColor: modeColors.light },
                  ]}
                >
                  <Text
                    style={[styles.conceptText, { color: modeColors.color }]}
                  >
                    {concept}
                  </Text>
                </View>
              ))}
              {spark.conceptLinks.length > 3 && (
                <View
                  style={[
                    styles.conceptChip,
                    { backgroundColor: modeColors.light },
                  ]}
                >
                  <Text
                    style={[styles.conceptText, { color: modeColors.color }]}
                  >
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
              {spark.viewed && (
                <View style={styles.viewedBadge}>
                  <Text style={styles.viewedIcon}>👁</Text>
                </View>
              )}

              {/* Save button */}
              {onSave && (
                <TouchableOpacity
                  onPress={onSave}
                  style={styles.saveButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.saveIcon}>
                    {spark.saved ? "❤" : "🤍"}
                  </Text>
                </TouchableOpacity>
              )}
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
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.base,
    marginVertical: SPACING.sm,
    ...SHADOWS.soft,
  },
  compactCard: {
    padding: SPACING.md,
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  modeIcon: {
    fontSize: FONT_SIZES.sm,
    marginRight: SPACING.xs,
  },
  modeLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  sparkText: {
    fontSize: FONT_SIZES.base,
    lineHeight: FONT_SIZES.base * 1.5,
    color: COLORS.neutral.black,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: SPACING.md,
  },
  expandButton: {
    alignSelf: "flex-start",
    marginBottom: SPACING.sm,
  },
  expandText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  conceptsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: SPACING.sm,
  },
  conceptChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  conceptText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.gray100,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.gray500,
    fontWeight: FONT_WEIGHTS.medium,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewedBadge: {
    marginRight: SPACING.sm,
  },
  viewedIcon: {
    fontSize: FONT_SIZES.sm,
  },
  saveButton: {
    padding: SPACING.xs / 2,
  },
  saveIcon: {
    fontSize: FONT_SIZES.lg,
  },
});

export default SparkCard;
