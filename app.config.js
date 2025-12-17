// app.config.js
export default {
  expo: {
    name: "Curiosity Engine",
    owner: "aryaakks-organization",
    slug: "curiosity-engine",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/ian.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/ian.png",
      resizeMode: "contain",
      backgroundColor: "#F9F5EC",
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
        foregroundImage: "./assets/ian.png",
        backgroundColor: "#F9F5EC",
      },
      package: "com.yourcompany.curiosityengine",
    },
    web: {
      favicon: "./assets/ian.png",
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
