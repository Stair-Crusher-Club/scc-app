import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {Dimensions, Image, Modal, View} from 'react-native';
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

const SCREEN_WIDTH = Dimensions.get('window').width;
const POPUP_WIDTH = Math.min(SCREEN_WIDTH - 40, 360);

/**
 * 윌리의 외출 NUX 튜토리얼 외출 유도 전면 팝업.
 * 첫 가입자 / 기가입자 홈 첫 진입 시 1회 노출.
 *
 * 디자인: Figma 1427:7141
 * - 흐릿한 홈 배경 위에 윌리 캐릭터 일러스트
 * - "윌리가 새로운 장소로 쉽게 이동을 시작할 수 있게 아이템을 함께 모아주세요!" 문구
 * - 닫기 / "시작하기" 버튼 → TutorialMissionScreen으로 이동
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
        <PopupContainer style={{width: POPUP_WIDTH}}>
          <PopupTopArea>
            <PopupCharacterImage
              source={require('@/assets/img/tutorial/item_smartphone.png')}
              resizeMode="contain"
            />
            <PopupBubble>
              <PopupBubbleText>
                {`윌리가 새로운 장소로 쉽게 이동을 시작할 수 있게\n아이템을 함께 모아주세요!`}
              </PopupBubbleText>
            </PopupBubble>
          </PopupTopArea>
          <PopupTitle>
            {'윌리의 외출템 모으고\n계뿌클 추천 저장리스트 받아보기!'}
          </PopupTitle>
          <View style={{height: 8}} />
        </PopupContainer>
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
  align-items: center;
  justify-content: center;
`;

const PopupContainer = styled.View`
  background-color: ${color.white};
  border-radius: 16px;
  padding: 20px;
  align-items: center;
`;

const PopupTopArea = styled.View`
  align-items: center;
  gap: 12px;
`;

const PopupCharacterImage = styled(Image)`
  width: 120px;
  height: 120px;
`;

const PopupBubble = styled.View`
  background-color: ${color.white};
  border-width: 1px;
  border-color: ${color.gray20v2};
  border-radius: 12px;
  padding: 12px 16px;
`;

const PopupBubbleText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.black};
  text-align: center;
`;

const PopupTitle = styled.Text`
  margin-top: 16px;
  font-family: ${font.pretendardBold};
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.4px;
  color: ${color.black};
  text-align: center;
`;

const ButtonRow = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  flex-direction: row;
  gap: 8px;
  padding: 12px 20px 20px;
`;

const CloseButton = styled(SccPressable)`
  flex: 1;
  height: 48px;
  align-items: center;
  justify-content: center;
  background-color: ${color.white};
  border-radius: 12px;
`;

const CloseButtonText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.black};
`;

const StartButton = styled(SccPressable)`
  flex: 2;
  height: 48px;
  align-items: center;
  justify-content: center;
  background-color: ${color.brand40};
  border-radius: 12px;
`;

const StartButtonText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.white};
`;
