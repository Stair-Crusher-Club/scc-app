import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {FadeOut} from 'react-native-reanimated';
import SplashScreen from 'react-native-splash-screen';

import * as SplashStyle from '@/OTAUpdateDialog.style';

const SPLASH_FADE_OUT_DURATION_MS = 300;

// Native splash을 숨기되, SplashOverlay는 유지.
// HotUpdater가 오래 걸려도 OS가 앱을 kill하지 않도록.
const NATIVE_SPLASH_HIDE_TIMEOUT_MS = 1500;

let _dismiss: (() => void) | null = null;

export function dismissSplashOverlay() {
  _dismiss?.();
}

export default function SplashOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    _dismiss = () => setVisible(false);

    // HotUpdater/migration이 오래 걸릴 경우를 대비해
    // native splash만 먼저 숨긴다. SplashOverlay가 동일한 UI를 보여주므로
    // 사용자에게는 차이가 없다.
    const timer = setTimeout(() => {
      SplashScreen.hide();
    }, NATIVE_SPLASH_HIDE_TIMEOUT_MS);

    return () => {
      _dismiss = null;
      clearTimeout(timer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={StyleSheet.absoluteFill}
      exiting={FadeOut.duration(SPLASH_FADE_OUT_DURATION_MS)}>
      <SplashStyle.Container>
        <SplashStyle.CoverImage
          source={require('../assets/img/app_logo.png')}
        />
      </SplashStyle.Container>
    </Animated.View>
  );
}
