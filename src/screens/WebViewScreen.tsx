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

  // 뿌클로드 ID 추출 (con.staircrusher.club 경로에서만)
  const sccContentId = useMemo(() => {
    const match = currentUrl.match(/con\.staircrusher\.club\/([^/?#]+)/);
    return match ? match[1] : null;
  }, [currentUrl]);

  const shouldShowFloatingBar =
    sccContentId !== null ||
    currentUrl.startsWith('https://staircrusherclub.notion.site');

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
          setCurrentUrl(navState.url);
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
