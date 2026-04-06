import React, {useCallback} from 'react';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  ElevatorAccessibilityDto,
  StairInfo,
  StairHeightLevel,
} from '@/generated-sources/openapi';

interface ElevatorCorrectionSectionProps {
  elevatorAccessibility?: ElevatorAccessibilityDto;
  onChangeElevatorAccessibility: (
    value: ElevatorAccessibilityDto | undefined,
  ) => void;
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

export default function ElevatorCorrectionSection({
  elevatorAccessibility,
  onChangeElevatorAccessibility,
}: ElevatorCorrectionSectionProps) {
  const update = useCallback(
    (partial: Partial<ElevatorAccessibilityDto>) => {
      onChangeElevatorAccessibility({
        ...elevatorAccessibility,
        ...partial,
      });
    },
    [elevatorAccessibility, onChangeElevatorAccessibility],
  );

  const hasElevator = elevatorAccessibility !== undefined;

  return (
    <Container>
      <SectionTitle>엘리베이터 정보</SectionTitle>

      <SubLabel>엘리베이터</SubLabel>
      <OptionRow>
        {[
          {value: true, label: '있음'},
          {value: false, label: '없음'},
        ].map(option => {
          const isSelected =
            option.value === true ? hasElevator : !hasElevator;
          return (
            <OptionItem key={String(option.value)}>
              <SccButton
                text={option.label}
                textColor={isSelected ? 'brandColor' : 'gray70'}
                buttonColor="white"
                borderColor={isSelected ? 'blue50' : 'gray30'}
                onPress={() => {
                  if (option.value) {
                    onChangeElevatorAccessibility({});
                  } else {
                    onChangeElevatorAccessibility(undefined);
                  }
                }}
                elementName="report_correction_has_elevator"
                logParams={{value: option.value}}
              />
            </OptionItem>
          );
        })}
      </OptionRow>

      {hasElevator && (
        <>
          <SubLabel>엘리베이터까지 계단 수</SubLabel>
          <OptionRow>
            {STAIR_INFO_OPTIONS.map(option => {
              const isSelected =
                elevatorAccessibility?.stairInfo === option.value;
              return (
                <OptionItem key={option.value}>
                  <SccButton
                    text={option.label}
                    textColor={isSelected ? 'brandColor' : 'gray70'}
                    buttonColor="white"
                    borderColor={isSelected ? 'blue50' : 'gray30'}
                    onPress={() => update({stairInfo: option.value})}
                    elementName="report_correction_elevator_stair_info"
                    logParams={{value: option.value}}
                  />
                </OptionItem>
              );
            })}
          </OptionRow>

          {elevatorAccessibility?.stairInfo === StairInfo.One && (
            <>
              <SubLabel>계단 높이</SubLabel>
              <OptionRow>
                {STAIR_HEIGHT_OPTIONS.map(option => {
                  const isSelected =
                    elevatorAccessibility?.stairHeightLevel === option.value;
                  return (
                    <OptionItem key={option.value}>
                      <SccButton
                        text={option.label}
                        textColor={isSelected ? 'brandColor' : 'gray70'}
                        buttonColor="white"
                        borderColor={isSelected ? 'blue50' : 'gray30'}
                        onPress={() => update({stairHeightLevel: option.value})}
                        elementName="report_correction_elevator_stair_height"
                        logParams={{value: option.value}}
                      />
                    </OptionItem>
                  );
                })}
              </OptionRow>
            </>
          )}

          <SubLabel>엘리베이터까지 경사로</SubLabel>
          <OptionRow>
            {[
              {value: true, label: '있음'},
              {value: false, label: '없음'},
            ].map(option => {
              const isSelected =
                elevatorAccessibility?.hasSlope === option.value;
              return (
                <OptionItem key={String(option.value)}>
                  <SccButton
                    text={option.label}
                    textColor={isSelected ? 'brandColor' : 'gray70'}
                    buttonColor="white"
                    borderColor={isSelected ? 'blue50' : 'gray30'}
                    onPress={() => update({hasSlope: option.value})}
                    elementName="report_correction_elevator_slope"
                    logParams={{value: option.value}}
                  />
                </OptionItem>
              );
            })}
          </OptionRow>
        </>
      )}
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
