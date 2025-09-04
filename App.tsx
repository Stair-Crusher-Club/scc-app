import {HotUpdater} from '@hot-updater/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAnalytics} from '@react-native-firebase/analytics';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import globalAxios, {AxiosError, InternalAxiosRequestConfig} from 'axios';
import {Provider, useAtomValue, useSetAtom} from 'jotai';
import {useEffect, useState} from 'react';
import {Platform, StatusBar} from 'react-native';
import Config from 'react-native-config';
import {RootSiblingParent} from 'react-native-root-siblings';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AppComponentsProvider} from '@/AppComponentsContext';
import OTAUpdateDialog from '@/OTAUpdateDialog';
import {accessTokenAtom} from '@/atoms/Auth';
import {storage} from '@/atoms/atomForLocal';
import {LoadingView} from '@/components/LoadingView';
import {color} from '@/constant/color';
import {Configuration, DefaultApi} from '@/generated-sources/openapi';
import RootScreen from '@/screens/RootScreen';
import {logRequest, logResponse, logError} from '@/utils/DebugUtils';

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
    <RootSiblingParent>
      <StatusBar barStyle={'dark-content'} backgroundColor={color.white} />
      <RootScreen />
      <LoadingView />
    </RootSiblingParent>
  );
};

// do migration from AsyncStorage to MMKV
const AppWithMigration = () => {
  const [isMigrated, setIsMigrated] = useState(false);
  useEffect(() => {
    const migrateAsyncStorageToMMKV = async () => {
      const allKeys = await AsyncStorage.multiGet([
        'userInfo',
        'hasShownGuideForFirstVisit',
        'hasShownGuideForEnterancePhoto',
        'scc-token',
      ]);
      allKeys.forEach(([key, value]) => {
        if (value && storage.getString(key) === undefined) {
          if (key === 'scc-token') {
            // 토큰은 JSON 화된 문자열이 아닌 그대로 저장되어 있던 값이므로
            // JSON 에 호환되는 문자열로 저장해야 한다.
            storage.set(key, `"${value}"`);
          } else {
            storage.set(key, value);
          }
        }
      });
      setIsMigrated(true);
    };
    migrateAsyncStorageToMMKV();
  }, []);
  return isMigrated ? <AppWithProviders /> : null;
};

export default HotUpdater.wrap({
  source: Config.HOT_UPDATER_URL ?? '',
  onError: error => {
    getAnalytics().logEvent('HotUpdaterError', {
      error: error.message,
    });
  },
  fallbackComponent: ({progress}) => {
    return <OTAUpdateDialog progress={progress} />;
  },
})(AppWithMigration);
