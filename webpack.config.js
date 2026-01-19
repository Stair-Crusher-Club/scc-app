const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Load .env.local file
const envFile = process.env.ENVFILE || '.env.local';
const envConfig = dotenv.config({path: envFile}).parsed || {};
console.log('📝 Loaded environment:', envFile);
console.log('🌐 BASE_URL:', envConfig.BASE_URL || 'not set');

const transpileDeps = [
  '@react-navigation',
  'react-native-gesture-handler',
  'react-native-reanimated',
  'react-native-screens',
  'react-native-safe-area-context',
  'react-native-vector-icons',
];

module.exports = {
  mode: 'development',
  target: 'web',
  entry: './web/index.tsx',
  output: {
    path: path.resolve(__dirname, 'web-dist'),
    filename: 'bundle.js',
    publicPath: '/',
    globalObject: 'this',
  },
  resolve: {
    extensions: [
      '.web.js',
      '.web.ts',
      '.web.tsx',
      '.js',
      '.ts',
      '.tsx',
      '.json',
    ],
    alias: {
      'react-native$': 'react-native-web', // https://necolas.github.io/react-native-web/docs/setup/#bundler
      '@': path.resolve(__dirname, 'src'),
      // @react-navigation/stack 안에서 @react-navigation/elements를 import할 때
      // 내 node_modules가 아니라 @react-navigation/stack 안의 node_modules 안의 @react-navigation/elements를 참조하려고 한다.
      // 문제는 이 nested @react-navigation/elements가 문제가 있어서 2.5.1 버전으로 강제로 다운해야 한다.
      // 그래서 내 node_modules의 @react-navigation/elements를 쓰도록 지정하고 강제로 2.5.1 버전을 설치해준다.
      '@react-navigation/elements': path.resolve(
        __dirname,
        'node_modules/@react-navigation/elements',
      ), // lib 안의 nested node_modules를 참조하는 이슈 방지
      // Mock problematic native-only libraries
      'react-native-mmkv': path.resolve(
        __dirname,
        'web/mocks/react-native-mmkv.js',
      ),
      '@shopify/flash-list': path.resolve(__dirname, 'web/mocks/flash-list.js'),
      'lottie-react-native': false,
      'react-native-compressor': false,
      'react-native-svg': 'react-native-svg/lib/commonjs/ReactNativeSVG.web.js',
      'react-native-root-toast': path.resolve(
        __dirname,
        'web/mocks/react-native-root-toast.js',
      ),
      // Mock Firebase libraries
      '@react-native-firebase/analytics': path.resolve(
        __dirname,
        'web/mocks/firebase-analytics.js',
      ),
      '@react-native-firebase/crashlytics': path.resolve(
        __dirname,
        'web/mocks/firebase-crashlytics.js',
      ),
      '@react-native-firebase/messaging': path.resolve(
        __dirname,
        'web/mocks/firebase-messaging.js',
      ),
      'react-native-reanimated-carousel': path.resolve(
        __dirname,
        'web/mocks/react-native-reanimated-carousel.tsx',
      ),
      'react-native-image-zoom-viewer': path.resolve(
        __dirname,
        'web/mocks/react-native-image-zoom-viewer.tsx',
      ),
    },
    // Disable fully specified imports for all dependencies
    fullySpecified: false,
    fallback: {
      process: require.resolve('process/browser'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              target: 'es2015',
              module: 'esnext',
              lib: ['dom', 'es2015', 'es2017'],
              jsx: 'react',
              downlevelIteration: true,
            },
          },
        },
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: p =>
          /node_modules/.test(p) && transpileDeps.some(d => p.includes(d)),
        use: {
          loader: 'babel-loader',
          options: {
            configFile: './babel.config.web.js',
          },
        },
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        type: 'asset/resource',
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.svg\.txt$/,
        type: 'asset/source',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './web/index.html',
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
      'process.env': JSON.stringify({
        ...process.env,
        ...envConfig,
      }),
    }),
  ],
  devServer: {
    port: 3001,
    hot: true,
    historyApiFallback: true,
  },
  devtool: 'source-map',
};
