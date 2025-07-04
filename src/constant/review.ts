import {
  RecommendedMobilityTypeDto,
  SpaciousTypeDto,
} from '@/generated-sources/openapi';

export const SPACIOUS_LABELS: Record<SpaciousTypeDto, string> = {
  [SpaciousTypeDto.Wide]: '매우 넓고, 이용하기 적합해요 🥰',
  [SpaciousTypeDto.Enough]: '대부분의 구역을 이용하기에 적합해요😀',
  [SpaciousTypeDto.Limited]: '일부 구역만 이용하기에 적합해요 🙂',
  [SpaciousTypeDto.Tight]: '매우 좁아서 내부 이동이 불가능해요 🥲',
};

export const SPACIOUS_OPTIONS = Object.entries(SPACIOUS_LABELS).map(
  ([value, label]) => ({
    value: value as SpaciousTypeDto,
    label,
  }),
);

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

export const RECOMMEND_MOBILITY_TOOL_OPTIONS = Object.entries(
  RECOMMEND_MOBILITY_TOOL_LABELS,
).map(([value, label]) => ({
  value: value as RecommendedMobilityTypeDto,
  label,
}));
