// src/components/common/Button.tsx

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
} from "@constants/colors";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "gradient";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
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

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      ...getSizeStyle(),
      ...(fullWidth && { width: "100%" }),
    };

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: COLORS.primary.main,
          ...SHADOWS.medium,
        };

      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: COLORS.neutral.gray100,
          ...SHADOWS.small,
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

      case "gradient":
        return {
          ...baseStyle,
          overflow: "hidden",
          ...SHADOWS.colored.purple,
        };

      default:
        return baseStyle;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
          borderRadius: BORDER_RADIUS.sm,
        };
      case "large":
        return {
          paddingVertical: SPACING.lg,
          paddingHorizontal: SPACING.xl,
          borderRadius: BORDER_RADIUS.lg,
        };
      default:
        return {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          borderRadius: BORDER_RADIUS.md,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: "600",
      ...getTextSizeStyle(),
    };

    switch (variant) {
      case "primary":
      case "gradient":
        return { ...baseStyle, color: COLORS.neutral.white };

      case "secondary":
        return { ...baseStyle, color: COLORS.neutral.black };

      case "outline":
      case "ghost":
        return { ...baseStyle, color: COLORS.primary.main };

      default:
        return baseStyle;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case "small":
        return { fontSize: FONT_SIZES.sm };
      case "large":
        return { fontSize: FONT_SIZES.lg };
      default:
        return { fontSize: FONT_SIZES.md };
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
      {loading && (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "gradient"
              ? COLORS.neutral.white
              : COLORS.primary.main
          }
          style={{ marginRight: SPACING.sm }}
        />
      )}
      {!loading && icon && <>{icon}</>}
      <Text style={textStyles}>{title}</Text>
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
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={COLORS.gradients.twilight as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
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
});

export default Button;
