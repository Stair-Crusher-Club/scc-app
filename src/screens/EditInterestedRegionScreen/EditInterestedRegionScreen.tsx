import React, {useCallback, useState} from 'react';
import styled from 'styled-components/native';

import {useMe} from '@/atoms/Auth';
import {SccButton} from '@/components/atoms';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {useFormExitConfirm} from '@/hooks/useFormExitConfirm';
import {useInterestedRegionGroupLabelMap} from '@/hooks/useListInterestedRegions';
import {useRegisterUserInterestedRegionsAndThemes} from '@/hooks/useUserTutorialProgress';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import FormExitConfirmBottomSheet from '@/modals/FormExitConfirmBottomSheet';
import {ScreenProps} from '@/navigation/Navigation.screens';
import RegionSelectBottomSheet from '@/screens/InterestedRegionAndThemesFormScreen/components/RegionSelectBottomSheet';
import InterestedFormField from '@/screens/InterestedRegionAndThemesFormScreen/components/InterestedFormFields';
import {
  arraysEqualAsSets,
  regionsToChips,
} from '@/screens/InterestedRegionAndThemesFormScreen/utils';
import ToastUtils from '@/utils/ToastUtils';

export interface EditInterestedRegionScreenParams {}

/**
 * 프로필 수정에서 관심 지역만 변경하는 화면. 기존 값(useMe().userInfo.interestedRegionIds)을
 * 초기값으로 채운 채로 등장한다.
 *
 * 저장 시 관심 테마는 기존 값을 그대로 유지한다 (서버 API가 둘 다 받는 구조이므로).
 */
export default function EditInterestedRegionScreen({
  navigation,
}: ScreenProps<'EditInterestedRegion'>) {
  const {userInfo} = useMe();
  const initialRegionIds = userInfo?.interestedRegionIds ?? [];
  const interestedThemes = userInfo?.interestedThemes ?? [];

  const [selectedRegionIds, setSelectedRegionIds] =
    useState<string[]>(initialRegionIds);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const registerMutation = useRegisterUserInterestedRegionsAndThemes();
  const regionLabelMap = useInterestedRegionGroupLabelMap();
  const regionChips = regionsToChips(selectedRegionIds, regionLabelMap);

  const isFormDirty = !arraysEqualAsSets(selectedRegionIds, initialRegionIds);
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
    registerMutation.mutate(
      {
        interestedRegionIds: selectedRegionIds,
        interestedThemes,
      },
      {
        onSuccess: () => {
          setHasSubmitted(true);
          ToastUtils.show('저장되었습니다.');
          navigation.goBack();
        },
      },
    );
  }, [selectedRegionIds, interestedThemes, registerMutation, navigation]);

  const handleSheetConfirm = useCallback((nextSelectedIds: string[]) => {
    setSelectedRegionIds(nextSelectedIds);
    setIsSheetOpen(false);
  }, []);

  const canSubmit = selectedRegionIds.length > 0;

  return (
    <ScreenLayout isHeaderVisible={true} safeAreaEdges={['bottom']}>
      <LogParamsProvider
        params={{displaySectionName: 'edit_interested_region'}}>
        <Container>
          <Content>
            <TitleSection>
              <ScreenTitle>관심 지역을 선택해주세요</ScreenTitle>
            </TitleSection>
            <InterestedFormField
              label="관심 지역"
              selectedChips={regionChips}
              placeholder="관심 있는 지역을 알려주세요"
              elementName="interested_region_input"
              onPress={() => setIsSheetOpen(true)}
            />
          </Content>
          <BottomBar>
            <SccButton
              text="확인"
              elementName="interested_region_save_button"
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
          <FormExitConfirmBottomSheet
            isVisible={formExitConfirm.isVisible}
            onConfirm={formExitConfirm.onConfirm}
            onCancel={formExitConfirm.onCancel}
          />
          <RegionSelectBottomSheet
            isVisible={isSheetOpen}
            initialSelectedGroupIds={selectedRegionIds}
            onConfirm={handleSheetConfirm}
            onClose={() => setIsSheetOpen(false)}
          />
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

const BottomBar = styled.View`
  padding: 16px 20px 24px;
  background-color: ${color.white};
`;
