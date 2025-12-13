// src/screens/settings/SettingsScreen.tsx - FRESH SETTINGS

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettingsStore } from "@stores/settingsStore";
import { useThreadStore } from "@stores/threadStore";
import notificationService from "@/services/notifications/notificationService";
import { SoftCard } from "@components/common/Card";
import Button from "@components/common/Button";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
  ANIMATION,
} from "@constants/colors";
import { APP_CONFIG } from "@constants/config";
import tagEngine from "@services/tag-engine/tagEngine";

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

  const handleResetData = () => {
    Alert.alert(
      "Reset All Data",
      "This will delete all your sparks, concepts, and reset your tags. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await tagEngine.resetTagUsage();
            await resetGraph();
            Alert.alert("Success", "All data has been reset");
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "This will restore all settings to default values.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          onPress: () => {
            resetSettings();
            Alert.alert("Success", "Settings restored to default");
          },
        },
      ]
    );
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotifications(value);

    if (value) {
      await notificationService.initialize();
      await notificationService.scheduleSparkReminder();
      Alert.alert(
        "Notifications Enabled",
        "You will receive daily reminders to generate sparks."
      );
    } else {
      await notificationService.cancelAllNotifications();
      Alert.alert(
        "Notifications Disabled",
        "Daily reminders have been turned off."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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

          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFill,
                  { width: `${settings.difficultyLevel * 100}%` },
                ]}
              />
            </View>
            <View style={styles.sliderButtons}>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() =>
                  setDifficultyLevel(
                    Math.max(0, settings.difficultyLevel - 0.1)
                  )
                }
              >
                <Text style={styles.sliderButtonText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() =>
                  setDifficultyLevel(
                    Math.min(1, settings.difficultyLevel + 0.1)
                  )
                }
              >
                <Text style={styles.sliderButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Divider />

          <View style={styles.sliderRow}>
            <View style={styles.sliderIconContainer}>
              <Text style={styles.sliderIcon}>🌊</Text>
            </View>
            <View style={styles.sliderTextContainer}>
              <Text style={styles.settingTitle}>Deep Dive Layers</Text>
              <Text style={styles.settingSubtitle}>
                {settings.maxDeepDiveLayers} layers
              </Text>
            </View>
          </View>

          <View style={styles.sliderButtons}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() =>
                setMaxDeepDiveLayers(
                  Math.max(3, settings.maxDeepDiveLayers - 1)
                )
              }
            >
              <Text style={styles.sliderButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.layerCount}>{settings.maxDeepDiveLayers}</Text>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() =>
                setMaxDeepDiveLayers(
                  Math.min(6, settings.maxDeepDiveLayers + 1)
                )
              }
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
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
              Alert.alert(
                "Curiosity Engine",
                "A personal curiosity companion that helps you explore ideas through AI-powered sparks.\n\nVersion: " +
                  APP_CONFIG.VERSION
              );
            }}
            showChevron
          />
        </SoftCard>

        {/* Danger Zone Section */}
        <Text style={styles.sectionTitle}>DANGER ZONE</Text>

        <SoftCard style={{
          ...styles.settingsCard,
          ...styles.dangerCard,
        }}>
          <Button
            title="Reset All Settings"
            onPress={handleResetSettings}
            variant="outline"
            size="medium"
            fullWidth
            style={styles.dangerButton}
          />

          <View style={{ height: SPACING.sm }} />

          <Button
            title="Reset All Data"
            onPress={handleResetData}
            variant="outline"
            size="medium"
            fullWidth
            style={{
              ...styles.dangerButton,
              ...styles.dangerButtonRed,
            }}
          />
        </SoftCard>

        <View style={{ height: SPACING.huge }} />
      </ScrollView>
    </SafeAreaView>
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
}> = ({ icon, title, subtitle, onPress, rightComponent, showChevron }) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.settingLeft}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.settingTexts}>
        <Text style={styles.settingTitle}>{title}</Text>
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
    paddingBottom: SPACING.sm,
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
  sliderContainer: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.base,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: COLORS.neutral.gray200,
    borderRadius: BORDER_RADIUS.full,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  sliderFill: {
    height: "100%",
    backgroundColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.full,
  },
  sliderButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  sliderButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary.main,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SPACING.md,
  },
  sliderButtonText: {
    fontSize: 24,
    color: COLORS.neutral.white,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 24,
  },
  layerCount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary.main,
    minWidth: 40,
    textAlign: "center",
  },
  dangerCard: {
    padding: SPACING.base,
    backgroundColor: COLORS.error.light,
  },
  dangerButton: {
    borderColor: COLORS.error.main,
  },
  dangerButtonRed: {
    borderColor: COLORS.error.dark,
  },
});

export default SettingsScreen;
