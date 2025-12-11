// src/components/common/Card.tsx

import React from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS } from "@constants/colors";

type CardVariant = "default" | "elevated" | "gradient" | "outlined" | "glass";

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  gradientColors?: string[];
  animated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  onPress,
  style,
  gradientColors,
  animated = true,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!animated) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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
      bounciness: 6,
    }).start();
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      overflow: "hidden",
    };

    switch (variant) {
      case "default":
        return {
          ...baseStyle,
          backgroundColor: COLORS.neutral.white,
          ...SHADOWS.small,
        };

      case "elevated":
        return {
          ...baseStyle,
          backgroundColor: COLORS.neutral.white,
          ...SHADOWS.medium,
        };

      case "gradient":
        return {
          ...baseStyle,
          ...SHADOWS.colored.purple,
        };

      case "outlined":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: COLORS.neutral.gray200,
        };

      case "glass":
        return {
          ...baseStyle,
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          // backdropFilter is not supported in React Native
          // Using a more compatible approach for glass effect
          ...SHADOWS.small,
        };

      default:
        return baseStyle;
    }
  };

  const renderCard = () => {
    if (variant === "gradient") {
      return (
        <LinearGradient
          colors={
            (gradientColors as [string, string, ...string[]]) ||
            COLORS.gradients.twilight
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[getCardStyle(), style]}
        >
          {children}
        </LinearGradient>
      );
    }

    return <View style={[getCardStyle(), style]}>{children}</View>;
  };

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          {renderCard()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return <>{renderCard()}</>;
};

// Preset card variants for quick use
export const GlowCard: React.FC<Omit<CardProps, "variant">> = (props) => (
  <Card variant="elevated" {...props} />
);

export const GradientCard: React.FC<Omit<CardProps, "variant">> = (props) => (
  <Card variant="gradient" {...props} />
);

export const OutlinedCard: React.FC<Omit<CardProps, "variant">> = (props) => (
  <Card variant="outlined" {...props} />
);

export const GlassCard: React.FC<Omit<CardProps, "variant">> = (props) => (
  <Card variant="glass" {...props} />
);

export default Card;
