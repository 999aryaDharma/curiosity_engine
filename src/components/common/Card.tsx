// src/components/common/Card.tsx - FRESH ROUNDED CARDS

import React from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  COLORS,
  SHADOWS,
  SPACING,
  BORDER_RADIUS,
  ANIMATION,
} from "@constants/colors";

type CardVariant =
  | "default" // Standard white card with soft shadow
  | "elevated" // More pronounced shadow
  | "gradient" // Gradient background
  | "outlined" // Just border, no fill
  | "glass" // Glassmorphism effect
  | "soft"; // Light colored background

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  gradientColors?: string[];
  animated?: boolean;
  borderRadius?: "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  onPress,
  style,
  gradientColors,
  animated = true,
  borderRadius = "xxl",
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const shadowAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!animated || !onPress) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0.5,
        duration: ANIMATION.fast,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (!animated || !onPress) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 6,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: ANIMATION.normal,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const getBorderRadius = () => {
    switch (borderRadius) {
      case "sm":
        return BORDER_RADIUS.sm;
      case "md":
        return BORDER_RADIUS.md;
      case "lg":
        return BORDER_RADIUS.lg;
      case "xl":
        return BORDER_RADIUS.xl;
      case "xxl":
        return BORDER_RADIUS.xxl;
      case "xxxl":
        return BORDER_RADIUS.xxxl;
      default:
        return BORDER_RADIUS.xxl;
    }
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: getBorderRadius(),
      padding: SPACING.base,
      overflow: "hidden",
    };

    switch (variant) {
      case "default":
        return {
          ...baseStyle,
          backgroundColor: COLORS.neutral.white,
          ...SHADOWS.soft,
        };

      case "elevated":
        return {
          ...baseStyle,
          backgroundColor: COLORS.neutral.white,
          ...SHADOWS.card,
        };

      case "gradient":
        return {
          ...baseStyle,
          ...SHADOWS.glow.mint,
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
          backgroundColor: COLORS.neutral.white,
          opacity: 0.95,
          ...SHADOWS.soft,
        };

      case "soft":
        return {
          ...baseStyle,
          backgroundColor: COLORS.neutral.gray50,
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
            (COLORS.gradients.mint as [string, string, ...string[]])
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
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnim }] },
          animated && typeof onPress === 'function' ? {
              shadowOpacity: shadowAnim,
            } : {},
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {renderCard()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return <>{renderCard()}</>;
};

// Preset card variants for quick use
export const ModeCard: React.FC<
  Omit<CardProps, "variant" | "borderRadius"> & {
    color?: "mint" | "coral" | "sunny" | "sky" | "rose";
  }
> = ({ color = "mint", ...props }) => {
  const gradients = {
    mint: COLORS.gradients.mint,
    coral: COLORS.gradients.coral,
    sunny: COLORS.gradients.sunny,
    sky: COLORS.gradients.sky,
    rose: COLORS.gradients.rose,
  };

  return (
    <Card
      variant="gradient"
      borderRadius="xxl"
      gradientColors={gradients[color]}
      {...props}
    />
  );
};

export const GlowCard: React.FC<Omit<CardProps, "variant">> = (props) => (
  <Card variant="elevated" borderRadius="xxl" {...props} />
);

export const SoftCard: React.FC<Omit<CardProps, "variant">> = (props) => (
  <Card variant="soft" borderRadius="xl" {...props} />
);

export const OutlinedCard: React.FC<Omit<CardProps, "variant">> = (props) => (
  <Card variant="outlined" borderRadius="xl" {...props} />
);

export const GlassCard: React.FC<Omit<CardProps, "variant">> = (props) => (
  <Card variant="glass" borderRadius="xxl" {...props} />
);

export default Card;
