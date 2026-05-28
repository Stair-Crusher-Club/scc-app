import {useFocusEffect} from '@react-navigation/native';
import {AxiosError} from 'axios';
import {useAtom, useAtomValue} from 'jotai';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import styled from 'styled-components/native';

import {featureFlagAtom} from '@/atoms/Auth';
import {hasShownOutingItemsCollectedPopupAtom} from '@/atoms/User';
import MissionCompletedOverlay from '@/components/MissionCompletedOverlay/MissionCompletedOverlay';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  TutorialMissionTypeDto,
  UserTutorialMissionDto,
} from '@/generated-sources/openapi';
import {
  useCompleteUserTutorialMission,
  useUserTutorialProgress,
} from '@/hooks/useUserTutorialProgress';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {useCheckAuth} from '@/utils/checkAuth';
import ToastUtils from '@/utils/ToastUtils';

import HiddenMissionCollectedPopup from './components/HiddenMissionCollectedPopup';
import MissionCard from './components/MissionCard';
import MissionHero from './components/MissionHero';
import {BubbleVariant} from './components/SpeechBubble';
import {MAIN_MISSION_TYPES, TUTORIAL_MISSION_META} from './constants';

function isMissionCompleted(
  mission: UserTutorialMissionDto | undefined,
): boolean {
  return mission?.completedAt != null;
}

interface BubbleStateInput {
  collectedMainCount: number;
  allMainCompleted: boolean;
  hasShownOutingItemsCollectedPopup: boolean;
  isHiddenCompleted: boolean;
}

// 박원 2026-05-27 시안 stage → bubble variant + float 매핑.
function pickBubbleState({
  collectedMainCount,
  allMainCompleted,
  hasShownOutingItemsCollectedPopup,
  isHiddenCompleted,
}: BubbleStateInput): {variant: BubbleVariant; float: boolean} {
  if (isHiddenCompleted) {
    return {variant: 'v6_all_complete', float: false};
  }
  if (allMainCompleted) {
    if (!hasShownOutingItemsCollectedPopup) {
      return {variant: 'v4_all_items_collected', float: false};
    }
    return {variant: 'v5_seek_hidden', float: true};
  }
  if (collectedMainCount === 0) {
    return {variant: 'v1_seek_item', float: true};
  }
  if (collectedMainCount === 1) {
    return {variant: 'v2_seek_map', float: true};
  }
  return {variant: 'v3_seek_detail', float: true};
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export interface TutorialMissionScreenParams {
  /**
   * 미션 완료 후 popTo 로 돌아왔을 때 ScrollView 를 instant top 으로 reset 하기 위한 token.
   * 매번 새 값(Date.now() 등)을 전달하면 useEffect dep 변화로 scroll reset.
   * 일반 back 으로 돌아온 경우엔 이 값이 변하지 않으므로 스크롤 유지된다.
   */
  scrollResetToken?: number;
}

export default function TutorialMissionScreen({
  navigation,
  route,
}: ScreenProps<'TutorialMission'>) {
  const checkAuth = useCheckAuth();
  const featureFlags = useAtomValue(featureFlagAtom);
  const {data: progress, refetch} = useUserTutorialProgress();
  const completeMission = useCompleteUserTutorialMission();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // 미션 완료 후 popTo 로 돌아왔을 때 instant scroll top.
  // 일반 back 으로 돌아온 경우엔 token 이 변하지 않으므로 스크롤이 유지된다.
  const scrollResetToken = route.params?.scrollResetToken;
  useEffect(() => {
    if (scrollResetToken == null) {
      return;
    }
    scrollRef.current?.scrollTo({y: 0, animated: false});
  }, [scrollResetToken]);

  // USER_TUTORIAL feature flag 미대상 사용자가 deeplink 등으로 우회 진입한 경우 broken UX
  // 노출 방지. featureFlags === null (아직 getUserInfo 응답 전 / 익명 유저) 동안은 대기.
  useEffect(() => {
    if (featureFlags && !featureFlags.enabledFlags.has('USER_TUTORIAL')) {
      navigation.goBack();
    }
  }, [featureFlags, navigation]);
  const [showHiddenCollected, setShowHiddenCollected] = useState(false);
  const [
    hasShownOutingItemsCollectedPopup,
    setHasShownOutingItemsCollectedPopup,
  ] = useAtom(hasShownOutingItemsCollectedPopupAtom);
  const [showOutingItemsCollected, setShowOutingItemsCollected] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const missionByType = useMemo(() => {
    const map = new Map<TutorialMissionTypeDto, UserTutorialMissionDto>();
    progress?.missions.forEach(m => map.set(m.missionType, m));
    return map;
  }, [progress]);

  const collectedMainCount = useMemo(() => {
    return MAIN_MISSION_TYPES.filter(type =>
      isMissionCompleted(missionByType.get(type)),
    ).length;
  }, [missionByType]);

  const allMainCompleted = collectedMainCount === MAIN_MISSION_TYPES.length;
  const isHiddenCompleted = isMissionCompleted(
    missionByType.get(TutorialMissionTypeDto.HiddenAppSurvey),
  );

  const tryCompleteHiddenMission = useCallback(() => {
    if (!allMainCompleted || isHiddenCompleted) {
      return;
    }
    if (completeMission.isPending) {
      return;
    }
    completeMission.mutate(
      {missionType: TutorialMissionTypeDto.HiddenAppSurvey},
      {
        onSuccess: () => {
          setShowHiddenCollected(true);
        },
        onError: error => {
          if (error instanceof AxiosError && error.response?.status === 400) {
            ToastUtils.show(
              'Tally Form 제출이 확인되지 않았어요.\n잠시 후 다시 시도하거나 Form을 다시 제출해주세요.',
            );
          }
        },
      },
    );
  }, [allMainCompleted, isHiddenCompleted, completeMission]);

  // tally form Webview 진입 후 화면 복귀 시 hidden 완료 API 자동 호출.
  // 서버가 tally API로 직접 검증 (idempotent + 미제출 시 400 silent) 하므로 안전하게 시도.
  const wasTallyOpenedRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!wasTallyOpenedRef.current) {
        return;
      }
      wasTallyOpenedRef.current = false;
      tryCompleteHiddenMission();
    }, [tryCompleteHiddenMission]),
  );

  // 모든 메인 미션 완료 시 "외출템 수집 완료!" 팝업 1회 노출.
  // useFocusEffect 로 감싸서 TutorialMissionScreen 이 focus 됐을 때만 trigger.
  // (미션 3 화면 같은 자식 스크린이 push 된 상태에서는 trigger 되지 않도록 — 자식
  // 화면 위에 외출템 팝업이 뜨는 걸 막는다.)
  useFocusEffect(
    useCallback(() => {
      if (!allMainCompleted) {
        return;
      }
      if (hasShownOutingItemsCollectedPopup) {
        return;
      }
      setShowOutingItemsCollected(true);
    }, [allMainCompleted, hasShownOutingItemsCollectedPopup]),
  );

  const handleStartMission = useCallback(
    (missionType: TutorialMissionTypeDto) => {
      const meta = TUTORIAL_MISSION_META[missionType];
      checkAuth(() => {
        if (meta.navigateTo === 'TallyForm') {
          return;
        }
        if (meta.navigateTo === 'InterestedRegionAndThemes') {
          navigation.navigate('InterestedRegionAndThemes', {});
        } else if (meta.navigateTo === 'PublicPlaceLists') {
          // 튜토리얼 미션 2 (SAVE_PLACE_LIST) 진입은 전용 라우트로. 라우트 이름이
          // 컨텍스트를 명시 — 자식 PlaceListDetail 이 fromTutorial 을 인식해서
          // 미션 완료 mutation 을 명시 호출한다 (일반 PublicPlaceLists 진입은 X).
          navigation.navigate('TutorialMissionSavePlaceList', {
            fromTutorial: true,
          });
        } else if (meta.navigateTo === 'TutorialUpvoteAccessibilityMission') {
          navigation.navigate('TutorialUpvoteAccessibilityMission');
        } else if (meta.navigateTo === 'Main') {
          navigation.navigate('Main');
        }
      });
    },
    [checkAuth, navigation],
  );

  const handleHiddenMissionPress = useCallback(() => {
    if (!allMainCompleted) {
      return;
    }
    if (isHiddenCompleted) {
      return;
    }
    checkAuth(() => {
      const url = progress?.hiddenMissionTallyFormUrl;
      if (!url) {
        return;
      }
      wasTallyOpenedRef.current = true;
      navigation.navigate('Webview', {
        url,
        fixedTitle: '숨겨진 외출템 모아보기',
        headerVariant: 'appbar',
        confirmOnClose: false,
      });
    });
  }, [allMainCompleted, isHiddenCompleted, checkAuth, progress, navigation]);

  // hero 의 외출템(?) hot zone 탭 핸들러.
  // - 이미 완료된 외출템: 무반응 (PNG 가 컬러여서 ? 표시가 없음, 클릭 의미 없음).
  // - 잠긴 외출템(이전 미션 미완료): 무반응. 아직 못 깨는 미션이라 시작 페이지로 보내면 X.
  // - 현재 진행 가능 미션 (= 다음에 깰 미션 = 첫 미완료 + 이전 모두 완료): 미션 카드의
  //   "미션 시작" 버튼을 누른 것과 동일하게 미션 시작 페이지로 이동.
  const handleMissionItemPress = useCallback(
    (index: 0 | 1 | 2) => {
      const missionType = MAIN_MISSION_TYPES[index];
      if (!missionType) {
        return;
      }
      const mission = missionByType.get(missionType);
      if (isMissionCompleted(mission)) {
        return;
      }
      const allPreviousCompleted = MAIN_MISSION_TYPES.slice(0, index).every(
        prev => isMissionCompleted(missionByType.get(prev)),
      );
      if (!allPreviousCompleted) {
        return;
      }
      handleStartMission(missionType);
    },
    [missionByType, handleStartMission],
  );

  // 박원 2026-05-27 시안. hero PNG 자체는 정지하고 hero 위에 overlay 한 말풍선만
  // 둥실 애니메이션을 적용한다. variant 별 텍스트/위치는 SpeechBubble 이 처리.
  // - variant 1/2/3: 미션 진행 중 (mainCount 0/1/2) → 둥실
  // - variant 4: 외출템 다 모았어 (allMain, !popupShown) → 정지
  // - variant 5: 숨겨진 외출템도 모아볼까 (allMain, popupShown, !hidden) → 둥실
  // - variant 6: 다모았다 (hidden 완료) → 정지
  const bubbleState = pickBubbleState({
    collectedMainCount,
    allMainCompleted,
    hasShownOutingItemsCollectedPopup,
    isHiddenCompleted,
  });

  // 외출템 다 모은 뒤(variant 5, 6) 노출되는 sticky bottom CTA + tooltip (박원 시안).
  // - 버튼: 화면 하단 50px 위 고정 (figma 2004:14517 / 2004:15337).
  // - tooltip: 버튼 위 4↔10px 상하 둥실 (figma 2004:14518 / 2004:15338).
  //   히든 완료 variant 6 frame metadata 에도 tooltip 노드가 그대로 있으므로 같이 노출.
  const showStickyHiddenCta = allMainCompleted;
  const showHiddenTooltip = allMainCompleted;
  const tooltipFloatY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!showHiddenTooltip) {
      tooltipFloatY.stopAnimation();
      tooltipFloatY.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(tooltipFloatY, {
          toValue: -6,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(tooltipFloatY, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [showHiddenTooltip, tooltipFloatY]);

  const handleHiddenListPress = useCallback(() => {
    if (!allMainCompleted) {
      return;
    }
    checkAuth(() => {
      navigation.navigate('PublicPlaceLists', {fromTutorial: true});
    });
  }, [allMainCompleted, checkAuth, navigation]);

  if (!progress) {
    return <ScreenLayout isHeaderVisible={true} />;
  }

  return (
    <ScreenLayout isHeaderVisible={true}>
      <LogParamsProvider
        params={{displaySectionName: 'tutorial_mission_screen'}}>
        <BgContainer>
          <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
            <MissionHero
              hiddenActive={allMainCompleted}
              hiddenCompleted={isHiddenCompleted}
              onHiddenPress={handleHiddenMissionPress}
              imageWidth={SCREEN_WIDTH}
              heroImageUrl={progress.heroImageUrl}
              bubbleVariant={bubbleState.variant}
              bubbleFloat={bubbleState.float}
              onMissionItemPress={handleMissionItemPress}
            />

            <ContentArea>
              <SectionTitle>
                {`${
                  allMainCompleted ? 3 : MAIN_MISSION_TYPES.length
                }개의 미션을 뿌시고,\n윌리의 외출템을 모아주세요!`}
              </SectionTitle>

              <CardsWrapper>
                {MAIN_MISSION_TYPES.map((missionType, index) => {
                  const mission = missionByType.get(missionType);
                  const meta = TUTORIAL_MISSION_META[missionType];
                  const isCompleted = isMissionCompleted(mission);
                  const previousMissions = MAIN_MISSION_TYPES.slice(0, index);
                  const isPreviousCompleted = previousMissions.every(prev =>
                    isMissionCompleted(missionByType.get(prev)),
                  );
                  const isDimmed = !isPreviousCompleted && !isCompleted;
                  return (
                    <MissionCard
                      key={missionType}
                      missionType={missionType}
                      meta={meta}
                      isCompleted={isCompleted}
                      isDimmed={isDimmed}
                      dimText={
                        index > 0
                          ? `외출템 ${index}을 모으면, 외출템 ${
                              index + 1
                            } 미션이 열려요!`
                          : undefined
                      }
                      onStart={() => handleStartMission(missionType)}
                    />
                  );
                })}
              </CardsWrapper>

              {/* sticky bottom CTA + tooltip 영역과 겹치지 않도록 충분한 여백 확보. */}
              <View style={{height: showStickyHiddenCta ? 140 : 40}} />
            </ContentArea>
          </ScrollView>

          {showStickyHiddenCta && (
            <StickyHiddenCtaWrapper
              pointerEvents="box-none"
              style={{bottom: insets.bottom + 50}}>
              {showHiddenTooltip && (
                <Animated.View
                  style={{
                    alignItems: 'center',
                    marginBottom: 4,
                    transform: [{translateY: tooltipFloatY}],
                  }}>
                  <TooltipBubble>
                    <TooltipText>히든 리스트를 확인해보세요!</TooltipText>
                  </TooltipBubble>
                  <TooltipArrow />
                </Animated.View>
              )}
              <HiddenCtaShadow>
                <HiddenCtaButton
                  elementName="tutorial_mission_hidden_list_sticky_cta"
                  onPress={handleHiddenListPress}>
                  <Svg
                    style={StyleSheet.absoluteFillObject}
                    preserveAspectRatio="none"
                    viewBox="0 0 1 1">
                    <Defs>
                      <SvgLinearGradient
                        id="hiddenCtaGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">
                        {/*
                         * 박원 figma 2004:15337 그라데이션 178.23deg, stop 11.113%
                         * #0C76F7 → 194.62% #074591. SVG stop offset 은 0~1 범위라
                         * figma 의 visible portion(11.113%~100%) 만 잘라 사용한다.
                         * 100% 색은 두 stop 사이 선형 보간으로 계산:
                         *   t=(100-11.113)/(194.62-11.113)=0.4843
                         *   rgb(12,118,247)→rgb(7,69,145) 보간 ≈ rgb(10,94,198)=#0A5EC6
                         */}
                        <Stop offset="0.111" stopColor="#0C76F7" />
                        <Stop offset="1" stopColor="#0A5EC6" />
                      </SvgLinearGradient>
                    </Defs>
                    <Rect width="1" height="1" fill="url(#hiddenCtaGrad)" />
                  </Svg>
                  <HiddenCtaText>계뿌클 히든 맛집 리스트 보기!</HiddenCtaText>
                </HiddenCtaButton>
              </HiddenCtaShadow>
            </StickyHiddenCtaWrapper>
          )}

          {showOutingItemsCollected && (
            <MissionCompletedOverlay
              isVisible={true}
              variant="outing-items"
              itemImage={require('@/assets/img/tutorial/mission_complete_img_outing_items.png')}
              description={
                '윌리의 외출템을 모두 모았어요!\n이제 계뿌클 히든 맛집 리스트를\n확인할 수 있어요'
              }
              confirmElementName="tutorial_outing_items_collected_confirm"
              onClose={() => {
                setShowOutingItemsCollected(false);
                setHasShownOutingItemsCollectedPopup(true);
              }}
            />
          )}
          {showHiddenCollected && (
            <HiddenMissionCollectedPopup
              isVisible={true}
              onClose={() => setShowHiddenCollected(false)}
            />
          )}
        </BgContainer>
      </LogParamsProvider>
    </ScreenLayout>
  );
}

const BgContainer = styled.View`
  flex: 1;
  background-color: ${color.white};
`;

const ContentArea = styled.View`
  background-color: #e9f4c3;
  padding: 32px 16px 40px;
`;

const SectionTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.4px;
  color: ${color.black};
  text-align: center;
  margin-bottom: 32px;
`;

const CardsWrapper = styled.View`
  gap: 8px;
`;

// Figma 2004:14517 / 2004:15337: 화면 하단 50px 위에 고정된 button container.
// pointerEvents=box-none 으로 wrapper 자체는 터치 통과, 내부 버튼/툴팁만 터치 수신.
const StickyHiddenCtaWrapper = styled.View`
  position: absolute;
  left: 16px;
  right: 16px;
  align-items: center;
`;

// Figma 2004:15337: 358x56, 그라데이션(#0C76F7→#074591), 흰색 1.5px border,
// box-shadow 2px 4px 4px rgba(0,0,0,0.25). RN 의 shadow 는 overflow:hidden 와
// 같이 쓰면 잘리므로 wrapper(Shadow) + inner(border + overflow + svg) 두 단으로
// 분리.
const HiddenCtaShadow = styled.View`
  width: 100%;
  border-radius: 8px;
  /* iOS */
  shadow-color: #000;
  shadow-offset: 2px 4px;
  shadow-opacity: 0.25;
  shadow-radius: 4px;
  /* Android */
  elevation: 6;
`;

const HiddenCtaButton = styled(SccPressable)`
  width: 100%;
  height: 56px;
  border-radius: 8px;
  border-width: 1.5px;
  border-color: ${color.white};
  background-color: #0c76f7;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const HiddenCtaText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.white};
`;

// Figma 2004:14518 tooltip: 157x34 (text 28 + arrow 6), 진한 회색 배경 + 흰 텍스트.
const TooltipBubble = styled.View`
  background-color: ${color.gray90v2};
  border-radius: 8px;
  padding: 6px 12px;
  align-items: center;
  justify-content: center;
`;

const TooltipText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.26px;
  color: ${color.white};
`;

// 말풍선 ↘ 아래로 향하는 작은 삼각 화살표. 10x6 (figma 28:8534 기준).
const TooltipArrow = styled.View`
  width: 0;
  height: 0;
  border-left-width: 5px;
  border-right-width: 5px;
  border-top-width: 6px;
  border-left-color: transparent;
  border-right-color: transparent;
  border-top-color: ${color.gray90v2};
`;
