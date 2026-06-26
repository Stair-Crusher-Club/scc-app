import {match} from 'ts-pattern';

import {
  EntranceDoorType,
  RecommendedMobilityTypeDto,
  SpaciousTypeDto,
  ToiletLocationTypeDto,
  UserMobilityToolDto,
} from '@/generated-sources/openapi';

type UserMobilityToolMap = typeof UserMobilityToolDto;

export type UserMobilityToolMapDto = UserMobilityToolMap[keyof Omit<
  UserMobilityToolMap,
  'FriendOfToolUser' | 'Cluch'
>];

export const MOBILITY_TOOL_LABELS: Record<UserMobilityToolMapDto, string> = {
  [UserMobilityToolDto.ManualWheelchair]: '수동휠체어',
  [UserMobilityToolDto.ElectricWheelchair]: '전동휠체어',
  [UserMobilityToolDto.ManualAndElectricWheelchair]: '수전동휠체어',
  [UserMobilityToolDto.WalkingAssistanceDevice]: '보행보조도구',
  [UserMobilityToolDto.ProstheticFoot]: '의족',
  [UserMobilityToolDto.Stroller]: '유아차 동반',
  [UserMobilityToolDto.None]: '해당없음',
  [UserMobilityToolDto.Scooter]: '스쿠터',
  [UserMobilityToolDto.WheelchairUserCompanion]:
    '휠체어 사용자의 가족·친구·동료',
  [UserMobilityToolDto.Walker]: '워커',
  [UserMobilityToolDto.Cane]: '지팡이',
  [UserMobilityToolDto.WalkingCart]: '보행차',
  [UserMobilityToolDto.Crutch]: '목발',
  [UserMobilityToolDto.WalkingDifficulty]:
    '보행 대체·보조 기기가 없으나 보행 불편',
};

export const MOBILITY_TOOL_OPTIONS = Object.entries(MOBILITY_TOOL_LABELS)
  .filter(([value]) => value !== UserMobilityToolDto.FriendOfToolUser)
  .map(([value, label]) => ({
    value: value as UserMobilityToolDto,
    label,
  }));

export function getMobilityToolDefaultValue(
  mobilityTools?: UserMobilityToolDto[],
) {
  const validOrder = Object.keys(
    MOBILITY_TOOL_LABELS,
  ) as UserMobilityToolMapDto[];
  return validOrder.find(tool => mobilityTools?.includes(tool));
}

export const RECOMMEND_MOBILITY_TOOL_LABELS: Record<
  RecommendedMobilityTypeDto,
  string
> = {
  [RecommendedMobilityTypeDto.ManualWheelchair]: '수동휠체어',
  [RecommendedMobilityTypeDto.ElectricWheelchair]: '전동휠체어',
  [RecommendedMobilityTypeDto.Elderly]: '고령자',
  [RecommendedMobilityTypeDto.Stroller]: '유아차 동반',
  [RecommendedMobilityTypeDto.NotSure]: '모름',
  [RecommendedMobilityTypeDto.None]: '추천안함',
};

export const SPACIOUS_LABELS: Record<SpaciousTypeDto, string> = {
  [SpaciousTypeDto.Wide]: '🥰 매우 넓어 이용하기 아주 편리해요',
  [SpaciousTypeDto.Enough]: '😀 대부분 구역에서 문제없이 이용할 수 있어요',
  [SpaciousTypeDto.Limited]: '🙂 일부 구역만 이용할 수 있어요',
  [SpaciousTypeDto.Tight]: '🥲 매우 좁아 내부 이동이 거의 불가능해요',
};

export const SPACIOUS_OPTIONS = Object.entries(SPACIOUS_LABELS).map(
  ([value, label]) => ({
    value: value as SpaciousTypeDto,
    label,
  }),
);

export const RECOMMEND_MOBILITY_TOOL_OPTIONS = Object.entries(
  RECOMMEND_MOBILITY_TOOL_LABELS,
).map(([value, label]) => ({
  value: value as RecommendedMobilityTypeDto,
  label,
}));

export const makeRecommendedMobilityOptions = (
  currentOptions: RecommendedMobilityTypeDto[],
) => {
  const isNoneSelected = currentOptions.includes(
    RecommendedMobilityTypeDto.None,
  );
  const isNotSureSelected = currentOptions.includes(
    RecommendedMobilityTypeDto.NotSure,
  );
  const isAnyOtherSelected =
    currentOptions.length > 0 &&
    currentOptions.some(
      opt =>
        opt !== RecommendedMobilityTypeDto.None &&
        opt !== RecommendedMobilityTypeDto.NotSure,
    );

  return Object.entries(RECOMMEND_MOBILITY_TOOL_LABELS).map(([key, label]) => {
    const value = key as RecommendedMobilityTypeDto;
    const isNone = value === RecommendedMobilityTypeDto.None;
    const isNotSure = value === RecommendedMobilityTypeDto.NotSure;

    return {
      label,
      value,
      disabled: match({
        isNoneSelected,
        isNotSureSelected,
        isAnyOtherSelected,
      })
        .with({isNoneSelected: true}, () => !isNone)
        .with({isNotSureSelected: true}, () => !isNotSure)
        .with({isAnyOtherSelected: true}, () => isNone || isNotSure)
        .otherwise(() => false),
    };
  });
};

export const TOILET_SECTION_TITLE = '장애인 화장실 정보';
export const TOILET_PHOTO_GUIDE = '장애인 화장실 입구와 내부를 촬영해 주세요';
export const TOILET_LOCATION_COMMENT_PLACEHOLDER =
  '화장실 위치를 설명해 주세요 (예: 1층 엘리베이터 옆)';
export const TOILET_COMMENT_PLACEHOLDER = '기타 참고사항을 입력해 주세요';

type ToiletLocationTypeMap = typeof ToiletLocationTypeDto;

export type ToiletLocationTypeDtoWithoutNotSure =
  ToiletLocationTypeMap[keyof Omit<ToiletLocationTypeMap, 'NotSure'>];

export const TOILET_LOCATION_TYPE_LABELS: Record<
  ToiletLocationTypeDtoWithoutNotSure,
  string
> = {
  [ToiletLocationTypeDto.Place]: '매장 내부에 있음',
  [ToiletLocationTypeDto.Building]: '건물 내 있음',
  [ToiletLocationTypeDto.None]: '없음',
  [ToiletLocationTypeDto.Etc]: '기타',
};

export const TOILET_LOCATION_TYPE_OPTIONS = Object.entries(
  TOILET_LOCATION_TYPE_LABELS,
).map(([value, label]) => ({
  value: value as ToiletLocationTypeDtoWithoutNotSure,
  label,
}));

type DoorTypeMap = typeof EntranceDoorType;

type DoorTypeMapDto = DoorTypeMap[keyof Omit<
  DoorTypeMap,
  'Revolving' | 'None'
>];

export const DOOR_TYPE_LABELS: Record<DoorTypeMapDto, string> = {
  Sliding: '미닫이문(옆으로 미는 슬라이딩 문)',
  Hinged: '여닫이문(앞/뒤로 여는 문)',
  Automatic: '자동문(버튼)',
  ETC: '기타',
};

export const DOOR_TYPE_OPTIONS = Object.entries(DOOR_TYPE_LABELS).map(
  ([value, label]) => ({
    value: value as DoorTypeMapDto,
    label,
  }),
);
