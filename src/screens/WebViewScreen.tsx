import {useBackHandler} from '@react-native-community/hooks';
import {useFocusEffect} from '@react-navigation/native';
import {SccPressable} from '@/components/SccPressable';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import type {
  ShouldStartLoadRequest,
  WebViewOpenWindowEvent,
} from 'react-native-webview/lib/WebViewTypes';
import {useAtomValue} from 'jotai';
import Config from 'react-native-config';

import BackIcon from '@/assets/icon/ic_v2_arrow_back.svg';
import CloseIcon from '@/assets/icon/close.svg';
import {accessTokenAtom, isAnonymousUserAtom, useMe} from '@/atoms/Auth';
import {CloseAppBar} from '@/components/AppBar';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {resolveTemplatedExternalUrl} from '@/utils/externalUrlTemplating';
import {
  handleWebViewOpenWindow,
  handleWebViewShouldStartLoad,
  isTrackingLinkUrl,
} from '@/utils/webViewUtils';
import SccContentFloatingBar from './WebViewScreen/components/SccContentFloatingBar';

// 브리지(로그인 상태 주입 + 로그인 위임 메시지 수신)를 허용하는 origin.
// prefix 매칭(`startsWith(origin)`)은 `https://web.staircrusher.club.evil.com` 같은
// 접미사 도메인을 통과시켜 토큰을 넘겨주므로, origin 뒤에 경계문자가 오는지까지 본다.
// (웹뷰 안 링크 클릭은 handleWebViewShouldStartLoad 가 http(s) 를 전부 통과시키므로
//  외부 도메인으로 이동이 가능하다 — 여기가 유일한 신뢰 경계다.)
const BRIDGE_ALLOWED_ORIGINS = ['https://web.staircrusher.club'];

function isBridgeAllowedUrl(targetUrl: string): boolean {
  return BRIDGE_ALLOWED_ORIGINS.some(
    origin =>
      targetUrl === origin ||
      targetUrl.startsWith(`${origin}/`) ||
      targetUrl.startsWith(`${origin}?`) ||
      targetUrl.startsWith(`${origin}#`),
  );
}

// 웹 → 앱 메시지 타입. 웹뷰 안 web bundle 이 "로그인이 필요하다" 를 앱에 위임한다.
// (로그인 주체는 항상 앱 — 웹뷰 안 애플 로그인은 팝업 미지원으로 깨지고 신규가입
//  플로우도 웹에 없다. 상세: src/utils/appWebViewBridge.web.ts)
const APP_MESSAGE_REQUEST_LOGIN = 'SCC_REQUEST_LOGIN';

// 주입 payload 의 스키마 버전. 웹은 이 값이 있을 때만 로그인 위임을 시도하고,
// 없으면(= 이 코드가 없는 구버전 앱) 기존 동작으로 폴백한다.
const AUTH_BRIDGE_VERSION = 1;

export interface WebViewScreenParams {
  headerVariant?: 'appbar' | 'navigation';
  fixedTitle?: string;
  url: string;
  // close 버튼 누를 때 "정말 나가시겠어요?" confirm Alert 표시 여부. 기본 true.
  confirmOnClose?: boolean;
  // (web 전용) 외부 url을 열 때 브라우저 target. '_blank'=새 탭(기본, 앱 내부 링크
  // 클릭용), '_self'=현재 탭 이동. 미지정 시 '_blank'. (native는 인앱 웹뷰라 무시)
  webLinkTarget?: '_self' | '_blank';
  // true 면 SccContentFloatingBar(좋아요/저장 등) 를 강제로 숨긴다 (공지사항 등 콘텐츠 도메인이라도).
  forceHideFloatingBar?: boolean;
}

const WebViewScreen = ({route, navigation}: ScreenProps<'Webview'>) => {
  const {
    fixedTitle,
    url,
    headerVariant = 'navigation',
    confirmOnClose = true,
    forceHideFloatingBar,
  } = route.params;
  const webViewRef = useRef<WebView>(null);
  const {userInfo} = useMe();
  const accessToken = useAtomValue(accessTokenAtom);
  const isAnonymousUser = useAtomValue(isAnonymousUserAtom);
  // 앱은 게스트 로그인만 해도 익명 토큰을 갖는다 — 토큰 유무가 아니라 식별 여부를 웹에 알린다.
  // 로그아웃은 토큰만 지우고 userInfo 는 남기므로(SettingScreen/BottomButtons) 둘을 함께 본다.
  const isAnonymous = !accessToken || isAnonymousUser;
  const resolvedInitialUrl = useMemo(
    () => resolveTemplatedExternalUrl(url, {userId: userInfo?.id}),
    [url, userInfo?.id],
  );
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(resolvedInitialUrl);

  const [title, setTitle] = useState<string | undefined>(
    fixedTitle || undefined,
  );

  // 웹페이지 OG 메타 + 본문 이미지 (저장 시 서버로 전달)
  const [ogMeta, setOgMeta] = useState<{
    title: string | null;
    description: string | null;
    imageUrls: string[];
  } | null>(null);

  // SCC 콘텐츠 도메인이면 floating bar 노출 (forceHideFloatingBar 로 강제 opt-out 가능)
  const shouldShowFloatingBar =
    !forceHideFloatingBar &&
    (currentUrl.startsWith('https://con.staircrusher.club') ||
      currentUrl.startsWith('https://staircrusherclub.notion.site'));

  // BBUCLE_ROAD 좋아요용 path id (기존 흐름과 동일).
  // 좋아요는 SccContent 저장 여부와 무관하게 path id 기준으로 누적/조회된다.
  const bbucleRoadId = useMemo(() => {
    const match = currentUrl.match(
      /(?:con\.staircrusher\.club|staircrusherclub\.notion\.site)\/([^/?#]+)/,
    );
    return match ? match[1] : null;
  }, [currentUrl]);

  // 로그인 위임은 idempotent 해야 한다 — 웹이 몇 번을 요청하든 로그인 화면은 최대 1개.
  // (중복 요청 경로를 다 막는 것보다 sink 에서 보장하는 쪽이 안전하다)
  // 화면이 다시 포커스되면(= 로그인 화면이 닫혔다) 잠금을 푼다.
  const loginRequestPendingRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      loginRequestPendingRef.current = false;
    }, []),
  );

  const onTapCloseButton = useCallback(() => {
    if (!confirmOnClose) {
      navigation.goBack();
      return;
    }
    Alert.alert('정말 페이지를 나가시겠어요?', '', [
      {text: '취소', style: 'cancel'},
      {
        text: '나가기',
        onPress: () => navigation.goBack(),
        style: 'destructive',
      },
    ]);
  }, [navigation, confirmOnClose]);

  const handleMessage = useCallback(
    (message: WebViewMessageEvent) => {
      const raw = message.nativeEvent.data;
      try {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed === 'object' &&
          parsed.type === APP_MESSAGE_REQUEST_LOGIN
        ) {
          // onMessage 에는 origin 이 없고, 주입 채널은 웹뷰가 외부 도메인으로 이동한 뒤에도
          // 살아있다. 현재 로드된 URL 이 허용 origin 일 때만 로그인 화면을 띄운다.
          if (!isBridgeAllowedUrl(currentUrl)) return;
          // 이미 요청했거나(같은 tick 의 중복 메시지) 로그인 화면이 떠 있으면 무시한다.
          if (loginRequestPendingRef.current) return;
          const routes = navigation.getState().routes;
          // Login → (미가입) Signup 으로 replace 되므로 둘 다 "이미 떠 있음" 이다.
          const topRouteName = routes[routes.length - 1]?.name;
          if (topRouteName === 'Login' || topRouteName === 'Signup') return;
          loginRequestPendingRef.current = true;
          navigation.navigate('Login', {asModal: true});
          return;
        }
        if (
          parsed &&
          typeof parsed === 'object' &&
          parsed.type === 'SCC_OG_META'
        ) {
          const payload = parsed.payload as {
            title: string | null;
            description: string | null;
            imageUrls?: string[] | null;
          } | null;
          if (payload) {
            setOgMeta({
              title: payload.title ?? null,
              description: payload.description ?? null,
              imageUrls: Array.isArray(payload.imageUrls)
                ? payload.imageUrls
                : [],
            });
            // fixedTitle 을 준 호출부는 헤더에 띄울 문구를 이미 정한 것이다 — 페이지의 OG title
            // 로 덮으면 "공지사항"이 노션 문서 제목으로, 홈 섹션 더보기가 "아티클 | 계단뿌셔클럽"
            // 으로 바뀐다. OG title 이 필요한 곳(FloatingBar)엔 ogDetail 로 따로 넘어간다.
            if (payload.title && !fixedTitle) {
              setTitle(payload.title);
            }
          }
        }
      } catch (_e) {
        // OG 스크립트 외 메시지는 무시 (의도되지 않은 raw postMessage).
      }
    },
    [currentUrl, navigation, fixedTitle],
  );

  // 앱의 로그인 상태를 웹에 주입하는 스크립트. 페이지의 BbucleRoadScreen 이
  // window.__SCC_APP_AUTH__ 를 감지해 저장 기능/로그인 위임을 결정한다.
  //
  // 토큰이 없거나(로그아웃) 익명이어도 주입한다 — "토큰 없음" 도 상태다. 여기서
  // early-return 하면 웹이 자기 localStorage 의 옛 토큰으로 폴백해 앱은 로그아웃인데
  // 웹뷰만 로그인 상태로 보인다(재진입 시 split-brain).
  const authInjectScript = useMemo(() => {
    // baseUrl 도 함께 주입해서 web bundle 이 이 환경에 맞는 API 서버로 호출하게 한다.
    // (web.staircrusher.club 의 web bundle 은 default 로 prod API 를 가리키므로,
    //  sandbox 앱 안에서 띄우면 prod API 호출 → 신규 endpoint 미배포 → 404 등 사고.)
    // BASE_URL 이 비어있으면 web 측 default(prod) 가 그대로 사용된다.
    // JSON.stringify 로 따옴표/이스케이프 safety 확보.
    const baseUrl = Config.BASE_URL ?? '';
    return `(function(){
      try {
        window.__SCC_APP_AUTH__ = {
          token: ${JSON.stringify(accessToken ?? null)},
          baseUrl: ${JSON.stringify(baseUrl)},
          isAnonymous: ${isAnonymous ? 'true' : 'false'},
          bridgeVersion: ${AUTH_BRIDGE_VERSION},
        };
        window.dispatchEvent(new Event('scc-app-auth-ready'));
      } catch (_e) {}
    })(); true;`;
  }, [accessToken, isAnonymous]);

  // 로그인 상태가 바뀌면(로그인 완료/로그아웃/cold start 후 atom 늦은 로드) 즉시 재주입한다.
  // 웹뷰 안에서 앱 LoginScreen 으로 로그인한 뒤 웹이 갱신되는 경로가 바로 이것 —
  // 웹의 useAppInjectedAuth 가 scc-app-auth-ready 를 받아 reload 없이 리렌더한다.
  useEffect(() => {
    if (!isBridgeAllowedUrl(currentUrl)) return;
    webViewRef.current?.injectJavaScript(authInjectScript);
  }, [authInjectScript, currentUrl]);

  // 페이지 로드 완료 시 OG 메타 + 본문 이미지 추출 스크립트 주입
  const handleLoadEnd = useCallback(() => {
    // 1) web.staircrusher.club 라면 로그인 상태도 같이 주입 (저장 버튼/로그인 위임 결정)
    if (isBridgeAllowedUrl(currentUrl)) {
      webViewRef.current?.injectJavaScript(authInjectScript);
    }

    const extractOgScript = `
      (function() {
        try {
          var get = function(sel) {
            var el = document.querySelector(sel);
            return el ? el.getAttribute('content') : null;
          };
          // og:image 를 먼저 push 한 뒤 본문 <img> src 를 절대 URL 화하여 합친다.
          // data: URI / 빈 src 는 제외, 중복은 제거, 등장 순서는 유지.
          // BLOCKED: con.staircrusher.club 의 공통 og:image (모든 페이지에 동일하게 박혀있음)
          var BLOCKED = {
            'https://oopy.lazyrockets.com/api/rest/cdn/image/272f5141-2c9f-46a7-b8dd-274bc7291fbb.png': true,
          };
          var imageUrls = [];
          var seen = Object.create(null);
          var ogImage = get('meta[property="og:image"]');
          if (ogImage) {
            try {
              var ogAbs = new URL(ogImage, document.baseURI).toString();
              if (!BLOCKED[ogAbs]) {
                imageUrls.push(ogAbs);
                seen[ogAbs] = true;
              }
            } catch (_e) {
              if (!BLOCKED[ogImage]) {
                imageUrls.push(ogImage);
                seen[ogImage] = true;
              }
            }
          }
          // 아이콘/장식 이미지 필터링:
          // (1) src 에 .svg 가 박혀 있으면 제외 (query 안 .svg 도 포함 — notion oopy icon 등)
          // (2) 자연 크기가 100x100 미만이면 제외 (이미 로드된 img 만 판정 가능,
          //     naturalWidth 0 인 lazy/미로드 img 는 일단 통과시킨다)
          var MIN_IMAGE_SIDE = 100;
          var imgs = document.querySelectorAll('img[src]');
          for (var i = 0; i < imgs.length; i++) {
            var src = imgs[i].getAttribute('src');
            if (!src || src.indexOf('data:') === 0) continue;
            if (src.toLowerCase().indexOf('.svg') !== -1) continue;
            var nw = imgs[i].naturalWidth || 0;
            var nh = imgs[i].naturalHeight || 0;
            if (nw > 0 && nh > 0 && (nw < MIN_IMAGE_SIDE || nh < MIN_IMAGE_SIDE)) continue;
            var abs = src;
            try { abs = new URL(src, document.baseURI).toString(); } catch (_e) {}
            if (BLOCKED[abs]) continue;
            if (seen[abs]) continue;
            seen[abs] = true;
            imageUrls.push(abs);
          }
          var og = {
            title: get('meta[property="og:title"]') || document.title || null,
            description: get('meta[property="og:description"]') || get('meta[name="description"]'),
            imageUrls: imageUrls,
          };
          window.ReactNativeWebView.postMessage(JSON.stringify({type: 'SCC_OG_META', payload: og}));
        } catch (e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({type: 'SCC_OG_META', payload: null}));
        }
      })();
      true;
    `;
    webViewRef.current?.injectJavaScript(extractOgScript);
  }, [authInjectScript, currentUrl]);

  const handleBackPress = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  }, [canGoBack]);

  // 딥링크를 앱에 넘긴 뒤, 웹뷰가 airbridge 랜딩 페이지에 남아 있으면 원래 페이지로 되돌린다.
  // (안 되돌리면 띄운 화면을 닫고 웹뷰로 돌아왔을 때 빈 랜딩 페이지가 보인다)
  // 트래킹 링크는 이제 로드 전에 목적지를 확인하므로 보통 이 경로를 타지 않는다 —
  // 랜딩 페이지가 실제로 로드된 경우(직접 링크 등)만 정리한다.
  const handleAppDeepLink = useCallback(() => {
    if (isTrackingLinkUrl(currentUrl)) {
      webViewRef.current?.goBack();
    }
  }, [currentUrl]);

  const loadHandlerOptions = useMemo(
    () => ({
      userId: userInfo?.id,
      webViewRef,
      onAppDeepLink: handleAppDeepLink,
    }),
    [userInfo?.id, handleAppDeepLink],
  );

  const handleShouldStartLoad = useCallback(
    (request: ShouldStartLoadRequest) =>
      handleWebViewShouldStartLoad(request, loadHandlerOptions),
    [loadHandlerOptions],
  );

  const handleOpenWindow = useCallback(
    (event: WebViewOpenWindowEvent) =>
      handleWebViewOpenWindow(event.nativeEvent.targetUrl, loadHandlerOptions),
    [loadHandlerOptions],
  );

  useBackHandler(handleBackPress);

  return (
    <SafeAreaWrapper style={styles.safeArea}>
      {headerVariant === 'appbar' ? (
        <CloseAppBar
          title={title}
          showSeparator={true}
          onTapCloseButton={onTapCloseButton}
        />
      ) : (
        <View style={styles.navigationContainer}>
          <SccPressable
            elementName="webview_back_button"
            hitSlop={10}
            onPress={() => {
              if (canGoBack && webViewRef.current) {
                webViewRef.current.goBack();
              } else {
                onTapCloseButton();
              }
            }}>
            <BackIcon width={24} height={24} color={color.black} />
          </SccPressable>
          <Text style={styles.navigationTitle} numberOfLines={1}>
            {title}
          </Text>
          <SccPressable
            elementName="webview_close_button"
            hitSlop={14}
            onPress={onTapCloseButton}>
            <CloseIcon width={16} height={16} color={color.black} />
          </SccPressable>
        </View>
      )}
      <WebView
        ref={webViewRef}
        style={styles.webview}
        source={{uri: resolvedInitialUrl}}
        // 로컬 개발 빌드(FLAVOR=local) 에서만 HTTPS 페이지의 HTTP API 호출을 허용.
        // 예: web.staircrusher.club (HTTPS) 안에서 http://10.0.2.2:8080 으로 saveContent 호출.
        // sandbox/production 빌드는 차단 유지 (MITM 공격 방지).
        mixedContentMode={Config.FLAVOR === 'local' ? 'always' : 'never'}
        // 페이지 JS 가 실행되기 전에 미리 로그인 상태를 심어준다. 초기 source 가
        // 허용 origin 이면 BbucleRoadScreen 의 initializeAuth 가 window.__SCC_APP_AUTH__ 를
        // 즉시 감지할 수 있다(토큰이 없는 상태도 그대로 전달한다).
        injectedJavaScriptBeforeContentLoaded={
          isBridgeAllowedUrl(resolvedInitialUrl) ? authInjectScript : undefined
        }
        onMessage={handleMessage}
        onLoadEnd={handleLoadEnd}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        // target="_blank" 클릭도 같은 판정을 타게 한다 (없으면 안드로이드에서 화면에 붙지 않는
        // 새 WebView 로 새서 클릭이 사라진다 — 상세는 handleWebViewOpenWindow 주석)
        onOpenWindow={handleOpenWindow}
        onNavigationStateChange={navState => {
          setCanGoBack(navState.canGoBack);
          // 함수형 setter 로 atomic 하게 비교 + 갱신 — onNavigationStateChange 는 빠르게
          // 연속 호출될 수 있어 인라인 콜백의 currentUrl 클로저가 stale 일 수 있다.
          setCurrentUrl(prev => {
            if (prev !== navState.url) {
              setOgMeta(null);
              // URL 이 바뀌면 title 도 fixedTitle 로 되돌린다 (이전 페이지의 OG title 잔존 방지).
              setTitle(fixedTitle || undefined);
            }
            return navState.url;
          });
        }}
        // 스크롤 관성을 iOS 기본값으로 되돌린다 — **New Architecture 에서는 필수다.**
        // react-native-webview 의 Fabric codegen spec 은 `decelerationRate?: Double` 을
        // WithDefault 없이 선언해서, 생성된 Props.h 가 `double decelerationRate{0.0}` 이 된다
        // (ios/build/generated/.../RNCWebViewSpec/Props.h). prop 을 안 넘기면 0 이 그대로
        // scrollView.decelerationRate 에 박혀 손을 떼는 순간 스크롤이 멈춘다.
        // 구 아키텍처 경로(RNCWebViewManager.mm)는 nil 일 때 Normal 로 폴백하므로 이 함정이 없다.
        decelerationRate="normal"
        contentInset={shouldShowFloatingBar ? {bottom: 80} : undefined}
      />
      {shouldShowFloatingBar && (
        <SccContentFloatingBar
          url={currentUrl}
          bbucleRoadId={bbucleRoadId}
          title={title}
          ogDetail={
            ogMeta
              ? {
                  title: ogMeta.title,
                  imageUrls: ogMeta.imageUrls,
                  description: ogMeta.description,
                }
              : undefined
          }
        />
      )}
    </SafeAreaWrapper>
  );
};

export default WebViewScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: color.white,
  },
  webview: {
    flex: 1,
  },
  navigationContainer: {
    height: 50,
    backgroundColor: color.white,
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 12,
  },
  navigationTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: font.pretendardRegular,
    color: color.black,
  },
});
