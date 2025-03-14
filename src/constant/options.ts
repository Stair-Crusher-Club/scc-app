import AutomaticDoorIcon from '@/assets/icon/door_automatic.svg';
import EtcDoorIcon from '@/assets/icon/door_etc.svg';
import HingedDoorIcon from '@/assets/icon/door_hinged.svg';
import NoneDoorIcon from '@/assets/icon/door_none.svg';
import RevolvingDoorIcon from '@/assets/icon/door_revolving.svg';
import SlidingDoorIcon from '@/assets/icon/door_sliding.svg';
import {EntranceDoorType} from '@/generated-sources/openapi';

export const doorTypeMap = {
  [EntranceDoorType.Hinged]: '여닫이문',
  [EntranceDoorType.Sliding]: '미닫이문',
  [EntranceDoorType.Automatic]: '자동문',
  [EntranceDoorType.Revolving]: '회전문',
  [EntranceDoorType.Etc]: '기타',
  [EntranceDoorType.None]: '문 없음',
} as const;

export const makeDoorTypeOptions = (currentOptions: EntranceDoorType[]) => {
  const isNoDoorSelected = currentOptions.includes(EntranceDoorType.None);
  const isAnyDoorSelected = currentOptions.length > 0 && !isNoDoorSelected;

  return [
    {
      icon: HingedDoorIcon,
      label: doorTypeMap[EntranceDoorType.Hinged],
      value: EntranceDoorType.Hinged,
      disabled: isNoDoorSelected,
    },
    {
      icon: SlidingDoorIcon,
      label: doorTypeMap[EntranceDoorType.Sliding],
      value: EntranceDoorType.Sliding,
      disabled: isNoDoorSelected,
    },
    {
      icon: AutomaticDoorIcon,
      label: doorTypeMap[EntranceDoorType.Automatic],
      value: EntranceDoorType.Automatic,
      disabled: isNoDoorSelected,
    },
    {
      icon: RevolvingDoorIcon,
      label: doorTypeMap[EntranceDoorType.Revolving],
      value: EntranceDoorType.Revolving,
      disabled: isNoDoorSelected,
    },
    {
      icon: EtcDoorIcon,
      label: doorTypeMap[EntranceDoorType.Etc],
      value: EntranceDoorType.Etc,
      disabled: isNoDoorSelected,
    },
    {
      icon: NoneDoorIcon,
      label: doorTypeMap[EntranceDoorType.None],
      value: EntranceDoorType.None,
      disabled: isAnyDoorSelected,
    },
  ];
};
