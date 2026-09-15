import {CommonActions} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {Image} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
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
import {CtplConquest} from '@/utils/ctplConquest';
import {useBackHandler} from '@react-native-community/hooks';
import {REGISTRATION_COMPLETE_CONTENT} from './constants';

const conquestStampGrayImage = require('@/assets/img/img_challenge_conquest_stamp_gray.png');
const conquestStampGreenImage = require('@/assets/img/img_challenge_conquest_stamp_green.png');

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
  /**
   * CTPL(정복 대상 장소 목록) 정복 완료 축하 표시용. target === 'place' 일 때만
   * 유효하다 — CTPL 기여는 PLACE_ACCESSIBILITY 등록만 인정된다
   * (ChallengeService.isContributionTarget). 있으면 기존 완료 화면 대신 축하
   * 화면을 그린다.
   */
  conquest?: CtplConquest;
}

export default function RegistrationCompleteScreen({
  route,
  navigation,
}: ScreenProps<'RegistrationComplete'>) {
  const {target, event, placeInfo, conquest} = route.params;
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

  // 정복 완료 축하 전용: pop() 후 push 하면 PDP가 한 프레임 노출되므로(전환 중
  // flash는 타이밍을 고친다) 단일 reset dispatch로 최상단(RegistrationComplete)을
  // 남은 매장 지도 모드로 치환한다.
  const handleConquestConfirm = () => {
    if (!conquest) return;
    navigation.dispatch(s => {
      const newRoutes = [
        ...s.routes.slice(0, -1),
        {
          name: 'ChallengeConquerTargetPlaces' as const,
          params: {
            challengeId: conquest.challengeId,
            initialViewMode: 'map' as const,
          },
        },
      ];
      return CommonActions.reset({
        ...s,
        index: newRoutes.length - 1,
        routes: newRoutes,
      });
    });
  };

  if (target === 'place' && conquest) {
    return (
      <ScreenLayout
        isHeaderVisible={false}
        safeAreaEdges={['top', 'bottom']}
        style={{backgroundColor: color.gray80v2}}>
        <ConquestContainer>
          <ConquestTopBlock>
            <ConquestTextBlock>
              <ConquestTitle>
                {`${conquest.order}번째 `}
                <ConquestTitleBrand>{`${conquest.brandName} `}</ConquestTitleBrand>
                {'\n정복 완료!'}
              </ConquestTitle>
              <ConquestDescription>
                {`${userInfo?.nickname ?? '크러셔'}님 덕분에 ${conquest.total}개의 ${conquest.brandName} 중 \n${conquest.order}번째 ${conquest.brandName}을 정복했어요.`}
              </ConquestDescription>
            </ConquestTextBlock>
            <ConquestStamp />
          </ConquestTopBlock>
          <ConquestButtonContainer>
            <SccButton
              text="다른 곳도 정복하러 가기"
              textColor="white"
              buttonColor="brand40"
              fontFamily={font.pretendardSemibold}
              fontSize={18}
              height={56}
              onPress={handleConquestConfirm}
              elementName="registration_complete_conquest_confirm"
              style={{borderRadius: 8}}
            />
          </ConquestButtonContainer>
        </ConquestContainer>
      </ScreenLayout>
    );
  }

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

// Conquest celebration variant styles

/** 회색 → 연두 도장 크로스페이드. Lottie 파일이 오지 않는 한 reanimated opacity 로 충분. */
function ConquestStamp() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.ease),
    });
  }, [progress]);

  const greenStyle = useAnimatedStyle(() => ({opacity: progress.value}));

  return (
    <ConquestStampBox>
      <Image
        source={conquestStampGrayImage}
        resizeMode="contain"
        style={conquestStampImageStyle}
      />
      <Animated.Image
        source={conquestStampGreenImage}
        resizeMode="contain"
        style={[conquestStampImageStyle, greenStyle]}
      />
    </ConquestStampBox>
  );
}

const conquestStampImageStyle = {
  position: 'absolute' as const,
  // 정복 도장 에셋은 컨테이너(330px)보다 넓게(375px) 그려진 뒤 잘리는 디자인 —
  // 좌우를 대칭으로 넘치게 배치한다((330-375)/2 = -22.5).
  top: 12,
  left: -22.5,
  width: 375,
  height: 260,
};

const ConquestContainer = styled.View`
  flex: 1;
  background-color: ${color.gray80v2};
  justify-content: space-between;
`;

const ConquestTopBlock = styled.View`
  align-items: center;
  padding-top: 110px;
  gap: 12px;
`;

const ConquestTextBlock = styled.View`
  align-items: center;
  gap: 12px;
  width: 335px;
`;

const ConquestTitle = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 28px;
  line-height: 38px;
  color: ${color.white};
  text-align: center;
`;

const ConquestTitleBrand = styled.Text`
  color: #a7ce49;
`;

const ConquestDescription = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 16px;
  line-height: 26px;
  letter-spacing: -0.32px;
  color: ${color.gray25};
  text-align: center;
`;

const ConquestStampBox = styled.View`
  width: 330px;
  height: 294px;
  overflow: hidden;
`;

const ConquestButtonContainer = styled.View`
  padding: 12px 20px;
`;
