// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver for path aliases
config.resolver.alias = {
  '@/*': './src/*',
  '@components/*': './src/components/*',
  '@screens/*': './src/screens/*',
  '@stores/*': './src/stores/*',
  '@services/*': './src/services/*',
  '@types/*': './src/types/*',
  '@utils/*': './src/utils/*',
  '@constants/*': './src/constants/*',
  '@hooks/*': './src/hooks/*',
};

// Add crypto polyfill for uuid
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: require.resolve('react-native-quick-crypto'),
  stream: require.resolve('stream-browserify'),
  buffer: require.resolve('buffer'),
};

// Transformer options to handle ES6 modules
config.transformer = {
  ...config.transformer,
  experimentalImportSupport: false,
  inlineRequires: true,
};

module.exports = config;