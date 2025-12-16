// src/components/spark/SparkCard.tsx - REDESIGNED (FRESH & CLEAN)

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
  FONT_WEIGHTS,
  ANIMATION,
} from "@constants/colors";
import { formatDate } from "@utils/dateUtils";

interface SparkCardProps {
  spark: Spark;
  onPress?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  compact?: boolean;
}

export const SparkCard: React.FC<SparkCardProps> = ({
  spark,
  onPress,
  onSave,
  onShare,
  compact = false,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

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
      bounciness: 8,
    }).start();
  };

  const getModeConfig = (mode: SparkMode) => {
    switch (mode) {
      case 1:
        return {
          gradient: COLORS.gradients.mint,
          icon: "⚡",
          label: "Quick Spark",
          badgeColor: COLORS.primary.light,
          badgeTextColor: COLORS.primary.main,
        };
      case 2:
        return {
          gradient: COLORS.gradients.coral,
          icon: "🌊",
          label: "Deep Dive",
          badgeColor: COLORS.secondary.light,
          badgeTextColor: COLORS.secondary.main,
        };
      case 3:
        return {
          gradient: COLORS.gradients.sky,
          icon: "🧵",
          label: "Thread",
          badgeColor: COLORS.info.light,
          badgeTextColor: COLORS.info.main,
        };
      default:
        return {
          gradient: COLORS.gradients.mint,
          icon: "✨",
          label: "Spark",
          badgeColor: COLORS.primary.light,
          badgeTextColor: COLORS.primary.main,
        };
    }
  };

  const config = getModeConfig(spark.mode);

  // Extract first 2 concept links as tags
  const displayTags = spark.conceptLinks?.slice(0, 2) || [];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.card}>
          {/* Top Gradient Bar */}
          <LinearGradient
            colors={config.gradient as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topBar}
          />

          {/* Card Content */}
          <View style={styles.content}>
            {/* Header Row */}
            <View style={styles.headerRow}>
              {/* Mode Badge */}
              <View
                style={[
                  styles.modeBadge,
                  { backgroundColor: config.badgeColor },
                ]}
              >
                <Text style={styles.modeIcon}>{config.icon}</Text>
                <Text
                  style={[styles.modeLabel, { color: config.badgeTextColor }]}
                >
                  {config.label}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                {onSave && (
                  <TouchableOpacity
                    onPress={onSave}
                    style={styles.actionButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.actionIcon}>
                      {spark.saved ? "❤️" : "🤍"}
                    </Text>
                  </TouchableOpacity>
                )}
                {onShare && (
                  <TouchableOpacity
                    onPress={onShare}
                    style={styles.actionButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.actionIcon}>📤</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title} numberOfLines={compact ? 2 : undefined}>
              {spark.text}
            </Text>

            {/* Description (if has knowledge) */}
            {spark.knowledge && !compact && (
              <Text style={styles.description} numberOfLines={2}>
                {spark.knowledge.substring(0, 120)}...
              </Text>
            )}

            {/* Tags and Date Row */}
            <View style={styles.tagsAndDateRow}>
              {/* Tags */}
              {displayTags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {displayTags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Creation Date */}
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>
                  {formatDate(spark.createdAt, "relative")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.base,
  },
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.xxl,
    overflow: "hidden",
    ...SHADOWS.card,
  },
  topBar: {
    height: 6,
    width: "100%",
  },
  content: {
    padding: SPACING.base,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  modeIcon: {
    fontSize: FONT_SIZES.sm,
    marginRight: SPACING.xs,
  },
  modeLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral.gray50,
    justifyContent: "center",
    alignItems: "center",
  },
  actionIcon: {
    fontSize: FONT_SIZES.base,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.gray600,
    lineHeight: FONT_SIZES.lg * 1.3,
    marginBottom: SPACING.lg,
    paddingLeft: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray600,
    lineHeight: FONT_SIZES.sm * 1.5,
    marginBottom: SPACING.md,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.neutral.gray100,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  tagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.gray600,
    fontWeight: FONT_WEIGHTS.medium,
  },
  tagsAndDateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: SPACING.sm,
  },
  dateContainer: {
    backgroundColor: COLORS.neutral.gray100,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.sm,
  },
  dateText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.gray500,
    fontWeight: FONT_WEIGHTS.medium,
  },
});

export default SparkCard;
