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

  // 이 화면이 올라와 있는 동안 스택을 [..., PDP, RegistrationComplete]로 맞춘다.
  // - FormScreen을 이 시점에 제거하면 닫기 시 네이티브 스택이 "pop" 하나만
  //   수행하면 되므로 중간 프레임 / 2중 애니메이션이 생기지 않는다.
  // - 과거에 popTo로 Form + RegComplete를 한 번에 pop하면 iOS에서 RegComplete
  //   slide 뒤에 Form이 또 한 번 밀리는 2중 애니메이션이 발생했던 문제를 해결.
  useEffect(() => {
    navigation.dispatch(s => {
      const regCompleteRoute = s.routes[s.routes.length - 1];
      const existingPdpIndex = s.routes.findIndex(r => r.name === pdpScreen);

      const newRoutes =
        existingPdpIndex >= 0
          ? [
              ...s.routes.slice(0, existingPdpIndex),
              {
                ...s.routes[existingPdpIndex],
                params: {
                  ...s.routes[existingPdpIndex].params,
                  placeInfo,
                  event,
                },
              },
              regCompleteRoute,
            ]
          : [
              ...s.routes.slice(0, -2),
              {name: pdpScreen, params: {placeInfo, event}},
              regCompleteRoute,
            ];

      return CommonActions.reset({
        ...s,
        index: newRoutes.length - 1,
        routes: newRoutes,
      });
    });
  }, []);

  const handleConfirm = () => {
    // 스택이 [..., PDP, RegistrationComplete]이므로 단순 pop으로 충분.
    // 모달 dismiss 애니메이션이 바로 아래 PDP를 드러낸다.
    navigation.pop();
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
