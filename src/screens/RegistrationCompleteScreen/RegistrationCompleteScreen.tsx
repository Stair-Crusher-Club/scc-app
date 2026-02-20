import React, {useEffect} from 'react';
import styled from 'styled-components/native';

import {useMe} from '@/atoms/Auth';
import {SccButton} from '@/components/atoms';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Building, Place} from '@/generated-sources/openapi';
import {usePlaceDetailScreenName} from '@/hooks/useFeatureFlags';
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
  const {userInfo} = useMe();
  const pdpScreen = usePlaceDetailScreenName();

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
    // FormScreen과 CompleteScreen 스택에서 제거
    navigation.pop();
    navigation.pop();
    // PlaceDetail로 이동
    navigation.navigate(pdpScreen, {
      placeInfo,
      event,
    });
  };

  if (target === 'building') {
    return (
      <ScreenLayout
        isHeaderVisible={false}
        safeAreaEdges={['top', 'bottom']}
        style={{backgroundColor: color.gray80}}>
        <Container>
          <Content>
            <BuildingTitle>{content.title}</BuildingTitle>
            <BuildingDescription>{content.description()}</BuildingDescription>
            <ImageContainer>
              <StyledImage source={content.imagePath} resizeMode="contain" />
            </ImageContainer>
          </Content>
          <ButtonContainer>
            <SccButton
              text="닫기"
              textColor="white"
              buttonColor="blue50"
              fontFamily={font.pretendardBold}
              onPress={handleConfirm}
              elementName="registration_complete_confirm"
              style={{borderRadius: 12}}
            />
          </ButtonContainer>
        </Container>
      </ScreenLayout>
    );
  }

  // place variant (default)
  return (
    <ScreenLayout
      isHeaderVisible={false}
      safeAreaEdges={['top', 'bottom']}
      style={{backgroundColor: color.gray15}}>
      <Container>
        <Content>
          <ImageContainer>
            <StyledImage source={content.imagePath} resizeMode="contain" />
          </ImageContainer>
          <Title>{content.title}</Title>
          <Description>{content.description(userInfo?.nickname)}</Description>
        </Content>
        <ButtonContainer>
          <SccButton
            text="닫기"
            textColor="white"
            buttonColor="brandColor"
            fontFamily={font.pretendardBold}
            onPress={handleConfirm}
            elementName="registration_complete_confirm"
            style={{borderRadius: 12}}
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

// Building variant styles
const BuildingTitle = styled.Text({
  color: color.white,
  fontSize: 28,
  fontFamily: font.pretendardBold,
  textAlign: 'center',
  marginBottom: 12,
  lineHeight: 40,
});

const BuildingDescription = styled.Text({
  color: color.gray25,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
  textAlign: 'center',
  lineHeight: 26,
  marginBottom: 20,
});

// Place variant styles (original)
const Title = styled.Text({
  color: color.black,
  fontSize: 28,
  fontFamily: font.pretendardBold,
  textAlign: 'center',
  marginBottom: 12,
  lineHeight: 40,
});

const Description = styled.Text({
  color: color.gray70,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
  textAlign: 'center',
  lineHeight: 26,
});

const ImageContainer = styled.View({
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 20,
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
