import {StairInfo, StairHeightLevel} from '@/generated-sources/openapi';

export const STAIR_INFO_OPTIONS = [
  {value: StairInfo.None, label: '없음'},
  {value: StairInfo.One, label: '1칸'},
  {value: StairInfo.TwoToFive, label: '2~5칸'},
  {value: StairInfo.OverSix, label: '6칸 이상'},
];

export const STAIR_HEIGHT_OPTIONS = [
  {value: StairHeightLevel.HalfThumb, label: '엄지 반마디 이하'},
  {value: StairHeightLevel.Thumb, label: '엄지 한마디 정도'},
  {value: StairHeightLevel.OverThumb, label: '엄지 한마디 이상'},
];

export const SLOPE_OPTIONS = [
  {value: true as boolean, label: '있음'},
  {value: false as boolean, label: '없음'},
];

export const HAS_ELEVATOR_OPTIONS = [
  {value: true as boolean, label: '있음'},
  {value: false as boolean, label: '없음'},
];
