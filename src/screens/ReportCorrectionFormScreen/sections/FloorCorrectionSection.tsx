import React, {useCallback, useEffect, useMemo} from 'react';

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
import {FormGroup, GuideLink, SectionRoot, SubLabel} from './shared';

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

  // 층간이동 질문이 더 이상 필요 없어지면 선택값도 초기화 (연쇄로 엘리베이터 정보도 초기화됨)
  useEffect(() => {
    if (!conditions.showFloorMovement && floorMovingMethodTypes.length > 0) {
      onChangeFloorMovingMethodTypes([]);
    }
  }, [
    conditions.showFloorMovement,
    floorMovingMethodTypes,
    onChangeFloorMovingMethodTypes,
  ]);

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
    <SectionRoot>
      <FormGroup>
        <SubLabel>이 장소는 건물의 1층에 있나요?</SubLabel>
        <FloorQuestionUI
          floorOption={floorOption}
          selectedFloor={detailFloorValue}
          standaloneType={standaloneType}
          onChangeFloorOption={handleOptionSelect}
          onChangeSelectedFloor={handleFloorChange}
          onChangeStandaloneType={handleStandaloneTypeChange}
        />
      </FormGroup>

      {conditions.showFloorMovement && (
        <FormGroup>
          <SubLabel>
            1층에서 다른층으로 이동 가능한 방법을 확인해주세요
          </SubLabel>
          <OptionsV2.Multiple
            columns={2}
            values={floorMovingMethodTypes}
            options={makeFloorMovementOptions(
              isStandaloneBuilding,
              floorMovingMethodTypes,
            )}
            onSelect={onChangeFloorMovingMethodTypes}
          />
        </FormGroup>
      )}

      {hasPlaceElevator && (
        <>
          <FormGroup>
            <SubLabel>엘리베이터까지 계단을 확인해주세요</SubLabel>
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
            <GuideLink
              type="stair"
              elementName="report_correction_floor_elevator_stair_guide"
            />
          </FormGroup>

          {elevatorConditions.showStairHeight && (
            <FormGroup>
              <SubLabel>계단 높이를 확인해주세요</SubLabel>
              <OptionsV2
                options={ELEVATOR_OPTIONS.stairHeightOptions}
                value={elevatorAccessibility?.stairHeightLevel}
                columns={1}
                onSelect={(value: StairHeightLevel) =>
                  updateElevatorField({stairHeightLevel: value})
                }
              />
            </FormGroup>
          )}

          <FormGroup>
            <SubLabel>엘리베이터 앞 경사로를 확인해주세요</SubLabel>
            <OptionsV2
              options={ELEVATOR_OPTIONS.slopeOptions}
              value={elevatorAccessibility?.hasSlope}
              columns={2}
              onSelect={(value: boolean) =>
                updateElevatorField({hasSlope: value})
              }
            />
            <GuideLink
              type="slope"
              elementName="report_correction_floor_elevator_slope_guide"
            />
          </FormGroup>
        </>
      )}
    </SectionRoot>
  );
}
