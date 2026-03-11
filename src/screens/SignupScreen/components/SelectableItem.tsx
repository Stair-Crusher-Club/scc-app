import React from 'react';
import {Text} from 'react-native';

import FilledCheckIcon from '@/assets/icon/ic_filled_check.svg';
import FilledCheckOffIcon from '@/assets/icon/ic_filled_check_off.svg';
import {SccPressable} from '@/components/SccPressable';
import {cn} from '@/utils/cn';

interface SelectableItemProps {
  isSelected: boolean;
  onPress: () => void;
  text: string;
  elementName: string;
}

export default function SelectableItem({
  isSelected,
  onPress,
  text,
  elementName,
}: SelectableItemProps) {
  return (
    <SccPressable
      elementName={elementName}
      logParams={{text}}
      onPress={onPress}
      className={cn(
        'flex-row items-center justify-start gap-[8px] p-[16px_12px] rounded-[20px] border-[1px]',
        isSelected
          ? 'bg-brand-5 border-brand-color'
          : 'bg-white border-gray-20',
      )}>
      {isSelected ? <FilledCheckIcon /> : <FilledCheckOffIcon />}
      <Text className="font-pretendard-medium text-[16px] text-gray-100">
        {text}
      </Text>
    </SccPressable>
  );
}
