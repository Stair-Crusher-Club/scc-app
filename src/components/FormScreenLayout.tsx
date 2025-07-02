import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ViewProps,
} from 'react-native';
import {
  Edge,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {HEIGHT_OF_NAVIGATION_HEADER} from '@/constant/constant';

export interface FormScreenLayoutProps extends ViewProps {
  children?: React.ReactNode;
  isHeaderVisible?: boolean; // 기본 네비게이션 Header 여부
  isKeyboardAvoidingView?: boolean; // KeyboardAvoidingView 여부
  safeAreaEdges?: ReadonlyArray<Edge>;
}

export const FormScreenLayout = ({
  children,
  isHeaderVisible = true,
  isKeyboardAvoidingView = true,
  safeAreaEdges = [],
  style = {},
}: FormScreenLayoutProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  let verticalOffset = 0;
  if (isHeaderVisible) {
    verticalOffset =
      HEIGHT_OF_NAVIGATION_HEADER +
      (Platform.OS === 'android'
        ? StatusBar.currentHeight || 0
        : safeAreaInsets.top);
    if (safeAreaEdges.indexOf('bottom') >= 0) {
      verticalOffset -= safeAreaInsets.bottom;
    }
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'position' : 'height'}
      enabled={isKeyboardAvoidingView ?? true}
      keyboardVerticalOffset={verticalOffset}
      style={style}>
      <SafeAreaView edges={safeAreaEdges}>{children}</SafeAreaView>
    </KeyboardAvoidingView>
  );
};
