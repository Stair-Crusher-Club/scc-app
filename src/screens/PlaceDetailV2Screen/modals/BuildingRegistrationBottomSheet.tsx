import React from 'react';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import BottomSheet from '@/modals/BottomSheet';
import {
  BUILDING_REGISTRATION_CONTENT,
  BuildingRegistrationEvent,
} from '../constants';

interface BuildingRegistrationBottomSheetProps {
  isVisible: boolean;
  event: BuildingRegistrationEvent;
  onPressCancel: () => void;
  onPressConfirm: () => void;
}

export default function BuildingRegistrationBottomSheet({
  isVisible,
  event,
  onPressCancel,
  onPressConfirm,
}: BuildingRegistrationBottomSheetProps) {
  const content = BUILDING_REGISTRATION_CONTENT[event];

  return (
    <LogParamsProvider
      params={{
        bottom_sheet_type: 'building_registration',
        registration_event: event,
      }}>
      <BottomSheet isVisible={isVisible}>
        <Container>
          <TitleSection>
            <Title>{content.title}</Title>
            <Description>{content.description}</Description>
          </TitleSection>
          <ImageContainer>
            <StyledImage source={content.imagePath} resizeMode="contain" />
          </ImageContainer>
          <ButtonContainer>
            <SccButton
              text={content.cancelButtonText}
              textColor="black"
              buttonColor="gray10"
              fontFamily={font.pretendardMedium}
              onPress={onPressCancel}
              elementName="building_registration_cancel"
              style={{maxWidth: 132, width: '100%'}}
            />
            <SccButton
              text={content.confirmButtonText}
              textColor="white"
              buttonColor="brandColor"
              fontFamily={font.pretendardBold}
              onPress={onPressConfirm}
              elementName="building_registration_confirm"
              style={{flex: 1}}
            />
          </ButtonContainer>
        </Container>
      </BottomSheet>
    </LogParamsProvider>
  );
}

const Container = styled.View`
  padding: 32px 20px 20px;
  gap: 24px;
`;

const TitleSection = styled.View`
  gap: 4px;
`;

const Title = styled.Text`
  font-size: 22px;
  line-height: 30px;
  font-family: ${font.pretendardBold};
  color: ${color.gray80};
  text-align: center;
`;

const Description = styled.Text`
  font-size: 18px;
  line-height: 26px;
  color: ${color.gray70};
  text-align: center;
`;

const ImageContainer = styled.View`
  width: 100%;
  align-items: center;
  justify-content: center;
  margin-top: -11px;
`;

const StyledImage = styled.Image`
  width: 100%;
  height: auto;
  aspect-ratio: 375 / 265;
  max-height: 300px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-top: 24px;
`;
