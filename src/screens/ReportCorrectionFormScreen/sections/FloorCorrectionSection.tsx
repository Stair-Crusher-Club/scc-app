import React, {useCallback, useMemo} from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {FloorMovingMethodTypeDto} from '@/generated-sources/openapi';

import FloorQuestionUI from '../../PlaceFormV2Screen/components/FloorQuestionUI';
import OptionsV2 from '../../PlaceFormV2Screen/components/OptionsV2';
import {makeFloorMovementOptions} from '../../PlaceFormV2Screen/constants';
import {
  useFloorFormLogic,
  getDetailFloorValue,
  computeFloors,
} from '../../PlaceFormV2Screen/hooks';
import type {
  FloorOptionKey,
  StandaloneBuildingType,
} from '../../PlaceFormV2Screen/types';

interface FloorCorrectionSectionProps {
  floors?: number[];
  floorMovingMethodTypes?: FloorMovingMethodTypeDto[];
  isStandaloneBuilding?: boolean;
  onChangeFloors: (value: number[]) => void;
  onChangeFloorMovingMethodTypes: (value: FloorMovingMethodTypeDto[]) => void;
}

export default function FloorCorrectionSection({
  floors,
  floorMovingMethodTypes = [],
  isStandaloneBuilding = false,
  onChangeFloors,
  onChangeFloorMovingMethodTypes,
}: FloorCorrectionSectionProps) {
  const floor = useFloorFormLogic({
    initialFloors: floors,
    isStandaloneBuilding,
  });

  const detailFloorValue = useMemo(() => getDetailFloorValue(floors), [floors]);

  const handleOptionSelect = useCallback(
    (option: FloorOptionKey) => {
      floor.setFloorOption(option);
      const newFloors = computeFloors(
        option,
        option === 'otherFloor' ? (detailFloorValue ?? 2) : undefined,
        null,
      );
      onChangeFloors(newFloors);
    },
    [floor, onChangeFloors, detailFloorValue],
  );

  const handleFloorChange = useCallback(
    (value: number) => {
      floor.setSelectedFloor(value);
      onChangeFloors([value]);
    },
    [floor, onChangeFloors],
  );

  const handleStandaloneTypeChange = useCallback(
    (value: StandaloneBuildingType) => {
      floor.setStandaloneType(value);
      onChangeFloors(computeFloors('standalone', undefined, value));
    },
    [floor, onChangeFloors],
  );

  return (
    <Container>
      <SectionTitle>이 장소는 건물의 1층에 있나요?</SectionTitle>

      <FloorQuestionUI
        floorOption={floor.floorOption}
        selectedFloor={detailFloorValue}
        standaloneType={floor.standaloneType}
        onChangeFloorOption={handleOptionSelect}
        onChangeSelectedFloor={handleFloorChange}
        onChangeStandaloneType={handleStandaloneTypeChange}
      />

      {floor.conditions.showFloorMovement && (
        <FloorMovementContainer>
          <SubSectionTitle>
            1층에서 다른층으로 이동가능한 방법을 모두 알려주세요
          </SubSectionTitle>

          <OptionsV2.Multiple
            columns={2}
            values={floorMovingMethodTypes}
            options={makeFloorMovementOptions(
              isStandaloneBuilding,
              floorMovingMethodTypes,
            )}
            onSelect={onChangeFloorMovingMethodTypes}
          />
        </FloorMovementContainer>
      )}
    </Container>
  );
}

// Styled components
const Container = styled.View``;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-family: ${font.pretendardBold};
  color: ${color.black};
  margin-bottom: 16px;
`;

const FloorMovementContainer = styled.View`
  margin-top: 24px;
`;

const SubSectionTitle = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardSemibold};
  color: ${color.black};
  margin-bottom: 12px;
`;
