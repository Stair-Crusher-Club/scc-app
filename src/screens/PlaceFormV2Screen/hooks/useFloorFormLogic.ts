import {useCallback, useMemo, useState} from 'react';

import type {FloorOptionKey, StandaloneBuildingType} from '../types';

interface UseFloorFormLogicParams {
  initialFloors?: number[];
  isStandaloneBuilding?: boolean;
}

/**
 * Infer the floor option from the floors array.
 * - [1] -> firstFloor
 * - [n] where n !== 1 -> otherFloor
 * - [1, ...others] (multiple including 1) -> multipleFloors
 * - [] or undefined -> null
 */
export function getFloorOptionFromFloors(
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

export function getDetailFloorValue(floors?: number[]): number | undefined {
  if (!floors || floors.length !== 1) {
    return undefined;
  }
  if (floors[0] !== 1) {
    return floors[0];
  }
  return undefined;
}

/**
 * Compute the floors array from the selected option/floor/standaloneType.
 */
export function computeFloors(
  option: FloorOptionKey | null,
  selectedFloor: number | undefined,
  standaloneType: StandaloneBuildingType | null,
): number[] {
  switch (option) {
    case 'firstFloor':
      return [1];
    case 'otherFloor':
      return selectedFloor ? [selectedFloor] : [1];
    case 'multipleFloors':
      return [1, 2];
    case 'standalone':
      return standaloneType === 'multipleFloors' ? [1, 2] : [1];
    default:
      return [1];
  }
}

/**
 * Compute floor form conditions from current values.
 * Pure function — no state, no side effects.
 */
export function getFloorConditions(params: {
  floorOption: FloorOptionKey | null;
  standaloneType: StandaloneBuildingType | null;
}) {
  return {
    showFloorMovement:
      params.floorOption === 'multipleFloors' ||
      (params.floorOption === 'standalone' &&
        params.standaloneType === 'multipleFloors'),
    showDetailFloor: params.floorOption === 'otherFloor',
  };
}

/**
 * Hook that manages floor selection state with auto-reset logic.
 *
 * Used in PlaceFormV2Screen and FloorCorrectionSection to ensure
 * consistent state transitions (e.g. option !== standalone resets standaloneType).
 */
export default function useFloorFormLogic({
  initialFloors,
  isStandaloneBuilding,
}: UseFloorFormLogicParams) {
  const [floorOption, setFloorOptionState] = useState<FloorOptionKey | null>(
    getFloorOptionFromFloors(initialFloors, isStandaloneBuilding),
  );
  const [selectedFloor, setSelectedFloor] = useState<number | undefined>(
    getDetailFloorValue(initialFloors),
  );
  const [standaloneType, setStandaloneTypeState] =
    useState<StandaloneBuildingType | null>(null);

  // When floor option changes, reset dependent state
  const setFloorOption = useCallback((value: FloorOptionKey) => {
    setFloorOptionState(value);
    if (value !== 'standalone') {
      setStandaloneTypeState(null);
    }
    if (value !== 'otherFloor') {
      setSelectedFloor(undefined);
    }
  }, []);

  const setStandaloneType = useCallback((value: StandaloneBuildingType) => {
    setStandaloneTypeState(value);
  }, []);

  const conditions = useMemo(
    () => getFloorConditions({floorOption, standaloneType}),
    [floorOption, standaloneType],
  );

  const floors = useMemo(
    () => computeFloors(floorOption, selectedFloor, standaloneType),
    [floorOption, selectedFloor, standaloneType],
  );

  return {
    floorOption,
    selectedFloor,
    standaloneType,

    setFloorOption,
    setSelectedFloor,
    setStandaloneType,

    conditions,
    floors,
  };
}
