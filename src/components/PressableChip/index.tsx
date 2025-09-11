import {PressableProps, Text} from 'react-native';

import {SccPressable} from '@/components/SccPressable';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface ChipProps extends PressableProps {
  label: string;
  active?: boolean;
}

export default function PressableChip({
  label,
  active = false,
  disabled = false,
  ...props
}: ChipProps) {
  return (
    <SccPressable
      elementName="pressable_chip"
      disableLogging
      style={[
        {
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 48,
          borderWidth: 1,
          borderColor: '#DCDEE3',
          backgroundColor: color.white,
        },
        active && {
          borderColor: color.brand,
          backgroundColor: '#EBF5FF',
        },
        disabled && {
          borderColor: color.gray20,
          backgroundColor: color.gray10,
        },
      ]}
      disabled={disabled}
      {...props}>
      <Text
        style={[
          {
            fontSize: 14,
            lineHeight: 20,
            fontFamily: font.pretendardRegular,
            color: color.black,
          },
          active && {
            color: color.brand,
          },
          disabled && {
            color: color.gray40,
          },
        ]}>
        {label}
      </Text>
    </SccPressable>
  );
}
