import {UserMobilityToolDto} from '@/generated-sources/openapi';

export const MOBILITY_TOOL_LABELS: Record<UserMobilityToolDto, string> = {
  [UserMobilityToolDto.ManualWheelchair]: '수동휠체어',
  [UserMobilityToolDto.ElectricWheelchair]: '전동휠체어',
  [UserMobilityToolDto.ManualAndElectricWheelchair]: '수전동휠체어',
  [UserMobilityToolDto.Scooter]: '전동스쿠터(의료용)',
  [UserMobilityToolDto.FriendOfWheelchairUser]:
    '휠체어 사용자의 가족 · 친구 · 동료',
  [UserMobilityToolDto.ProstheticFoot]: '의족',
  [UserMobilityToolDto.Cane]: '지팡이',
  [UserMobilityToolDto.WalkerAndWalkingCart]: '워커 · 보행차',
  [UserMobilityToolDto.Crutch]: '목발',
  [UserMobilityToolDto.FriendOfWalkingAidUser]:
    '보행 보조 기기 사용자의 가족 · 친구 · 동료',
  [UserMobilityToolDto.None]: '해당 없음',
  [UserMobilityToolDto.Stroller]: '유아차 동반',
  [UserMobilityToolDto.WalkingDifficulty]: '보행 보조 기기가 없으나 보행 불편',
  // 하위호환 유지 (신규 UI에 미표시)
  [UserMobilityToolDto.WalkingAssistanceDevice]: '보행보조도구',
  [UserMobilityToolDto.Cluch]: '클러치(목발, 지팡이 등)',
};

export interface MobilityToolOption {
  value: UserMobilityToolDto;
  label: string;
  fullWidth?: boolean;
}

export interface MobilityToolGroup {
  groupLabel: string;
  options: MobilityToolOption[];
}

export const MOBILITY_TOOL_GROUPS: MobilityToolGroup[] = [
  {
    groupLabel: '이동수단',
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
        value: UserMobilityToolDto.FriendOfWheelchairUser,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.FriendOfWheelchairUser],
        fullWidth: true,
      },
    ],
  },
  {
    groupLabel: '보행 보조 기기',
    options: [
      {
        value: UserMobilityToolDto.ProstheticFoot,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.ProstheticFoot],
      },
      {
        value: UserMobilityToolDto.Cane,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.Cane],
      },
      {
        value: UserMobilityToolDto.WalkerAndWalkingCart,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.WalkerAndWalkingCart],
      },
      {
        value: UserMobilityToolDto.Crutch,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.Crutch],
      },
      {
        value: UserMobilityToolDto.FriendOfWalkingAidUser,
        label: MOBILITY_TOOL_LABELS[UserMobilityToolDto.FriendOfWalkingAidUser],
        fullWidth: true,
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
        fullWidth: true,
      },
    ],
  },
];

// 레거시 호환: 기존 flat 옵션 계약 유지
export const MOBILITY_TOOL_OPTIONS = Object.entries(MOBILITY_TOOL_LABELS).map(
  ([value, label]) => ({
    value: value as UserMobilityToolDto,
    label,
  }),
);
