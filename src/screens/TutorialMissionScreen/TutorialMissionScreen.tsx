import {useFocusEffect} from '@react-navigation/native';
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
import BottomSheet from '@/modals/BottomSheet/BottomSheet';
import BottomSheetButtonGroup, {
  BottomSheetButtonGroupLayout,
} from '@/modals/BottomSheet/BottomSheetButtonGroup';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {useCheckAuth} from '@/utils/checkAuth';
import ToastUtils from '@/utils/ToastUtils';

import HiddenMissionCollectedBottomSheet from './components/HiddenMissionCollectedBottomSheet';
import MissionCard from './components/MissionCard';
import MissionHero from './components/MissionHero';
import MissionItemCollectedBottomSheet from './components/MissionItemCollectedBottomSheet';
import {MAIN_MISSION_TYPES, TUTORIAL_MISSION_META} from './constants';

const SCREEN_WIDTH = Dimensions.get('window').width;

export interface TutorialMissionScreenParams {}

export default function TutorialMissionScreen({
  navigation,
}: ScreenProps<'TutorialMission'>) {
  const checkAuth = useCheckAuth();
  const {data: progress, refetch} = useUserTutorialProgress();
  const completeHiddenMission = useCompleteUserTutorialHiddenMission();
  const [showHiddenCollected, setShowHiddenCollected] = useState(false);
  // 새로 완료된 main 미션의 외출템 수집 팝업을 위한 type
  const [newlyCompletedMissionType, setNewlyCompletedMissionType] =
    useState<TutorialMissionTypeDto | null>(null);
  // tally form 외출 후 복귀 시 확인 modal
  const [showHiddenConfirm, setShowHiddenConfirm] = useState(false);

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

  // 외출템 N개 수집 단계 (0..4)
  const collectedMainCount = useMemo(() => {
    return MAIN_MISSION_TYPES.filter(
      type => missionByType.get(type)?.isCompleted,
    ).length;
  }, [missionByType]);

  const allMainCompleted = collectedMainCount === MAIN_MISSION_TYPES.length;
  const isHiddenCompleted =
    missionByType.get(TutorialMissionTypeDto.CollectHiddenItem)?.isCompleted ??
    false;

  // progress diff 감지: 이전에 미완료였다가 새로 완료된 main 미션이 있으면 팝업 노출
  const prevCompletedRef = useRef<Set<TutorialMissionTypeDto> | null>(null);
  useEffect(() => {
    if (!progress) {
      return;
    }
    const currentCompleted = new Set<TutorialMissionTypeDto>();
    progress.missions.forEach(m => {
      if (m.isCompleted) {
        currentCompleted.add(m.missionType);
      }
    });

    if (prevCompletedRef.current !== null) {
      const prev = prevCompletedRef.current;
      // 메인 미션 중 새로 완료된 것을 첫 번째 발견 시점에 노출
      for (const type of MAIN_MISSION_TYPES) {
        if (currentCompleted.has(type) && !prev.has(type)) {
          setNewlyCompletedMissionType(type);
          break;
        }
      }
    }
    prevCompletedRef.current = currentCompleted;
  }, [progress]);

  // tally form 진입 후 background → active 복귀 시 hidden 완료 확인 modal 노출
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
            setShowHiddenConfirm(true);
          }
        }
      },
    );
    return () => {
      subscription.remove();
    };
  }, [allMainCompleted, isHiddenCompleted]);

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
   * 히든 미션 완료 처리 (사용자가 tally form 제출 후 앱으로 복귀해서 확인했을 때)
   */
  const handleHiddenMissionComplete = useCallback(() => {
    setShowHiddenConfirm(false);
    checkAuth(() => {
      completeHiddenMission.mutate(undefined, {
        onSuccess: () => {
          setShowHiddenCollected(true);
        },
      });
    });
  }, [checkAuth, completeHiddenMission]);

  const handleCloseHiddenConfirm = useCallback(() => {
    setShowHiddenConfirm(false);
  }, []);

  // main 미션이 모두 완료되었지만 hidden은 미완료인 경우 CTA를 항상 노출
  // (AppState 감지 외에 사용자가 명시적으로 누를 수도 있도록)
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
              imageWidth={SCREEN_WIDTH}
            />

            {/* 미션 카드 영역 */}
            <ContentArea>
              <SectionTitle>
                {`4개의 미션을 뿌시고,\n윌리의 외출템을 모아주세요!`}
              </SectionTitle>

              {MAIN_MISSION_TYPES.map((missionType, index) => {
                const mission = missionByType.get(missionType);
                const meta = TUTORIAL_MISSION_META[missionType];
                const isCompleted = mission?.isCompleted ?? false;
                // 이전 미션이 모두 완료되었을 때만 활성
                const previousMissions = MAIN_MISSION_TYPES.slice(0, index);
                const isPreviousCompleted = previousMissions.every(
                  prev => missionByType.get(prev)?.isCompleted,
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
                        ? `외출템${index}을 먼저 모아주세요!`
                        : undefined
                    }
                    onStart={() => handleStartMission(missionType)}
                  />
                );
              })}

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

          {newlyCompletedMissionType !== null && (
            <MissionItemCollectedBottomSheet
              isVisible={true}
              missionType={newlyCompletedMissionType}
              onClose={() => setNewlyCompletedMissionType(null)}
            />
          )}

          {showHiddenCollected && (
            <HiddenMissionCollectedBottomSheet
              isVisible={true}
              onClose={() => setShowHiddenCollected(false)}
            />
          )}

          {/* tally 외출 후 복귀 확인 modal */}
          <BottomSheet
            isVisible={showHiddenConfirm}
            onPressBackground={handleCloseHiddenConfirm}>
            <ConfirmContainer>
              <ConfirmTitle>Tally Form 제출을 완료하셨나요?</ConfirmTitle>
              <ConfirmDescription>
                제출이 완료되었다면 히든 외출템을 받을 수 있어요!
              </ConfirmDescription>
              <BottomSheetButtonGroup
                layout={BottomSheetButtonGroupLayout.HORIZONTAL_1X2}
                positiveButton={{
                  text: '완료했어요',
                  onPressed: handleHiddenMissionComplete,
                }}
                negativeButton={{
                  text: '아직이에요',
                  onPressed: handleCloseHiddenConfirm,
                }}
              />
            </ConfirmContainer>
          </BottomSheet>
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
  margin-bottom: 24px;
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

const ConfirmContainer = styled.View`
  padding: 24px 20px 24px;
`;

const ConfirmTitle = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.black};
  text-align: center;
`;

const ConfirmDescription = styled.Text`
  margin-top: 8px;
  margin-bottom: 16px;
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.gray70};
  text-align: center;
`;
