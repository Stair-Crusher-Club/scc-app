import {FloorMovingMethodTypeDto} from '@/generated-sources/openapi';
import {FloorOption, StandaloneBuildingOption} from '../types';

export const STEPS = ['floor', 'info', 'floorMovement'] as const;

export const FLOOR_OPTIONS: FloorOption[] = [
  {key: 'firstFloor', label: '네, 1층에 있어요'},
  {key: 'otherFloor', label: '아니요, 다른층이에요'},
  {key: 'multipleFloors', label: '1층을 포함한 여러층이에요'},
  {key: 'standalone', label: '단독건물이에요'},
];

export const STANDALONE_BUILDING_OPTIONS: StandaloneBuildingOption[] = [
  {key: 'singleFloor', label: '단독 1층 건물이에요'},
  {key: 'multipleFloors', label: '여러층 건물이에요'},
];

export const makeFloorMovementOptions = (isStandaloneBuilding: boolean) => {
  if (isStandaloneBuilding) {
    return [
      {label: '엘리베이터', value: FloorMovingMethodTypeDto.PlaceElevator},
      {label: '계단', value: FloorMovingMethodTypeDto.PlaceStairs},
      {label: '에스컬레이터', value: FloorMovingMethodTypeDto.PlaceEscalator},
      {label: '모르겠음', value: FloorMovingMethodTypeDto.Unknown},
    ];
  }

  return [
    {
      label: '매장 내부 엘리베이터',
      value: FloorMovingMethodTypeDto.PlaceElevator,
    },
    {label: '매장 내부 계단', value: FloorMovingMethodTypeDto.PlaceStairs},
    {
      label: '매장 내부 에스컬레이터',
      value: FloorMovingMethodTypeDto.PlaceEscalator,
    },
    {
      label: '매장 외부 엘리베이터',
      value: FloorMovingMethodTypeDto.BuildingElevator,
    },
    {label: '매장 외부 계단', value: FloorMovingMethodTypeDto.BuildingStairs},
    {
      label: '매장 외부 에스컬레이터',
      value: FloorMovingMethodTypeDto.BuildingEscalator,
    },
    {label: '모르겠음', value: FloorMovingMethodTypeDto.Unknown},
  ];
};
