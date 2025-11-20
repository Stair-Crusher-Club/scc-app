import type {ImageSourcePropType} from 'react-native';

import {FloorMovingMethodTypeDto} from '@/generated-sources/openapi';

import {FloorOption, StandaloneBuildingOption} from '../types';

// Building suggest images
const buildingSuggestStrong = require('@/assets/img/form/building_suggest_strong.png');
const buildingSuggestWeak = require('@/assets/img/form/building_suggest_weak.png');

// Floor images - illustration
const floorFirstIll = require('@/assets/img/form/floor_first_ill.png');
const floorFirstStandaloneIll = require('@/assets/img/form/floor_first_standalone_ill.png');
const floorMultiIll = require('@/assets/img/form/floor_multi_ill.png');
const floorMultiStandaloneIll = require('@/assets/img/form/floor_multi_standalone_ill.png');
const floorOtherIll = require('@/assets/img/form/floor_other_ill.png');

// Floor images - real
const floorFirstReal = require('@/assets/img/form/floor_first_real.png');
const floorFirstStandaloneReal = require('@/assets/img/form/floor_first_standalone_real.png');
const floorMultiReal = require('@/assets/img/form/floor_multi_real.png');
const floorMultiStandaloneReal = require('@/assets/img/form/floor_multi_standalone_real.png');
const floorOtherReal = require('@/assets/img/form/floor_other_real.png');

// Entrance images - illustration
const entranceInIll = require('@/assets/img/form/entrance_in_ill.png');
const entranceOutIll = require('@/assets/img/form/entrance_out_ill.png');

// Entrance images - real
const entranceInReal = require('@/assets/img/form/entrance_in_real.png');
const entranceOutReal = require('@/assets/img/form/entrance_out_real.png');

// Stair images
const stairIll = require('@/assets/img/form/stair_img_ill.png');
const stairReal = require('@/assets/img/form/stair_img_real.png');

// Thank you image
const thankYou = require('@/assets/img/form/thank_you.png');

export type ImageStyle = 'illustration' | 'real';

interface FormImages {
  buildingSuggest: {
    strong: ImageSourcePropType;
    weak: ImageSourcePropType;
  };
  floor: {
    first: ImageSourcePropType;
    firstStandalone: ImageSourcePropType;
    multi: ImageSourcePropType;
    multiStandalone: ImageSourcePropType;
    other: ImageSourcePropType;
  };
  entrance: {
    in: ImageSourcePropType;
    out: ImageSourcePropType;
  };
  stair: ImageSourcePropType;
  thankYou: ImageSourcePropType;
}

const illustrationImages: FormImages = {
  buildingSuggest: {
    strong: buildingSuggestStrong,
    weak: buildingSuggestWeak,
  },
  floor: {
    first: floorFirstIll,
    firstStandalone: floorFirstStandaloneIll,
    multi: floorMultiIll,
    multiStandalone: floorMultiStandaloneIll,
    other: floorOtherIll,
  },
  entrance: {
    in: entranceInIll,
    out: entranceOutIll,
  },
  stair: stairIll,
  thankYou: thankYou,
};

const realImages: FormImages = {
  buildingSuggest: {
    strong: buildingSuggestStrong,
    weak: buildingSuggestWeak,
  },
  floor: {
    first: floorFirstReal,
    firstStandalone: floorFirstStandaloneReal,
    multi: floorMultiReal,
    multiStandalone: floorMultiStandaloneReal,
    other: floorOtherReal,
  },
  entrance: {
    in: entranceInReal,
    out: entranceOutReal,
  },
  stair: stairReal,
  thankYou: thankYou,
};

// 이미지 스타일 플래그 - 여기서 전역 변경
const IMAGE_STYLE: ImageStyle = 'real';

export function getFormImages(style: ImageStyle = IMAGE_STYLE): FormImages {
  return style === 'real' ? realImages : illustrationImages;
}

// 플래그에 따라 자동 선택된 이미지
export const formImages =
  IMAGE_STYLE === 'real' ? realImages : illustrationImages;

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
