// src/components/tags/TagChip.tsx - UPDATED WITH LONG PRESS

import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
  ViewStyle,
} from "react-native";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ANIMATION,
} from "@constants/colors";

type TagColor = "mint" | "coral" | "sunny" | "sky" | "rose" | "neutral";
type TagSize = "small" | "medium" | "large";

interface TagChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void; // NEW: Long press support
  onRemove?: () => void;
  color?: TagColor;
  size?: TagSize;
  animated?: boolean;
  style?: ViewStyle;
}

export const TagChip: React.FC<TagChipProps> = ({
  label,
  selected = false,
  onPress,
  onLongPress, // NEW
  onRemove,
  color = "mint",
  size = "medium",
  animated = true,
  style,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (selected && animated) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.08,
          useNativeDriver: true,
          speed: 50,
          bounciness: 20,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
          bounciness: 12,
        }),
      ]).start();

      Animated.timing(glowAnim, {
        toValue: 1,
        duration: ANIMATION.normal,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: ANIMATION.normal,
        useNativeDriver: true,
      }).start();
    }
  }, [selected]);

  const handlePressIn = () => {
    if (!animated) return;
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    if (!animated) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  // NEW: Long press feedback
  const handleLongPressStart = () => {
    if (!animated || !onLongPress) return;
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const getColorPalette = () => {
    switch (color) {
      case "mint":
        return {
          main: COLORS.primary.main,
          light: COLORS.primary.light,
          lighter: COLORS.primary.lighter,
        };
      case "coral":
        return {
          main: COLORS.secondary.main,
          light: COLORS.secondary.light,
          lighter: COLORS.secondary.lighter,
        };
      case "sunny":
        return {
          main: COLORS.accent.main,
          light: COLORS.accent.light,
          lighter: COLORS.accent.lighter,
        };
      case "sky":
        return {
          main: COLORS.info.main,
          light: COLORS.info.light,
          lighter: COLORS.info.lighter,
        };
      case "rose":
        return {
          main: COLORS.rose.main,
          light: COLORS.rose.light,
          lighter: COLORS.rose.lighter,
        };
      default:
        return {
          main: COLORS.neutral.gray600,
          light: COLORS.neutral.gray50,
          lighter: COLORS.neutral.gray100,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: SPACING.xs,
          paddingHorizontal: SPACING.sm,
          borderRadius: BORDER_RADIUS.full,
          minHeight: 28,
        };
      case "large":
        return {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          borderRadius: BORDER_RADIUS.full,
          minHeight: 44,
        };
      default: // medium
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.base,
          borderRadius: BORDER_RADIUS.full,
          minHeight: 36,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "small":
        return FONT_SIZES.xs;
      case "large":
        return FONT_SIZES.base;
      default:
        return FONT_SIZES.sm;
    }
  };

  const colorPalette = getColorPalette();

  const chipStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...getSizeStyle(),
    backgroundColor: selected ? colorPalette.main : colorPalette.light,
    borderWidth: selected ? 0 : 1.5,
    borderColor: selected ? "transparent" : colorPalette.lighter,
  };

  const textColor = selected ? COLORS.neutral.white : colorPalette.main;

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        selected && {
          shadowColor: colorPalette.main,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.3],
          }),
          shadowRadius: 12,
          elevation: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 6],
          }),
        },
      ]}
    >
      <TouchableOpacity
        style={[chipStyle, style]}
        onPress={onPress}
        onLongPress={() => {
          console.log(`[TagChip] Long press detected on: ${label}`);
          onLongPress && onLongPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={!onPress && !onLongPress}
        delayLongPress={500}
      >
        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.label,
              {
                color: textColor,
                fontSize: getTextSize(),
                fontWeight: selected
                  ? FONT_WEIGHTS.semibold
                  : FONT_WEIGHTS.medium,
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>

          {onRemove && selected && (
            <TouchableOpacity
              onPress={onRemove}
              style={styles.removeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.removeIcon, { color: textColor }]}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    // Font properties set dynamically
  },
  removeButton: {
    marginLeft: SPACING.xs,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  removeIcon: {
    fontSize: 16,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 16,
  },
});

export default TagChip;
