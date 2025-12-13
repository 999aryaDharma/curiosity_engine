import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import Constants from "expo-constants";

import OnboardingScreen from "@screens/onboarding/OnboardingScreen";
import HomeScreen from "@screens/main/HomeScreen";
import QuickSparkScreen from "@screens/main/QuickSparkScreen";
import DeepDiveScreen from "@screens/main/DeepDiveScreen";
import ThreadScreen from "@screens/main/ThreadScreen";
import ClusterJourneyScreen from "@screens/main/ClusterJourneyScreen";
import ThreadPackViewScreen from "@screens/main/ThreadPackViewScreen";
import HistoryScreen from "@screens/main/HistoryScreen";
import SettingsScreen from "@screens/settings/SettingsScreen";

import { sqliteService } from "@services/storage/sqliteService";
import { mmkvService } from "@services/storage/mmkvService";
import llmClient from "@services/llm/llmClient";
import tagEngine from "@services/tag-engine/tagEngine";
import { getDefaultTagsWithIds } from "@constants/defaultTags";
import { COLORS } from "@constants/colors";
import { MigrationUtility } from "@/utils/migrationUtils";

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  QuickSpark: undefined;
  DeepDive: { sparkText?: string };
  Thread: undefined;
  ClusterJourney: { clusterId: string };
  ThreadPackView: { clusterId: string };
  History: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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

      const apiKey = Constants.expoConfig?.extra?.geminiApiKey;

      if (apiKey) {
        llmClient.setApiKey(apiKey);
        console.log("[App] Gemini API key loaded");
      } else {
        console.warn("[App] No Gemini API key found in configuration");
      }

      await sqliteService.initialize();
      console.log("[App] Database initialized");

      // 3. RUN MIGRATION (CRITICAL!)
      const needsMigration = await MigrationUtility.needsMigration();
      if (needsMigration) {
        console.log("[App] Running database migration...");
        try {
          await MigrationUtility.fixExistingDatabase();
          console.log("[App] Migration completed successfully");
        } catch (migrationError) {
          console.error(
            "[App] Migration failed, doing complete reset:",
            migrationError
          );
          // Fallback: Complete reset
          await MigrationUtility.completeReset();
        }
      }

      const defaultTags = getDefaultTagsWithIds();
      await tagEngine.initializeDefaultTags(defaultTags);
      console.log("[App] Tags initialized");

      const onboardingComplete = await mmkvService.getOnboardingComplete();
      setInitialRoute(onboardingComplete ? "Home" : "Onboarding");

      console.log("[App] Initialization complete");
      setIsReady(true);
    } catch (error) {
      console.error("[App] Initialization failed:", error);
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
        <Stack.Screen
          name="ClusterJourney"
          component={ClusterJourneyScreen}
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="ThreadPackView"
          component={ThreadPackViewScreen}
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
