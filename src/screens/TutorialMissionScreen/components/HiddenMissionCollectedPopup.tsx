import React from 'react';
import {Image, Modal} from 'react-native';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface HiddenMissionCollectedPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

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
      onRequestClose={onClose}>
      <DimRoot>
        <ContentsWrapper>
          <TitleImage
            source={require('@/assets/img/tutorial/hidden_collected_title.png')}
            resizeMode="contain"
          />
          <ImageWrapper>
            <Image
              source={require('@/assets/img/tutorial/hidden_collected_willy.png')}
              style={{width: 320, height: 200}}
              resizeMode="contain"
            />
          </ImageWrapper>
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
  background-color: rgba(0, 0, 0, 0.6);
  align-items: center;
  justify-content: center;
  padding: 0 24px;
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

const ImageWrapper = styled.View`
  width: 100%;
  height: 200px;
  align-items: center;
  justify-content: center;
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
