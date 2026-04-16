// Web mock for @d11/react-native-fast-image
// Maps FastImage to React Native's Image component
const {Image} = require('react-native');

const FastImage = Image;

FastImage.resizeMode = {
  contain: 'contain',
  cover: 'cover',
  stretch: 'stretch',
  center: 'center',
};

FastImage.priority = {
  low: 'low',
  normal: 'normal',
  high: 'high',
};

FastImage.cacheControl = {
  immutable: 'immutable',
  web: 'web',
  cacheOnly: 'cacheOnly',
};

FastImage.preload = function (sources) {
  // no-op on web
};

FastImage.clearMemoryCache = function () {
  return Promise.resolve();
};

FastImage.clearDiskCache = function () {
  return Promise.resolve();
};

module.exports = FastImage;
module.exports.default = FastImage;
