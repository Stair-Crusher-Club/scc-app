import {
  AccessibilityInfoDto,
  StairHeightLevel,
  StairInfo,
} from '@/generated-sources/openapi';

export enum FloorAccessibilityType {
  GroundFloor,
  GroundAndMoreFloors,
  GroundAndMoreFloorsWithStairOnly,
  UpperWithElevator,
  UpperWithoutElevator,
  UndergroundWithElevator,
  UndergroundWithoutElevator,
  UnknownButNotOnGround,
  Unknown,
}
export function getFloorAccessibility(
  accessibility: AccessibilityInfoDto,
): FloorAccessibilityType {
  const floors = accessibility.placeAccessibility?.floors ?? [];
  const isSingleFloor = floors.length === 1;

  // 과거 등록 데이터 : 층수 정보가 없는 경우
  if (floors.length === 0) {
    // 1층인 경우와 1층이 아닌 경우로 구분 가능
    if (accessibility.placeAccessibility?.isFirstFloor) {
      return FloorAccessibilityType.GroundFloor;
    }
    return FloorAccessibilityType.UnknownButNotOnGround;
  }

  if (isSingleFloor && floors[0] === 1) {
    return FloorAccessibilityType.GroundFloor;
  }

  if (!isSingleFloor) {
    if (accessibility.placeAccessibility?.isStairOnlyOption) {
      return FloorAccessibilityType.GroundAndMoreFloorsWithStairOnly;
    } else {
      return FloorAccessibilityType.GroundAndMoreFloors;
    }
  }

  if (isSingleFloor && floors[0] > 1) {
    if (accessibility.buildingAccessibility?.hasElevator) {
      return FloorAccessibilityType.UpperWithElevator;
    } else {
      return FloorAccessibilityType.UpperWithoutElevator;
    }
  }
  if (isSingleFloor && floors[0] < 1) {
    if (accessibility.buildingAccessibility?.hasElevator) {
      return FloorAccessibilityType.UndergroundWithElevator;
    } else {
      return FloorAccessibilityType.UndergroundWithoutElevator;
    }
  }
  return FloorAccessibilityType.Unknown;
}

export enum EntranceStepType {
  StairOnly,
  SlopeOnly,
  StairAndSlope,
  Flat,
  Unknown,
}
export function getPlaceEntranceStepType(
  accessibility: AccessibilityInfoDto,
): EntranceStepType {
  const stairInfo = accessibility.placeAccessibility?.stairInfo;
  const hasSlope = accessibility.placeAccessibility?.hasSlope;

  if (stairInfo === StairInfo.None) {
    if (hasSlope) {
      return EntranceStepType.SlopeOnly;
    } else {
      return EntranceStepType.Flat;
    }
  } else {
    if (hasSlope) {
      return EntranceStepType.StairAndSlope;
    } else {
      return EntranceStepType.StairOnly;
    }
  }
}

export function getBuildingEntranceStepType(
  accessibility: AccessibilityInfoDto,
): EntranceStepType {
  const stairInfo = accessibility.buildingAccessibility?.entranceStairInfo;
  const hasSlope = accessibility.buildingAccessibility?.hasSlope;

  if (stairInfo === StairInfo.None) {
    if (hasSlope) {
      return EntranceStepType.SlopeOnly;
    } else {
      return EntranceStepType.Flat;
    }
  } else {
    if (hasSlope) {
      return EntranceStepType.StairAndSlope;
    } else {
      return EntranceStepType.StairOnly;
    }
  }
}

export enum ElevatorType {
  ElevatorAfterStair,
  ElevatorNoBarriers,
  NoElevator,
}
export function getBuildingElevatorType(
  accessibility: AccessibilityInfoDto,
): ElevatorType {
  const hasElevator = accessibility.buildingAccessibility?.hasElevator;
  const stairInfo = accessibility.buildingAccessibility?.entranceStairInfo;

  if (!hasElevator) {
    return ElevatorType.NoElevator;
  }
  if (stairInfo === StairInfo.None) {
    return ElevatorType.ElevatorNoBarriers;
  } else {
    return ElevatorType.ElevatorAfterStair;
  }
}

export function getStairDescription(
  height?: StairHeightLevel,
  stair?: StairInfo,
) {
  const description = [
    getStairHeightDescription(height),
    getStairCountDescription(stair),
  ]
    .filter(e => e)
    .join(', ');
  return description;
}

function getStairHeightDescription(height?: StairHeightLevel) {
  switch (height) {
    case StairHeightLevel.HalfThumb:
      return '엄지 한마디 높이';
    case StairHeightLevel.Thumb:
      return '엄지 손가락 높이';
    case StairHeightLevel.OverThumb:
      return '엄지 손가락 이상 높이';
    default:
      return '';
  }
}

function getStairCountDescription(stair?: StairInfo) {
  switch (stair) {
    case StairInfo.One:
      return '1칸';
    case StairInfo.TwoToFive:
      return '2-5칸';
    case StairInfo.OverSix:
      return '6칸 이상';
    default:
      return '';
  }
}
