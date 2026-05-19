import {useBackHandler} from '@react-native-community/hooks';
import {BlurView} from '@sbaiahmed1/react-native-blur';
import React from 'react';
import {Dimensions, Image, Modal, StyleSheet, View} from 'react-native';
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
  // Modal 이 열려있을 때 Android hardware back 키가 호출 사이트의 navigation back 으로
  // propagate 되지 않도록 차단한다 (QA round3). MissionCompletedOverlay 와 동일 패턴.
  useBackHandler(() => {
    if (isVisible) {
      onClose();
      return true;
    }
    return false;
  });

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      {/*
       * Figma 1648:40812 backdrop = "검정 ~60% 반투명 dim + blur" 조합. BlurView 의 Android
       * 구현이 dark 색을 적용하지 못해 흰색 반투명으로 보이는 케이스가 있어 (QA round3),
       * blur 위에 명시적으로 검정 반투명 View 를 stack 하여 dark dim 을 보장한다.
       */}
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="dark"
        blurAmount={10}
        reducedTransparencyFallbackColor={color.blacka70}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {backgroundColor: 'rgba(0, 0, 0, 0.6)'},
        ]}
        pointerEvents="none"
      />
      <DimRoot>
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

const DimRoot = styled.View`
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
