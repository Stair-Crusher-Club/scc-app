import {useFocusEffect} from '@react-navigation/native';
import {AxiosError} from 'axios';
import {useAtom} from 'jotai';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Dimensions, ScrollView, View} from 'react-native';
import styled from 'styled-components/native';

import {hasShownOutingItemsCollectedPopupAtom} from '@/atoms/User';
import MissionCompletedOverlay from '@/components/MissionCompletedOverlay/MissionCompletedOverlay';
import {ScreenLayout} from '@/components/ScreenLayout';
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

import HiddenMissionCollectedPopup from './components/HiddenMissionCollectedPopup';
import MissionCard from './components/MissionCard';
import MissionHero from './components/MissionHero';
import {MAIN_MISSION_TYPES, TUTORIAL_MISSION_META} from './constants';

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
      },
    });
  }, [allMainCompleted, isHiddenCompleted, completeHiddenMission]);

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

  // 모든 메인 미션 완료 시 "외출템 수집 완료!" 팝업 1회 노출
  useEffect(() => {
    if (!allMainCompleted) {
      return;
    }
    if (hasShownOutingItemsCollectedPopup) {
      return;
    }
    setShowOutingItemsCollected(true);
  }, [allMainCompleted, hasShownOutingItemsCollectedPopup]);

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
          navigation.navigate('PublicPlaceLists', {fromTutorial: true});
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
        fixedTitle: '히든 맛집 리스트',
        headerVariant: 'appbar',
        confirmOnClose: false,
      });
    });
  }, [allMainCompleted, isHiddenCompleted, checkAuth, progress, navigation]);

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
          <ScrollView showsVerticalScrollIndicator={false}>
            <MissionHero
              hiddenActive={allMainCompleted}
              hiddenCompleted={isHiddenCompleted}
              onHiddenPress={handleHiddenMissionPress}
              onHiddenListPress={handleHiddenListPress}
              imageWidth={SCREEN_WIDTH}
              heroImageUrl={progress.heroImageUrl}
            />

            <ContentArea>
              <SectionTitle>
                {`${
                  allMainCompleted ? 4 : MAIN_MISSION_TYPES.length
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

              <View style={{height: 40}} />
            </ContentArea>
          </ScrollView>

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
