const upstreamTransformer = require('react-native-svg-transformer');

module.exports = {
  transform: arg => {
    if (arg.filename.endsWith('.txt')) {
      return upstreamTransformer.transform({
        ...arg,
        src: `module.exports = ${JSON.stringify(arg.src)};`,
      });
    }
    return upstreamTransformer.transform(arg);
  },
};
