import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

import OptionsV2 from '../../PlaceFormV2Screen/components/OptionsV2';

const ACCESS_LEVEL_OPTIONS = [
  {value: 0, label: '레벨 0 (계단/턱 없음)'},
  {value: 1, label: '레벨 1 (계단 1칸, 엄지 반마디 이하)'},
  {value: 2, label: '레벨 2 (계단 1칸, 엄지 한마디 정도)'},
  {value: 3, label: '레벨 3 (계단 1칸, 엄지 한마디 이상)'},
  {value: 4, label: '레벨 4 (계단 2~5칸)'},
  {value: 5, label: '레벨 5 (계단 6칸 이상)'},
];

interface AccessLevelCorrectionSectionProps {
  currentLevel?: number;
  selectedLevel?: number;
  onChangeLevel: (level: number) => void;
}

export default function AccessLevelCorrectionSection({
  currentLevel,
  selectedLevel,
  onChangeLevel,
}: AccessLevelCorrectionSectionProps) {
  return (
    <Container>
      <SectionTitle>접근레벨</SectionTitle>

      {currentLevel !== undefined && (
        <CurrentLevelText>현재: 레벨 {currentLevel}</CurrentLevelText>
      )}

      <SubLabel>실제 접근레벨은?</SubLabel>
      <OptionsV2
        options={ACCESS_LEVEL_OPTIONS}
        value={selectedLevel}
        columns={1}
        onSelect={onChangeLevel}
      />
    </Container>
  );
}

// Styled components
const Container = styled.View``;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-family: ${font.pretendardBold};
  color: ${color.black};
  margin-bottom: 12px;
`;

const CurrentLevelText = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  color: ${color.brandColor};
  margin-bottom: 12px;
`;

const SubLabel = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray60};
  margin-bottom: 8px;
`;
