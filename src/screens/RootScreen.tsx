import {getMessaging} from '@react-native-firebase/messaging';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {Linking} from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import DevTool from '@/components/DevTool/DevTool';
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

  const routeNameRef = useRef<string>(undefined);
  const navigationRef = useNavigationContainerRef();
  const globalLogParams = useLogParams();

  return (
    <>
      <NavigationContainer
        ref={navigationRef}
        onReady={async () => {
          setTimeout(() => {
            SplashScreen.hide();
          }, 150);
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
          // 앱 quit 상태에서 deeplink 클릭이나 앱 푸시 클릭을 했을 때의 처리
          getInitialURL: async () => {
            // 일반 딥링크 처리
            const url = await Linking.getInitialURL();
            if (url) {
              logDebug('Normal deeplink click during app quit state', url);
              return url;
            }

            // 푸시 알림 처리
            const message = await getMessaging().getInitialNotification();
            if (message) {
              logDebug('getInitialNotification', message);
              Logger.logAppPushOpen({
                title: message.notification?.title || '',
                body: message.notification?.body || '',
                campaignId: message.data?.campaign_id as string | undefined,
                campaignType: message.data?.campaign_type as string | undefined,
                serverPushLogId: message.data?.server_push_log_id as
                  | string
                  | undefined,
              });
              const data = message.data as {_d: string};
              return data?._d;
            }
            return null;
          },
          // 앱 background 상태에서 deeplink 클릭이나 앱 푸시 클릭을 했을 때의 처리
          subscribe(listener) {
            // 일반 딥링크 처리
            const linkingSubscription = Linking.addEventListener(
              'url',
              ({url}) => {
                logDebug(
                  'Normal deeplink click during app background state',
                  url,
                );
                listener(url);
              },
            );

            // 푸시 알림 처리
            const pushSubscription = getMessaging().onNotificationOpenedApp(
              async remoteMessage => {
                // https://github.com/invertase/react-native-firebase/issues/7749#issuecomment-2075084174
                // 1. background 상태 -> 2. 앱 푸시 A 클릭해서 오픈 -> 3. quit 상태 -> 4. 앱 푸시 B 클릭해서 오픈
                // 위와 같은 시나리오를 겪을 때, 4번의 getInitialNotification()에서 앱 푸시 A의 remoteMessage를 수신하는 문제가 있다.
                // 링크된 github issue를 보면 2번 타이밍 때 getInitialNotification() 쪽에 앱 푸시 A에 대한 데이터가 로컬에 저장되는데,
                // onNotificationOpenedApp() 호출로는 이 데이터가 초기화되지 않아서 4번 타이밍에 앱 푸시 A의 remoteMessage가 쓰이는 것으로 보인다.
                // 임시 방편으로 2번 타이밍 때 getInitialNotification()를 호출해줘서 강제로 로컬에 저장된 remoteMessage를 초기화해준다.
                getMessaging().getInitialNotification();

                logDebug('onNotificationOpenedApp', remoteMessage);
                Logger.logAppPushOpen({
                  title: remoteMessage.notification?.title || '',
                  body: remoteMessage.notification?.body || '',
                  campaignId: remoteMessage.data?.campaign_id as
                    | string
                    | undefined,
                  campaignType: remoteMessage.data?.campaign_type as
                    | string
                    | undefined,
                  serverPushLogId: remoteMessage.data?.server_push_log_id as
                    | string
                    | undefined,
                });

                const data = remoteMessage.data as {_d?: string};
                if (data?._d) {
                  listener(data._d);
                }
              },
            );

            return () => {
              linkingSubscription.remove();
              pushSubscription();
            };
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
              CrusherActivity: {
                path: 'crusher-activity',
              },
              'Review/Upvote': {
                path: 'review/upvote',
              },
              'Conquerer/Upvote': {
                path: 'conquerer/upvote',
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
      <DevTool />
    </>
  );
};

export default RootScreen;
