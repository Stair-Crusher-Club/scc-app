import React, {useCallback, useState} from 'react';
import styled from 'styled-components/native';

import {useMe} from '@/atoms/Auth';
import {SccButton} from '@/components/atoms';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {UserInterestedThemeDto} from '@/generated-sources/openapi';
import {useFormExitConfirm} from '@/hooks/useFormExitConfirm';
import {useRegisterUserInterestedRegionsAndThemes} from '@/hooks/useUserTutorialProgress';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import FormExitConfirmBottomSheet from '@/modals/FormExitConfirmBottomSheet';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ThemeSelectBottomSheet from '@/screens/InterestedRegionAndThemesFormScreen/components/ThemeSelectBottomSheet';
import InterestedFormField from '@/screens/InterestedRegionAndThemesFormScreen/components/InterestedFormFields';
import {
  arraysEqualAsSets,
  themesToChips,
} from '@/screens/InterestedRegionAndThemesFormScreen/utils';
import ToastUtils from '@/utils/ToastUtils';

export interface EditInterestedThemesScreenParams {}

/**
 * 프로필 수정에서 관심 주제만 변경하는 화면. 기존 값(useMe().userInfo.interestedThemes)을
 * 초기값으로 채운 채로 등장한다.
 *
 * 저장 시 관심 지역은 기존 값을 그대로 유지한다 (서버 API가 둘 다 받는 구조이므로).
 */
export default function EditInterestedThemesScreen({
  navigation,
}: ScreenProps<'EditInterestedThemes'>) {
  const {userInfo} = useMe();
  const interestedRegionIds = userInfo?.interestedRegionIds ?? [];
  const initialThemes = userInfo?.interestedThemes ?? [];

  const [selectedThemes, setSelectedThemes] =
    useState<UserInterestedThemeDto[]>(initialThemes);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const registerMutation = useRegisterUserInterestedRegionsAndThemes();
  const themeChips = themesToChips(selectedThemes);

  const isFormDirty = !arraysEqualAsSets(selectedThemes, initialThemes);
  const formExitConfirm = useFormExitConfirm(
    action => {
      navigation.dispatch(action);
    },
    {enabled: isFormDirty && !hasSubmitted},
  );

  const handleSubmit = useCallback(() => {
    if (selectedThemes.length === 0) {
      ToastUtils.show('관심 주제를 1개 이상 선택해주세요.');
      return;
    }
    registerMutation.mutate(
      {
        interestedRegionIds,
        interestedThemes: selectedThemes,
      },
      {
        onSuccess: () => {
          setHasSubmitted(true);
          ToastUtils.show('저장되었습니다.');
          navigation.goBack();
        },
      },
    );
  }, [selectedThemes, interestedRegionIds, registerMutation, navigation]);

  const handleSheetConfirm = useCallback(
    (nextSelectedThemes: UserInterestedThemeDto[]) => {
      setSelectedThemes(nextSelectedThemes);
      setIsSheetOpen(false);
    },
    [],
  );

  const canSubmit = selectedThemes.length > 0;

  return (
    <ScreenLayout isHeaderVisible={true} safeAreaEdges={['bottom']}>
      <LogParamsProvider
        params={{displaySectionName: 'edit_interested_themes'}}>
        <Container>
          <Content>
            <TitleSection>
              <ScreenTitle>관심 주제를 선택해주세요</ScreenTitle>
            </TitleSection>
            <InterestedFormField
              label="관심 주제"
              selectedChips={themeChips}
              placeholder="관심 있는 주제를 알려주세요"
              elementName="interested_theme_input"
              onPress={() => setIsSheetOpen(true)}
            />
          </Content>
          <BottomBar>
            <SccButton
              text="완료"
              elementName="interested_themes_save_button"
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
          <ThemeSelectBottomSheet
            isVisible={isSheetOpen}
            initialSelectedThemes={selectedThemes}
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
