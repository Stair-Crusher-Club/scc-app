import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {Dimensions, Image, Modal} from 'react-native';
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

// Figma NUX_intro 프레임(2552:29163, 390×844) 기준 popup 콘텐츠 좌표.
// 말풍선 텍스트가 Kyobo Handwriting 2019 손글씨체(번들 X)라 말풍선과 윌리를
// 각각 이미지(2552:29377 / 2552:29382)로 박아 겹쳐 놓는다.
const DESIGN_FRAME_WIDTH = 390;
const DESIGN_FRAME_HEIGHT = 844;
const SCALE = SCREEN_WIDTH / DESIGN_FRAME_WIDTH;
// 콘텐츠 블록(=말풍선) 좌상단. 가로는 프레임 폭, 세로는 프레임 높이 비율로 앵커.
const CONTENT_LEFT = 24 * SCALE;
const CONTENT_TOP = SCREEN_HEIGHT * (329 / DESIGN_FRAME_HEIGHT);
// 말풍선 329×112 @(24,329), 윌리 160×160 @(214,389.5) → 블록 기준 상대좌표.
const BUBBLE_WIDTH = 329 * SCALE;
const BUBBLE_HEIGHT = 112 * SCALE;
const WILLY_SIZE = 160 * SCALE;
const WILLY_LEFT = (214 - 24) * SCALE;
const WILLY_TOP = (389.5 - 329) * SCALE;
// 시작하기 버튼: Figma Button-Docked(2552:29376) 안 버튼 350×56 @(20,566) — 화면
// 하단이 아니라 윌리 바로 아래(콘텐츠 블록 기준 566-329=237 아래)에 붙는다.
const BUTTON_LEFT = 20 * SCALE;
const BUTTON_WIDTH = 350 * SCALE;
const BUTTON_HEIGHT = 56 * SCALE;
const BUTTON_TOP = CONTENT_TOP + (566 - 329) * SCALE;

/**
 * 윌리의 외출 NUX 튜토리얼 진입 유도 전면 팝업.
 * 첫 가입자 / 기가입자 홈 첫 진입 시 1회 노출.
 *
 * 디자인: Figma node 2552:29163 (NUX_intro, 튜토리얼 진입 늘리기 기획).
 * 닫기/건너뛰기 없이 시작하기(=튜토리얼 진입)만 제공한다.
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
    // ponytail: 닫기/건너뛰기 없이 무조건 튜토리얼로 랜딩시키는 게 기획 의도라
    // 하드웨어 백(onRequestClose)도 닫기가 아니라 튜토리얼 진입으로 연결한다.
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleStart}>
      <Overlay>
        <PopupContent style={{left: CONTENT_LEFT, top: CONTENT_TOP}}>
          <BubbleImage
            source={require('@/assets/img/tutorial/intro_popup_bubble.png')}
            style={{width: BUBBLE_WIDTH, height: BUBBLE_HEIGHT}}
            resizeMode="contain"
          />
          {/* 윌리는 말풍선 위(앞)에 겹쳐 그린다. */}
          <WillyImage
            source={require('@/assets/img/tutorial/intro_popup_willy.png')}
            style={{
              left: WILLY_LEFT,
              top: WILLY_TOP,
              width: WILLY_SIZE,
              height: WILLY_SIZE,
            }}
            resizeMode="contain"
          />
        </PopupContent>
        <StartButton
          elementName="tutorial_intro_popup_start"
          onPress={handleStart}
          style={{
            left: BUTTON_LEFT,
            top: BUTTON_TOP,
            width: BUTTON_WIDTH,
            height: BUTTON_HEIGHT,
          }}>
          <StartButtonText>계뿌클 앱 시작하기</StartButtonText>
        </StartButton>
      </Overlay>
    </Modal>
  );
}

const Overlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.7);
`;

const PopupContent = styled.View`
  position: absolute;
`;

const BubbleImage = styled(Image)``;

const WillyImage = styled(Image)`
  position: absolute;
`;

const StartButton = styled(SccPressable)`
  position: absolute;
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
