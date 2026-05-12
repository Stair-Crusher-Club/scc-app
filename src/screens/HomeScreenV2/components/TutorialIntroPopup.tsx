import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {Image, Modal} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ScreenParams} from '@/navigation/Navigation.screens';

interface TutorialIntroPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * 윌리의 외출 NUX 튜토리얼 외출 유도 전면 팝업.
 * 첫 가입자 / 기가입자 홈 첫 진입 시 1회 노출.
 *
 * 디자인: Figma 1427:7141
 * - dim 오버레이
 * - 흰색 말풍선 박스: "윌리가 새로운 장소로 쉽게 이동을 시작할 수 있게 아이템을 함께 모아주세요!"
 * - 윌리 캐릭터 일러스트 (160x160 영역, 우측 하단)
 * - 하단 버튼: 닫기 / 시작하기 → TutorialMissionScreen으로 이동
 */
export default function TutorialIntroPopup({
  isVisible,
  onClose,
}: TutorialIntroPopupProps) {
  const navigation = useNavigation<NavigationProp<ScreenParams>>();
  const insets = useSafeAreaInsets();

  const handleStart = useCallback(() => {
    onClose();
    navigation.navigate('TutorialMission', {});
  }, [navigation, onClose]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Overlay>
        <ContentArea>
          <BubbleAndCharacter>
            <Bubble>
              <BubbleText>
                {`윌리가 새로운 장소로 쉽게 이동을 시작할 수 있게\n아이템을 함께 모아주세요!`}
              </BubbleText>
            </Bubble>
            <CharacterWrapper>
              <CharacterImage
                source={require('@/assets/img/tutorial/willy_wheelchair_intro.png')}
                resizeMode="contain"
              />
            </CharacterWrapper>
          </BubbleAndCharacter>
        </ContentArea>
        <ButtonRow style={{paddingBottom: Math.max(insets.bottom, 20)}}>
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
      </Overlay>
    </Modal>
  );
}

const Overlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
`;

const ContentArea = styled.View`
  flex: 1;
  justify-content: center;
  padding-horizontal: 24px;
`;

/* Bubble과 캐릭터를 함께 묶는 relative 컨테이너.
   캐릭터는 absolute로 Bubble 우측 하단에 겹치게 배치된다. */
const BubbleAndCharacter = styled.View`
  position: relative;
`;

const Bubble = styled.View`
  background-color: ${color.white};
  border-radius: 4px;
  padding: 18px 16px 20px;
  align-self: flex-start;
  max-width: 100%;
`;

const BubbleText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 18px;
  line-height: 27px;
  letter-spacing: -0.36px;
  color: ${color.black};
`;

const CharacterWrapper = styled.View`
  position: absolute;
  width: 160px;
  height: 160px;
  /* Bubble center align 기준으로 우측 하단에 겹쳐 배치
     (Figma: bubble bottom=516, character top=464 -> -52px overlap;
     character right ~ screen edge 16px) */
  right: -8px;
  bottom: -80px;
`;

const CharacterImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  gap: 8px;
  padding: 16px 20px 0;
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
