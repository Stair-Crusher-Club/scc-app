import {useCallback, useMemo, useState} from 'react';

import {
  STAIR_INFO_OPTIONS,
  STAIR_HEIGHT_OPTIONS,
  SLOPE_OPTIONS,
} from '@/constant/accessibility-options';
import {
  StairInfo,
  StairHeightLevel,
  PlaceDoorDirectionTypeDto,
  EntranceDoorType,
} from '@/generated-sources/openapi';

/**
 * Compute entrance form conditions from current values.
 * Pure function — no state, no side effects.
 */
export function getEntranceConditions(params: {
  stairInfo?: StairInfo;
  isStandaloneBuilding: boolean;
}) {
  return {
    showStairHeight: params.stairInfo === StairInfo.One,
    showDoorDirection: !params.isStandaloneBuilding,
  };
}

/**
 * Shared entrance form option constants.
 */
export const ENTRANCE_OPTIONS = {
  stairInfoOptions: STAIR_INFO_OPTIONS,
  stairHeightOptions: STAIR_HEIGHT_OPTIONS,
  slopeOptions: SLOPE_OPTIONS,
} as const;

interface UseEntranceFormLogicParams {
  initialValues?: {
    stairInfo?: StairInfo;
    stairHeightLevel?: StairHeightLevel;
    hasSlope?: boolean;
    doorDirectionType?: PlaceDoorDirectionTypeDto;
    entranceDoorTypes?: EntranceDoorType[];
  };
  isStandaloneBuilding: boolean;
}

/**
 * Hook that manages entrance form state with auto-reset logic.
 *
 * Used in PlaceFormV2Screen and ReportCorrectionFormScreen to ensure
 * consistent state transitions (e.g. stairInfo !== ONE resets stairHeightLevel).
 */
export default function useEntranceFormLogic({
  initialValues,
  isStandaloneBuilding,
}: UseEntranceFormLogicParams) {
  const [stairInfo, setStairInfoState] = useState<StairInfo | undefined>(
    initialValues?.stairInfo,
  );
  const [stairHeightLevel, setStairHeightLevel] = useState<
    StairHeightLevel | undefined
  >(initialValues?.stairHeightLevel);
  const [hasSlope, setHasSlope] = useState<boolean | undefined>(
    initialValues?.hasSlope,
  );
  const [doorDirectionType, setDoorDirectionType] = useState<
    PlaceDoorDirectionTypeDto | undefined
  >(initialValues?.doorDirectionType);
  const [entranceDoorTypes, setEntranceDoorTypes] = useState<
    EntranceDoorType[] | undefined
  >(initialValues?.entranceDoorTypes);

  // When stairInfo changes away from ONE, auto-reset stairHeightLevel
  const setStairInfo = useCallback((value: StairInfo) => {
    setStairInfoState(value);
    if (value !== StairInfo.One) {
      setStairHeightLevel(undefined);
    }
  }, []);

  const conditions = useMemo(
    () => getEntranceConditions({stairInfo, isStandaloneBuilding}),
    [stairInfo, isStandaloneBuilding],
  );

  return {
    // State
    stairInfo,
    stairHeightLevel,
    hasSlope,
    doorDirectionType,
    entranceDoorTypes,

    // Setters
    setStairInfo,
    setStairHeightLevel,
    setHasSlope,
    setDoorDirectionType,
    setEntranceDoorTypes,

    // Conditions
    conditions,

    // Options
    options: ENTRANCE_OPTIONS,
  };
}
