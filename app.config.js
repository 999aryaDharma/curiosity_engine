// app.config.js
export default {
  expo: {
    name: "Curiosity Engine",
    owner: "aryaakks-organization",
    slug: "curiosity-engine",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.curiosityengine",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
      package: "com.yourcompany.curiosityengine",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      // Add your API key here
      geminiApiKey: process.env.GEMINI_API_KEY || "",
      eas: {
        projectId: "042327c8-4ab9-4bd9-b1aa-f039e86ad18e",
      },
    },
  },
};
