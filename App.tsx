import {HotUpdater} from '@hot-updater/react-native';
import {getAnalytics} from '@react-native-firebase/analytics';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import globalAxios, {AxiosError, InternalAxiosRequestConfig} from 'axios';
import {Provider, useAtomValue, useSetAtom} from 'jotai';
import React, {useEffect} from 'react';
import {Platform, StatusBar, View} from 'react-native';
import Config from 'react-native-config';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {RootSiblingParent} from 'react-native-root-siblings';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AppComponentsProvider} from '@/AppComponentsContext';
import {accessTokenAtom} from '@/atoms/Auth';
import {LoadingView} from '@/components/LoadingView';
import {color} from '@/constant/color';
import SplashOverlay from '@/splash/SplashOverlay';
import {Configuration, DefaultApi} from '@/generated-sources/openapi';
import RootScreen from '@/screens/RootScreen';
import {logError, logRequest, logResponse} from '@/utils/DebugUtils';

import {setupGlobalFeatures} from '@/features/globalFeatures';

import './global.css';

setupGlobalFeatures();

const queryClient = new QueryClient();

// Get BASE_URL with local development override
const getBaseURL = () => {
  if (Config.FLAVOR === 'local') {
    return Platform.OS === 'ios'
      ? 'http://localhost:8080'
      : 'http://10.0.2.2:8080';
  }
  return Config.BASE_URL;
};

const AppWithProviders = () => {
  return (
    <View style={{flex: 1, backgroundColor: color.brand30}}>
      <Provider>
        <SafeAreaProvider>
          <AppComponentsProvider
            api={new DefaultApi(new Configuration({basePath: getBaseURL()}))}>
            <QueryClientProvider client={queryClient}>
              <App />
            </QueryClientProvider>
          </AppComponentsProvider>
        </SafeAreaProvider>
      </Provider>
    </View>
  );
};

const App = () => {
  const accessToken = useAtomValue(accessTokenAtom);
  const setAccessToken = useSetAtom(accessTokenAtom);

  useEffect(() => {
    // Request logging interceptor
    const requestInterceptorId = globalAxios.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        logRequest(config);

        if (accessToken) {
          config.headers.set('Content-Type', 'application/json');
          if (!config.headers.get('Authorization')) {
            // 회원가입 시나리오에서 state에 저장된 것과는 다른 access token을 사용하고 싶은 경우가 있다.
            // 따라서 이미 Authoirzation header가 지정된 상태라면 access token injection을 스킵한다.
            config.headers.set('Authorization', `Bearer ${accessToken}`);
          }
          config.headers.set('Accept', 'application/json');
        } else {
          config.headers.set('Content-Type', 'application/json');
          config.headers.set('Accept', 'application/json');
        }
        return config;
      },
      error => {
        logError(error, 'Request Interceptor');
        return Promise.reject(error);
      },
    );

    // Response logging interceptor
    const responseInterceptorId = globalAxios.interceptors.response.use(
      response => {
        logResponse(response);
        return response;
      },
      (error: AxiosError) => {
        logError(error, 'Response Interceptor');

        if (error.response && error.response.status === 401) {
          setAccessToken(null);
        }
        return Promise.reject(error);
      },
    );

    return () => {
      globalAxios.interceptors.request.eject(requestInterceptorId);
      globalAxios.interceptors.response.eject(responseInterceptorId);
    };
  }, [accessToken]);
  return (
    <GestureHandlerRootView style={{flex: 1, backgroundColor: color.brand30}}>
      <RootSiblingParent>
        <StatusBar barStyle={'dark-content'} backgroundColor={color.white} />
        <RootScreen />
        <LoadingView />
      </RootSiblingParent>
    </GestureHandlerRootView>
  );
};

const AppWithMigration = () => {
  return <AppWithProviders />;
};

const HotUpdatedApp = HotUpdater.wrap({
  source: Config.HOT_UPDATER_URL ?? '',
  fallbackComponent: () => null,
  onError: error => {
    getAnalytics().logEvent('HotUpdaterError', {
      error: error.message,
    });
  },
})(AppWithMigration);

const AppRoot = () => (
  <View style={{flex: 1, backgroundColor: color.brand30}}>
    <HotUpdatedApp />
    <SplashOverlay />
  </View>
);

export default AppRoot;
