// src/screens/settings/SettingsScreen.tsx

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
import { LinearGradient } from "expo-linear-gradient";
import { useSettingsStore } from "@stores/settingsStore";
import { useThreadStore } from "@stores/threadStore";
import notificationService from "@/services/notifications/notificationService";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "@constants/colors";
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
    setChaosLevel,
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

  const handleTestNotification = async () => {
    await notificationService.sendTestNotification();
    Alert.alert("Test Sent", "You should receive a notification in 2 seconds.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Appearance</Text>

        <Card variant="elevated" style={styles.settingsCard}>
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
        </Card>

        <Text style={styles.sectionTitle}>Spark Generation</Text>

        <Card variant="elevated" style={styles.settingsCard}>
          <View style={styles.sliderRow}>
            <View>
              <Text style={styles.settingTitle}>Chaos Level</Text>
              <Text style={styles.settingSubtitle}>
                {Math.round(settings.chaosLevel * 100)}% -{" "}
                {getChaosLabel(settings.chaosLevel)}
              </Text>
            </View>
          </View>

          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <LinearGradient
                colors={
                  COLORS.gradients.twilight as [string, string, ...string[]]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.sliderFill,
                  { width: `${settings.chaosLevel * 100}%` },
                ]}
              />
            </View>
            <View style={styles.sliderButtons}>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() =>
                  setChaosLevel(Math.max(0, settings.chaosLevel - 0.1))
                }
              >
                <Text style={styles.sliderButtonText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() =>
                  setChaosLevel(Math.min(1, settings.chaosLevel + 0.1))
                }
              >
                <Text style={styles.sliderButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Divider />

          <View style={styles.sliderRow}>
            <View>
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
        </Card>

        <Text style={styles.sectionTitle}>Notifications</Text>

        <Card variant="elevated" style={styles.settingsCard}>
          <SettingRow
            icon="🔔"
            title="Daily Reminders"
            subtitle="Get reminded to explore daily"
            rightComponent={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{
                  false: COLORS.neutral.gray300,
                  true: COLORS.primary.light,
                }}
                thumbColor={
                  settings.notificationsEnabled
                    ? COLORS.primary.main
                    : COLORS.neutral.gray400
                }
              />
            }
          />

          {settings.notificationsEnabled && (
            <>
              <Divider />
              <SettingRow
                icon="🧪"
                title="Test Notification"
                subtitle="Send a test notification"
                onPress={handleTestNotification}
                showChevron
              />
            </>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Data Management</Text>

        <Card variant="elevated" style={styles.settingsCard}>
          <SettingRow
            icon="🏷️"
            title="Manage Tags"
            subtitle="Add or remove tags"
            onPress={() => navigation.navigate("TagManagement")}
            showChevron
          />

          <Divider />

          <SettingRow
            icon="🔄"
            title="Reset Tag Usage"
            subtitle="Clear all tag history"
            onPress={() => {
              Alert.alert(
                "Reset Tag Usage",
                "This will reset all tag usage statistics.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Reset",
                    onPress: async () => {
                      await tagEngine.resetTagUsage();
                      Alert.alert("Success", "Tag usage reset");
                    },
                  },
                ]
              );
            }}
            showChevron
          />

          <Divider />

          <SettingRow
            icon="🗑️"
            title="Reset Thread Graph"
            subtitle="Clear concept map"
            onPress={() => {
              Alert.alert(
                "Reset Thread Graph",
                "This will delete all concepts and connections.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                      await resetGraph();
                      Alert.alert("Success", "Thread graph reset");
                    },
                  },
                ]
              );
            }}
            showChevron
          />
        </Card>

        <Text style={styles.sectionTitle}>About</Text>

        <Card variant="elevated" style={styles.settingsCard}>
          <SettingRow
            icon="📱"
            title="App Version"
            subtitle={APP_CONFIG.VERSION}
          />

          <Divider />

          <SettingRow
            icon="ℹ️"
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
        </Card>

        <Text style={styles.sectionTitle}>Danger Zone</Text>

        <Card
          variant="outlined"
          style={{ ...styles.settingsCard, ...styles.dangerCard }}
        >
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
            style={styles.dangerButton}
            textStyle={{ color: COLORS.error.main }}
          />
        </Card>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

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
      <Text style={styles.settingIcon}>{icon}</Text>
      <View style={styles.settingTexts}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {rightComponent || (showChevron && <Text style={styles.chevron}>›</Text>)}
  </TouchableOpacity>
);

const Divider = () => <View style={styles.divider} />;

const getChaosLabel = (chaos: number): string => {
  if (chaos < 0.3) return "Focused";
  if (chaos < 0.6) return "Balanced";
  if (chaos < 0.8) return "Creative";
  return "Wild";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.gray50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.gray200,
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
    fontWeight: "bold",
    color: COLORS.neutral.black,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    color: COLORS.neutral.gray600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  settingsCard: {
    marginBottom: SPACING.md,
    padding: 0,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  settingTexts: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
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
    marginLeft: SPACING.md + 24 + SPACING.md,
  },
  sliderRow: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  sliderContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: COLORS.neutral.gray200,
    borderRadius: BORDER_RADIUS.full,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  sliderFill: {
    height: "100%",
    borderRadius: BORDER_RADIUS.full,
  },
  sliderButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary.main,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SPACING.md,
  },
  sliderButtonText: {
    fontSize: 24,
    color: COLORS.neutral.white,
    fontWeight: "600",
  },
  layerCount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "bold",
    color: COLORS.primary.main,
    minWidth: 40,
    textAlign: "center",
  },
  dangerCard: {
    borderColor: COLORS.error.main,
    borderWidth: 1,
    padding: SPACING.md,
  },
  dangerButton: {
    borderColor: COLORS.error.main,
  },
});

export default SettingsScreen;
