import {UserMobilityToolDto} from '@/generated-sources/openapi';

export const MOBILITY_TOOL_LABELS: Record<UserMobilityToolDto, string> = {
  [UserMobilityToolDto.None]: '해당없음',
  [UserMobilityToolDto.FriendOfToolUser]: '해당하는 유형 없음',
  [UserMobilityToolDto.ManualWheelchair]: '수동휠체어',
  [UserMobilityToolDto.ElectricWheelchair]: '전동휠체어',
  [UserMobilityToolDto.ManualAndElectricWheelchair]: '수전동휠체어',
  [UserMobilityToolDto.WalkingAssistanceDevice]: '보행보조도구',
  [UserMobilityToolDto.ProstheticFoot]: '의족',
  [UserMobilityToolDto.Stroller]: '유아차 동반',
  [UserMobilityToolDto.Cluch]: '클러치(목발, 지팡이 등)',
  [UserMobilityToolDto.Scooter]: '스쿠터',
  [UserMobilityToolDto.WheelchairUserCompanion]: '휠체어 이용자 동반',
  [UserMobilityToolDto.Walker]: '워커',
  [UserMobilityToolDto.Cane]: '지팡이',
  [UserMobilityToolDto.WalkingCart]: '보행 카트',
  [UserMobilityToolDto.Crutch]: '목발',
  [UserMobilityToolDto.WalkingDifficulty]: '보행 어려움',
};

export const MOBILITY_TOOL_OPTIONS = Object.entries(MOBILITY_TOOL_LABELS)
  .filter(([value]) => value !== UserMobilityToolDto.FriendOfToolUser) // 친구 선택은 NONE 선택 이후 진행됨
  .map(([value, label]) => ({
    value: value as UserMobilityToolDto,
    label,
  }));
