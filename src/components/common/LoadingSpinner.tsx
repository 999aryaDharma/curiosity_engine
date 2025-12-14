// src/components/common/LoadingSpinner.tsx - ULTRA SAFE

import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Text,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SPACING, FONT_SIZES } from "@constants/colors";

type SpinnerVariant = "default" | "gradient" | "dots" | "pulse";
type SpinnerSize = "small" | "medium" | "large";

interface LoadingSpinnerProps {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = "gradient",
  size = "medium",
  message,
  fullScreen = false,
  style,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (variant === "default" || variant === "gradient") {
      // Spinning animation
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }

    if (variant === "pulse") {
      // Pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: 600,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 600,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (variant === "dots") {
      // Bouncing dots animation
      const animateDot = (dotAnim: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dotAnim, {
              toValue: 1,
              duration: 400,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
            Animated.timing(dotAnim, {
              toValue: 0,
              duration: 400,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateDot(dot1, 0);
      animateDot(dot2, 150);
      animateDot(dot3, 300);
    }
  }, [variant]);

  const getSpinnerSize = () => {
    switch (size) {
      case "small":
        return 24;
      case "large":
        return 64;
      default:
        return 40;
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const renderSpinner = () => {
    const spinnerSize = getSpinnerSize();

    switch (variant) {
      case "gradient":
        // DEFENSIVE: Ensure gradient colors array is valid
        const gradientColors = Array.isArray(COLORS.gradients?.twilight)
          ? COLORS.gradients.twilight
          : Array.isArray(COLORS.gradients?.mint)
          ? COLORS.gradients.mint
          : ["#2EAB89", "#3DC9A5", "#2EAB89"]; // Fallback

        return (
          <Animated.View
            style={[
              styles.spinner,
              {
                width: spinnerSize,
                height: spinnerSize,
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <LinearGradient
              colors={gradientColors as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.gradientSpinner,
                {
                  width: spinnerSize,
                  height: spinnerSize,
                  borderRadius: spinnerSize / 2,
                },
              ]}
            >
              <View
                style={[
                  styles.gradientInner,
                  {
                    width: spinnerSize - 6,
                    height: spinnerSize - 6,
                    borderRadius: (spinnerSize - 6) / 2,
                  },
                ]}
              />
            </LinearGradient>
          </Animated.View>
        );

      case "dots":
        const dotTranslate1 = dot1.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -12],
        });
        const dotTranslate2 = dot2.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -12],
        });
        const dotTranslate3 = dot3.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -12],
        });

        const dotSize = size === "small" ? 8 : size === "large" ? 16 : 12;

        return (
          <View style={styles.dotsContainer}>
            <Animated.View
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  backgroundColor: COLORS.primary.main,
                  transform: [{ translateY: dotTranslate1 }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  backgroundColor: COLORS.accent.main || COLORS.secondary.main,
                  transform: [{ translateY: dotTranslate2 }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  backgroundColor: COLORS.secondary.main,
                  transform: [{ translateY: dotTranslate3 }],
                },
              ]}
            />
          </View>
        );

      case "pulse":
        // DEFENSIVE: Safe gradient colors
        const pulseGradient = Array.isArray(COLORS.gradients?.twilight)
          ? COLORS.gradients.twilight
          : Array.isArray(COLORS.gradients?.mint)
          ? COLORS.gradients.mint
          : ["#2EAB89", "#3DC9A5"];

        return (
          <Animated.View
            style={{
              transform: [{ scale: scaleValue }],
            }}
          >
            <LinearGradient
              colors={pulseGradient as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.pulseCircle,
                {
                  width: spinnerSize,
                  height: spinnerSize,
                  borderRadius: spinnerSize / 2,
                },
              ]}
            />
          </Animated.View>
        );

      default:
        return (
          <Animated.View
            style={[
              styles.spinner,
              styles.defaultSpinner,
              {
                width: spinnerSize,
                height: spinnerSize,
                borderRadius: spinnerSize / 2,
                borderWidth: size === "small" ? 2 : size === "large" ? 4 : 3,
                transform: [{ rotate: spin }],
              },
            ]}
          />
        );
    }
  };

  const containerStyle = [
    styles.container,
    fullScreen && styles.fullScreen,
    style,
  ];

  const getMessageFontSize = () => {
    switch (size) {
      case "small":
        return FONT_SIZES.xs;
      case "large":
        return FONT_SIZES.md;
      default:
        return FONT_SIZES.sm;
    }
  };

  return (
    <View style={containerStyle}>
      {renderSpinner()}
      {message && (
        <Text style={[styles.message, { fontSize: getMessageFontSize() }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.md,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  spinner: {
    justifyContent: "center",
    alignItems: "center",
  },
  defaultSpinner: {
    borderColor: COLORS.primary.main,
    borderTopColor: "transparent",
  },
  gradientSpinner: {
    justifyContent: "center",
    alignItems: "center",
  },
  gradientInner: {
    backgroundColor: COLORS.neutral.white,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    marginHorizontal: SPACING.xs,
  },
  pulseCircle: {
    opacity: 0.8,
  },
  message: {
    marginTop: SPACING.md,
    color: COLORS.neutral.gray600,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default LoadingSpinner;
