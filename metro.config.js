const {getDefaultConfig} = require('@react-native/metro-config');
const {withNativeWind} = require('nativewind/metro');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */

const path = require('node:path');

const config = getDefaultConfig(__dirname);
const {transformer, resolver} = config;

// 에이전트 git worktree 는 프로젝트 루트 안(.claude/worktrees/*)에 생기고 자체 node_modules 를
// 가진다. 막지 않으면 Metro 가 react-native 를 두 벌 스캔해서 TurboModule 이 중복 등록되고,
// 앱이 "'PlatformConstants' could not be found" 레드박스로 죽는다.
const worktreesDir = path.join(__dirname, '.claude', 'worktrees');
const worktreeBlockList = new RegExp(
  `^${worktreesDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[/\\\\].*`,
);
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('./textFileTransformer.js'),
};
config.resolver = {
  ...resolver,
  blockList: [
    ...(Array.isArray(resolver.blockList)
      ? resolver.blockList
      : resolver.blockList
        ? [resolver.blockList]
        : []),
    worktreeBlockList,
  ],
  assetExts: [
    ...resolver.assetExts
      .filter(ext => ext !== 'svg')
      .filter(ext => ext !== 'txt'),
    'lottie',
  ],
  sourceExts: [...resolver.sourceExts, 'svg', 'txt'],
};

module.exports = withNativeWind(config, {input: './global.css'});
