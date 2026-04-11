import React, {useCallback, useMemo, useState} from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {FloorMovingMethodTypeDto} from '@/generated-sources/openapi';

import FloorQuestionUI from '../../PlaceFormV2Screen/components/FloorQuestionUI';
import OptionsV2 from '../../PlaceFormV2Screen/components/OptionsV2';
import {makeFloorMovementOptions} from '../../PlaceFormV2Screen/constants';
import type {
  FloorOptionKey,
  StandaloneBuildingType,
} from '../../PlaceFormV2Screen/types';

/**
 * Infer the floor option from the floors array.
 * - [1] -> firstFloor
 * - [n] where n !== 1 -> otherFloor
 * - [1, ...others] (multiple including 1) -> multipleFloors
 * - [] or undefined -> null
 */
function getFloorOptionFromFloors(
  floors?: number[],
  isStandaloneBuilding?: boolean,
): FloorOptionKey | null {
  if (!floors || floors.length === 0) {
    return null;
  }
  if (isStandaloneBuilding) {
    return 'standalone';
  }
  if (floors.length === 1 && floors[0] === 1) {
    return 'firstFloor';
  }
  if (floors.length === 1 && floors[0] !== 1) {
    return 'otherFloor';
  }
  // Multiple floors including 1
  if (floors.length > 1 && floors.includes(1)) {
    return 'multipleFloors';
  }
  return null;
}

function getDetailFloorValue(floors?: number[]): number | undefined {
  if (!floors || floors.length !== 1) {
    return undefined;
  }
  if (floors[0] !== 1) {
    return floors[0];
  }
  return undefined;
}

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
  const [selectedOption, setSelectedOption] = useState<FloorOptionKey | null>(
    getFloorOptionFromFloors(floors, isStandaloneBuilding),
  );
  const [standaloneType, setStandaloneType] =
    useState<StandaloneBuildingType | null>(null);

  const detailFloorValue = useMemo(() => getDetailFloorValue(floors), [floors]);

  const handleOptionSelect = useCallback(
    (option: FloorOptionKey) => {
      setSelectedOption(option);
      switch (option) {
        case 'firstFloor':
          onChangeFloors([1]);
          break;
        case 'otherFloor':
          // Keep existing detail floor if available, otherwise default to 2
          if (detailFloorValue !== undefined) {
            onChangeFloors([detailFloorValue]);
          } else {
            onChangeFloors([2]);
          }
          break;
        case 'multipleFloors':
          onChangeFloors([1, 2]);
          break;
        case 'standalone':
          onChangeFloors([1]);
          break;
      }
    },
    [onChangeFloors, detailFloorValue],
  );

  const handleFloorChange = useCallback(
    (value: number) => {
      onChangeFloors([value]);
    },
    [onChangeFloors],
  );

  const handleStandaloneTypeChange = useCallback(
    (value: StandaloneBuildingType) => {
      setStandaloneType(value);
    },
    [],
  );

  const showFloorMovement =
    selectedOption === 'otherFloor' ||
    selectedOption === 'multipleFloors' ||
    (selectedOption === 'standalone' && standaloneType === 'multipleFloors');

  return (
    <Container>
      <SectionTitle>이 장소는 건물의 1층에 있나요?</SectionTitle>

      <FloorQuestionUI
        floorOption={selectedOption}
        selectedFloor={detailFloorValue}
        standaloneType={standaloneType}
        onChangeFloorOption={handleOptionSelect}
        onChangeSelectedFloor={handleFloorChange}
        onChangeStandaloneType={handleStandaloneTypeChange}
      />

      {showFloorMovement && (
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
