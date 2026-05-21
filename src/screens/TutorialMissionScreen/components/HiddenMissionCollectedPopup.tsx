import {BlurView} from '@sbaiahmed1/react-native-blur';
import React from 'react';
import {Dimensions, Image, Modal, Platform, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
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
      {/* iOS 는 blurAmount 0-100 범위라 10 이 figma 의도보다 약함. iOS 만 25 로 보정 +
          fallback 색도 어둡게 해서 흰 텍스트 가독성 확보. Android 는 figma 와 일치하므로 유지. */}
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="dark"
        blurAmount={Platform.OS === 'ios' ? 35 : 6}
        overlayColor="rgba(0,0,0,0.6)"
      />
      {/* dim 은 absoluteFill 로 전체 덮고, 콘텐츠는 SafeAreaView 안에서 center
          정렬 — 작은 화면에서도 confirm 버튼이 home indicator 와 겹치지 않게. */}
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
