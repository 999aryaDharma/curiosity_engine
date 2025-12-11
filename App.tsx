// App.tsx

import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "../app/src/navigation/AppNavigation";
import { COLORS } from "../app/src/constants/colors";

// Import stores to initialize
import { useSettingsStore } from "../app/src/stores/settingsStore";

export default function App() {
  const { settings, loadSettings } = useSettingsStore();

  useEffect(() => {
    // Load settings on app start
    loadSettings();
  }, []);

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
