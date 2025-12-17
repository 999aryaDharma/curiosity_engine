import React, { useState, useRef, useEffect, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  PanResponder,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  cancelAnimation,
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettingsStore } from "@stores/settingsStore";
import { useThreadStore } from "@stores/threadStore";
import notificationService from "@/services/notifications/notificationService";
import { SoftCard } from "@components/common/Card";
import Button from "@components/common/Button";
import { CustomAlert } from "@components/common/CustomAlert";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
} from "@constants/colors";
import { APP_CONFIG } from "@constants/config";
import tagEngine from "@services/tag-engine/tagEngine";

// Create an Animated version of SafeAreaView to handle page transitions
const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

// Define alert queue actions and reducer outside component for stability
type AlertQueueAction =
  | { type: "ADD_ALERT"; payload: any }
  | { type: "REMOVE_FIRST" }
  | { type: "CLEAR" };

const alertQueueReducer = (state: any[], action: AlertQueueAction): any[] => {
  switch (action.type) {
    case "ADD_ALERT":
      return [...state, action.payload];
    case "REMOVE_FIRST":
      return state.length > 0 ? state.slice(1) : state;
    case "CLEAR":
      return [];
    default:
      return state;
  }
};

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
}) => {
  const {
    settings,
    setTheme,
    setLanguage,
    setNotifications,
    setDifficultyLevel,
    setMaxDeepDiveLayers,
    resetSettings,
  } = useSettingsStore();

  const { resetGraph } = useThreadStore();

  // State for custom alert queue using reducer
  const [alertQueue, dispatchAlert] = useReducer(alertQueueReducer, []);

  const showAlert = (
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    options: {
      confirmText?: string;
      cancelText?: string;
      showCancel?: boolean;
      type?: "default" | "warning" | "error" | "success";
      confirmStyle?: "default" | "destructive";
    } = {}
  ) => {
    const alert = {
      id: Date.now() + Math.random(), // Unique ID to track alerts
      title,
      message,
      confirmText: options.confirmText || "OK",
      cancelText: options.cancelText || "Cancel",
      showCancel: options.showCancel ?? true,
      type: options.type || "default",
      confirmStyle: options.confirmStyle || "default",
      onConfirm: onConfirm || (() => {}),
      onCancel: onCancel || (() => {}),
    };

    dispatchAlert({ type: "ADD_ALERT", payload: alert });
  };

  const handleResetData = () => {
    showAlert(
      "Reset All Data",
      "This will delete all your sparks, concepts, and reset your tags. This action cannot be undone.",
      async () => {
        try {
          await tagEngine.resetTagUsage();
          await resetGraph();
          // Increased timeout to 500ms to allow the previous modal to fully close/animate out
          // before trying to show the success modal.
          setTimeout(() => {
            showAlert(
              "Success",
              "All data has been reset",
              () => {},
              undefined,
              {
                confirmText: "OK",
                showCancel: false,
                type: "success",
              }
            );
          }, 500);
        } catch (error) {
          console.error("Reset data failed:", error);
        }
      },
      undefined, // onCancel - will use default empty function
      {
        confirmText: "Reset",
        cancelText: "Cancel",
        type: "warning",
        confirmStyle: "destructive",
      }
    );
  };

  const handleResetSettings = () => {
    showAlert(
      "Reset Settings",
      "This will restore all settings to default values.",
      () => {
        resetSettings();
        // Increased timeout to 500ms
        setTimeout(() => {
          showAlert(
            "Success",
            "Settings restored to default",
            () => {},
            undefined,
            {
              confirmText: "OK",
              showCancel: false,
              type: "success",
            }
          );
        }, 500);
      },
      undefined,
      {
        confirmText: "Reset",
        cancelText: "Cancel",
        type: "warning",
      }
    );
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotifications(value);

    if (value) {
      await notificationService.initialize();
      await notificationService.scheduleSparkReminder();
      showAlert(
        "Notifications Enabled",
        "You will receive daily reminders to generate sparks.",
        undefined,
        undefined,
        { type: "success", showCancel: false }
      );
    } else {
      await notificationService.cancelAllNotifications();
      showAlert(
        "Notifications Disabled",
        "Daily reminders have been turned off.",
        undefined,
        undefined,
        { type: "default", showCancel: false }
      );
    }
  };

  return (
    <AnimatedSafeAreaView
      style={styles.container}
      edges={["top"]}
      // Animasi masuk dari kanan (Slide In)
      entering={SlideInRight.duration(300)}
      // Animasi keluar ke kanan (Slide Out) saat unmount/goBack
      exiting={SlideOutRight.duration(300)}
    >
      <CustomAlert
        // Key ensures React remounts component on new alert ID
        key={alertQueue[0]?.id || "alert-hidden"}
        visible={alertQueue.length > 0}
        title={alertQueue[0]?.title || ""}
        message={alertQueue[0]?.message || ""}
        confirmText={alertQueue[0]?.confirmText || "OK"}
        cancelText={alertQueue[0]?.cancelText || "Cancel"}
        onConfirm={async () => {
          if (alertQueue.length > 0) {
            const currentAlert = alertQueue[0];
            // Remove first, THEN execute callback to allow UI to begin closing
            dispatchAlert({ type: "REMOVE_FIRST" });

            if (currentAlert.onConfirm) {
              await currentAlert.onConfirm();
            }
          }
        }}
        onCancel={async () => {
          if (alertQueue.length > 0) {
            const currentAlert = alertQueue[0];
            dispatchAlert({ type: "REMOVE_FIRST" });

            if (currentAlert.onCancel) {
              await currentAlert.onCancel();
            }
          }
        }}
        showCancel={alertQueue[0]?.showCancel}
        type={alertQueue[0]?.type}
        confirmStyle={alertQueue[0]?.confirmStyle}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings ⚙</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={true}
      >
        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>

        <SoftCard style={styles.settingsCard}>
          <SettingRow
            icon="🔔"
            title="Notifications"
            subtitle="Daily reminders & updates"
            rightComponent={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{
                  false: COLORS.neutral.gray300,
                  true: COLORS.primary.lighter,
                }}
                thumbColor={
                  settings.notificationsEnabled
                    ? COLORS.primary.main
                    : COLORS.neutral.white
                }
                ios_backgroundColor={COLORS.neutral.gray300}
              />
            }
          />

          <Divider />

          <SettingRow
            icon="🎨"
            title="Theme"
            subtitle={`Current: ${settings.theme}`}
            onPress={() => {
              const themes: Array<"light" | "dark" | "auto"> = [
                "light",
                "dark",
                "auto",
              ];
              const currentIndex = themes.indexOf(settings.theme);
              const nextTheme = themes[(currentIndex + 1) % themes.length];
              setTheme(nextTheme);
            }}
            showChevron
          />

          <Divider />

          <SettingRow
            icon="🌍"
            title="Language"
            subtitle={
              settings.language === "en" ? "English" : "Bahasa Indonesia"
            }
            onPress={() => {
              setLanguage(settings.language === "en" ? "id" : "en");
            }}
            showChevron
          />
        </SoftCard>

        {/* Spark Settings Section */}
        <Text style={styles.sectionTitle}>SPARK SETTINGS</Text>

        <SoftCard style={styles.settingsCard}>
          {/* Difficulty Slider */}
          <View style={styles.sliderRow}>
            <View style={styles.sliderIconContainer}>
              <Text style={styles.sliderIcon}>🎚</Text>
            </View>
            <View style={styles.sliderTextContainer}>
              <Text style={styles.settingTitle}>Difficulty Level</Text>
              <Text style={styles.settingSubtitle}>
                {Math.round(settings.difficultyLevel * 100)}% -{" "}
                {getDifficultyLabel(settings.difficultyLevel)}
              </Text>
            </View>
          </View>

          <View style={styles.sliderWrapper}>
            <ReanimatedSlider
              min={0}
              max={1}
              step={0.1}
              value={settings.difficultyLevel}
              onValueChange={setDifficultyLevel}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>Focused</Text>
              <Text style={styles.sliderLabelText}>Wild</Text>
            </View>
          </View>

          <Divider />

          {/* Deep Dive Layers Slider */}
          <View style={styles.sliderRow}>
            <View style={styles.sliderIconContainer}>
              <Text style={styles.sliderIcon}>🌊</Text>
            </View>
            <View style={styles.sliderTextContainer}>
              <Text style={styles.settingTitle}>Deep Dive Layers</Text>
              <Text style={styles.settingSubtitle}>
                {settings.maxDeepDiveLayers} layers depth
              </Text>
            </View>
          </View>

          <View style={styles.sliderWrapper}>
            <ReanimatedSlider
              min={3}
              max={6}
              step={1}
              value={settings.maxDeepDiveLayers}
              onValueChange={setMaxDeepDiveLayers}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>3 Layers</Text>
              <Text style={styles.sliderLabelText}>6 Layers</Text>
            </View>
          </View>
        </SoftCard>

        {/* About Section */}
        <Text style={styles.sectionTitle}>ABOUT</Text>

        <SoftCard style={styles.settingsCard}>
          <SettingRow
            icon="📱"
            title="App Version"
            subtitle={APP_CONFIG.VERSION}
          />

          <Divider />

          <SettingRow
            icon="ℹ"
            title="About Curiosity Engine"
            subtitle="Learn more"
            onPress={() => {
              showAlert(
                "Curiosity Engine",
                "A personal curiosity companion that helps you explore ideas through AI-powered sparks.\n\nVersion: " +
                  APP_CONFIG.VERSION,
                undefined,
                undefined,
                { type: "default", showCancel: false }
              );
            }}
            showChevron
          />
        </SoftCard>

        {/* Danger Zone Section */}
        <Text style={styles.sectionTitle}>DANGER ZONE</Text>

        <SoftCard style={styles.settingsCard}>
          <SettingRow
            icon="↻"
            title="Reset All Settings"
            subtitle="Restore defaults"
            onPress={handleResetSettings}
            isDestructive
          />

          <Divider />

          <SettingRow
            icon="🗑️"
            title="Reset All Data"
            subtitle="Delete all sparks & history"
            onPress={handleResetData}
            isDestructive
          />
        </SoftCard>

        <View style={{ height: SPACING.huge }} />
      </ScrollView>
    </AnimatedSafeAreaView>
  );
};

// --- Reanimated Slider Component ---
interface ReanimatedSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onValueChange: (value: number) => void;
}

const ReanimatedSlider: React.FC<ReanimatedSliderProps> = ({
  min,
  max,
  step,
  value,
  onValueChange,
}) => {
  const trackWidthRef = useRef(0);
  const isDragging = useSharedValue(false);
  const startX = useRef(0);
  const translateX = useSharedValue(0);
  const onValueChangeRef = useRef(onValueChange);

  useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  const getPositionFromValue = (val: number) => {
    const width = trackWidthRef.current;
    if (width === 0) return 0;
    const percentage = (val - min) / (max - min);
    return percentage * width;
  };

  const [layoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    if (!isDragging.value && trackWidthRef.current > 0) {
      translateX.value = withSpring(getPositionFromValue(value), {
        damping: 20,
        stiffness: 150,
      });
    }
  }, [value, min, max, layoutReady]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        isDragging.value = true;
        cancelAnimation(translateX);
        const width = trackWidthRef.current;
        if (width > 0) {
          const touchX = evt.nativeEvent.locationX;
          let clampedX = Math.min(Math.max(touchX, 0), width);
          translateX.value = clampedX;
          startX.current = clampedX;

          const percentage = clampedX / width;
          let rawValue = min + percentage * (max - min);
          let steppedValue = Math.round(rawValue / step) * step;
          steppedValue = Math.min(Math.max(steppedValue, min), max);

          const decimals = step.toString().split(".")[1]?.length || 0;
          const cleanValue = Number(steppedValue.toFixed(decimals));

          runOnJS(onValueChangeRef.current)(cleanValue);
        }
      },

      onPanResponderMove: (_, gestureState) => {
        const width = trackWidthRef.current;
        if (width === 0) return;

        let newX = startX.current + gestureState.dx;

        if (newX < 0) newX = 0;
        if (newX > width) newX = width;

        translateX.value = newX;

        const percentage = newX / width;
        let rawValue = min + percentage * (max - min);
        let steppedValue = Math.round(rawValue / step) * step;
        steppedValue = Math.min(Math.max(steppedValue, min), max);

        const decimals = step.toString().split(".")[1]?.length || 0;
        const cleanValue = Number(steppedValue.toFixed(decimals));

        runOnJS(onValueChangeRef.current)(cleanValue);
      },

      onPanResponderRelease: () => {
        isDragging.value = false;
      },

      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  const knobStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value - 12 }],
    };
  });

  const activeTrackStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value,
    };
  });

  return (
    <View
      style={styles.sliderContainer}
      onLayout={(e) => {
        trackWidthRef.current = e.nativeEvent.layout.width;
        setLayoutReady(true);
      }}
    >
      <View style={styles.sliderTrackBg} />
      <Animated.View style={[styles.sliderTrackFill, activeTrackStyle]} />
      <Animated.View style={[styles.sliderKnob, knobStyle]} />
      <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />
    </View>
  );
};

// Helper Components
const SettingRow: React.FC<{
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showChevron?: boolean;
  isDestructive?: boolean;
}> = ({
  icon,
  title,
  subtitle,
  onPress,
  rightComponent,
  showChevron,
  isDestructive,
}) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.settingLeft}>
      <View
        style={[
          styles.iconContainer,
          isDestructive && styles.destructiveIconContainer,
        ]}
      >
        <Text style={[styles.icon, isDestructive && styles.destructiveText]}>
          {icon}
        </Text>
      </View>
      <View style={styles.settingTexts}>
        <Text
          style={[styles.settingTitle, isDestructive && styles.destructiveText]}
        >
          {title}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {rightComponent || (showChevron && <Text style={styles.chevron}>›</Text>)}
  </TouchableOpacity>
);

const Divider = () => <View style={styles.divider} />;

const getDifficultyLabel = (difficulty: number): string => {
  if (difficulty < 0.3) return "Focused";
  if (difficulty < 0.6) return "Balanced";
  if (difficulty < 0.8) return "Creative";
  return "Wild";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.offWhite,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.neutral.black,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
  },
  scrollContent: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.gray500,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  settingsCard: {
    marginBottom: SPACING.md,
    padding: 0,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.base,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.neutral.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 22,
  },
  settingTexts: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.black,
    marginBottom: SPACING.xs / 2,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray600,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.neutral.gray400,
    marginLeft: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral.gray200,
    marginLeft: SPACING.base + 44 + SPACING.md,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.base,
    paddingBottom: SPACING.xs,
  },
  sliderIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.neutral.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  sliderIcon: {
    fontSize: 22,
  },
  sliderTextContainer: {
    flex: 1,
  },
  // Reanimated Slider Styles
  sliderWrapper: {
    paddingHorizontal: SPACING.base + SPACING.md + 44, // Align with text
    paddingRight: SPACING.base,
    paddingBottom: SPACING.base,
    marginBottom: SPACING.xs,
  },
  sliderContainer: {
    height: 40, // Touch area
    justifyContent: "center",
    width: "100%",
  },
  sliderTrackBg: {
    height: 6,
    backgroundColor: COLORS.neutral.gray200,
    borderRadius: BORDER_RADIUS.full,
    width: "100%",
    position: "absolute",
  },
  sliderTrackFill: {
    height: 6,
    backgroundColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.full,
    position: "absolute",
    left: 0,
  },
  sliderKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.neutral.white,
    position: "absolute",
    left: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: COLORS.neutral.gray200,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sliderLabelText: {
    fontSize: 10,
    color: COLORS.neutral.gray400,
    fontWeight: "600",
  },
  // Destructive Styles
  destructiveText: {
    color: COLORS.error.main,
  },
  destructiveIconContainer: {
    backgroundColor: COLORS.error.light,
  },
});

export default SettingsScreen;
