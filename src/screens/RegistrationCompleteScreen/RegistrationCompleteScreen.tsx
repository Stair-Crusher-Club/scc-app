import React, {useEffect} from 'react';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Building, Place} from '@/generated-sources/openapi';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {BuildingRegistrationEvent} from '@/screens/PlaceDetailV2Screen/constants';
import {useBackHandler} from '@react-native-community/hooks';
import {REGISTRATION_COMPLETE_CONTENT} from './constants';

export interface RegistrationCompleteScreenParams {
  target: 'place' | 'building';
  event?: BuildingRegistrationEvent;
  placeInfo:
    | {placeId: string}
    | {
        place: Place;
        building: Building;
        isAccessibilityRegistrable?: boolean;
        accessibilityScore?: number;
      };
}

export default function RegistrationCompleteScreen({
  route,
  navigation,
}: ScreenProps<'RegistrationComplete'>) {
  const {target, event, placeInfo} = route.params;
  const content = REGISTRATION_COMPLETE_CONTENT[target];

  // 안드로이드 뒤로가기 버튼 막기
  useBackHandler(() => {
    return true; // true를 반환하여 뒤로가기 동작 차단
  });

  // iOS 스와이프 제스처 막기
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
    });
  }, [navigation]);

  const handleConfirm = () => {
    navigation.navigate('PlaceDetailV2', {
      placeInfo,
      event,
    });
  };

  return (
    <ScreenLayout
      isHeaderVisible={false}
      safeAreaEdges={['top', 'bottom']}
      style={{backgroundColor: color.white}}>
      <Container>
        <Content>
          <Title>{content.title}</Title>
          <Description>{content.description}</Description>
          <ImageContainer>
            <StyledImage source={content.imagePath} resizeMode="contain" />
          </ImageContainer>
        </Content>
        <ButtonContainer>
          <SccButton
            text="감사합니다"
            textColor="white"
            buttonColor="brandColor"
            fontFamily={font.pretendardBold}
            onPress={handleConfirm}
            elementName="registration_complete_confirm"
          />
        </ButtonContainer>
      </Container>
    </ScreenLayout>
  );
}

const Container = styled.View({
  flex: 1,
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingTop: 40,
  paddingBottom: 40,
});

const Content = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
});

const Title = styled.Text({
  color: color.white,
  fontSize: 28,
  fontFamily: font.pretendardBold,
  textAlign: 'center',
  marginBottom: 16,
  lineHeight: 40,
});

const Description = styled.Text({
  color: color.white,
  fontSize: 18,
  fontFamily: font.pretendardMedium,
  textAlign: 'center',
  marginBottom: 40,
  lineHeight: 28,
});

const ImageContainer = styled.View({
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
});

const StyledImage = styled.Image({
  width: '100%',
  height: 'auto',
  aspectRatio: 375 / 265,
  maxHeight: 300,
});

const ButtonContainer = styled.View({
  paddingTop: 20,
});
