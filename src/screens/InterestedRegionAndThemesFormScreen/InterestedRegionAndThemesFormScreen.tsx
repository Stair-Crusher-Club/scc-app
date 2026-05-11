import React, {useCallback, useState} from 'react';
import {ScrollView} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {UserInterestedThemeDto} from '@/generated-sources/openapi';
import {useFormExitConfirm} from '@/hooks/useFormExitConfirm';
import {useRegisterUserInterestedRegionsAndThemes} from '@/hooks/useUserTutorialProgress';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import FormExitConfirmBottomSheet from '@/modals/FormExitConfirmBottomSheet';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ToastUtils from '@/utils/ToastUtils';

import MissionItemCollectedBottomSheet from './components/MissionItemCollectedBottomSheet';
import {REGION_OPTIONS, THEME_OPTIONS} from './constants';

export interface InterestedRegionAndThemesFormScreenParams {
  /** 튜토리얼 미션 컨텍스트로 진입한 경우 true. 성공 시 외출템 수집 팝업을 노출. */
  fromTutorial?: boolean;
}

export default function InterestedRegionAndThemesFormScreen({
  route,
  navigation,
}: ScreenProps<'InterestedRegionAndThemes'>) {
  const fromTutorial = route.params?.fromTutorial ?? false;
  const registerMutation = useRegisterUserInterestedRegionsAndThemes();

  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<
    UserInterestedThemeDto[]
  >([]);
  const [showCollected, setShowCollected] = useState(false);

  const isFormDirty = selectedRegionIds.length > 0 || selectedThemes.length > 0;

  // 폼 작성 중 뒤로 가기 시 확인 (변경 사항이 있을 때만 modal trigger)
  const formExitConfirm = useFormExitConfirm(
    action => {
      navigation.dispatch(action);
    },
    {enabled: isFormDirty},
  );

  const toggleRegion = useCallback((id: string) => {
    setSelectedRegionIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id],
    );
  }, []);

  const toggleTheme = useCallback((theme: UserInterestedThemeDto) => {
    setSelectedThemes(prev =>
      prev.includes(theme) ? prev.filter(p => p !== theme) : [...prev, theme],
    );
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedRegionIds.length === 0 && selectedThemes.length === 0) {
      ToastUtils.show('관심지역 또는 관심테마를 최소 1개 이상 선택해주세요.');
      return;
    }
    // useRegisterUserInterestedRegionsAndThemes의 onSuccess가 이미 progress query를
    // invalidate하므로 여기서 중복으로 invalidate하지 않는다.
    registerMutation.mutate(
      {
        interestedRegionIds: selectedRegionIds,
        interestedThemes: selectedThemes,
      },
      {
        onSuccess: () => {
          if (fromTutorial) {
            // 외출템 수집 팝업을 띄우고 닫을 때 goBack
            setShowCollected(true);
          } else {
            ToastUtils.show('관심지역/관심테마가 저장되었습니다.');
            navigation.goBack();
          }
        },
      },
    );
  }, [
    selectedRegionIds,
    selectedThemes,
    registerMutation,
    fromTutorial,
    navigation,
  ]);

  const handleCollectedClose = useCallback(() => {
    setShowCollected(false);
    navigation.goBack();
  }, [navigation]);

  return (
    <ScreenLayout isHeaderVisible={true}>
      <LogParamsProvider
        params={{displaySectionName: 'interested_region_and_themes_form'}}>
        <Container>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Section>
              <SectionTitle>관심 지역</SectionTitle>
              <SectionDescription>
                자주 가고 싶은 지역을 선택해주세요. (복수 선택 가능)
              </SectionDescription>
              <ChipGrid>
                {REGION_OPTIONS.map(region => {
                  const isSelected = selectedRegionIds.includes(region.id);
                  return (
                    <Chip
                      key={region.id}
                      elementName="interested_region_chip"
                      logParams={{region_id: region.id}}
                      onPress={() => toggleRegion(region.id)}
                      selected={isSelected}>
                      <ChipText selected={isSelected}>{region.label}</ChipText>
                    </Chip>
                  );
                })}
              </ChipGrid>
            </Section>

            <Section>
              <SectionTitle>관심 테마</SectionTitle>
              <SectionDescription>
                관심있는 장소 종류를 선택해주세요. (복수 선택 가능)
              </SectionDescription>
              <ChipGrid>
                {THEME_OPTIONS.map(theme => {
                  const isSelected = selectedThemes.includes(theme.value);
                  return (
                    <Chip
                      key={theme.value}
                      elementName="interested_theme_chip"
                      logParams={{theme: theme.value}}
                      onPress={() => toggleTheme(theme.value)}
                      selected={isSelected}>
                      <ChipText selected={isSelected}>{theme.label}</ChipText>
                    </Chip>
                  );
                })}
              </ChipGrid>
            </Section>
          </ScrollView>
          <BottomBar>
            <SccButton
              text="저장"
              elementName="interested_region_themes_save_button"
              onPress={handleSubmit}
              buttonColor="brand40"
              textColor="white"
              fontFamily={font.pretendardSemibold}
              fontSize={16}
              height={52}
              isDisabled={registerMutation.isPending}
              style={{borderRadius: 12}}
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
          {showCollected && (
            <MissionItemCollectedBottomSheet
              isVisible={true}
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

const Section = styled.View`
  padding: 24px 20px 8px;
`;

const SectionTitle = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.black};
`;

const SectionDescription = styled.Text`
  margin-top: 4px;
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.26px;
  color: ${color.gray70};
`;

const ChipGrid = styled.View`
  margin-top: 16px;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled(SccPressable)<{selected: boolean}>`
  border-width: 1px;
  border-color: ${({selected}) => (selected ? color.brand40 : color.gray20v2)};
  background-color: ${({selected}) => (selected ? color.brand10 : color.white)};
  border-radius: 100px;
  padding: 8px 14px;
`;

const ChipText = styled.Text<{selected: boolean}>`
  font-family: ${({selected}) =>
    selected ? font.pretendardSemibold : font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${({selected}) => (selected ? color.brand50 : color.gray70)};
`;

const BottomBar = styled.View`
  padding: 12px 20px 24px;
  border-top-width: 1px;
  border-top-color: #f2f2f5;
  background-color: ${color.white};
`;
