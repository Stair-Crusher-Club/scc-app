import {useBackHandler} from '@react-native-community/hooks';
import React, {useCallback, useRef, useState} from 'react';
import {PixelRatio, Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import WebView, {WebViewMessageEvent} from 'react-native-webview';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import {CloseAppBar} from '@/components/AppBar';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ScreenProps} from '@/navigation/Navigation.screens';

export interface WebViewScreenParams {
  headerVariant?: 'appbar' | 'navigation';
  fixedTitle?: string;
  url: string;
}

const WebViewScreen = ({route, navigation}: ScreenProps<'Webview'>) => {
  const {fixedTitle, url, headerVariant = 'appbar'} = route.params;
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  const [title, setTitle] = useState<string | undefined>(
    fixedTitle || undefined,
  );

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

  useBackHandler(handleBackPress);

  return (
    <SafeAreaView style={styles.safeArea}>
      {headerVariant === 'appbar' ? (
        <CloseAppBar
          title={title}
          showSeparator={true}
          onTapCloseButton={onTapCloseButton}
        />
      ) : (
        <View style={styles.navigationContainer}>
          <Pressable onPress={() => navigation.goBack()}>
            <LeftArrowIcon width={24} height={24} color={color.black} />
          </Pressable>
          <Text style={styles.navigationTitle}>{title}</Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        style={styles.webview}
        source={{uri: url}}
        injectedJavaScript="window.postMessage(document.title)"
        onMessage={handleMessage}
        onNavigationStateChange={navState => {
          setCanGoBack(navState.canGoBack);
        }}
      />
    </SafeAreaView>
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
