import {BlurView} from '@sbaiahmed1/react-native-blur';
import React from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface HiddenMissionCollectedPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

// Figma 1648:40812 popup img frame: 390x200 (frame 폭). 화면 폭 비례.
const SCREEN_WIDTH = Dimensions.get('window').width;
const POPUP_IMG_HEIGHT = SCREEN_WIDTH * (200 / 390);

export default function HiddenMissionCollectedPopup({
  isVisible,
  onClose,
}: HiddenMissionCollectedPopupProps) {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}>
      {/* iOS Modal 은 별도 UIWindow 라 App.tsx 의 SafeAreaProvider context 가 끊긴다.
          react-native-safe-area-context 공식 권장 패턴대로 Modal 안에 SafeAreaProvider 를
          새로 wrap 해서 내부 SafeAreaView 가 올바른 insets 를 받게 한다. */}
      <SafeAreaProvider>
        {/* BlurView 는 blur 효과 전용. Android 에서 @sbaiahmed1/react-native-blur 의
            overlayColor 가 navigationBarTranslucent 로 확장된 Modal viewport 의 nav bar
            영역까지 안 그려지는 케이스가 있어서 dim 은 별도 View 로 명시. */}
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={Platform.OS === 'ios' ? 35 : 6}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            {backgroundColor: 'rgba(0,0,0,0.6)'},
          ]}
          pointerEvents="none"
        />
        {/* 콘텐츠는 SafeAreaView 안에서 center 정렬 — confirm 버튼이 home indicator /
            nav bar 와 겹치지 않게. */}
        <DimRoot edges={['top', 'bottom']}>
          <ContentsWrapper>
            <TitleImage
              source={require('@/assets/img/tutorial/hidden_collected_title.png')}
              resizeMode="contain"
            />
            <Image
              source={require('@/assets/img/tutorial/mission_complete_img_hidden.png')}
              style={{width: SCREEN_WIDTH, height: POPUP_IMG_HEIGHT}}
              resizeMode="contain"
            />
            <DescriptionWrapper>
              <Description>{'이제,\n새로운 곳으로 떠나봐요!'}</Description>
              <ConfirmButton
                elementName="tutorial_hidden_mission_collected_confirm"
                onPress={onClose}>
                <ConfirmButtonText>확인</ConfirmButtonText>
              </ConfirmButton>
            </DescriptionWrapper>
          </ContentsWrapper>
        </DimRoot>
      </SafeAreaProvider>
    </Modal>
  );
}

const DimRoot = styled(SafeAreaView)`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const ContentsWrapper = styled.View`
  align-items: center;
  width: 100%;
  gap: 20px;
`;

const TitleImage = styled.Image`
  width: 322px;
  height: 56px;
`;

const DescriptionWrapper = styled.View`
  align-items: center;
  gap: 20px;
`;

const Description = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.4px;
  color: ${color.white};
  text-align: center;
  text-shadow-color: rgba(0, 0, 0, 0.25);
  text-shadow-radius: 4px;
  text-shadow-offset: 0px 0px;
`;

const ConfirmButton = styled(SccPressable)`
  width: 140px;
  height: 56px;
  background-color: ${color.brand40};
  border-radius: 8px;
  align-items: center;
  justify-content: center;
`;

const ConfirmButtonText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.white};
`;
