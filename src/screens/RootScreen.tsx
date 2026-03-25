import {getMessaging} from '@react-native-firebase/messaging';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import React, {useRef} from 'react';
import {Linking, Platform} from 'react-native';
import Config from 'react-native-config';
import SplashScreen from 'react-native-splash-screen';
import {requestTrackingPermission} from 'react-native-tracking-transparency';
import {Airbridge} from 'airbridge-react-native-sdk';

import {getStorageValue} from '@/atoms/atomForLocal';
import DevTool from '@/components/DevTool/DevTool';
import {setDeferredDeepLinkUrl} from '@/deeplink/DeferredDeepLink';
import {useLogParams} from '@/logging/LogParamsProvider';
import Logger from '@/logging/Logger';
import {Navigation} from '@/navigation';
import {
  DEEP_LINK_PREFIXES,
  linkingScreensConfig,
} from '@/navigation/linkingConfig';
import {dismissSplashOverlay} from '@/splash/SplashOverlay';
import {logDebug} from '@/utils/DebugUtils';
import {isAuthDeferred} from '@/utils/deepLinkUtils';

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
  const routeNameRef = useRef<string>(undefined);
  const navigationRef = useNavigationContainerRef();
  const globalLogParams = useLogParams();

  return (
    <>
      <NavigationContainer
        ref={navigationRef}
        onReady={async () => {
          SplashScreen.hide();
          dismissSplashOverlay();
          if (Platform.OS === 'ios') {
            requestTrackingPermission();
          }
          const currentScreenName =
            navigationRef.current?.getCurrentRoute()?.name;
          logDebug(`App starts at ${currentScreenName}`);
          await Logger.logScreenView({
            currScreenName: currentScreenName,
          });
          routeNameRef.current = currentScreenName;
        }}
        linking={{
          prefixes: DEEP_LINK_PREFIXES,
          // 앱 quit 상태에서 deeplink 클릭이나 앱 푸시 클릭을 했을 때의 처리
          getInitialURL: async () => {
            // Airbridge 디퍼드 딥링크 확인 (production만)
            let resolvedUrl: string | null = null;

            if (Config.FLAVOR === 'production') {
              let resolved = false;
              const airbridgeUrl = await new Promise<string | null>(resolve => {
                const timeout = setTimeout(() => {
                  resolved = true;
                  resolve(null);
                }, 3000);
                Airbridge.setOnDeeplinkReceived((deeplink: string) => {
                  clearTimeout(timeout);
                  if (deeplink.startsWith('kakao')) {
                    return;
                  }
                  if (!resolved) {
                    resolved = true;
                    resolve(deeplink);
                  } else {
                    // ATT 응답 후 늦게 도착한 디퍼드 딥링크
                    setDeferredDeepLinkUrl(deeplink);
                  }
                });
              });
              if (airbridgeUrl) {
                logDebug('Airbridge deferred deeplink received', airbridgeUrl);
                resolvedUrl = airbridgeUrl;
              }
            }

            // 일반 딥링크 처리
            if (!resolvedUrl) {
              const url = await Linking.getInitialURL();
              if (url) {
                logDebug('Normal deeplink click during app quit state', url);
                resolvedUrl = url;
              }
            }

            // authDeferred=true → URL 저장 후 null 반환 (Main 마운트 후 소비)
            if (resolvedUrl && isAuthDeferred(resolvedUrl)) {
              logDebug('Auth-deferred deep link intercepted', resolvedUrl);
              setDeferredDeepLinkUrl(resolvedUrl);
              return null;
            }

            if (resolvedUrl) {
              return resolvedUrl;
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
                // 카카오 콜백 URL 무시 (iOS에서 Airbridge trackDeeplink가 처리하면서 딥링크 상태 방해)
                if (url.startsWith('kakao')) {
                  return;
                }
                // authDeferred=true + 비로그인 → URL 저장 + Login 리다이렉트
                if (
                  isAuthDeferred(url) &&
                  !getStorageValue<string>('scc-token')
                ) {
                  logDebug('Auth-deferred deep link (background)', url);
                  setDeferredDeepLinkUrl(url);
                  (navigationRef.current?.navigate as any)('Login');
                  return;
                }
                // 로그인 상태이거나 authDeferred 아님 → React Navigation에 위임
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
          config: linkingScreensConfig,
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
