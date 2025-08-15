import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
  View,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';

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
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        onPressBackground?.();
      }}>
      <GestureHandlerRootView style={{flex: 1}}>
        <DimmedBackground>
          <TouchableOpacity
            activeOpacity={1}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
            }}
            onPress={onPressBackground}
          />
          <KeyboardAvoidingView behavior={'padding'}>
            <Container edges={['bottom']}>{children}</Container>
          </KeyboardAvoidingView>
        </DimmedBackground>
      </GestureHandlerRootView>
    </Modal>
  );
}

const DimmedBackground = styled(View)({
  flex: 1,
  flexDirection: 'column-reverse',
  backgroundColor: color.blacka50,
});

const Container = styled(SafeAreaWrapper)({
  flexDirection: 'column',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  backgroundColor: color.white,
  overflow: 'visible',
});
