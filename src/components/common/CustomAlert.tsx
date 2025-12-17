// src/components/common/CustomAlert.tsx - FRESH CUSTOM ALERT (IMPROVED)

import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Button from "@components/common/Button";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
} from "@constants/colors";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  type?: "default" | "warning" | "error" | "success";
  confirmStyle?: "default" | "destructive";
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  showCancel = true,
  type = "default",
  confirmStyle = "default",
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const iconAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION.normal,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 12,
          bounciness: 10,
        }),
        Animated.sequence([
          Animated.delay(100),
          Animated.spring(iconAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 10,
            bounciness: 15,
          }),
        ]),
      ]).start();
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      iconAnim.setValue(0);
    }
  }, [visible]);

  const handleCancel = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: ANIMATION.fast,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: ANIMATION.fast,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onCancel) onCancel();
    });
  };

  const handleConfirm = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: ANIMATION.fast,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: ANIMATION.fast,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onConfirm) onConfirm();
    });
  };

  // Get colors and styles based on type
  const getTypeConfig = () => {
    switch (type) {
      case "warning":
        return {
          gradient: [COLORS.accent.main, COLORS.accent.light],
          icon: "⚠️",
          iconBg: COLORS.accent.light,
          cardBorder: COLORS.accent.main,
          confirmButtonColor: COLORS.accent.lighter,
          cancelButtonColor: COLORS.accent.main,
        };
      case "error":
        return {
          gradient: [COLORS.error.main, COLORS.error.light],
          icon: "❌",
          iconBg: COLORS.error.light,
          cardBorder: COLORS.error.main,
          confirmButtonColor: COLORS.error.main,
          cancelButtonColor: COLORS.error.light,
        };
      case "success":
        return {
          gradient: [COLORS.success.main, COLORS.success.light],
          icon: "✅",
          iconBg: COLORS.success.light,
          cardBorder: COLORS.success.main,
          confirmButtonColor: COLORS.success.main,
          cancelButtonColor: COLORS.success.light,
        };
      default: // default (info)
        return {
          gradient: COLORS.gradients.mint,
          icon: "💡",
          iconBg: COLORS.primary.light,
          cardBorder: COLORS.primary.main,
          confirmButtonColor: COLORS.primary.main,
          cancelButtonColor: COLORS.primary.light,
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Pressable style={styles.overlayPressable} onPress={handleCancel} />

        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Alert Card */}
          <View style={styles.alertCard}>
            {/* Top Gradient Bar */}
            <LinearGradient
              colors={config.gradient as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topBar}
            />

            {/* Icon Circle */}
            <Animated.View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: config.iconBg,
                  transform: [
                    { scale: iconAnim },
                    {
                      rotate: iconAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "10deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.icon}>{config.icon}</Text>
            </Animated.View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>

            {/* Buttons */}
            <View
              style={[
                styles.buttonContainer,
                { justifyContent: showCancel ? "space-between" : "center" }
              ]}
            >
              {showCancel && (
                <Button
                  title={cancelText}
                  variant={type === "default" ? "soft" : "ghost"}
                  size="medium"
                  onPress={handleCancel}
                  style={styles.button}
                  textStyle={
                    type !== "default"
                      ? { color: config.cancelButtonColor } // Use alert-specific cancel button color
                      : undefined
                  }
                />
              )}
              <Button
                title={confirmText}
                variant={
                  confirmStyle === "destructive"
                    ? "outline"
                    : type === "error"
                    ? "solid"
                    : type === "success"
                    ? "solid"
                    : type === "warning"
                    ? "solid"
                    : "gradient"
                }
                size="medium"
                onPress={handleConfirm}
                style={{
                  ...styles.button,
                  ...(showCancel && styles.buttonWithMargin),
                  ...(!showCancel && styles.buttonFullWidth),
                  ...(confirmStyle === "destructive" &&
                    styles.destructiveButton),
                  ...(type !== "default" &&
                    confirmStyle !== "destructive" && {
                      backgroundColor: config.confirmButtonColor,
                    }),
                }}
                textStyle={
                  confirmStyle === "destructive"
                    ? styles.destructiveText
                    : type !== "default"
                    ? { color: COLORS.neutral.white } // White text for solid colorful buttons
                    : undefined
                }
              />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  overlayPressable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: "90%",
    maxWidth: 400,
    paddingHorizontal: SPACING.base,
  },
  alertCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.xxxl,
    overflow: "hidden",
    ...SHADOWS.elevated,
  },
  topBar: {
    height: 6,
    width: "100%",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.soft,
  },
  icon: {
    fontSize: 44,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    alignItems: "center",
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
    textAlign: "center",
    marginBottom: SPACING.md,
    lineHeight: FONT_SIZES.xxl * 1.2,
  },
  message: {
    fontSize: FONT_SIZES.base,
    color: COLORS.neutral.gray700,
    textAlign: "center",
    lineHeight: FONT_SIZES.base * 1.5,
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
    justifyContent: "space-between",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonWithMargin: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  buttonFullWidth: {
    width: "100%",
  },
  destructiveButton: {
    borderColor: COLORS.error.main,
    borderWidth: 2,
  },
  destructiveText: {
    color: COLORS.error.main,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});

export default CustomAlert;
