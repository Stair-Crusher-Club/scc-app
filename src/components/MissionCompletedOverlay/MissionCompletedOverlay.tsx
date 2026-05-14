import React from 'react';
import {Image, Modal, View} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export type MissionCompletedOverlayVariant = 'mission' | 'outing-items';

interface MissionCompletedOverlayProps {
  isVisible: boolean;
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
          <ItemImageWrapper>
            <Image
              source={itemImage}
              style={{width: 200, height: 200}}
              resizeMode="contain"
            />
          </ItemImageWrapper>
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
  padding: 0 34px;
`;

const Contents = styled.View`
  align-items: center;
  gap: 20px;
`;

const TitleImage = styled.Image`
  width: 322px;
  height: 56px;
`;

const ItemImageWrapper = styled.View`
  width: 200px;
  height: 200px;
  align-items: center;
  justify-content: center;
`;

const Description = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.4px;
  text-align: center;
  color: ${color.white};
`;
