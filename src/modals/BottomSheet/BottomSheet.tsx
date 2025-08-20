import React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {SafeAreaProvider} from 'react-native-safe-area-context';

type Props = React.PropsWithChildren<{
  isVisible: boolean;
  onPressBackground?: () => void;
}>;
export default function BottomSheet({
  isVisible,
  onPressBackground,
  children,
}: Props) {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={() => {
        onPressBackground?.();
      }}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{flex: 1}}>
          <DimmedBackground>
            <TouchableOpacity
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
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <Container>
                <SafeAreaWrapper edges={['bottom']}>{children}</SafeAreaWrapper>
              </Container>
            </KeyboardAvoidingView>
          </DimmedBackground>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Modal>
  );
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
