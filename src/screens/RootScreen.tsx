import {getMessaging} from '@react-native-firebase/messaging';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {Linking} from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import {useLogParams} from '@/logging/LogParamsProvider';
import Logger from '@/logging/Logger';
import {Navigation} from '@/navigation';
import {logDebug} from '@/utils/DebugUtils';

// 중첩된 객체를 평탄화하는 함수
const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
  const flattened: Record<string, any> = {};

  Object.keys(obj).forEach(key => {
    const value = obj[key];
    // camelCase를 snake_case로 변환
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    const newKey = prefix ? `${prefix}_${snakeKey}` : snakeKey;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // 중첩된 객체인 경우 재귀적으로 평탄화
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      // 원시값이거나 배열인 경우 그대로 저장
      flattened[newKey] = value;
    }
  });

  return flattened;
};

const RootScreen = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const routeNameRef = useRef<string>(undefined);
  const navigationRef = useNavigationContainerRef();
  const globalLogParams = useLogParams();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={async () => {
        const currentScreenName =
          navigationRef.current?.getCurrentRoute()?.name;
        logDebug(`App starts at ${currentScreenName}`);
        await Logger.logScreenView({
          currScreenName: currentScreenName,
        });
        routeNameRef.current = currentScreenName;
      }}
      linking={{
        prefixes: [
          'stair-crusher://',
          'https://scc.airbridge.io/',
          'https://app.staircrusher.club/',
        ],
        getInitialURL: async () => {
          const url = await Linking.getInitialURL();
          if (url) {
            return url;
          }
          const message = await getMessaging().getInitialNotification();
          if (message) {
            const data = message.data as {_d: string};
            return data?._d;
          }
          return null;
        },
        config: {
          initialRouteName: 'Main' as any, // for preventing type error
          screens: {
            ProfileEditor: 'profile',
            Setting: 'setting',
            PlaceDetail: {
              path: 'place/:placeInfo',
              parse: {
                placeInfo: (placeId: string) => {
                  return {placeId};
                },
              },
              stringify: {
                placeInfo: (placeInfo: {placeId: string}) => {
                  return placeInfo.placeId;
                },
              },
            },
            ChallengeDetail: {
              path: 'challenge/:challengeId',
            },
            Webview: {
              path: 'webview',
            },
          },
        },
      }}
      onStateChange={async state => {
        const previousScreenName = routeNameRef.current;
        const currentScreenName =
          navigationRef.current?.getCurrentRoute()?.name;
        if (previousScreenName !== currentScreenName) {
          logDebug(`Screen ${previousScreenName} -> ${currentScreenName}`);
          const routeParams = state?.routes.at(-1)?.params ?? {};
          const flattenedRouteParams = flattenObject(routeParams);
          await Logger.logScreenView({
            prevScreenName: previousScreenName,
            currScreenName: currentScreenName,
            extraParams: {
              ...globalLogParams,
              ...flattenedRouteParams, // 평탄화된 routeParams 전달
            },
          });
          routeNameRef.current = currentScreenName;
        }
      }}>
      <Navigation />
    </NavigationContainer>
  );
};

export default RootScreen;
