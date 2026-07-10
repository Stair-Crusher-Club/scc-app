import {HotUpdater} from '@hot-updater/react-native';
import {getAnalytics} from '@react-native-firebase/analytics';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import globalAxios, {AxiosError, InternalAxiosRequestConfig} from 'axios';
import {Provider, useAtomValue, useSetAtom} from 'jotai';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Platform, StatusBar, View} from 'react-native';
import Config from 'react-native-config';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {RootSiblingParent} from 'react-native-root-siblings';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AppComponentsProvider} from '@/AppComponentsContext';
import {getStorageValue} from '@/atoms/atomForLocal';
import {accessTokenAtom} from '@/atoms/Auth';
import {useEnsureAnonymousUser} from '@/hooks/useEnsureAnonymousUser';
import ErrorBoundary from '@/components/ErrorBoundary';
import {LoadingView} from '@/components/LoadingView';
import {color} from '@/constant/color';
import SplashOverlay from '@/splash/SplashOverlay';
import {
  Configuration,
  DefaultApi,
  ToiletApi,
} from '@/generated-sources/openapi';
import RootScreen from '@/screens/RootScreen';
import Logger from '@/logging/Logger';
import {startupTiming} from '@/logging/startupTiming';
import {logError, logRequest, logResponse} from '@/utils/DebugUtils';

import {setupGlobalFeatures} from '@/features/globalFeatures';

import './global.css';

setupGlobalFeatures();

const queryClient = new QueryClient();

// Get BASE_URL with local development override
const getBaseURL = () => {
  // On web there is no localhost-emulator bridge; always use the configured
  // BASE_URL (the dev server origin must be CORS-allowed by that backend).
  if (Config.FLAVOR === 'local' && Platform.OS !== 'web') {
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
            api={new DefaultApi(new Configuration({basePath: getBaseURL()}))}
            toiletApi={
              new ToiletApi(new Configuration({basePath: getBaseURL()}))
            }>
            <QueryClientProvider client={queryClient}>
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
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
  const ensureAnonymousUser = useEnsureAnonymousUser();

  // web 무로그인화: 토큰이 없으면 익명 계정을 발행해 항상 토큰이 존재하게 한다.
  // 토큰이 첫 화면의 조회 쿼리(전역 Anonymous라 무토큰이면 401)보다 먼저 존재하도록
  // 발행이 끝날 때까지 RootScreen 렌더를 막는다(스피너). 실패해도(finally) 앱은 띄운다.
  // 이미 토큰이 있으면(재방문 — atom getOnInit로 동기 hydrate) 스피너 없이 바로 렌더.
  const [webBootstrapDone, setWebBootstrapDone] = useState(
    Platform.OS !== 'web' || !!accessToken,
  );
  useEffect(() => {
    if (Platform.OS !== 'web' || accessToken) {
      setWebBootstrapDone(true);
      return;
    }
    let cancelled = false;
    ensureAnonymousUser()
      .catch(e => logError(e, 'web anonymous bootstrap'))
      .finally(() => {
        if (!cancelled) {
          setWebBootstrapDone(true);
        }
      });
    return () => {
      cancelled = true;
    };
    // 마운트 시 1회만. 이후 토큰 발행은 setAccessToken → 재렌더로 반영된다.
  }, []);

  useEffect(() => {
    // Request logging interceptor.
    // 토큰은 매 요청 시점에 storage에서 직접 읽는다 — atom state 클로저를 캡처하면
    // 익명 부트스트랩 직후 토큰이 아직 인터셉터에 반영 안 된 채 쿼리가 나가 401이 날 수 있다.
    const requestInterceptorId = globalAxios.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        logRequest(config);
        config.headers.set('Content-Type', 'application/json');
        config.headers.set('Accept', 'application/json');
        const token = getStorageValue<string>('scc-token');
        if (token && !config.headers.get('Authorization')) {
          // 회원가입 시나리오에서 state에 저장된 것과는 다른 access token을 사용하고 싶은 경우가 있다.
          // 따라서 이미 Authoirzation header가 지정된 상태라면 access token injection을 스킵한다.
          config.headers.set('Authorization', `Bearer ${token}`);
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
  }, [setAccessToken]);

  if (!webBootstrapDone) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color.white,
        }}>
        <ActivityIndicator size="large" color={color.brand50} />
      </View>
    );
  }
  return (
    <GestureHandlerRootView style={{flex: 1, backgroundColor: color.white}}>
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
  onProgress: () => {
    // 번들 다운로드(UPDATING) 시작 시점만 한 번 기록 — 다운로드 소요 분리용
    if (!startupTiming.otaFirstProgress) {
      startupTiming.otaFirstProgress = Date.now();
    }
  },
  onUpdateProcessCompleted: res => {
    startupTiming.otaCompleted = Date.now();
    Logger.setOtaBundleId(HotUpdater.getBundleId() ?? 'unknown');
    Logger.logOtaCompleted({
      status: res.status,
      didDownload: res.status !== 'UP_TO_DATE',
      jsToOtaMs: startupTiming.otaCompleted - startupTiming.jsStart,
      downloadMs: startupTiming.otaFirstProgress
        ? startupTiming.otaCompleted - startupTiming.otaFirstProgress
        : 0,
      bundleId: HotUpdater.getBundleId() ?? 'unknown',
    });
  },
  onError: error => {
    getAnalytics().logEvent('HotUpdaterError', {
      error: error.message,
    });
  },
})(AppWithMigration);

const AppRoot = () => (
  <View style={{flex: 1, backgroundColor: color.brand30}}>
    {Platform.OS === 'web' ? (
      // Web: no OTA (HotUpdater) and no native splash. The provider tree is shared.
      <AppWithProviders />
    ) : (
      <>
        <HotUpdatedApp />
        <SplashOverlay />
      </>
    )}
  </View>
);

export default AppRoot;
