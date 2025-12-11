// src/components/tags/TagChip.tsx

import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  COLORS,
  SHADOWS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZES,
} from "@constants/colors";

interface TagChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  color?: string;
  size?: "small" | "medium" | "large";
  variant?: "default" | "gradient" | "outlined";
  animated?: boolean;
  style?: ViewStyle;
}

export const TagChip: React.FC<TagChipProps> = ({
  label,
  selected = false,
  onPress,
  onRemove,
  color,
  size = "medium",
  variant = "default",
  animated = true,
  style,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (selected && animated) {
      // Playful bounce when selected
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
          speed: 50,
          bounciness: 15,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
          bounciness: 10,
        }),
      ]).start();

      // Subtle rotation
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selected]);

  const handlePressIn = () => {
    if (!animated) return;
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    if (!animated) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: SPACING.xs,
          paddingHorizontal: SPACING.sm,
          borderRadius: BORDER_RADIUS.sm,
        };
      case "large":
        return {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          borderRadius: BORDER_RADIUS.lg,
        };
      default:
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
          borderRadius: BORDER_RADIUS.md,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "small":
        return FONT_SIZES.xs;
      case "large":
        return FONT_SIZES.md;
      default:
        return FONT_SIZES.sm;
    }
  };

  const getChipStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      ...getSizeStyle(),
    };

    if (variant === "gradient") {
      return {
        ...baseStyle,
        overflow: "hidden",
        ...SHADOWS.small,
      };
    }

    if (variant === "outlined") {
      return {
        ...baseStyle,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: selected
          ? color || COLORS.primary.main
          : COLORS.neutral.gray300,
      };
    }

    // Default variant
    return {
      ...baseStyle,
      backgroundColor: selected
        ? color || COLORS.primary.main
        : COLORS.neutral.gray100,
      ...SHADOWS.small,
    };
  };

  const textColor =
    variant === "outlined"
      ? selected
        ? color || COLORS.primary.main
        : COLORS.neutral.gray600
      : selected
      ? COLORS.neutral.white
      : COLORS.neutral.gray700;

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-5deg", "5deg"],
  });

  const renderContent = () => (
    <View style={[styles.contentContainer, getSizeStyle()]}>
      <Text
        style={[
          styles.label,
          {
            color: textColor,
            fontSize: getTextSize(),
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
  );

  const animatedStyle = {
    transform: [{ scale: scaleAnim }, { rotate }],
  };

  if (variant === "gradient" && selected) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          disabled={!onPress}
        >
          <LinearGradient
            colors={COLORS.gradients.twilight as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[getChipStyle(), style]}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[getChipStyle(), style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        disabled={!onPress}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontWeight: "600",
  },
  removeButton: {
    marginLeft: SPACING.xs,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  removeIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default TagChip;
