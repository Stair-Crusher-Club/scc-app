import React, {useCallback, useEffect, useMemo} from 'react';
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

export interface FloorFormState {
  floorOption: FloorOptionKey | null;
  standaloneType: StandaloneBuildingType | null;
  conditions: {showFloorMovement: boolean; showDetailFloor: boolean};
}

interface FloorCorrectionSectionProps {
  floors?: number[];
  floorMovingMethodTypes?: FloorMovingMethodTypeDto[];
  isStandaloneBuilding?: boolean;
  onChangeFloors: (value: number[]) => void;
  onChangeFloorMovingMethodTypes: (value: FloorMovingMethodTypeDto[]) => void;
  onStateChange?: (state: FloorFormState) => void;
}

export default function FloorCorrectionSection({
  floors,
  floorMovingMethodTypes = [],
  isStandaloneBuilding = false,
  onChangeFloors,
  onChangeFloorMovingMethodTypes,
  onStateChange,
}: FloorCorrectionSectionProps) {
  const {
    floorOption,
    standaloneType,
    conditions,
    setFloorOption,
    setSelectedFloor,
    setStandaloneType,
  } = useFloorFormLogic({
    initialFloors: floors,
    isStandaloneBuilding,
  });

  useEffect(() => {
    onStateChange?.({floorOption, standaloneType, conditions});
  }, [floorOption, standaloneType, conditions, onStateChange]);

  const detailFloorValue = useMemo(() => getDetailFloorValue(floors), [floors]);

  const handleOptionSelect = useCallback(
    (option: FloorOptionKey) => {
      setFloorOption(option);
      if (option !== 'otherFloor') {
        onChangeFloors(computeFloors(option, undefined, null));
      }
      // otherFloor의 경우 사용자가 층 선택 시 handleFloorChange에서 commit
    },
    [setFloorOption, onChangeFloors],
  );

  const handleFloorChange = useCallback(
    (value: number) => {
      setSelectedFloor(value);
      onChangeFloors([value]);
    },
    [setSelectedFloor, onChangeFloors],
  );

  const handleStandaloneTypeChange = useCallback(
    (value: StandaloneBuildingType) => {
      setStandaloneType(value);
      onChangeFloors(computeFloors('standalone', undefined, value));
    },
    [setStandaloneType, onChangeFloors],
  );

  return (
    <Container>
      <SectionTitle>이 장소는 건물의 1층에 있나요?</SectionTitle>

      <FloorQuestionUI
        floorOption={floorOption}
        selectedFloor={detailFloorValue}
        standaloneType={standaloneType}
        onChangeFloorOption={handleOptionSelect}
        onChangeSelectedFloor={handleFloorChange}
        onChangeStandaloneType={handleStandaloneTypeChange}
      />

      {conditions.showFloorMovement && (
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
