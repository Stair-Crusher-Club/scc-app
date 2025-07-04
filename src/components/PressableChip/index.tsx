import {Pressable, PressableProps, Text} from 'react-native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface ChipProps extends PressableProps {
  label: string;
  active?: boolean;
}

export default function PressableChip({
  label,
  active = false,
  ...props
}: ChipProps) {
  return (
    <Pressable
      style={{
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 48,
        borderWidth: 1,
        borderColor: active ? color.brand : '#DCDEE3',
        backgroundColor: active ? '#EBF5FF' : color.white,
      }}
      {...props}>
      <Text
        style={{
          fontSize: 14,
          lineHeight: 20,
          fontFamily: font.pretendardRegular,
          color: active ? color.brand : color.black,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}
