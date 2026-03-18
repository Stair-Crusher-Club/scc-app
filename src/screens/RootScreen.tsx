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
              const airbridgeUrl = await new Promise<string | null>(resolve => {
                const timeout = setTimeout(() => resolve(null), 3000);
                Airbridge.setOnDeeplinkReceived((deeplink: string) => {
                  clearTimeout(timeout);
                  resolve(deeplink);
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
                logDebug(
                  'Normal deeplink click during app background state',
                  url,
                );
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
