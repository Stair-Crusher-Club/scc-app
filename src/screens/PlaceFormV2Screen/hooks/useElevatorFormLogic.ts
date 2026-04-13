import {useCallback, useMemo, useState} from 'react';

import {
  HAS_ELEVATOR_OPTIONS,
  STAIR_INFO_OPTIONS,
  STAIR_HEIGHT_OPTIONS,
  SLOPE_OPTIONS,
} from '@/constant/accessibility-options';
import {
  StairInfo,
  StairHeightLevel,
  ElevatorAccessibilityDto,
} from '@/generated-sources/openapi';

/**
 * Compute elevator form conditions from current values.
 * Pure function — no state, no side effects.
 */
export function getElevatorConditions(params: {
  hasElevator?: boolean;
  stairInfo?: StairInfo;
}) {
  return {
    showElevatorDetails: params.hasElevator === true,
    showStairHeight: params.stairInfo === StairInfo.One,
    isPhotoRequired: params.hasElevator === true,
  };
}

/**
 * Shared elevator form option constants.
 */
export const ELEVATOR_OPTIONS = {
  hasElevatorOptions: HAS_ELEVATOR_OPTIONS,
  stairInfoOptions: STAIR_INFO_OPTIONS,
  stairHeightOptions: STAIR_HEIGHT_OPTIONS,
  slopeOptions: SLOPE_OPTIONS,
} as const;

interface UseElevatorFormLogicParams {
  initialValues?: {
    hasElevator?: boolean;
    stairInfo?: StairInfo;
    stairHeightLevel?: StairHeightLevel;
    hasSlope?: boolean;
  };
}

/**
 * Hook that manages elevator form state with auto-reset logic.
 *
 * Used in PlaceFormV2Screen (FloorMovementStep) and ElevatorCorrectionSection
 * to ensure consistent state transitions:
 * - hasElevator=false resets all sub-fields
 * - stairInfo !== ONE resets stairHeightLevel
 */
export default function useElevatorFormLogic({
  initialValues,
}: UseElevatorFormLogicParams = {}) {
  const [hasElevator, setHasElevatorState] = useState<boolean | undefined>(
    initialValues?.hasElevator,
  );
  const [stairInfo, setStairInfoState] = useState<StairInfo | undefined>(
    initialValues?.stairInfo,
  );
  const [stairHeightLevel, setStairHeightLevel] = useState<
    StairHeightLevel | undefined
  >(initialValues?.stairHeightLevel);
  const [hasSlope, setHasSlope] = useState<boolean | undefined>(
    initialValues?.hasSlope,
  );

  // When hasElevator becomes false, reset all sub-fields
  const setHasElevator = useCallback((value: boolean) => {
    setHasElevatorState(value);
    if (!value) {
      setStairInfoState(undefined);
      setStairHeightLevel(undefined);
      setHasSlope(undefined);
    }
  }, []);

  // When stairInfo changes away from ONE, auto-reset stairHeightLevel
  const setStairInfo = useCallback((value: StairInfo) => {
    setStairInfoState(value);
    if (value !== StairInfo.One) {
      setStairHeightLevel(undefined);
    }
  }, []);

  const conditions = useMemo(
    () => getElevatorConditions({hasElevator, stairInfo}),
    [hasElevator, stairInfo],
  );

  /**
   * Build an ElevatorAccessibilityDto from the current state,
   * or undefined if hasElevator is false.
   */
  const toElevatorAccessibility = useCallback(():
    | ElevatorAccessibilityDto
    | undefined => {
    if (!hasElevator) {
      return undefined;
    }
    return {
      stairInfo,
      stairHeightLevel:
        stairInfo === StairInfo.One ? stairHeightLevel : undefined,
      hasSlope,
    };
  }, [hasElevator, stairInfo, stairHeightLevel, hasSlope]);

  return {
    // State
    hasElevator,
    stairInfo,
    stairHeightLevel,
    hasSlope,

    // Setters
    setHasElevator,
    setStairInfo,
    setStairHeightLevel,
    setHasSlope,

    // Conditions
    conditions,

    // Options
    options: ELEVATOR_OPTIONS,

    // Helpers
    toElevatorAccessibility,
  };
}
