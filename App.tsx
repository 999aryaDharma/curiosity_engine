// App.tsx
import "react-native-get-random-values";
import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "@/navigation/AppNavigation";
import { COLORS } from "@/constants/colors";
import notificationService from "@/services/notifications/notificationService";

import { useSettingsStore } from "@/stores/settingsStore";

export default function App() {
  const { settings, loadSettings } = useSettingsStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await loadSettings();
    await notificationService.initialize();
    await notificationService.scheduleSparkReminder();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        barStyle={settings.theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={COLORS.neutral.white}
      />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}
