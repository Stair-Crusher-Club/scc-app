import React, {useCallback, useLayoutEffect, useMemo, useState} from 'react';
import styled from 'styled-components/native';

import {useMe} from '@/atoms/Auth';
import {useInterestedRegionsAndThemesCache} from '@/atoms/InterestedRegionsAndThemes';
import {SccButton} from '@/components/atoms';
import MissionCompletedOverlay from '@/components/MissionCompletedOverlay';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  TutorialMissionTypeDto,
  UserInterestedThemeDto,
} from '@/generated-sources/openapi';
import {useFormExitConfirm} from '@/hooks/useFormExitConfirm';
import {useInterestedRegionGroupLabelMap} from '@/hooks/useListInterestedRegions';
import {useMissionCompletionWatcher} from '@/hooks/useMissionCompletionWatcher';
import {
  useRegisterUserInterestedRegionsAndThemes,
  useUserTutorialProgress,
} from '@/hooks/useUserTutorialProgress';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import FormExitConfirmBottomSheet from '@/modals/FormExitConfirmBottomSheet';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ToastUtils from '@/utils/ToastUtils';

import RegionSelectBottomSheet from './components/RegionSelectBottomSheet';
import ThemeSelectBottomSheet from './components/ThemeSelectBottomSheet';
import {
  THEME_LABEL_BY_VALUE,
  TUTORIAL_MISSION_1_DESCRIPTION,
} from './constants';

/**
 * 화면 모드.
 * - 'both': 관심 지역 + 관심 주제 둘 다 입력 (튜토리얼 미션 1 진입).
 * - 'region': 관심 지역만 입력 (프로필 수정 진입).
 * - 'theme': 관심 주제만 입력 (프로필 수정 진입).
 */
export type InterestedRegionAndThemesFormMode = 'both' | 'region' | 'theme';

export interface InterestedRegionAndThemesFormScreenParams {
  /** 튜토리얼 미션 컨텍스트로 진입한 경우 true. 성공 시 미션 완료 오버레이를 노출. */
  fromTutorial?: boolean;
  /** 화면 모드. 기본값 'both'. */
  mode?: InterestedRegionAndThemesFormMode;
  /** 프로필 수정 진입 시 기존에 저장된 값으로 폼을 초기화하기 위한 prop. */
  initialRegionIds?: string[];
  initialThemes?: UserInterestedThemeDto[];
}

export default function InterestedRegionAndThemesFormScreen({
  route,
  navigation,
}: ScreenProps<'InterestedRegionAndThemes'>) {
  const fromTutorial = route.params?.fromTutorial ?? false;
  const mode: InterestedRegionAndThemesFormMode = route.params?.mode ?? 'both';

  // 프로필 수정에서 진입한 경우, navigation param에 명시적 초기값이 없으면 로컬 캐시를 사용.
  // 튜토리얼에서는 항상 빈 값으로 시작.
  const cache = useInterestedRegionsAndThemesCache();
  const initialRegionIds = useMemo(
    () =>
      route.params?.initialRegionIds ??
      (fromTutorial ? [] : cache.interestedRegionIds),
    [route.params?.initialRegionIds, fromTutorial, cache.interestedRegionIds],
  );
  const initialThemes = useMemo(
    () =>
      route.params?.initialThemes ??
      (fromTutorial ? [] : cache.interestedThemes),
    [route.params?.initialThemes, fromTutorial, cache.interestedThemes],
  );

  const registerMutation = useRegisterUserInterestedRegionsAndThemes();
  const {data: tutorialProgress} = useUserTutorialProgress();
  const {userInfo} = useMe();

  const [selectedRegionIds, setSelectedRegionIds] =
    useState<string[]>(initialRegionIds);
  const [selectedThemes, setSelectedThemes] =
    useState<UserInterestedThemeDto[]>(initialThemes);
  const [isRegionSheetOpen, setIsRegionSheetOpen] = useState(false);
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);
  const [showCollected, setShowCollected] = useState(false);

  // 튜토리얼: 미션 완료 오버레이 노출 제어.
  // REGISTER 미션이 미완료 → 완료로 전환된 경우에만 1회 노출한다.
  // (이미 완료된 미션을 재제출하는 프로필 수정 컨텍스트에서는 노출하지 않음.)
  const isRegisterMissionCompleted = useMemo(
    () =>
      tutorialProgress?.missions?.some(
        m =>
          m.missionType ===
            TutorialMissionTypeDto.RegisterInterestedRegionsAndThemes &&
          m.completedAt != null,
      ) ?? false,
    [tutorialProgress],
  );
  useMissionCompletionWatcher({
    enabled: fromTutorial,
    isMissionCompleted: isRegisterMissionCompleted,
    onJustCompleted: useCallback(() => {
      setShowCollected(true);
    }, []),
  });

  const showRegion = mode === 'both' || mode === 'region';
  const showTheme = mode === 'both' || mode === 'theme';

  // 튜토리얼 컨텍스트는 X 닫기 버튼 (Figma 1648-38721),
  // 프로필 수정 컨텍스트는 < 뒤로 가기 버튼 (Figma 1648-38731/38746)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      ...(fromTutorial && {variant: 'close'}),
    } as Parameters<typeof navigation.setOptions>[0]);
  }, [fromTutorial, navigation]);

  const isFormDirty = useMemo(() => {
    if (showRegion && !arraysEqualAsSets(selectedRegionIds, initialRegionIds)) {
      return true;
    }
    if (showTheme && !arraysEqualAsSets(selectedThemes, initialThemes)) {
      return true;
    }
    return false;
  }, [
    showRegion,
    showTheme,
    selectedRegionIds,
    initialRegionIds,
    selectedThemes,
    initialThemes,
  ]);

  // 폼 작성 중 뒤로 가기 시 확인 (변경 사항이 있을 때만 modal trigger)
  const formExitConfirm = useFormExitConfirm(
    action => {
      navigation.dispatch(action);
    },
    {enabled: isFormDirty},
  );

  const handleSubmit = useCallback(() => {
    if (showRegion && selectedRegionIds.length === 0) {
      ToastUtils.show('관심 지역을 1개 이상 선택해주세요.');
      return;
    }
    if (showTheme && selectedThemes.length === 0) {
      ToastUtils.show('관심 주제를 1개 이상 선택해주세요.');
      return;
    }
    // useRegisterUserInterestedRegionsAndThemes의 onSuccess가 이미 progress query를
    // invalidate하므로 여기서 중복으로 invalidate하지 않는다.
    // 단일 필드 모드(region/theme)에서는 다른 필드는 기존 값을 그대로 전송한다.
    const finalRegionIds = showRegion ? selectedRegionIds : initialRegionIds;
    const finalThemes = showTheme ? selectedThemes : initialThemes;
    registerMutation.mutate(
      {
        interestedRegionIds: finalRegionIds,
        interestedThemes: finalThemes,
      },
      {
        onSuccess: () => {
          // 로컬 캐시 업데이트 — 프로필 수정 화면 등에서 표시.
          cache.setCache({
            interestedRegionIds: finalRegionIds,
            interestedThemes: finalThemes,
          });
          if (!fromTutorial) {
            ToastUtils.show('저장되었습니다.');
            navigation.goBack();
          }
          // fromTutorial=true인 경우, useMissionCompletionWatcher가
          // 서버 progress 변화를 감지하여 오버레이를 띄운다.
        },
      },
    );
  }, [
    showRegion,
    showTheme,
    selectedRegionIds,
    selectedThemes,
    initialRegionIds,
    initialThemes,
    registerMutation,
    fromTutorial,
    navigation,
    cache,
  ]);

  const handleCollectedClose = useCallback(() => {
    setShowCollected(false);
    navigation.goBack();
  }, [navigation]);

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

  // 화면 본문 타이틀
  const screenTitle = useMemo(() => {
    if (fromTutorial) {
      return '딱 맞는 정보를 추천할게요!';
    }
    if (mode === 'theme') {
      return '관심 주제를 선택해주세요';
    }
    return '관심 지역을 선택해주세요';
  }, [fromTutorial, mode]);

  const regionLabelMap = useInterestedRegionGroupLabelMap();
  const regionSummary = formatRegionSummary(selectedRegionIds, regionLabelMap);
  const themeSummary = formatThemeSummary(selectedThemes);

  const canSubmit = useMemo(() => {
    if (showRegion && selectedRegionIds.length === 0) {
      return false;
    }
    if (showTheme && selectedThemes.length === 0) {
      return false;
    }
    return true;
  }, [showRegion, showTheme, selectedRegionIds, selectedThemes]);

  // 튜토리얼 컨텍스트에서는 region placeholder가 "여기를 클릭해서, ..."로 더 친절함.
  const regionPlaceholder = fromTutorial
    ? '여기를 클릭해서, 관심 지역을 알려주세요'
    : '관심 있는 지역을 알려주세요';
  const themePlaceholder = '관심 있는 주제를 알려주세요';

  // 버튼 텍스트: 튜토리얼 / theme 단독 → "완료", region 단독 → "확인" (Figma 1648-38731)
  const submitButtonText = mode === 'region' && !fromTutorial ? '확인' : '완료';

  return (
    <ScreenLayout isHeaderVisible={true}>
      <LogParamsProvider
        params={{displaySectionName: 'interested_region_and_themes_form'}}>
        <Container>
          <Content>
            <TitleSection>
              <ScreenTitle>{screenTitle}</ScreenTitle>
              {fromTutorial && (
                <Subtitle>{TUTORIAL_MISSION_1_DESCRIPTION}</Subtitle>
              )}
            </TitleSection>
            <FieldSection>
              {showRegion && (
                <Field>
                  <FieldLabel>관심 지역</FieldLabel>
                  <InputRow
                    elementName="interested_region_input"
                    onPress={() => setIsRegionSheetOpen(true)}>
                    <InputText filled={regionSummary !== null}>
                      {regionSummary ?? regionPlaceholder}
                    </InputText>
                  </InputRow>
                </Field>
              )}
              {showTheme && (
                <Field>
                  <FieldLabel>관심 주제</FieldLabel>
                  <InputRow
                    elementName="interested_theme_input"
                    onPress={() => setIsThemeSheetOpen(true)}>
                    <InputText filled={themeSummary !== null}>
                      {themeSummary ?? themePlaceholder}
                    </InputText>
                  </InputRow>
                </Field>
              )}
            </FieldSection>
          </Content>
          <BottomBar>
            <SccButton
              text={submitButtonText}
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
              itemImage={require('@/assets/img/tutorial/item_smartphone.png')}
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

function formatRegionSummary(
  selectedRegionIds: string[],
  labelMap: Record<string, string>,
): string | null {
  if (selectedRegionIds.length === 0) {
    return null;
  }
  return selectedRegionIds.map(id => labelMap[id] ?? id).join(', ');
}

function formatThemeSummary(
  selectedThemes: UserInterestedThemeDto[],
): string | null {
  if (selectedThemes.length === 0) {
    return null;
  }
  return selectedThemes.map(theme => THEME_LABEL_BY_VALUE[theme]).join(', ');
}

function arraysEqualAsSets<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const setB = new Set(b);
  return a.every(item => setB.has(item));
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

const Field = styled.View`
  gap: 8px;
`;

const FieldLabel = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.26px;
  color: ${color.gray80v2};
`;

const InputRow = styled(SccPressable)`
  width: 100%;
  height: 34px;
  padding-bottom: 8px;
  border-bottom-width: 1.5px;
  border-bottom-color: ${color.gray20};
  justify-content: center;
`;

const InputText = styled.Text<{filled: boolean}>`
  font-family: ${({filled}) =>
    filled ? font.pretendardMedium : font.pretendardRegular};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${({filled}) => (filled ? color.gray90v2 : color.gray40)};
`;

const BottomBar = styled.View`
  padding: 16px 20px 24px;
  background-color: ${color.white};
`;
