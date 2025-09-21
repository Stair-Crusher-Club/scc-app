import React, {useEffect, useState} from 'react';

import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  View,
} from 'react-native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {LogView} from '@/logging/LogView';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

type Props = React.PropsWithChildren<{
  isVisible: boolean;
  onPressBackground?: () => void;
}>;
export default function BottomSheet({
  isVisible,
  onPressBackground,
  children,
}: Props) {
  // https://github.com/facebook/react-native/issues/47140
  // android 에서 translucent status bar 를 키면, keyboard 가 한 번 올라갔다 내려가면 translucent 영역만큼 뷰가 위로 올라간 채로 남는
  // 오류가 존재한다. 이를 해결하기 위해 인셋만큼 offset 을 주되, 키보드가 올라갔을 때는 정상적으로 보일 수 있도록 isKeyboardVisible 을 사용하여 패딩을 추가하는 식으로 처리한다.
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const keyboardVerticalOffset =
    Platform.OS === 'android' ? -insets.bottom - insets.top : 0;
  const temporalContainerPaddingBottom =
    isKeyboardVisible && Platform.OS === 'android'
      ? insets.bottom + insets.top
      : 0;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      },
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const modalContent = (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={() => {
        onPressBackground?.();
      }}>
      <SafeAreaProvider>
        <KeyboardAvoidingView
          behavior={'padding'}
          style={{flexGrow: 1}}
          keyboardVerticalOffset={keyboardVerticalOffset}>
          <DimmedBackground>
            <SccTouchableOpacity
              elementName="bottom_sheet_background"
              activeOpacity={1}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
              }}
              onPress={() => {
                Keyboard.dismiss();
                onPressBackground?.();
              }}
            />
            <Container
              style={{
                paddingBottom: temporalContainerPaddingBottom,
              }}>
              <SafeAreaView edges={['bottom']}>{children}</SafeAreaView>
            </Container>
          </DimmedBackground>
        </KeyboardAvoidingView>
      </SafeAreaProvider>
    </Modal>
  );

  // LogView는 Modal이 실제로 보일 때만 렌더링
  if (isVisible) {
    return <LogView elementName="bottom_sheet">{modalContent}</LogView>;
  }

  return modalContent;
}

const DimmedBackground = styled(View)({
  flex: 1,
  flexDirection: 'column-reverse',
  backgroundColor: color.blacka50,
});

const Container = styled(View)({
  flexDirection: 'column',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  backgroundColor: color.white,
  overflow: 'visible',
});
