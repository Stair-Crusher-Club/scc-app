import {getMessaging} from '@react-native-firebase/messaging';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import {AppState, Linking, NativeModules, Platform} from 'react-native';
import Config from 'react-native-config';
import SplashScreen from 'react-native-splash-screen';
import {requestTrackingPermission} from 'react-native-tracking-transparency';
import {Airbridge} from 'airbridge-react-native-sdk';

import {getStorageValue} from '@/atoms/atomForLocal';
import DevTool from '@/components/DevTool/DevTool';
import {setDeferredDeepLinkUrl} from '@/deeplink/DeferredDeepLink';
import {setPendingSharedText} from '@/deeplink/PendingSharedText';
import {useLogParams} from '@/logging/LogParamsProvider';
import Logger from '@/logging/Logger';
import {Navigation} from '@/navigation';
import {
  DEEP_LINK_PREFIXES,
  linkingScreensConfig,
  webLinkingScreensConfig,
} from '@/navigation/linkingConfig';
import {startupTiming} from '@/logging/startupTiming';
import {dismissSplashOverlay} from '@/splash/SplashOverlay';
import {classifyWebRoute} from '@/navigation/webAccess';
import {showAppInstallPrompt} from '@/utils/appInstallPrompt';
import {logDebug} from '@/utils/DebugUtils';
import {isAuthDeferred} from '@/utils/deepLinkUtils';
import HeatTelemetry from '@/utils/HeatTelemetry';

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

  // __DEV__ only: expose navigationRef globally for CDP-based E2E testing
  React.useEffect(() => {
    if (!__DEV__) {
      return;
    }
    const g = globalThis as typeof globalThis & {
      __navRef?: typeof navigationRef;
    };
    g.__navRef = navigationRef;
    return () => {
      delete g.__navRef;
    };
  }, [navigationRef]);

  // 외부 지도앱 공유 텍스트 처리 (Android: ReceiveSharingIntent / iOS: stair-crusher://shared?text=)
  const handleSharedText = useCallback(
    (sharedText: string) => {
      const isLoggedIn = !!getStorageValue<string>('scc-token');
      if (!isLoggedIn) {
        setPendingSharedText(sharedText);
        (navigationRef.current?.navigate as any)('Login');
        return;
      }
      (navigationRef.current?.navigate as any)('ResolvingSharedLink', {
        sharedText,
      });
    },
    [navigationRef],
  );

  // 웹 라우트 게이트: 앱 화면은 token 필수(없으면 Login), 카메라 등록 플로우는 앱 설치
  // 유도. bbucle-road 등 웹 전용 컨텐츠는 token 없이 허용. 초기 딥링크(onReady)와
  // 이후 화면 전환(onStateChange) 양쪽에서 호출한다. 리다이렉트했으면 true 반환.
  const runWebRouteGate = useCallback(
    (routeName?: string): boolean => {
      if (Platform.OS !== 'web' || !routeName) {
        return false;
      }
      const access = classifyWebRoute(routeName);
      if (access === 'appOnly') {
        showAppInstallPrompt('이 기능은 앱에서만 이용할 수 있어요');
        if (navigationRef.current?.canGoBack()) {
          navigationRef.current.goBack();
        } else {
          (navigationRef.current?.navigate as any)('Main');
        }
        return true;
      }
      if (access === 'requireToken' && !getStorageValue<string>('scc-token')) {
        // 게이팅된 콘텐츠 URL을 redirect로 보존 → 로그인 후 그 페이지로 복귀.
        const loc = (
          globalThis as {location?: {pathname?: string; search?: string}}
        ).location;
        const redirect = loc ? `${loc.pathname ?? ''}${loc.search ?? ''}` : '';
        (navigationRef.current?.navigate as any)(
          'Login',
          redirect && !redirect.startsWith('/login') ? {redirect} : undefined,
        );
        return true;
      }
      return false;
    },
    [navigationRef],
  );

  // Android: MainActivity에서 직접 읽은 ACTION_SEND 텍스트를 NativeModule로 가져옴.
  // ReceiveSharingIntent 라이브러리는 getCurrentActivity() 타이밍 문제로 cold start 시 동작 안 함.
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    const {ShareIntentModule} = NativeModules;

    // cold start: navigation 아직 미준비 → PendingSharedText 경유 (MainScreen이 소비)
    const checkOnColdStart = async () => {
      try {
        const text: string | null =
          await ShareIntentModule?.getPendingShareText();
        if (text) {
          setPendingSharedText(text);
        }
      } catch (e) {
        logDebug('ShareIntentModule error', e);
      }
    };

    // background→foreground: navigation 이미 준비됨 → 바로 navigate
    const checkOnForeground = async () => {
      try {
        const text: string | null =
          await ShareIntentModule?.getPendingShareText();
        if (text) {
          handleSharedText(text);
        }
      } catch (e) {
        logDebug('ShareIntentModule error', e);
      }
    };

    checkOnColdStart();

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        checkOnForeground();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [handleSharedText]);

  return (
    <>
      <NavigationContainer
        ref={navigationRef}
        onReady={async () => {
          // 콜드스타트 splash 종료 시점 계측 (진단용)
          const navReady = Date.now();
          Logger.logSplashDismissed({
            jsToNavReadyMs: navReady - startupTiming.jsStart,
            otaToNavReadyMs: startupTiming.otaCompleted
              ? navReady - startupTiming.otaCompleted
              : 0,
          });
          SplashScreen.hide();
          dismissSplashOverlay();
          if (Platform.OS === 'ios') {
            requestTrackingPermission();
          }
          HeatTelemetry.beginSession().catch(() => {});
          const currentScreenName =
            navigationRef.current?.getCurrentRoute()?.name;
          // 초기 딥링크 게이트 (onStateChange는 초기 상태엔 발화하지 않음)
          if (runWebRouteGate(currentScreenName)) {
            return;
          }
          logDebug(`App starts at ${currentScreenName}`);
          await Logger.logScreenView({
            currScreenName: currentScreenName,
          });
          routeNameRef.current = currentScreenName;
        }}
        linking={
          Platform.OS === 'web'
            ? {
                // 웹: 브라우저 URL ↔ 화면 동기화는 react-navigation이 자동 처리.
                // 네이티브 deeplink/push/airbridge 로직은 불필요.
                prefixes: [
                  (globalThis as {location?: {origin?: string}}).location
                    ?.origin ?? '',
                ],
                config: webLinkingScreensConfig,
              }
            : {
                prefixes: DEEP_LINK_PREFIXES,
                // 앱 quit 상태에서 deeplink 클릭이나 앱 푸시 클릭을 했을 때의 처리
                getInitialURL: async () => {
                  // iOS Share Extension cold start: Airbridge 가로채기보다 먼저 분기한다.
                  // background subscribe 경로와 동일한 우선순위 — 이 순서가 없으면 Airbridge의
                  // setOnDeeplinkReceived가 share URL을 먼저 먹어버려 PendingSharedText가 set되지 않는다.
                  const initialUrl = await Linking.getInitialURL();
                  if (initialUrl?.startsWith('stair-crusher://shared?text=')) {
                    const sharedText = decodeURIComponent(
                      initialUrl.replace('stair-crusher://shared?text=', ''),
                    );
                    logDebug('iOS Share Extension cold start', sharedText);
                    setPendingSharedText(sharedText);
                    return null;
                  }

                  // Airbridge 디퍼드 딥링크 확인 (production만)
                  let resolvedUrl: string | null = null;

                  if (Config.FLAVOR === 'production') {
                    let resolved = false;
                    const airbridgeUrl = await new Promise<string | null>(
                      resolve => {
                        // 타임아웃 후 늦게 도착한 deeplink는 아래 else 분기에서
                        // setDeferredDeepLinkUrl로 async 처리됨(MainScreen/HomeScreenV2가 소비)
                        // → 짧게 잡아도 attribution 안 깨지고, 콜드스타트 splash 지연만 단축.
                        // (3000ms → 800ms: prod 콜드스타트 ③ 구간이 3s 고정 대기였음, 계측으로 확인)
                        const timeout = setTimeout(() => {
                          resolved = true;
                          resolve(null);
                        }, 800);
                        Airbridge.setOnDeeplinkReceived((deeplink: string) => {
                          clearTimeout(timeout);
                          if (deeplink.startsWith('kakao')) {
                            return;
                          }
                          // iOS Share Extension URL은 위에서 이미 처리됨 — Airbridge가 다시 삼키지 않도록 무시
                          if (deeplink.startsWith('stair-crusher://shared')) {
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
                      },
                    );
                    if (airbridgeUrl) {
                      logDebug(
                        'Airbridge deferred deeplink received',
                        airbridgeUrl,
                      );
                      resolvedUrl = airbridgeUrl;
                    }
                  }

                  // 일반 딥링크 처리 (share URL은 위에서 이미 처리됨)
                  if (!resolvedUrl && initialUrl) {
                    logDebug(
                      'Normal deeplink click during app quit state',
                      initialUrl,
                    );
                    resolvedUrl = initialUrl;
                  }

                  // authDeferred=true → URL 저장 후 null 반환 (Main 마운트 후 소비)
                  if (resolvedUrl && isAuthDeferred(resolvedUrl)) {
                    logDebug(
                      'Auth-deferred deep link intercepted',
                      resolvedUrl,
                    );
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
                      campaignId: message.data?.campaign_id as
                        | string
                        | undefined,
                      campaignType: message.data?.campaign_type as
                        | string
                        | undefined,
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
                      // iOS Share Extension: stair-crusher://shared?text=<encoded>
                      if (url.startsWith('stair-crusher://shared?text=')) {
                        const sharedText = decodeURIComponent(
                          url.replace('stair-crusher://shared?text=', ''),
                        );
                        handleSharedText(sharedText);
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
                  const pushSubscription =
                    getMessaging().onNotificationOpenedApp(
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
                          serverPushLogId: remoteMessage.data
                            ?.server_push_log_id as string | undefined,
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
              }
        }
        onStateChange={async state => {
          const previousScreenName = routeNameRef.current;
          const currentScreenName =
            navigationRef.current?.getCurrentRoute()?.name;

          if (runWebRouteGate(currentScreenName)) {
            return;
          }

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
