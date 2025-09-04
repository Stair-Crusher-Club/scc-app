import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Text, TouchableOpacity, TouchableOpacityProps} from 'react-native';

export type ExpandToggleButtonStatus = 'expand' | 'collapse';

interface ExpandToggleButtonProps extends TouchableOpacityProps {
  status: ExpandToggleButtonStatus;
}

export default function ExpandToggleButton({
  style,
  status,
  ...props
}: ExpandToggleButtonProps) {
  return (
    <TouchableOpacity
      style={[
        {
          borderWidth: 1,
          borderColor: color.gray25,
          paddingVertical: 8,
          paddingHorizontal: 27.5,
          borderRadius: 100,
        },
        style,
      ]}
      {...props}>
      <Text
        style={{
          fontSize: 14,
          fontFamily: font.pretendardRegular,
          lineHeight: 20,
          textAlign: 'center',
        }}>
        {status === 'collapse' && '더보기'}
        {status === 'expand' && '접기'}
      </Text>
    </TouchableOpacity>
  );
}
