import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {Dimensions, Image, Modal} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ScreenParams} from '@/navigation/Navigation.screens';

interface TutorialIntroPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;
// Figma frame 390×844 기준 popup contents bounding box + 위치.
const DESIGN_FRAME_WIDTH = 390;
const DESIGN_FRAME_HEIGHT = 844;
const POPUP_DESIGN_WIDTH = 350;
const POPUP_DESIGN_HEIGHT = 200;
const POPUP_DESIGN_TOP = 370;
const POPUP_WIDTH = SCREEN_WIDTH * (POPUP_DESIGN_WIDTH / DESIGN_FRAME_WIDTH);
const POPUP_HEIGHT = POPUP_WIDTH * (POPUP_DESIGN_HEIGHT / POPUP_DESIGN_WIDTH);
const POPUP_TOP = SCREEN_HEIGHT * (POPUP_DESIGN_TOP / DESIGN_FRAME_HEIGHT);

/**
 * 윌리의 외출 NUX 튜토리얼 외출 유도 전면 팝업.
 * 첫 가입자 / 기가입자 홈 첫 진입 시 1회 노출.
 *
 * 디자인: Figma node 1648:38448 (NUX_intro)
 * popup contents(말풍선+텍스트+윌리)는 통이미지(intro_popup_content.png)로 박는다.
 * 텍스트가 Kyobo Handwriting 2019 손글씨체라 폰트 번들 없이 1:1 재현 불가하기 때문.
 */
export default function TutorialIntroPopup({
  isVisible,
  onClose,
}: TutorialIntroPopupProps) {
  const navigation = useNavigation<NavigationProp<ScreenParams>>();

  const handleStart = useCallback(() => {
    onClose();
    navigation.navigate('TutorialMission', {});
  }, [navigation, onClose]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}>
      <Overlay>
        {/* PopupImage 는 디자인 좌표 (figma frame 비율) 기준 absolute. layout flow 밖이라
            SafeAreaView 영향 받지 않는다. */}
        <PopupImage
          source={require('@/assets/img/tutorial/intro_popup_content.png')}
          style={{
            width: POPUP_WIDTH,
            height: POPUP_HEIGHT,
            position: 'absolute',
            top: POPUP_TOP,
            alignSelf: 'center',
          }}
          resizeMode="contain"
        />
        {/* dim 은 Overlay 가 fullscreen 으로 담당하고, 버튼은 SafeAreaView 안에서
            자연스럽게 home indicator/nav bar 위로 올라온다. */}
        <SafeBottom edges={['bottom']}>
          <ButtonRow>
            <CloseButton
              elementName="tutorial_intro_popup_close"
              onPress={onClose}>
              <CloseButtonText>닫기</CloseButtonText>
            </CloseButton>
            <StartButton
              elementName="tutorial_intro_popup_start"
              onPress={handleStart}>
              <StartButtonText>시작하기</StartButtonText>
            </StartButton>
          </ButtonRow>
        </SafeBottom>
      </Overlay>
    </Modal>
  );
}

const Overlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: flex-end;
`;

const SafeBottom = styled(SafeAreaView)``;

const PopupImage = styled(Image)``;

const ButtonRow = styled.View`
  flex-direction: row;
  gap: 8px;
  padding: 16px 20px 15px;
`;

const CloseButton = styled(SccPressable)`
  width: 114px;
  height: 56px;
  align-items: center;
  justify-content: center;
  background-color: ${color.gray20v2};
  border-radius: 8px;
`;

const CloseButtonText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.gray90v2};
`;

const StartButton = styled(SccPressable)`
  flex: 1;
  height: 56px;
  align-items: center;
  justify-content: center;
  background-color: ${color.brand40};
  border-radius: 8px;
`;

const StartButtonText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.white};
`;
