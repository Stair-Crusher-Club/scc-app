import React from 'react';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {StairInfo, StairHeightLevel} from '@/generated-sources/openapi';

interface EntranceCorrectionSectionProps {
  stairInfo?: StairInfo;
  stairHeightLevel?: StairHeightLevel;
  hasSlope?: boolean;
  onChangeStairInfo: (value: StairInfo) => void;
  onChangeStairHeightLevel: (value: StairHeightLevel) => void;
  onChangeHasSlope: (value: boolean) => void;
}

const STAIR_INFO_OPTIONS: {value: StairInfo; label: string}[] = [
  {value: StairInfo.None, label: '없음'},
  {value: StairInfo.One, label: '1칸'},
  {value: StairInfo.TwoToFive, label: '2~5칸'},
  {value: StairInfo.OverSix, label: '6칸 이상'},
];

const STAIR_HEIGHT_OPTIONS: {value: StairHeightLevel; label: string}[] = [
  {value: StairHeightLevel.HalfThumb, label: '반마디'},
  {value: StairHeightLevel.Thumb, label: '한마디'},
  {value: StairHeightLevel.OverThumb, label: '한마디 이상'},
];

export default function EntranceCorrectionSection({
  stairInfo,
  stairHeightLevel,
  hasSlope,
  onChangeStairInfo,
  onChangeStairHeightLevel,
  onChangeHasSlope,
}: EntranceCorrectionSectionProps) {
  return (
    <Container>
      <SectionTitle>입구 정보</SectionTitle>

      <SubLabel>계단 수</SubLabel>
      <OptionRow>
        {STAIR_INFO_OPTIONS.map(option => {
          const isSelected = stairInfo === option.value;
          return (
            <OptionItem key={option.value}>
              <SccButton
                text={option.label}
                textColor={isSelected ? 'brandColor' : 'gray70'}
                buttonColor="white"
                borderColor={isSelected ? 'blue50' : 'gray30'}
                onPress={() => onChangeStairInfo(option.value)}
                elementName="report_correction_stair_info"
                logParams={{value: option.value}}
              />
            </OptionItem>
          );
        })}
      </OptionRow>

      {stairInfo === StairInfo.One && (
        <>
          <SubLabel>계단 높이</SubLabel>
          <OptionRow>
            {STAIR_HEIGHT_OPTIONS.map(option => {
              const isSelected = stairHeightLevel === option.value;
              return (
                <OptionItem key={option.value}>
                  <SccButton
                    text={option.label}
                    textColor={isSelected ? 'brandColor' : 'gray70'}
                    buttonColor="white"
                    borderColor={isSelected ? 'blue50' : 'gray30'}
                    onPress={() => onChangeStairHeightLevel(option.value)}
                    elementName="report_correction_stair_height"
                    logParams={{value: option.value}}
                  />
                </OptionItem>
              );
            })}
          </OptionRow>
        </>
      )}

      <SubLabel>경사로</SubLabel>
      <OptionRow>
        {[
          {value: true, label: '있음'},
          {value: false, label: '없음'},
        ].map(option => {
          const isSelected = hasSlope === option.value;
          return (
            <OptionItem key={String(option.value)}>
              <SccButton
                text={option.label}
                textColor={isSelected ? 'brandColor' : 'gray70'}
                buttonColor="white"
                borderColor={isSelected ? 'blue50' : 'gray30'}
                onPress={() => onChangeHasSlope(option.value)}
                elementName="report_correction_has_slope"
                logParams={{value: option.value}}
              />
            </OptionItem>
          );
        })}
      </OptionRow>
    </Container>
  );
}

const Container = styled.View``;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-family: ${font.pretendardBold};
  color: ${color.black};
  margin-bottom: 16px;
`;

const SubLabel = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray60};
  margin-bottom: 8px;
  margin-top: 4px;
`;

const OptionRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const OptionItem = styled.View`
  min-width: 70px;
`;
