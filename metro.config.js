const {getDefaultConfig} = require('@react-native/metro-config');
const {withNativeWind} = require('nativewind/metro');

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
    'lottie',
  ],
  sourceExts: [...resolver.sourceExts, 'svg', 'txt'],
};

module.exports = withNativeWind(config, {input: './global.css'});
