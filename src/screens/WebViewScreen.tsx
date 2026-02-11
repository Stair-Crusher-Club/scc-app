import {useBackHandler} from '@react-native-community/hooks';
import {SccPressable} from '@/components/SccPressable';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Linking, PixelRatio, StyleSheet, Text, View} from 'react-native';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import {CloseAppBar} from '@/components/AppBar';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ScreenProps} from '@/navigation/Navigation.screens';
import BbucleRoadFloatingBar from './WebViewScreen/components/BbucleRoadFloatingBar';

export interface WebViewScreenParams {
  headerVariant?: 'appbar' | 'navigation';
  fixedTitle?: string;
  url: string;
}

const WebViewScreen = ({route, navigation}: ScreenProps<'Webview'>) => {
  const {fixedTitle, url, headerVariant = 'appbar'} = route.params;
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);

  const [title, setTitle] = useState<string | undefined>(
    fixedTitle || undefined,
  );

  // URL에서 뿌클로드 ID 추출 (모든 route)
  const bbucleRoadId = useMemo(() => {
    const match = currentUrl.match(/con\.staircrusher\.club\/([^/?#]+)/);
    return match ? match[1] : null;
  }, [currentUrl]);

  const shouldShowFloatingBar = bbucleRoadId !== null;

  const onTapCloseButton = useCallback(() => {
    navigation.goBack();
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
    (request: ShouldStartLoadRequest) => {
      const reqUrl = request.url;
      if (reqUrl.startsWith('http://') || reqUrl.startsWith('https://')) {
        return true;
      }
      // 커스텀 스킴 딥링크 (stair-crusher://, intent:// 등)는 네이티브로 처리
      Linking.openURL(reqUrl).catch(() => {});
      return false;
    },
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
            onPress={() => navigation.goBack()}>
            <LeftArrowIcon width={24} height={24} color={color.black} />
          </SccPressable>
          <Text style={styles.navigationTitle}>{title}</Text>
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
          setCurrentUrl(navState.url);
        }}
        contentInset={shouldShowFloatingBar ? {bottom: 80} : undefined}
      />
      {shouldShowFloatingBar && bbucleRoadId && (
        <BbucleRoadFloatingBar bbucleRoadId={bbucleRoadId} title={title} />
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
    gap: 20,
  },
  navigationTitle: {
    fontSize: 20 / PixelRatio.getFontScale(),
    fontFamily: font.pretendardMedium,
    color: color.black,
  },
});
