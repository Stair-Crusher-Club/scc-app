import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

import OptionsV2 from '../../PlaceFormV2Screen/components/OptionsV2';
import {SectionRoot, SubLabel} from './shared';

const ACCESS_LEVEL_OPTIONS = [
  {value: 0, label: '접근레벨 0 (계단/턱 없음)'},
  {value: 1, label: '접근레벨 1 (계단 1칸, 엄지 반마디 이하)'},
  {value: 2, label: '접근레벨 2 (계단 1칸, 엄지 한마디 정도)'},
  {value: 3, label: '접근레벨 3 (계단 1칸, 엄지 한마디 이상)'},
  {value: 4, label: '접근레벨 4 (계단 2~5칸)'},
  {value: 5, label: '접근레벨 5 (계단 6칸 이상)'},
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
    <SectionRoot>
      <Group>
        <Header>
          <SubLabel>실제 접근 레벨을 확인해주세요</SubLabel>
          {currentLevel !== undefined && (
            <CurrentLevelText>현재: 접근레벨 {currentLevel}</CurrentLevelText>
          )}
        </Header>
        <OptionsV2
          options={ACCESS_LEVEL_OPTIONS}
          value={selectedLevel}
          columns={1}
          onSelect={onChangeLevel}
        />
      </Group>
    </SectionRoot>
  );
}

const Group = styled.View`
  gap: 16px;
  padding-bottom: 12px;
`;

const Header = styled.View`
  gap: 12px;
`;

const CurrentLevelText = styled.Text`
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  font-family: ${font.pretendardMedium};
  color: ${color.brandColor};
`;
