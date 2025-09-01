import React, {useEffect, useState} from 'react';
import {Keyboard, KeyboardAvoidingView, Platform, ViewProps} from 'react-native';
import {Edge, useSafeAreaInsets} from 'react-native-safe-area-context';

import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {HEIGHT_OF_NAVIGATION_HEADER} from '@/constant/constant';
import {color} from '@/constant/color';

export interface ScreenLayoutProps extends ViewProps {
  children?: React.ReactNode;
  isHeaderVisible: boolean; // 기본 네비게이션 Header 여부
  isKeyboardAvoidingView?: boolean; // KeyboardAvoidingView 여부
  safeAreaEdges?: ReadonlyArray<Edge>;
}

export const ScreenLayout = ({
  children,
  isHeaderVisible,
  isKeyboardAvoidingView = true,
  safeAreaEdges = [],
  style = {},
}: ScreenLayoutProps) => {
  const insets = useSafeAreaInsets();
  const [isKeyboardShownInAndroid, setIsKeyboardShownInAndroid] = useState<boolean>(false);
  let verticalOffset = 0;
  if (isHeaderVisible) {
    verticalOffset = HEIGHT_OF_NAVIGATION_HEADER + insets.top;
  }

  // https://github.com/facebook/react-native/pull/51132
  // 현재 RN 0.80 버전의 KeyboardAvoidingView의 경우, 안드로이드에서 키보드가 show / hide 될 때
  // bottom padding / height가 올바르게 계산되지 않는 문제가 있다.
  // 이를 해결해주기 위해, android에서는 키보드가 가려질 때 강제로 enabled를 false로 설정하게끔 한다.
  useEffect(() => {
    if (Platform.OS === 'android') {
      const subscriptions = [
        Keyboard.addListener('keyboardDidHide', () => setIsKeyboardShownInAndroid(false)),
        Keyboard.addListener('keyboardDidShow', () => setIsKeyboardShownInAndroid(true)),
      ]
      return () => {
        subscriptions.forEach(it => it.remove())
      }
    }
  }, []);

  return (
    <SafeAreaWrapper
      edges={safeAreaEdges}
      style={[{flex: 1, backgroundColor: color.white}, style]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled={(isKeyboardAvoidingView && (Platform.OS !=='android' || isKeyboardShownInAndroid)) ?? true}
        keyboardVerticalOffset={verticalOffset}
        style={[{flex: 1}, style]}>
        {children}
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};
