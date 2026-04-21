import {CommonActions} from '@react-navigation/native';
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

  // 모달이 덮고 있는 동안 PDP가 스택에 없으면 조용히 주입한다.
  // 닫기 시 popTo가 Form + RegComplete를 한 번에 pop하며 이미 마운트된
  // PDP를 드러내므로 중간 프레임이 생기지 않는다. (Search → FormV2 직행
  // 플로우에서도 스택이 [..., Search, PDP]로 깔끔하게 정리된다.)
  useEffect(() => {
    const state = navigation.getState();
    const hasPdp = state.routes.some(r => r.name === pdpScreen);
    if (hasPdp) {
      return;
    }
    navigation.dispatch(s => {
      const newRoutes = [
        ...s.routes.slice(0, -2),
        {name: pdpScreen, params: {placeInfo, event}},
        s.routes[s.routes.length - 2], // Form
        s.routes[s.routes.length - 1], // RegistrationComplete
      ];
      return CommonActions.reset({
        ...s,
        index: newRoutes.length - 1,
        routes: newRoutes,
      });
    });
  }, []);

  const handleConfirm = () => {
    // PDP가 스택에 있도록 useEffect에서 보장해두었으므로 단일 popTo로 충분.
    navigation.popTo(pdpScreen, {placeInfo, event});
  };

  if (target === 'building') {
    return (
      <ScreenLayout
        isHeaderVisible={false}
        safeAreaEdges={['top', 'bottom']}
        style={{backgroundColor: color.gray15}}>
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
  color: color.black,
  fontSize: 28,
  fontFamily: font.pretendardBold,
  textAlign: 'center',
  marginBottom: 12,
  lineHeight: 40,
});

const BuildingDescription = styled.Text({
  color: color.gray70,
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
