import {useAtomValue} from 'jotai';
import React, {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components/native';

import {featureFlagAtom, useMe} from '@/atoms/Auth';
import {SccButton} from '@/components/atoms';
import MissionCompletedOverlay from '@/components/MissionCompletedOverlay';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  TutorialMissionTypeDto,
  UserInterestedThemeDto,
} from '@/generated-sources/openapi';
import {useFormExitConfirm} from '@/hooks/useFormExitConfirm';
import {useInterestedRegionGroupLabelMap} from '@/hooks/useListInterestedRegions';
import {
  useCompleteUserTutorialMission,
  useRegisterUserInterestedRegionsAndThemes,
  useUserTutorialProgress,
} from '@/hooks/useUserTutorialProgress';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import FormExitConfirmBottomSheet from '@/modals/FormExitConfirmBottomSheet';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ToastUtils from '@/utils/ToastUtils';

import InterestedFormField from './components/InterestedFormFields';
import RegionSelectBottomSheet from './components/RegionSelectBottomSheet';
import ThemeSelectBottomSheet from './components/ThemeSelectBottomSheet';
import {TUTORIAL_MISSION_1_DESCRIPTION} from './constants';
import {arraysEqualAsSets, regionsToChips, themesToChips} from './utils';

export interface InterestedRegionAndThemesFormScreenParams {}

/**
 * 튜토리얼 미션 1: 관심 지역 + 관심 주제 둘 다 입력하는 화면.
 *
 * 프로필에서 단독 변경하는 경우는 EditInterestedRegionScreen / EditInterestedThemesScreen을
 * 사용한다. 이 화면은 튜토리얼 진입 전용.
 */
export default function InterestedRegionAndThemesFormScreen({
  navigation,
}: ScreenProps<'InterestedRegionAndThemes'>) {
  const {userInfo} = useMe();
  const featureFlags = useAtomValue(featureFlagAtom);

  // USER_TUTORIAL feature flag 미대상 사용자가 deeplink 등으로 우회 진입한 경우 broken UX
  // 노출 방지. featureFlags === null (아직 getUserInfo 응답 전 / 익명 유저) 동안은 대기.
  useEffect(() => {
    if (featureFlags && !featureFlags.enabledFlags.has('USER_TUTORIAL')) {
      navigation.goBack();
    }
  }, [featureFlags, navigation]);

  const registerMutation = useRegisterUserInterestedRegionsAndThemes();
  const completeMission = useCompleteUserTutorialMission();
  const {data: progress} = useUserTutorialProgress();
  const wasMissionAlreadyCompleted =
    progress?.missions.find(
      m =>
        m.missionType ===
        TutorialMissionTypeDto.RegisterInterestedRegionsAndThemes,
    )?.completedAt != null;

  // 기존에 등록한 관심 지역/주제가 있으면 그 값으로 prefill.
  // userInfo 가 아직 fetch 전이면 빈 배열 (EditInterestedRegionScreen 과 동일 패턴).
  const initialRegionIds = userInfo?.interestedRegionIds ?? [];
  const initialThemes = userInfo?.interestedThemes ?? [];

  const [selectedRegionIds, setSelectedRegionIds] =
    useState<string[]>(initialRegionIds);
  const [selectedThemes, setSelectedThemes] =
    useState<UserInterestedThemeDto[]>(initialThemes);
  const [isRegionSheetOpen, setIsRegionSheetOpen] = useState(false);
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);
  const [showCollected, setShowCollected] = useState(false);
  // mutation 성공 후엔 form exit confirm 우회 (이미 저장됐으므로 dirty 의미 없음).
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isFormDirty =
    !arraysEqualAsSets(selectedRegionIds, initialRegionIds) ||
    !arraysEqualAsSets(selectedThemes, initialThemes);

  const formExitConfirm = useFormExitConfirm(
    action => {
      navigation.dispatch(action);
    },
    {enabled: isFormDirty && !hasSubmitted},
  );

  const handleSubmit = useCallback(() => {
    if (selectedRegionIds.length === 0) {
      ToastUtils.show('관심 지역을 1개 이상 선택해주세요.');
      return;
    }
    if (selectedThemes.length === 0) {
      ToastUtils.show('관심 주제를 1개 이상 선택해주세요.');
      return;
    }
    registerMutation.mutate(
      {
        interestedRegionIds: selectedRegionIds,
        interestedThemes: selectedThemes,
      },
      {
        onSuccess: () => {
          setHasSubmitted(true);
          // 이 화면은 튜토리얼 미션 1 전용 진입 (라우트 자체가 분리되어 있음).
          // 등록 직후 미션 완료를 명시 호출한다 — 서버는 register API 에서 자동
          // 미션 완료를 더 이상 수행하지 않으므로 이 호출이 없으면 미션이 미완료로 남는다.
          completeMission.mutate(
            {
              missionType:
                TutorialMissionTypeDto.RegisterInterestedRegionsAndThemes,
            },
            {
              onSettled: () => {
                if (!wasMissionAlreadyCompleted) {
                  setShowCollected(true);
                } else {
                  formExitConfirm.bypass();
                  navigation.popTo('TutorialMission', {});
                }
              },
            },
          );
        },
      },
    );
  }, [
    selectedRegionIds,
    selectedThemes,
    registerMutation,
    completeMission,
    wasMissionAlreadyCompleted,
    formExitConfirm,
    navigation,
  ]);

  const handleCollectedClose = useCallback(() => {
    // 이 화면은 튜토리얼 미션 1 전용. 미션 완료 팝업 "확인" 시 TutorialMissionScreen
    // 으로 popTo (native-stack v7 popTo 는 stack 에 있는 라우트까지 pop).
    setShowCollected(false);
    formExitConfirm.bypass();
    navigation.popTo('TutorialMission', {});
  }, [formExitConfirm, navigation]);

  const handleRegionConfirm = useCallback((nextSelectedIds: string[]) => {
    setSelectedRegionIds(nextSelectedIds);
    setIsRegionSheetOpen(false);
  }, []);

  const handleThemeConfirm = useCallback(
    (nextSelectedThemes: UserInterestedThemeDto[]) => {
      setSelectedThemes(nextSelectedThemes);
      setIsThemeSheetOpen(false);
    },
    [],
  );

  const regionLabelMap = useInterestedRegionGroupLabelMap();
  const regionChips = regionsToChips(selectedRegionIds, regionLabelMap);
  const themeChips = themesToChips(selectedThemes);

  const canSubmit = selectedRegionIds.length > 0 && selectedThemes.length > 0;

  return (
    <ScreenLayout isHeaderVisible={true} safeAreaEdges={['bottom']}>
      <LogParamsProvider
        params={{displaySectionName: 'interested_region_and_themes_form'}}>
        <Container>
          <Content>
            <TitleSection>
              <ScreenTitle>딱 맞는 정보를 추천할게요!</ScreenTitle>
              <Subtitle>{TUTORIAL_MISSION_1_DESCRIPTION}</Subtitle>
            </TitleSection>
            <FieldSection>
              <InterestedFormField
                label="관심 지역"
                selectedChips={regionChips}
                placeholder="여기를 클릭해서, 관심 지역을 알려주세요"
                elementName="interested_region_input"
                onPress={() => setIsRegionSheetOpen(true)}
              />
              <InterestedFormField
                label="관심 주제"
                selectedChips={themeChips}
                placeholder="관심 있는 주제를 알려주세요"
                elementName="interested_theme_input"
                onPress={() => setIsThemeSheetOpen(true)}
              />
            </FieldSection>
          </Content>
          <BottomBar>
            <SccButton
              text="완료"
              elementName="interested_region_themes_save_button"
              onPress={handleSubmit}
              buttonColor="brand40"
              textColor="white"
              fontFamily={font.pretendardSemibold}
              fontSize={18}
              height={56}
              isDisabled={!canSubmit || registerMutation.isPending}
              style={{borderRadius: 8}}
            />
          </BottomBar>
          {/*
           * dirty 조건은 useFormExitConfirm의 enabled로 처리하므로 BottomSheet는
           * 항상 마운트. (조건부 렌더링하면 enabled=true가 된 직후 첫 back 시 modal이
           * 마운트 전이라 사용자가 stuck 될 수 있다.)
           */}
          <FormExitConfirmBottomSheet
            isVisible={formExitConfirm.isVisible}
            onConfirm={formExitConfirm.onConfirm}
            onCancel={formExitConfirm.onCancel}
          />
          <RegionSelectBottomSheet
            isVisible={isRegionSheetOpen}
            initialSelectedGroupIds={selectedRegionIds}
            onConfirm={handleRegionConfirm}
            onClose={() => setIsRegionSheetOpen(false)}
          />
          <ThemeSelectBottomSheet
            isVisible={isThemeSheetOpen}
            initialSelectedThemes={selectedThemes}
            onConfirm={handleThemeConfirm}
            onClose={() => setIsThemeSheetOpen(false)}
          />
          {showCollected && (
            <MissionCompletedOverlay
              isVisible={true}
              itemImage={require('@/assets/img/tutorial/mission_complete_img_smartphone.png')}
              description={`계단뿌셔클럽 앱이 설치된 스마트폰 획득!\n${
                userInfo?.nickname ?? '크러셔'
              }님 덕분에 장소 찾기가 쉬워졌어요!`}
              confirmElementName="tutorial_mission_1_completed_confirm"
              onClose={handleCollectedClose}
            />
          )}
        </Container>
      </LogParamsProvider>
    </ScreenLayout>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${color.white};
`;

const Content = styled.View`
  flex: 1;
  padding: 10px 20px 40px;
  gap: 40px;
`;

const TitleSection = styled.View`
  gap: 12px;
`;

const ScreenTitle = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 24px;
  line-height: 32px;
  color: ${color.gray90v2};
`;

const Subtitle = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.gray70v2};
`;

const FieldSection = styled.View`
  gap: 36px;
`;

const BottomBar = styled.View`
  padding: 16px 20px 24px;
  background-color: ${color.white};
`;
