import React from 'react';
import {Dimensions, Image, Modal, View} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export type MissionCompletedOverlayVariant = 'mission' | 'outing-items';

interface MissionCompletedOverlayProps {
  isVisible: boolean;
  /**
   * 미션 완료 일러스트 통이미지 (figma popup img frame 그대로 export한 PNG).
   * sparkle/배경/캐릭터/외출템이 모두 합성된 한 장의 이미지.
   * Figma `1648:38681` 같은 img frame 노드. ratio 390:200 (= 1.95).
   */
  itemImage: number;
  description: string;
  confirmElementName: string;
  confirmLogParams?: Record<string, unknown>;
  variant?: MissionCompletedOverlayVariant;
  onClose: () => void;
}

const TITLE_IMAGE_BY_VARIANT: Record<MissionCompletedOverlayVariant, number> = {
  mission: require('@/assets/img/tutorial/mission_complete_title.png'),
  'outing-items': require('@/assets/img/tutorial/outing_items_collected_title.png'),
};

// Figma popup img frame: 390x200 (frame 폭 기준). 화면 폭에 맞춰 비례 적용.
const SCREEN_WIDTH = Dimensions.get('window').width;
const POPUP_IMG_DESIGN_RATIO = 200 / 390;
const POPUP_IMG_WIDTH = SCREEN_WIDTH;
const POPUP_IMG_HEIGHT = POPUP_IMG_WIDTH * POPUP_IMG_DESIGN_RATIO;

export default function MissionCompletedOverlay({
  isVisible,
  itemImage,
  description,
  confirmElementName,
  confirmLogParams,
  variant = 'mission',
  onClose,
}: MissionCompletedOverlayProps) {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Dim>
        <Contents>
          <TitleImage
            source={TITLE_IMAGE_BY_VARIANT[variant]}
            resizeMode="contain"
          />
          <Image
            source={itemImage}
            style={{width: POPUP_IMG_WIDTH, height: POPUP_IMG_HEIGHT}}
            resizeMode="contain"
          />
          <Description>{description}</Description>
          <View style={{height: 8}} />
          <SccButton
            text="확인"
            elementName={confirmElementName}
            logParams={confirmLogParams}
            onPress={onClose}
            buttonColor="brand40"
            textColor="white"
            fontFamily={font.pretendardSemibold}
            fontSize={18}
            width={140}
            height={56}
            style={{borderRadius: 8}}
          />
        </Contents>
      </Dim>
    </Modal>
  );
}

const Dim = styled.View`
  flex: 1;
  background-color: ${color.blacka70};
  align-items: center;
  justify-content: center;
`;

const Contents = styled.View`
  align-items: center;
  gap: 20px;
`;

const TitleImage = styled.Image`
  width: 322px;
  height: 56px;
`;

const Description = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.4px;
  text-align: center;
  color: ${color.white};
`;
