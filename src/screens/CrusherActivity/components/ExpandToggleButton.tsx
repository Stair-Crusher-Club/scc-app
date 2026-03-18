import SccTouchableOpacity from '@/components/SccTouchableOpacity';
import React from 'react';
import {Text, TouchableOpacityProps} from 'react-native';

export type ExpandToggleButtonStatus = 'expand' | 'collapse';

interface ExpandToggleButtonProps extends TouchableOpacityProps {
  status: ExpandToggleButtonStatus;
}

export default function ExpandToggleButton({
  status,
  ...props
}: ExpandToggleButtonProps) {
  return (
    <SccTouchableOpacity
      elementName="expand_toggle"
      className="rounded-[100px] border-[1px] border-gray-25 px-[27.5px] py-2"
      {...props}>
      <Text className="text-center font-pretendard-regular text-[14px] leading-[20px] text-black">
        {status === 'collapse' && '더보기'}
        {status === 'expand' && '접기'}
      </Text>
    </SccTouchableOpacity>
  );
}
