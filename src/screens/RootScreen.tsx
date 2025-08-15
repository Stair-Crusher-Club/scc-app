import messaging from '@react-native-firebase/messaging';
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

// 전체 화면 공용 로깅 규칙 정의
const ROUTE_PARAMS_LOGGING_RULES: Record<string, string> = {
  'placeInfo.placeId': 'place_id',
  'placeInfo.place.id': 'place_id',
  'placeInfo.name': 'place_name',
  // 필요에 따라 추가...
};

// 중첩된 객체에서 특정 경로의 값을 가져오는 함수
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// 허용된 route params만 선택적으로 추출하는 함수
const extractAllowedRouteParams = (routeParams: any): Record<string, any> => {
  const extracted: Record<string, any> = {};

  Object.entries(ROUTE_PARAMS_LOGGING_RULES).forEach(([paramPath, logKey]) => {
    const value = getNestedValue(routeParams, paramPath);
    if (value !== undefined && value !== null) {
      extracted[logKey] = value;
    }
  });

  return extracted;
};

const RootScreen = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const routeNameRef = useRef<string>();
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
          const message = await messaging().getInitialNotification();
          if (message) {
            return message.data?._d;
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
            Search: {
              path: 'search',
              parse: {
                searchQuery: (searchQuery?: string) => {
                  return searchQuery || undefined;
                },
              },
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
          const allowedRouteParams = extractAllowedRouteParams(routeParams);
          await Logger.logScreenView({
            prevScreenName: previousScreenName,
            currScreenName: currentScreenName,
            extraParams: {
              ...globalLogParams,
              ...allowedRouteParams, // 허용된 route params만 전달
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
