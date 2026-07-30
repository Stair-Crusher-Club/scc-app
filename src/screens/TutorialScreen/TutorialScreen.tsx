import {useBackHandler} from '@react-native-community/hooks';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import ChevronRight from '@/assets/icon/ic_chevron_right.svg';
import {hasShownHomeTutorialAtom} from '@/atoms/User';
import MissionCompletedOverlay from '@/components/MissionCompletedOverlay/MissionCompletedOverlay';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {TutorialMissionTypeDto} from '@/generated-sources/openapi';
import {useCompleteUserTutorialMission} from '@/hooks/useUserTutorialProgress';
import type {ScreenProps} from '@/navigation/Navigation.screens';
import {useSetAtom} from 'jotai';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;
const SLIDE_COUNT = 3;

export const tutorialSlides = [
  require('@/assets/img/tutorial_1.png'),
  require('@/assets/img/tutorial_2.png'),
  require('@/assets/img/tutorial_3.png'),
];

export interface TutorialScreenParams {
  /**
   * 튜토리얼 미션(윌리의 외출) 미션 1 로 진입한 경우 true.
   * 마지막 장 CTA 가 "시작하기"(게스트용 홈 튜토리얼 종료) 대신
   * "계뿌클 둘러보기 완료!"(미션 완료 API + 완료 팝업 + 미션 화면 이동)로 바뀐다.
   */
  fromTutorialMission?: boolean;
}

export default function TutorialScreen({
  navigation,
  route,
}: ScreenProps<'Tutorial'>) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const setHasShownHomeTutorial = useSetAtom(hasShownHomeTutorialAtom);
  const fromTutorialMission = route.params?.fromTutorialMission === true;
  const completeMission = useCompleteUserTutorialMission();
  const [showMissionCompleted, setShowMissionCompleted] = useState(false);

  // Android 하드웨어 백버튼 차단 ("강제로 보기" 요건).
  useBackHandler(() => true);

  const isFirst = activeSlide === 0;
  const isLast = activeSlide === SLIDE_COUNT - 1;

  const scaledHeight = useMemo(() => {
    const source = Image.resolveAssetSource(tutorialSlides[0]);
    return SCREEN_WIDTH * (source.height / source.width);
  }, []);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setActiveSlide(page);
    },
    [],
  );

  const handlePrev = useCallback(() => {
    scrollRef.current?.scrollTo({
      x: (activeSlide - 1) * SCREEN_WIDTH,
      animated: true,
    });
  }, [activeSlide]);

  const handleNext = useCallback(() => {
    scrollRef.current?.scrollTo({
      x: (activeSlide + 1) * SCREEN_WIDTH,
      animated: true,
    });
  }, [activeSlide]);

  const handleStart = useCallback(() => {
    setHasShownHomeTutorial(true);
    navigation.goBack();
  }, [navigation, setHasShownHomeTutorial]);

  // 미션 화면이 스택에 없으면(홈 → Tutorial 직진) 라우터가 현재 라우트를 대체하므로
  // 어느 진입 경로에서도 미션 화면에 도착한다.
  const goToMissionScreen = useCallback(() => {
    navigation.popTo('TutorialMission', {scrollResetToken: Date.now()});
  }, [navigation]);

  // 미션 1 완료. 실패해도 이 화면에 붙잡아 두지 않고 미션 화면으로 내보낸다 — 이 화면은
  // 헤더도 제스처 백도 없어서(Navigation.screens.ts 의 headerShown/gestureEnabled false)
  // 오프라인처럼 완료 API 가 계속 실패하는 상황에서 머물게 하면 빠져나갈 방법이 없다.
  // 미션 1 은 미완료로 남으므로 미션 카드에서 다시 진입해 재시도할 수 있다
  // (완료 API 는 멱등). 실패 사유는 hook 이 토스트로 알린다.
  const handleCompleteMission = useCallback(() => {
    if (completeMission.isPending) {
      return;
    }
    completeMission.mutate(
      {missionType: TutorialMissionTypeDto.ViewTutorialImages},
      {
        onSuccess: () => setShowMissionCompleted(true),
        onError: goToMissionScreen,
      },
    );
  }, [completeMission, goToMissionScreen]);

  const handleMissionCompletedClose = useCallback(() => {
    setShowMissionCompleted(false);
    goToMissionScreen();
  }, [goToMissionScreen]);

  return (
    <Container>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}>
        {tutorialSlides.map((source, index) => (
          <SlideContainer key={index}>
            <Image
              source={source}
              style={{width: SCREEN_WIDTH, height: scaledHeight}}
            />
          </SlideContainer>
        ))}
      </ScrollView>
      <BottomBar style={{paddingBottom: insets.bottom + 20}}>
        {isLast ? (
          fromTutorialMission ? (
            <StartButton
              onPress={handleCompleteMission}
              disabled={completeMission.isPending}
              elementName="tutorial_mission_1_view_images_complete_button">
              <StartButtonText>계뿌클 둘러보기 완료!</StartButtonText>
            </StartButton>
          ) : (
            <StartButton
              onPress={handleStart}
              elementName="tutorial_start_button">
              <StartButtonText>시작하기</StartButtonText>
            </StartButton>
          )
        ) : (
          <NavRow>
            <SccPressable
              onPress={handlePrev}
              disabled={isFirst}
              elementName="tutorial_prev"
              disableLogging={isFirst}
              style={{opacity: isFirst ? 0 : 1}}>
              <NavButtonInner>
                <ChevronLeft width={24} height={24} color={color.white} />
                <NavText>이전</NavText>
              </NavButtonInner>
            </SccPressable>
            <DotsContainer>
              {tutorialSlides.map((_, index) => (
                <Dot key={index} active={index === activeSlide} />
              ))}
            </DotsContainer>
            <SccPressable onPress={handleNext} elementName="tutorial_next">
              <NavButtonInner>
                <NavText>다음</NavText>
                <ChevronRight width={24} height={24} color={color.white} />
              </NavButtonInner>
            </SccPressable>
          </NavRow>
        )}
      </BottomBar>

      {showMissionCompleted && (
        <MissionCompletedOverlay
          isVisible={true}
          itemImage={require('@/assets/img/tutorial/mission_complete_img_magnifier.png')}
          description={
            '돋보기 획득!\n계뿌클 앱을 둘러봤어요.\n계뿌클 사용법 참 쉽죠!?'
          }
          confirmElementName="tutorial_mission_1_view_images_completed_confirm"
          onClose={handleMissionCompletedClose}
        />
      )}
    </Container>
  );
}

// chevron left = chevron right 180도 회전
const ChevronLeft = styled(ChevronRight)`
  transform: rotate(180deg);
`;

const Container = styled.View`
  flex: 1;
  background-color: ${color.black};
`;

const SlideContainer = styled.View`
  width: ${SCREEN_WIDTH}px;
  height: ${SCREEN_HEIGHT}px;
  overflow: hidden;
`;

const BottomBar = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding-horizontal: 20px;
`;

const NavRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const NavButtonInner = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding-horizontal: 20px;
  padding-vertical: 12px;
  gap: 2px;
`;

const NavText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  line-height: 24px;
  height: 24px;
  letter-spacing: -0.32px;
  color: ${color.white};
`;

const DotsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const Dot = styled.View<{active: boolean}>`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${({active}) => (active ? color.gray20v2 : color.gray50v2)};
`;

const StartButton = styled(SccPressable)`
  background-color: ${color.brand40};
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  padding-horizontal: 28px;
  padding-vertical: 12px;
`;

const StartButtonText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.white};
`;
