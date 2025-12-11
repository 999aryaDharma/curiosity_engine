// app.config.js
export default {
  expo: {
    name: "Curiosity Engine",
    slug: "curiosity-engine",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
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
    },
  },
};
