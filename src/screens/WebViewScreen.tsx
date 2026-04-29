import {useBackHandler} from '@react-native-community/hooks';
import {SccPressable} from '@/components/SccPressable';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

import BackIcon from '@/assets/icon/ic_v2_arrow_back.svg';
import CloseIcon from '@/assets/icon/close.svg';
import {CloseAppBar} from '@/components/AppBar';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {handleWebViewShouldStartLoad} from '@/utils/webViewUtils';
import SccContentFloatingBar from './WebViewScreen/components/SccContentFloatingBar';

export interface WebViewScreenParams {
  headerVariant?: 'appbar' | 'navigation';
  fixedTitle?: string;
  url: string;
}

const WebViewScreen = ({route, navigation}: ScreenProps<'Webview'>) => {
  const {fixedTitle, url, headerVariant = 'navigation'} = route.params;
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);

  const [title, setTitle] = useState<string | undefined>(
    fixedTitle || undefined,
  );

  // 뿌클로드(con.staircrusher.club) / 계뿌클 Notion 양쪽에서 콘텐츠 ID 추출
  const sccContentId = useMemo(() => {
    const match = currentUrl.match(
      /(?:con\.staircrusher\.club|staircrusherclub\.notion\.site)\/([^/?#]+)/,
    );
    return match ? match[1] : null;
  }, [currentUrl]);

  // SCC 콘텐츠 도메인이면 ID 추출 실패해도 floating bar는 노출 (id 없으면 도움이돼요만 숨김).
  // scheme(http/https)나 selector 차이에 robust하도록 host 매칭으로 판정.
  const shouldShowFloatingBar =
    /\bcon\.staircrusher\.club\b/.test(currentUrl) ||
    /\bstaircrusherclub\.notion\.site\b/.test(currentUrl);

  const onTapCloseButton = useCallback(() => {
    Alert.alert('정말 페이지를 나가시겠어요?', '', [
      {text: '취소', style: 'cancel'},
      {
        text: '나가기',
        onPress: () => navigation.goBack(),
        style: 'destructive',
      },
    ]);
  }, [navigation]);

  const handleMessage = useCallback((message: WebViewMessageEvent) => {
    setTitle(message.nativeEvent.data);
  }, []);

  const handleBackPress = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  }, [canGoBack]);

  const handleShouldStartLoad = useCallback(
    (request: ShouldStartLoadRequest) => handleWebViewShouldStartLoad(request),
    [],
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
            onPress={onTapCloseButton}>
            <CloseIcon width={16} height={16} color={color.black} />
          </SccPressable>
        </View>
      )}
      <WebView
        ref={webViewRef}
        style={styles.webview}
        source={{uri: url}}
        injectedJavaScript="window.postMessage(document.title)"
        onMessage={handleMessage}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onNavigationStateChange={navState => {
          setCanGoBack(navState.canGoBack);
          // navState.url이 빈 문자열로 들어오는 순간이 있어 currentUrl이 덮어써지지 않도록 가드
          if (navState.url) {
            setCurrentUrl(navState.url);
          }
        }}
        contentInset={shouldShowFloatingBar ? {bottom: 80} : undefined}
      />
      {shouldShowFloatingBar && (
        <SccContentFloatingBar
          url={currentUrl}
          sccContentId={sccContentId}
          title={title}
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
