// src/navigation/AppNavigator.tsx

import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";

// Screens
import OnboardingScreen from "@screens/onboarding/OnboardingScreen";
import HomeScreen from "@screens/main/HomeScreen";
import QuickSparkScreen from "@screens/main/QuickSparkScreen";
import DeepDiveScreen from "@screens/main/DeepDiveScreen";
import ThreadScreen from "@screens/main/ThreadScreen";
import HistoryScreen from "@screens/main/HistoryScreen";
import SettingsScreen from "@screens/settings/SettingsScreen";

// Services
import sqliteService from "@services/storage/sqliteService";
import {mmkvService} from "@services/storage/mmkvService";
import llmClient from "@services/llm/llmClient";
import tagEngine from "@services/tag-engine/tagEngine";
import { getDefaultTagsWithIds } from "@constants/defaultTags";
import { COLORS } from "@constants/colors";

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<"Onboarding" | "Home">(
    "Onboarding"
  );

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log("[App] Initializing...");

      // 1. Initialize Database
      await sqliteService.initialize();
      console.log("[App] Database initialized");

      // 2. Initialize default tags
      const defaultTags = getDefaultTagsWithIds();
      await tagEngine.initializeDefaultTags(defaultTags);
      console.log("[App] Tags initialized");

      // 4. Check if onboarding is complete
      const onboardingComplete = await mmkvService.getOnboardingComplete();
      setInitialRoute(onboardingComplete ? "Home" : "Onboarding");

      console.log("[App] Initialization complete");
      setIsReady(true);
    } catch (error) {
      console.error("[App] Initialization failed:", error);
      // Still allow app to run, but show error
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.neutral.white,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary.main} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: {
            backgroundColor: COLORS.neutral.white,
          },
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="QuickSpark"
          component={QuickSparkScreen}
          options={{
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="DeepDive"
          component={DeepDiveScreen}
          options={{
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="Thread"
          component={ThreadScreen}
          options={{
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
