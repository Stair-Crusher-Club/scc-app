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

  // 웹페이지 OG 메타 (저장 시 서버로 전달)
  const [ogMeta, setOgMeta] = useState<{
    title: string | null;
    thumbnailUrl: string | null;
    description: string | null;
  } | null>(null);

  // SCC 콘텐츠 도메인이면 floating bar 노출
  const shouldShowFloatingBar =
    currentUrl.startsWith('https://con.staircrusher.club') ||
    currentUrl.startsWith('https://staircrusherclub.notion.site');

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
    // OG 메타 메시지인지 확인 (JSON)
    try {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === 'object' &&
        parsed.type === 'SCC_OG_META'
      ) {
        const payload = parsed.payload as {
          title: string | null;
          thumbnailUrl: string | null;
          description: string | null;
        } | null;
        if (payload) {
          setOgMeta({
            title: payload.title ?? null,
            thumbnailUrl: payload.thumbnailUrl ?? null,
            description: payload.description ?? null,
          });
          if (payload.title) {
            setTitle(payload.title);
          }
        }
        return;
      }
    } catch (_e) {
      // JSON 아니면 기존 document.title 메시지로 처리
    }
    setTitle(raw);
  }, []);

  // 페이지 로드 완료 시 OG 메타 추출 스크립트 주입
  const handleLoadEnd = useCallback(() => {
    const extractOgScript = `
      (function() {
        try {
          var get = function(sel) {
            var el = document.querySelector(sel);
            return el ? el.getAttribute('content') : null;
          };
          var og = {
            title: get('meta[property="og:title"]') || document.title || null,
            thumbnailUrl: get('meta[property="og:image"]'),
            description: get('meta[property="og:description"]') || get('meta[name="description"]'),
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
        injectedJavaScript="window.postMessage(document.title)"
        onMessage={handleMessage}
        onLoadEnd={handleLoadEnd}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onNavigationStateChange={navState => {
          setCanGoBack(navState.canGoBack);
          if (navState.url !== currentUrl) {
            setOgMeta(null);
          }
          setCurrentUrl(navState.url);
        }}
        contentInset={shouldShowFloatingBar ? {bottom: 80} : undefined}
      />
      {shouldShowFloatingBar && (
        <SccContentFloatingBar
          url={currentUrl}
          title={title}
          ogTitle={ogMeta?.title ?? null}
          ogThumbnailUrl={ogMeta?.thumbnailUrl ?? null}
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
