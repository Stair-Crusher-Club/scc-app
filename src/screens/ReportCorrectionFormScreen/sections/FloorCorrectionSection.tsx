import React, {useCallback, useEffect, useMemo} from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  FloorMovingMethodTypeDto,
  StairInfo,
  StairHeightLevel,
} from '@/generated-sources/openapi';

import FloorQuestionUI from '../../PlaceFormV2Screen/components/FloorQuestionUI';
import OptionsV2 from '../../PlaceFormV2Screen/components/OptionsV2';
import {makeFloorMovementOptions} from '../../PlaceFormV2Screen/constants';
import {
  useFloorFormLogic,
  getDetailFloorValue,
  computeFloors,
  getElevatorConditions,
  ELEVATOR_OPTIONS,
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

interface ElevatorInfo {
  stairInfo?: StairInfo;
  stairHeightLevel?: StairHeightLevel;
  hasSlope?: boolean;
}

interface FloorCorrectionSectionProps {
  floors?: number[];
  floorMovingMethodTypes?: FloorMovingMethodTypeDto[];
  isStandaloneBuilding?: boolean;
  elevatorAccessibility?: ElevatorInfo;
  onChangeFloors: (value: number[]) => void;
  onChangeFloorMovingMethodTypes: (value: FloorMovingMethodTypeDto[]) => void;
  onChangeElevatorAccessibility: (value: ElevatorInfo | undefined) => void;
  onStateChange?: (state: FloorFormState) => void;
}

export default function FloorCorrectionSection({
  floors,
  floorMovingMethodTypes = [],
  isStandaloneBuilding = false,
  elevatorAccessibility,
  onChangeFloors,
  onChangeFloorMovingMethodTypes,
  onChangeElevatorAccessibility,
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

  const hasPlaceElevator = useMemo(
    () =>
      floorMovingMethodTypes.includes(FloorMovingMethodTypeDto.PlaceElevator),
    [floorMovingMethodTypes],
  );

  const elevatorConditions = useMemo(
    () =>
      getElevatorConditions({
        hasElevator: hasPlaceElevator,
        stairInfo: elevatorAccessibility?.stairInfo,
      }),
    [hasPlaceElevator, elevatorAccessibility?.stairInfo],
  );

  // PLACE_ELEVATOR가 해제되면 엘리베이터 접근성 정보 초기화
  useEffect(() => {
    if (!hasPlaceElevator && elevatorAccessibility !== undefined) {
      onChangeElevatorAccessibility(undefined);
    }
  }, [hasPlaceElevator, elevatorAccessibility, onChangeElevatorAccessibility]);

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

  const updateElevatorField = useCallback(
    (partial: Partial<ElevatorInfo>) => {
      onChangeElevatorAccessibility({
        ...elevatorAccessibility,
        ...partial,
      });
    },
    [elevatorAccessibility, onChangeElevatorAccessibility],
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

      {hasPlaceElevator && (
        <ElevatorInfoContainer>
          <SubSectionTitle>엘리베이터 정보</SubSectionTitle>

          <ElevatorSubLabel>엘리베이터까지 계단</ElevatorSubLabel>
          <OptionsV2
            options={ELEVATOR_OPTIONS.stairInfoOptions}
            value={elevatorAccessibility?.stairInfo}
            columns={2}
            onSelect={(value: StairInfo) =>
              updateElevatorField({
                stairInfo: value,
                ...(value !== StairInfo.One
                  ? {stairHeightLevel: undefined}
                  : {}),
              })
            }
          />

          {elevatorConditions.showStairHeight && (
            <>
              <ElevatorSubLabel>계단 높이</ElevatorSubLabel>
              <OptionsV2
                options={ELEVATOR_OPTIONS.stairHeightOptions}
                value={elevatorAccessibility?.stairHeightLevel}
                columns={1}
                onSelect={(value: StairHeightLevel) =>
                  updateElevatorField({stairHeightLevel: value})
                }
              />
            </>
          )}

          <ElevatorSubLabel>엘리베이터 앞 경사로</ElevatorSubLabel>
          <OptionsV2
            options={ELEVATOR_OPTIONS.slopeOptions}
            value={elevatorAccessibility?.hasSlope}
            columns={2}
            onSelect={(value: boolean) =>
              updateElevatorField({hasSlope: value})
            }
          />
        </ElevatorInfoContainer>
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

const ElevatorInfoContainer = styled.View`
  margin-top: 24px;
`;

const SubSectionTitle = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardSemibold};
  color: ${color.black};
  margin-bottom: 12px;
`;

const ElevatorSubLabel = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray60};
  margin-bottom: 8px;
  margin-top: 12px;
`;
