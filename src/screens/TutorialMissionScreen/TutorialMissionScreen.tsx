import {useFocusEffect} from '@react-navigation/native';
import {AxiosError} from 'axios';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  AppState,
  AppStateStatus,
  Dimensions,
  Linking,
  ScrollView,
  View,
} from 'react-native';
import styled from 'styled-components/native';

import {ScreenLayout} from '@/components/ScreenLayout';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  TutorialMissionTypeDto,
  UserTutorialMissionDto,
} from '@/generated-sources/openapi';
import {
  useCompleteUserTutorialHiddenMission,
  useUserTutorialProgress,
} from '@/hooks/useUserTutorialProgress';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {useCheckAuth} from '@/utils/checkAuth';
import ToastUtils from '@/utils/ToastUtils';

import HiddenMissionCollectedBottomSheet from './components/HiddenMissionCollectedBottomSheet';
import MissionCard from './components/MissionCard';
import MissionHero from './components/MissionHero';
import {MAIN_MISSION_TYPES, TUTORIAL_MISSION_META} from './constants';

/**
 * 미션 완료 여부 판단 helper.
 * 서버 스펙: completedAt이 null이 아니면 완료된 미션.
 */
function isMissionCompleted(
  mission: UserTutorialMissionDto | undefined,
): boolean {
  return mission?.completedAt != null;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export interface TutorialMissionScreenParams {}

export default function TutorialMissionScreen({
  navigation,
}: ScreenProps<'TutorialMission'>) {
  const checkAuth = useCheckAuth();
  const {data: progress, refetch} = useUserTutorialProgress();
  const completeHiddenMission = useCompleteUserTutorialHiddenMission();
  const [showHiddenCollected, setShowHiddenCollected] = useState(false);

  // 화면 포커스 시 progress 재조회 (다른 화면에서 작업하고 돌아왔을 때 미션 상태 반영)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // 진행 상태 lookup
  const missionByType = useMemo(() => {
    const map = new Map<TutorialMissionTypeDto, UserTutorialMissionDto>();
    progress?.missions.forEach(m => map.set(m.missionType, m));
    return map;
  }, [progress]);

  // 외출템 N개 수집 단계 (0..3)
  const collectedMainCount = useMemo(() => {
    return MAIN_MISSION_TYPES.filter(type =>
      isMissionCompleted(missionByType.get(type)),
    ).length;
  }, [missionByType]);

  const allMainCompleted = collectedMainCount === MAIN_MISSION_TYPES.length;
  const isHiddenCompleted = isMissionCompleted(
    missionByType.get(TutorialMissionTypeDto.HiddenAppSurvey),
  );

  /**
   * 히든 미션 완료 시도 (서버가 tally API 직접 검증).
   * - 400 응답: tally 제출이 아직 확인되지 않음 → retry 안내 toast
   * - 성공: 히든템 수집 BottomSheet 노출
   * - 기타 에러: 기본 toast (useCompleteUserTutorialHiddenMission의 onError)
   */
  const tryCompleteHiddenMission = useCallback(() => {
    if (!allMainCompleted || isHiddenCompleted) {
      return;
    }
    if (completeHiddenMission.isPending) {
      return;
    }
    completeHiddenMission.mutate(undefined, {
      onSuccess: () => {
        setShowHiddenCollected(true);
      },
      onError: error => {
        if (error instanceof AxiosError && error.response?.status === 400) {
          ToastUtils.show(
            'Tally Form 제출이 확인되지 않았어요.\n잠시 후 다시 시도하거나 Form을 다시 제출해주세요.',
          );
        }
        // 그 외 에러는 useCompleteUserTutorialHiddenMission.onError가 토스트 표시
      },
    });
  }, [allMainCompleted, isHiddenCompleted, completeHiddenMission]);

  // tally form 진입 후 background → active 복귀 시 자동으로 hidden 완료 API 호출.
  // 서버가 tally API로 직접 검증하므로 사용자 confirm 단계 없이 바로 시도한다.
  const wasBackgroundedAfterTallyRef = useRef(false);
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'background' || nextState === 'inactive') {
          if (allMainCompleted && !isHiddenCompleted) {
            wasBackgroundedAfterTallyRef.current = true;
          }
        } else if (nextState === 'active') {
          if (
            wasBackgroundedAfterTallyRef.current &&
            allMainCompleted &&
            !isHiddenCompleted
          ) {
            wasBackgroundedAfterTallyRef.current = false;
            tryCompleteHiddenMission();
          }
        }
      },
    );
    return () => {
      subscription.remove();
    };
  }, [allMainCompleted, isHiddenCompleted, tryCompleteHiddenMission]);

  /**
   * 미션 카드 "미션 시작" 버튼 클릭 핸들러
   */
  const handleStartMission = useCallback(
    (missionType: TutorialMissionTypeDto) => {
      const meta = TUTORIAL_MISSION_META[missionType];
      checkAuth(() => {
        if (meta.navigateTo === 'TallyForm') {
          // 히든 미션은 별도 hot zone에서 처리 (미션 카드 시작 버튼 없음)
          return;
        }
        if (meta.navigateTo === 'InterestedRegionAndThemes') {
          navigation.navigate('InterestedRegionAndThemes', {
            fromTutorial: true,
          });
        } else if (meta.navigateTo === 'PublicPlaceLists') {
          navigation.navigate('PublicPlaceLists', {fromTutorial: true});
        } else if (meta.navigateTo === 'Main') {
          // 지도/장소 상세 화면으로 이동 (탭 home으로)
          navigation.navigate('Main');
        }
      });
    },
    [checkAuth, navigation],
  );

  /**
   * 히든 미션 hot zone 클릭 핸들러: tally form 오픈
   */
  const handleHiddenMissionPress = useCallback(() => {
    if (!allMainCompleted) {
      return;
    }
    if (isHiddenCompleted) {
      return;
    }
    checkAuth(async () => {
      const url = progress?.hiddenMissionTallyFormUrl;
      if (!url) {
        return;
      }
      try {
        await Linking.openURL(url);
      } catch {
        ToastUtils.show('링크를 열 수 없습니다. 잠시 후 다시 시도해주세요.');
      }
    });
  }, [allMainCompleted, isHiddenCompleted, checkAuth, progress]);

  /**
   * 히든 미션 완료 fallback 버튼 (AppState background→active 못 잡았을 때 retry).
   * tryCompleteHiddenMission과 동일하게 서버 검증을 시도한다.
   */
  const handleHiddenMissionComplete = useCallback(() => {
    checkAuth(() => {
      tryCompleteHiddenMission();
    });
  }, [checkAuth, tryCompleteHiddenMission]);

  /**
   * 히든 맛집 리스트 CTA 클릭 — 모든 메인 미션 완료 후 활성화.
   * 공개 저장리스트 화면으로 이동 (히든 리스트 노출 위함).
   */
  const handleHiddenListPress = useCallback(() => {
    if (!allMainCompleted) {
      return;
    }
    checkAuth(() => {
      navigation.navigate('PublicPlaceLists', {fromTutorial: true});
    });
  }, [allMainCompleted, checkAuth, navigation]);

  // main 미션이 모두 완료되었지만 hidden은 미완료인 경우 CTA를 항상 노출
  // (AppState 감지를 못 잡았을 때 사용자가 명시적으로 retry할 수 있도록)
  const showHiddenCompleteCta = allMainCompleted && !isHiddenCompleted;

  return (
    <ScreenLayout isHeaderVisible={true}>
      <LogParamsProvider
        params={{displaySectionName: 'tutorial_mission_screen'}}>
        <BgContainer>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 상단 hero (윌리 + 외출템 진행 시각화 + 히든 hot zone) */}
            <MissionHero
              stage={collectedMainCount}
              hiddenActive={allMainCompleted}
              hiddenCompleted={isHiddenCompleted}
              onHiddenPress={handleHiddenMissionPress}
              onHiddenListPress={handleHiddenListPress}
              imageWidth={SCREEN_WIDTH}
            />

            {/* 미션 카드 영역 */}
            <ContentArea>
              <SectionTitle>
                {`3개의 미션을 뿌시고,\n윌리의 외출템을 모아주세요!`}
              </SectionTitle>

              <CardsWrapper>
                {MAIN_MISSION_TYPES.map((missionType, index) => {
                  const mission = missionByType.get(missionType);
                  const meta = TUTORIAL_MISSION_META[missionType];
                  const isCompleted = isMissionCompleted(mission);
                  // 이전 미션이 모두 완료되었을 때만 활성
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
                            }미션이 열려요!`
                          : undefined
                      }
                      onStart={() => handleStartMission(missionType)}
                    />
                  );
                })}
              </CardsWrapper>

              {showHiddenCompleteCta && (
                <HiddenCompleteCtaWrapper>
                  <CompleteCtaText>
                    Tally Form 제출이 끝났다면 아래 버튼을 눌러주세요.
                  </CompleteCtaText>
                  <CompleteCtaButton
                    elementName="tutorial_mission_hidden_complete_button"
                    onPress={handleHiddenMissionComplete}
                    disabled={completeHiddenMission.isPending}>
                    <CompleteCtaButtonText>
                      히든 미션 완료하기
                    </CompleteCtaButtonText>
                  </CompleteCtaButton>
                </HiddenCompleteCtaWrapper>
              )}

              <View style={{height: 40}} />
            </ContentArea>
          </ScrollView>

          {showHiddenCollected && (
            <HiddenMissionCollectedBottomSheet
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

const HiddenCompleteCtaWrapper = styled.View`
  margin-top: 16px;
  align-items: center;
  gap: 8px;
`;

const CompleteCtaText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.26px;
  color: ${color.gray70};
  text-align: center;
`;

const CompleteCtaButton = styled(SccPressable)`
  background-color: ${color.brand40};
  padding: 12px 28px;
  border-radius: 8px;
`;

const CompleteCtaButtonText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.white};
`;
