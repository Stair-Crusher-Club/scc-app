const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Load .env.local file
const envFile = process.env.ENVFILE || '.env.local';
const envConfig = dotenv.config({path: envFile}).parsed || {};
console.log('📝 Loaded environment:', envFile);
console.log('🌐 BASE_URL:', envConfig.BASE_URL || 'not set');

// Fail fast on a misconfigured web build. These keys come from the
// `scc-frontend-build-configurations` submodule's .env files. The most common
// failure is a STALE submodule checkout: the on-disk .env then lacks newer keys
// (e.g. KAKAO_JS_KEY), dotenv silently returns undefined, DefinePlugin inlines
// `undefined`, and the build "succeeds" while shipping broken Kakao login
// (KOE114 Application ID mismatch). Turn that silent failure into a hard error
// so a wrong build can never reach web.staircrusher.club. (재발 방지)
const REQUIRED_ENV_KEYS = ['BASE_URL', 'KAKAO_JS_KEY'];
const missingEnvKeys = REQUIRED_ENV_KEYS.filter(key => !envConfig[key]);
if (missingEnvKeys.length > 0) {
  throw new Error(
    `\n❌ ENVFILE '${envFile}' is missing required keys: ${missingEnvKeys.join(', ')}.\n` +
      `   이 값들은 scc-frontend-build-configurations submodule 의 .env 에서 옵니다.\n` +
      `   submodule 이 stale 일 가능성이 높습니다. 다음을 실행한 뒤 다시 빌드하세요:\n` +
      `     git submodule update --init subprojects/scc-frontend-build-configurations\n`,
  );
}

const transpileDeps = [
  '@react-navigation',
  'react-native-gesture-handler',
  'react-native-reanimated',
  'react-native-screens',
  'react-native-safe-area-context',
  'react-native-vector-icons',
  // ESM packages that omit file extensions (fail webpack's fullySpecified check)
  'react-native-markdown-display',
];

// React Native resolves `foo.png` to the highest-density `foo@3x.png` variant;
// webpack does not. This resolver plugin retries any image request with an
// `@3x` suffix, falling through to the exact path if that variant is absent.
class DensityImageResolverPlugin {
  apply(resolver) {
    const target = resolver.ensureHook('resolve');
    resolver
      .getHook('resolve')
      .tapAsync(
        'DensityImageResolverPlugin',
        (request, resolveContext, callback) => {
          const req = request.request;
          if (
            !req ||
            !/\.(png|jpe?g|gif)$/.test(req) ||
            /@\d+x\.(png|jpe?g|gif)$/.test(req)
          ) {
            return callback();
          }
          const altered = {
            ...request,
            request: req.replace(/\.(png|jpe?g|gif)$/, '@3x.$1'),
          };
          resolver.doResolve(
            target,
            altered,
            `try @3x variant for ${req}`,
            resolveContext,
            (err, result) => {
              if (!err && result) {
                return callback(null, result);
              }
              return callback();
            },
          );
        },
      );
  }
}

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
      'lottie-react-native': path.resolve(__dirname, 'web/mocks/lottie.js'),
      '@sbaiahmed1/react-native-blur': path.resolve(
        __dirname,
        'web/mocks/blur.js',
      ),
      'react-native-keyboard-aware-scroll-view': path.resolve(
        __dirname,
        'web/mocks/keyboard-aware-scroll-view.js',
      ),
      '@d11/react-native-fast-image': path.resolve(
        __dirname,
        'web/mocks/react-native-fast-image.js',
      ),
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
      // Mock native-only modules so the real App.tsx tree bundles on web
      'react-native-config': path.resolve(
        __dirname,
        'web/mocks/react-native-config.js',
      ),
      '@hot-updater/react-native': path.resolve(
        __dirname,
        'web/mocks/hot-updater.js',
      ),
      '@react-native-community/geolocation': path.resolve(
        __dirname,
        'web/mocks/geolocation.js',
      ),
      'react-native-splash-screen': path.resolve(
        __dirname,
        'web/mocks/splash-screen.js',
      ),
      'react-native-tracking-transparency': path.resolve(
        __dirname,
        'web/mocks/tracking-transparency.js',
      ),
      'airbridge-react-native-sdk': path.resolve(
        __dirname,
        'web/mocks/airbridge.js',
      ),
      'react-native-vision-camera': path.resolve(
        __dirname,
        'web/mocks/vision-camera.js',
      ),
      'react-native-image-picker': path.resolve(
        __dirname,
        'web/mocks/image-picker.js',
      ),
      '@react-native-community/image-editor': path.resolve(
        __dirname,
        'web/mocks/image-editor.js',
      ),
      '@invertase/react-native-apple-authentication': path.resolve(
        __dirname,
        'web/mocks/apple-authentication.js',
      ),
      '@react-native-seoul/kakao-login': path.resolve(
        __dirname,
        'web/mocks/kakao-login.js',
      ),
      '@react-native-clipboard/clipboard': path.resolve(
        __dirname,
        'web/mocks/clipboard.js',
      ),
      'react-native-device-info': path.resolve(
        __dirname,
        'web/mocks/device-info.js',
      ),
      'react-native-webview': path.resolve(
        __dirname,
        'web/mocks/react-native-webview.tsx',
      ),
      // react-native-animated-glow pulls in @shopify/react-native-skia +
      // canvaskit-wasm, which can't bundle for web. Mock it as a pass-through.
      'react-native-animated-glow': path.resolve(
        __dirname,
        'web/mocks/animated-glow.js',
      ),
    },
    // Disable fully specified imports for all dependencies
    fullySpecified: false,
    fallback: {
      process: require.resolve('process/browser'),
    },
    plugins: [new DensityImageResolverPlugin()],
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
              // NativeWind v4: emit the automatic JSX runtime pointing at
              // nativewind so `className` props are interpreted on web.
              jsx: 'react-jsx',
              jsxImportSource: 'nativewind',
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
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        type: 'asset/resource',
      },
      {
        test: /\.lottie$/,
        type: 'asset/resource',
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              // svgo 기본 설정은 viewBox 를 제거해버려, width/height prop 으로 크기를
              // 줄여도 path 가 원래 좌표(예: 24×24)대로 그려져 박스를 넘친다(앱보다 큼).
              // viewBox 를 유지해야 prop 크기에 맞게 스케일된다.
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {overrides: {removeViewBox: false}},
                  },
                ],
              },
            },
          },
        ],
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
    port: 3000,
    hot: true,
    historyApiFallback: true,
    // Allow serving under the prod hostname (via browser host-resolver) so the
    // Naver Maps key — registered for web.staircrusher.club — authenticates in
    // local testing.
    allowedHosts: 'all',
    // Don't let non-fatal warnings (RN module export shims) or environmental
    // runtime errors (e.g. denied geolocation permission) cover the app.
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: error => {
          const text = String(error?.message ?? error ?? '');
          // Suppress environmental / already-handled rejections so they don't
          // cover the app: denied geolocation, and API errors that the app
          // handles (axios interceptor clears the token & redirects on 401, etc).
          if (
            /Geolocation|geolocation position/i.test(text) ||
            /Request failed with status code|Network Error|AxiosError/i.test(
              text,
            )
          ) {
            return false;
          }
          return true;
        },
      },
    },
  },
  devtool: 'source-map',
};
