import {useBackHandler} from '@react-native-community/hooks';
import {SccPressable} from '@/components/SccPressable';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

import BackIcon from '@/assets/icon/ic_v2_arrow_back.svg';
import CloseIcon from '@/assets/icon/close.svg';
import {useMe} from '@/atoms/Auth';
import {CloseAppBar} from '@/components/AppBar';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {resolveTemplatedExternalUrl} from '@/utils/externalUrlTemplating';
import {handleWebViewShouldStartLoad} from '@/utils/webViewUtils';
import SccContentFloatingBar from './WebViewScreen/components/SccContentFloatingBar';

export interface WebViewScreenParams {
  headerVariant?: 'appbar' | 'navigation';
  fixedTitle?: string;
  url: string;
  // close 버튼 누를 때 "정말 나가시겠어요?" confirm Alert 표시 여부. 기본 true.
  confirmOnClose?: boolean;
}

const WebViewScreen = ({route, navigation}: ScreenProps<'Webview'>) => {
  const {
    fixedTitle,
    url,
    headerVariant = 'navigation',
    confirmOnClose = true,
  } = route.params;
  const webViewRef = useRef<WebView>(null);
  const {userInfo} = useMe();
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

  // SCC 콘텐츠 도메인이면 floating bar 노출
  const shouldShowFloatingBar =
    currentUrl.startsWith('https://con.staircrusher.club') ||
    currentUrl.startsWith('https://staircrusherclub.notion.site');

  // BBUCLE_ROAD 좋아요용 path id (기존 흐름과 동일).
  // 좋아요는 SccContent 저장 여부와 무관하게 path id 기준으로 누적/조회된다.
  const bbucleRoadId = useMemo(() => {
    const match = currentUrl.match(
      /(?:con\.staircrusher\.club|staircrusherclub\.notion\.site)\/([^/?#]+)/,
    );
    return match ? match[1] : null;
  }, [currentUrl]);

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

  const handleMessage = useCallback((message: WebViewMessageEvent) => {
    const raw = message.nativeEvent.data;
    try {
      const parsed = JSON.parse(raw);
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
          if (payload.title) {
            setTitle(payload.title);
          }
        }
      }
    } catch (_e) {
      // OG 스크립트 외 메시지는 무시 (의도되지 않은 raw postMessage).
    }
  }, []);

  // 페이지 로드 완료 시 OG 메타 + 본문 이미지 추출 스크립트 주입
  const handleLoadEnd = useCallback(() => {
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
  }, []);

  const handleBackPress = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  }, [canGoBack]);

  const handleShouldStartLoad = useCallback(
    (request: ShouldStartLoadRequest) =>
      handleWebViewShouldStartLoad(request, {
        userId: userInfo?.id,
        webViewRef,
      }),
    [userInfo?.id],
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
        onMessage={handleMessage}
        onLoadEnd={handleLoadEnd}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onNavigationStateChange={navState => {
          setCanGoBack(navState.canGoBack);
          // 함수형 setter 로 atomic 하게 비교 + 갱신 — onNavigationStateChange 는 빠르게
          // 연속 호출될 수 있어 인라인 콜백의 currentUrl 클로저가 stale 일 수 있다.
          setCurrentUrl(prev => {
            if (prev !== navState.url) {
              setOgMeta(null);
            }
            return navState.url;
          });
        }}
        contentInset={shouldShowFloatingBar ? {bottom: 80} : undefined}
      />
      {shouldShowFloatingBar && (
        <SccContentFloatingBar
          url={currentUrl}
          bbucleRoadId={bbucleRoadId}
          title={title}
          ogTitle={ogMeta?.title ?? null}
          ogImageUrls={ogMeta?.imageUrls ?? []}
          ogDescription={ogMeta?.description ?? null}
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
