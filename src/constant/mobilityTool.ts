import {UserMobilityToolDto} from '@/generated-sources/openapi';

export const MOBILITY_TOOL_LABELS: Record<UserMobilityToolDto, string> = {
  [UserMobilityToolDto.ManualWheelchair]: '수동 휠체어',
  [UserMobilityToolDto.ElectricWheelchair]: '전동 휠체어',
  [UserMobilityToolDto.ManualAndElectricWheelchair]: '수전동 휠체어',
  [UserMobilityToolDto.Scooter]: '스쿠터',
  [UserMobilityToolDto.WheelchairUserCompanion]:
    '휠체어 사용자의 가족·친구·동료',
  [UserMobilityToolDto.ProstheticFoot]: '의족',
  [UserMobilityToolDto.Walker]: '워커',
  [UserMobilityToolDto.Cane]: '지팡이',
  [UserMobilityToolDto.WalkingCart]: '보행차',
  [UserMobilityToolDto.Crutch]: '목발',
  [UserMobilityToolDto.None]: '해당하는 유형없음',
  [UserMobilityToolDto.Stroller]: '유아차 동반',
  [UserMobilityToolDto.WalkingDifficulty]:
    '보행 대체·보조 기기가 없으나 보행 불편',
  // 하위호환 유지 (신규 UI에 미표시)
  [UserMobilityToolDto.WalkingAssistanceDevice]: '보행보조도구',
  [UserMobilityToolDto.Cluch]: '클러치(목발, 지팡이 등)',
  [UserMobilityToolDto.FriendOfToolUser]: '이동약자의 친구/가족/동료',
};

export interface MobilityToolGroup {
  groupLabel: string;
  options: {value: UserMobilityToolDto; label: string}[];
}

export const MOBILITY_TOOL_GROUPS: MobilityToolGroup[] = [
  {
    groupLabel: '휠체어 사용',
    options: [
      {
        value: UserMobilityToolDto.ManualWheelchair,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.ManualWheelchair],
      },
      {
        value: UserMobilityToolDto.ElectricWheelchair,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.ElectricWheelchair],
      },
      {
        value: UserMobilityToolDto.ManualAndElectricWheelchair,
        label:
          MOBILITY_TOOL_LABELS[UserMobilityToolDto.ManualAndElectricWheelchair],
      },
      {
        value: UserMobilityToolDto.Scooter,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.Scooter],
      },
      {
        value: UserMobilityToolDto.WheelchairUserCompanion,
        label:
          MOBILITY_TOOL_LABELS[UserMobilityToolDto.WheelchairUserCompanion],
      },
    ],
  },
  {
    groupLabel: '보행 대체 · 보조 기기',
    options: [
      {
        value: UserMobilityToolDto.ProstheticFoot,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.ProstheticFoot],
      },
      {
        value: UserMobilityToolDto.Walker,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.Walker],
      },
      {
        value: UserMobilityToolDto.Cane,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.Cane],
      },
      {
        value: UserMobilityToolDto.WalkingCart,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.WalkingCart],
      },
      {
        value: UserMobilityToolDto.Crutch,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.Crutch],
      },
    ],
  },
  {
    groupLabel: '기타',
    options: [
      {
        value: UserMobilityToolDto.None,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.None],
      },
      {
        value: UserMobilityToolDto.Stroller,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.Stroller],
      },
      {
        value: UserMobilityToolDto.WalkingDifficulty,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.WalkingDifficulty],
      },
    ],
  },
];

// 레거시 호환: 기존 코드에서 MOBILITY_TOOL_OPTIONS를 참조하는 곳이 있으면 그대로 사용 가능
export const MOBILITY_TOOL_OPTIONS = MOBILITY_TOOL_GROUPS.flatMap(
  g => g.options,
);
