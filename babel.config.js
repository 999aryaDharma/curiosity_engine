module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          root: ["./src"],
          extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
          alias: {
            "@": "./src",
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@stores": "./src/stores",
            "@services": "./src/services",
            "@types": "./src/types",
            "@utils": "./src/utils",
            "@constants": "./src/constants",
            "@hooks": "./src/hooks",
          },
        },
      ],
    ],
  };
};
