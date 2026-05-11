import React from 'react';
import {Image} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import BottomSheet from '@/modals/BottomSheet/BottomSheet';

import {TUTORIAL_MISSION_META} from '../constants';

interface HiddenMissionCollectedBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function HiddenMissionCollectedBottomSheet({
  isVisible,
  onClose,
}: HiddenMissionCollectedBottomSheetProps) {
  const meta = TUTORIAL_MISSION_META.HIDDEN_APP_SURVEY;
  return (
    <BottomSheet isVisible={isVisible} onPressBackground={onClose}>
      <ContentsContainer>
        <ItemImageWrapper>
          <Image
            source={meta.itemImage}
            style={{width: 120, height: 120}}
            resizeMode="contain"
          />
        </ItemImageWrapper>
        <Title>{meta.collectPopupTitle}</Title>
        <Description>{meta.collectPopupDescription}</Description>
        <SccButton
          text="확인"
          elementName="tutorial_hidden_mission_collected_confirm"
          onPress={onClose}
          buttonColor="brand40"
          textColor="white"
          fontFamily={font.pretendardSemibold}
          height={48}
          style={{borderRadius: 14, marginTop: 12}}
        />
      </ContentsContainer>
    </BottomSheet>
  );
}

const ContentsContainer = styled.View`
  padding: 20px 20px 32px;
`;

const ItemImageWrapper = styled.View`
  align-items: center;
  padding-top: 16px;
  padding-bottom: 12px;
`;

const Title = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.4px;
  color: ${color.black};
  text-align: center;
`;

const Description = styled.Text`
  margin-top: 6px;
  font-family: ${font.pretendardRegular};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.gray70};
  text-align: center;
`;
