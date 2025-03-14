import {UserMobilityToolDto} from '@/generated-sources/openapi';

export const MOBILITY_TOOL_LABELS: Record<UserMobilityToolDto, string> = {
  [UserMobilityToolDto.None]: '해당하는 유형 없음',
  [UserMobilityToolDto.FriendOfToolUser]: '해당하는 유형 없음',
  [UserMobilityToolDto.ManualWheelchair]: '수동휠체어',
  [UserMobilityToolDto.ElectricWheelchair]: '전동휠체어',
  [UserMobilityToolDto.ManualAndElectricWheelchair]: '수전동휠체어',
  [UserMobilityToolDto.WalkingAssistanceDevice]:
    '보행보조도구(목발, 지팡이, 워커, 보행차 등)',
  [UserMobilityToolDto.ProstheticFoot]: '의족',
  [UserMobilityToolDto.Stroller]: '유아차 동반',
  [UserMobilityToolDto.Cluch]: '클러치(목발, 지팡이 등)',
};

export const MOBILITY_TOOL_OPTIONS = Object.entries(MOBILITY_TOOL_LABELS)
  .filter(([value]) => value !== UserMobilityToolDto.FriendOfToolUser) // 친구 선택은 NONE 선택 이후 진행됨
  .map(([value, label]) => ({
    value: value as UserMobilityToolDto,
    label,
  }));
