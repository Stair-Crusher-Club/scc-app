import React, {useCallback, useState} from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import WebView, {WebViewMessageEvent} from 'react-native-webview';

import {CloseAppBar} from '@/components/AppBar';
import {color} from '@/constant/color';
import {ScreenProps} from '@/navigation/Navigation.screens';

export interface WebViewScreenParams {
  fixedTitle?: string;
  url: string;
}

const WebViewScreen = ({route, navigation}: ScreenProps<'Webview'>) => {
  const {fixedTitle, url} = route.params;

  const [title, setTitle] = useState<string | undefined>(
    fixedTitle || undefined,
  );

  const onTapCloseButton = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleMessage = useCallback((message: WebViewMessageEvent) => {
    setTitle(message.nativeEvent.data);
  }, []);
  return (
    <SafeAreaView style={styles.safeArea}>
      <CloseAppBar
        title={title}
        showSeparator={true}
        onTapCloseButton={onTapCloseButton}
      />
      <WebView
        style={styles.webview}
        source={{uri: url}}
        injectedJavaScript="window.postMessage(document.title)"
        onMessage={handleMessage}
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
});
