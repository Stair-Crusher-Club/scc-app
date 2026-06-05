import React, {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {UserInterestedThemeDto} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import BottomSheet from '@/modals/BottomSheet/BottomSheet';

import {THEME_OPTIONS} from '../constants';

interface ThemeSelectBottomSheetProps {
  isVisible: boolean;
  initialSelectedThemes: UserInterestedThemeDto[];
  onConfirm: (selectedThemes: UserInterestedThemeDto[]) => void;
  onClose: () => void;
}

/**
 * 관심 주제(테마) 선택 바텀시트.
 *
 * Figma 1629:29991 디자인 기준:
 * - 2-column grid 8개. 각 칩은 이모지 + 라벨.
 * - 선택 시 brand 색 border, 선택 안 됨은 gray border.
 * - 하단 "확인" 버튼: 선택된 테마 1개 이상일 때 활성.
 */
export default function ThemeSelectBottomSheet({
  isVisible,
  initialSelectedThemes,
  onConfirm,
  onClose,
}: ThemeSelectBottomSheetProps) {
  const [selectedThemes, setSelectedThemes] = useState<
    UserInterestedThemeDto[]
  >(initialSelectedThemes);

  useEffect(() => {
    if (isVisible) {
      setSelectedThemes(initialSelectedThemes);
    }
  }, [isVisible, initialSelectedThemes]);

  const toggleTheme = useCallback((theme: UserInterestedThemeDto) => {
    setSelectedThemes(prev =>
      prev.includes(theme) ? prev.filter(p => p !== theme) : [...prev, theme],
    );
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(selectedThemes);
  }, [selectedThemes, onConfirm]);

  const isConfirmEnabled = selectedThemes.length > 0;

  return (
    <BottomSheet isVisible={isVisible} onPressBackground={onClose}>
      <LogParamsProvider
        params={{displaySectionName: 'interested_theme_bottom_sheet'}}>
        <SheetHeader>
          <SheetHandle />
        </SheetHeader>
        <ContentsContainer>
          <TitleArea>
            <Title>관심 주제를 모두 선택해주세요.</Title>
            <Description>
              맞춤 정보 제공 및 탐색을 위해 필요한 정보입니다.
            </Description>
          </TitleArea>
          <ThemeGrid>
            {THEME_OPTIONS.map(theme => {
              const isSelected = selectedThemes.includes(theme.value);
              return (
                <ThemeChip
                  key={theme.value}
                  elementName="interested_theme_chip"
                  logParams={{theme: theme.value}}
                  onPress={() => toggleTheme(theme.value)}
                  selected={isSelected}>
                  <ThemeChipText selected={isSelected}>
                    {theme.label}
                  </ThemeChipText>
                </ThemeChip>
              );
            })}
          </ThemeGrid>
        </ContentsContainer>
        <BottomBar>
          <SccButton
            text="확인"
            elementName="interested_theme_confirm_button"
            onPress={handleConfirm}
            buttonColor="brand40"
            textColor="white"
            fontFamily={font.pretendardSemibold}
            fontSize={18}
            height={56}
            isDisabled={!isConfirmEnabled}
            style={{borderRadius: 8}}
          />
        </BottomBar>
      </LogParamsProvider>
    </BottomSheet>
  );
}

const SheetHeader = styled.View`
  width: 100%;
  height: 36px;
  align-items: center;
  justify-content: center;
  padding-bottom: 4px;
`;

const SheetHandle = styled.View`
  width: 48px;
  height: 4px;
  border-radius: 2px;
  background-color: ${color.gray20v2};
`;

const ContentsContainer = styled.View`
  padding: 0 20px 20px;
  background-color: ${color.white};
`;

const TitleArea = styled.View`
  gap: 4px;
`;

const Title = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 22px;
  line-height: 30px;
  letter-spacing: -0.44px;
  color: ${color.black};
`;

const Description = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.gray70v2};
`;

const ThemeGrid = styled.View`
  margin-top: 20px;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`;

const ThemeChip = styled(SccPressable)<{selected: boolean}>`
  /* 고정 width(169px) 는 좁은 폰에서 2칸이 한 줄에 안 들어가 1-column 으로 깨진다.
     flex-basis 40% + flex-grow 1 로 화면 폭과 무관하게 항상 2-column 이 되도록 한다
     (3번째는 120% 라 자동 줄바꿈, 같은 줄 2칸은 grow 로 남은 폭을 채움). */
  flex-grow: 1;
  flex-basis: 40%;
  padding: 14px 8px;
  border-radius: 14px;
  border-width: 1.2px;
  border-color: ${({selected}) => (selected ? color.brand40 : color.gray20v2)};
  background-color: ${({selected}) => (selected ? color.brand10 : color.white)};
  align-items: center;
  justify-content: center;
`;

const ThemeChipText = styled.Text<{selected: boolean}>`
  font-family: ${({selected}) =>
    selected ? font.pretendardSemibold : font.pretendardMedium};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  text-align: center;
  color: ${({selected}) => (selected ? color.brand50 : color.gray80v2)};
`;

const BottomBar = styled.View`
  padding: 16px 20px 24px;
  background-color: ${color.white};
`;
