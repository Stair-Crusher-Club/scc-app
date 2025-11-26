module.exports = {
  presets: [
    [
      'module:@react-native/babel-preset',
      {useTransformReactJSXExperimental: true},
    ],
    'nativewind/babel',
  ],
  plugins: [
    ['@babel/plugin-transform-react-jsx', {runtime: 'automatic'}],
    'hot-updater/babel-plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {
          '@': './src',
        },
      },
    ],
    'react-native-worklets/plugin',
  ],
};
