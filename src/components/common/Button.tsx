// src/components/common/Button.tsx - FRESH ROUNDED BUTTON

import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  COLORS,
  SHADOWS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ANIMATION,
} from "@constants/colors";

type ButtonVariant =
  | "gradient" // Primary gradient button
  | "solid" // Solid color button
  | "soft" // Light background with colored text
  | "outline" // Outlined button
  | "ghost"; // Transparent with hover

type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "gradient",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  style,
  textStyle,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const glowAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
      Animated.timing(glowAnim, {
        toValue: 1.1,
        duration: ANIMATION.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: ANIMATION.normal,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.base,
          minHeight: 40,
        };
      case "large":
        return {
          paddingVertical: SPACING.base + 2,
          paddingHorizontal: SPACING.xl,
          minHeight: 56,
        };
      default: // medium
        return {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          minHeight: 48,
        };
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case "small":
        return { fontSize: FONT_SIZES.sm };
      case "large":
        return { fontSize: FONT_SIZES.lg };
      default:
        return { fontSize: FONT_SIZES.base };
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      borderRadius: BORDER_RADIUS.full, // Pill shape
      ...getSizeStyle(),
      ...(fullWidth && { width: "100%" }),
    };

    switch (variant) {
      case "gradient":
        return {
          ...baseStyle,
          overflow: "hidden",
          ...SHADOWS.glow.mint,
        };

      case "solid":
        return {
          ...baseStyle,
          backgroundColor: COLORS.primary.main,
          ...SHADOWS.soft,
        };

      case "soft":
        return {
          ...baseStyle,
          backgroundColor: COLORS.primary.light,
        };

      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: COLORS.primary.main,
        };

      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };

      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: FONT_WEIGHTS.semibold,
      ...getTextSizeStyle(),
    };

    switch (variant) {
      case "gradient":
      case "solid":
        return { ...baseStyle, color: COLORS.neutral.white };

      case "soft":
      case "outline":
      case "ghost":
        return { ...baseStyle, color: COLORS.primary.main };

      default:
        return baseStyle;
    }
  };

  const buttonStyle = [getButtonStyle(), disabled && styles.disabled, style];

  const textStyles = [
    getTextStyle(),
    disabled && styles.disabledText,
    textStyle,
  ];

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={
            variant === "gradient" || variant === "solid"
              ? COLORS.neutral.white
              : COLORS.primary.main
          }
          style={{ marginRight: icon ? SPACING.sm : 0 }}
        />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Animated.View
              style={[
                styles.iconContainer,
                styles.iconLeft,
                { transform: [{ scale: glowAnim }] },
              ]}
            >
              {icon}
            </Animated.View>
          )}
        </>
      )}

      <Text style={textStyles}>{title}</Text>

      {!loading && icon && iconPosition === "right" && (
        <Animated.View
          style={[
            styles.iconContainer,
            styles.iconRight,
            { transform: [{ scale: glowAnim }] },
          ]}
        >
          {icon}
        </Animated.View>
      )}
    </>
  );

  if (variant === "gradient") {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
        >
          <LinearGradient
            colors={COLORS.gradients.mint as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={buttonStyle}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.6,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});

export default Button;
