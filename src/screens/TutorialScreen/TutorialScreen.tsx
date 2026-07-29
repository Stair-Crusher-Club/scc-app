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
  const [hasCompletionFailed, setHasCompletionFailed] = useState(false);

  // Android 하드웨어 백버튼 차단. 단 미션 완료 API 가 한 번이라도 실패했다면 차단을 푼다
  // (오프라인 등으로 완료가 불가능한데 나갈 방법까지 없으면 앱 강제 종료 외엔 답이 없다).
  // 이때 나가도 미션 1 은 미완료로 남아 다시 진입해 재시도할 수 있다.
  useBackHandler(() => !hasCompletionFailed, [hasCompletionFailed]);

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

  // 미션 1 완료: 실패 시엔 팝업을 띄우지 않는다 (hook 이 에러 토스트 노출, 재탭 시
  // 재시도 가능 — 완료 API 는 멱등).
  //
  // 실패를 기록해 백 버튼 차단을 푼다. "강제로 보기"는 스킵 방지가 목적이지 네트워크
  // 장애 시 가두는 게 목적이 아니다 — 오프라인이면 완료 API 가 계속 실패하는데 헤더도
  // 제스처 백도 없어(Navigation.screens.ts 의 headerShown/gestureEnabled false) 앱 강제
  // 종료 외엔 빠져나갈 방법이 없어진다.
  const handleCompleteMission = useCallback(() => {
    if (completeMission.isPending) {
      return;
    }
    completeMission.mutate(
      {missionType: TutorialMissionTypeDto.ViewTutorialImages},
      {
        onSuccess: () => setShowMissionCompleted(true),
        onError: () => setHasCompletionFailed(true),
      },
    );
  }, [completeMission]);

  // 미션 화면이 스택에 없으면(홈 → Tutorial 직진) 라우터가 현재 라우트를 대체하므로
  // 어느 진입 경로에서도 미션 화면에 도착한다.
  const handleMissionCompletedClose = useCallback(() => {
    setShowMissionCompleted(false);
    navigation.popTo('TutorialMission', {scrollResetToken: Date.now()});
  }, [navigation]);

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
