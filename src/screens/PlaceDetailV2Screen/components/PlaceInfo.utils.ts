import {
  AccessibilityInfoDto,
  FloorMovingMethodTypeDto,
  PlaceDoorDirectionTypeDto,
  StairHeightLevel,
  StairInfo,
} from '@/generated-sources/openapi';

export const FLOOR_MOVING_METHOD_LABELS: Record<
  FloorMovingMethodTypeDto,
  string
> = {
  [FloorMovingMethodTypeDto.PlaceElevator]: '매장 엘리베이터',
  [FloorMovingMethodTypeDto.PlaceStairs]: '매장 계단',
  [FloorMovingMethodTypeDto.PlaceEscalator]: '매장 에스컬레이터',
  [FloorMovingMethodTypeDto.BuildingElevator]: '건물 엘리베이터',
  [FloorMovingMethodTypeDto.BuildingStairs]: '건물 계단',
  [FloorMovingMethodTypeDto.BuildingEscalator]: '건물 에스컬레이터',
  [FloorMovingMethodTypeDto.Unknown]: '기타',
};

export type AccessibilitySectionType =
  | '층 정보'
  | '건물 출입구'
  | '매장 출입구'
  | '층간 이동 정보'
  | '내부 이용 정보';

export function getAccessibilitySections(params: {
  isStandalone: boolean;
  doorDir?: PlaceDoorDirectionTypeDto;
  isMultiFloor: boolean;
  hasV2Fields: boolean;
  hasBuildingAccessibility: boolean;
  showBuildingEntranceForOutsideDoor?: boolean;
}): AccessibilitySectionType[] {
  const {
    isStandalone,
    doorDir,
    isMultiFloor,
    hasV2Fields,
    hasBuildingAccessibility,
    showBuildingEntranceForOutsideDoor = false,
  } = params;
  const sections: AccessibilitySectionType[] = ['층 정보'];

  if (hasV2Fields) {
    const isInsideDoor =
      !isStandalone && doorDir === PlaceDoorDirectionTypeDto.InsideBuilding;

    // InsideBuilding: 건물 출입구 → 매장 출입구 순서
    if (isInsideDoor) {
      sections.push('건물 출입구');
    }
    sections.push('매장 출입구');
    if (isMultiFloor) sections.push('층간 이동 정보');

    // OutsideBuilding: 매장 출입구 뒤, 내부 이용 정보 직전 (접근성 탭에서만)
    if (showBuildingEntranceForOutsideDoor && !isStandalone && !isInsideDoor) {
      sections.push('건물 출입구');
    }
    sections.push('내부 이용 정보');
  } else {
    if (isInsideDoor) sections.push('건물 출입구');
    sections.push('매장 출입구');
    if (showBuildingEntranceForOutsideDoor && !isInsideDoor) sections.push('건물 출입구');
    sections.push('내부 이용 정보');
  }

  return sections;
}

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
  doorDirectionType?: PlaceDoorDirectionTypeDto,
): {
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
    const methods =
      accessibility.placeAccessibility?.floorMovingMethodTypes ?? [];
    const stairOnlyTypes: FloorMovingMethodTypeDto[] = [
      FloorMovingMethodTypeDto.PlaceStairs,
      FloorMovingMethodTypeDto.BuildingStairs,
    ];
    const isStairOnly =
      methods.length > 0 && methods.every(m => stairOnlyTypes.includes(m));

    let description: string;
    if (isStairOnly) {
      description = '계단으로만 이동 가능';
    } else if (methods.length > 0) {
      description = methods.map(m => FLOOR_MOVING_METHOD_LABELS[m]).join(', ');
    } else {
      // fallback for V1 data
      description = accessibility.placeAccessibility?.isStairOnlyOption
        ? '계단으로만 이동 가능'
        : '계단 외 이동 방법 있음';
    }

    if (
      isStairOnly ||
      (methods.length === 0 &&
        accessibility.placeAccessibility?.isStairOnlyOption)
    ) {
      return {
        type: FloorAccessibilityType.GroundAndMoreFloorsWithStairOnly,
        title: '1층을 포함한 여러층',
        description,
      };
    } else {
      return {
        type: FloorAccessibilityType.GroundAndMoreFloors,
        title: '1층을 포함한 여러층',
        description,
      };
    }
  }

  const isOutsideBuilding =
    doorDirectionType === PlaceDoorDirectionTypeDto.OutsideBuilding;

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
          accessibility.buildingAccessibility === undefined &&
          !isOutsideBuilding
            ? '엘레베이터 정보가 필요해요'
            : accessibility.buildingAccessibility === undefined
              ? undefined
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
          accessibility.buildingAccessibility === undefined &&
          !isOutsideBuilding
            ? '엘레베이터 정보가 필요해요'
            : accessibility.buildingAccessibility === undefined
              ? undefined
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
export function getPlaceEntranceStepType(pa: {
  stairInfo?: StairInfo;
  hasSlope?: boolean;
}): EntranceStepType {
  const stairInfo = pa.stairInfo;
  const hasSlope = pa.hasSlope;

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

export function getBuildingEntranceStepType(ba: {
  entranceStairInfo?: StairInfo;
  hasSlope?: boolean;
}): EntranceStepType {
  const stairInfo = ba.entranceStairInfo;
  const hasSlope = ba.hasSlope;

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
export function getBuildingElevatorType(ba: {
  hasElevator?: boolean;
  elevatorStairInfo?: StairInfo;
}): ElevatorType {
  const hasElevator = ba.hasElevator;
  const stairInfo = ba.elevatorStairInfo;

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
