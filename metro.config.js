const {getDefaultConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */

const config = getDefaultConfig(__dirname);
const {transformer, resolver} = config;
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('./textFileTransformer.js'),
};
config.resolver = {
  ...resolver,
  assetExts: [
    ...resolver.assetExts
      .filter(ext => ext !== 'svg')
      .filter(ext => ext !== 'txt'),
  ],
  sourceExts: [...resolver.sourceExts, 'svg', 'txt'],
};

module.exports = config;
