import React from 'react';
import {KeyboardAvoidingView, Modal, TouchableOpacity} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import {color} from '@/constant/color';

type Props = React.PropsWithChildren<{
  isVisible: boolean;
  onPressBackground?: () => void;
}>;
export default function BottomSheet({
  isVisible,
  onPressBackground,
  children,
}: Props) {
  // TODO: Modal 안에서 SafeAreaView 가 동작하지 않아서 넣은 값.
  const safeAreaInsets = useSafeAreaInsets();
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
            <Container style={{paddingBottom: safeAreaInsets.bottom}}>
              {children}
            </Container>
          </KeyboardAvoidingView>
        </DimmedBackground>
      </GestureHandlerRootView>
    </Modal>
  );
}

const DimmedBackground = styled(SafeAreaView)({
  flex: 1,
  flexDirection: 'column-reverse',
  backgroundColor: color.blacka50,
});

const Container = styled.View({
  flexDirection: 'column',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  backgroundColor: color.white,
  overflow: 'visible',
});
