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

export function getFloorAccessibility(accessibility: AccessibilityInfoDto): {
  type: FloorAccessibilityType;
  title: string;
  description?: string;
} {
  const floors = accessibility.placeAccessibility?.floors ?? [];
  const isSingleFloor = floors.length === 1;
  const floorName = floors[0] < 1 ? `지하 ${-floors[0]}층` : `${floors[0]}층`;

  // 과거 등록 데이터 : 층수 정보가 없는 경우
  if (floors.length === 0) {
    // 1층인 경우와 1층이 아닌 경우로 구분 가능
    if (accessibility.placeAccessibility?.isFirstFloor) {
      return {
        type: FloorAccessibilityType.GroundFloor,
        title: '1층',
      };
    }
    return {
      type: FloorAccessibilityType.UnknownButNotOnGround,
      title: '1층 아님',
    };
  }

  if (isSingleFloor && floors[0] === 1) {
    return {
      type: FloorAccessibilityType.GroundFloor,
      title: '1층',
    };
  }

  if (!isSingleFloor) {
    if (accessibility.placeAccessibility?.isStairOnlyOption) {
      return {
        type: FloorAccessibilityType.GroundAndMoreFloorsWithStairOnly,
        title: '1-2층을 포함한 여러층',
        description: '계단으로만 이동 가능',
      };
    } else {
      return {
        type: FloorAccessibilityType.GroundAndMoreFloors,
        title: '1-2층을 포함한 여러층',
        description: '계단 외 이동 방법 있음',
      };
    }
  }

  if (isSingleFloor && floors[0] > 1) {
    if (accessibility.buildingAccessibility?.hasElevator) {
      return {
        type: FloorAccessibilityType.UpperWithElevator,
        title: floorName,
        description: '엘리베이터로 이동 가능',
      };
    } else {
      return {
        type: FloorAccessibilityType.UpperWithoutElevator,
        title: floorName,
        description:
          accessibility.buildingAccessibility === undefined
            ? '엘레베이터 정보가 필요해요'
            : '계단으로만 이동 가능',
      };
    }
  }

  if (isSingleFloor && floors[0] < 1) {
    if (accessibility.buildingAccessibility?.hasElevator) {
      return {
        type: FloorAccessibilityType.UndergroundWithElevator,
        title: floorName,
        description: '엘리베이터로 이동 가능',
      };
    } else {
      return {
        type: FloorAccessibilityType.UndergroundWithoutElevator,
        title: floorName,
        description:
          accessibility.buildingAccessibility === undefined
            ? '엘레베이터 정보가 필요해요'
            : '계단으로만 이동 가능',
      };
    }
  }

  return {
    type: FloorAccessibilityType.Unknown,
    title: '알 수 없음',
  };
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
