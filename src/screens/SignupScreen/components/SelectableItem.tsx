import React from 'react';
import {Text} from 'react-native';

import FilledCheckIcon from '@/assets/icon/ic_filled_check.svg';
import FilledCheckOffIcon from '@/assets/icon/ic_filled_check_off.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {cn} from '@/utils/cn';

interface SelectableItemProps {
  isSelected: boolean;
  isDimmed?: boolean;
  onPress: () => void;
  text: string;
  elementName: string;
}

export default function SelectableItem({
  isSelected,
  isDimmed = false,
  onPress,
  text,
  elementName,
}: SelectableItemProps) {
  return (
    <SccPressable
      elementName={elementName}
      logParams={{text}}
      onPress={onPress}
      style={{opacity: isDimmed ? 0.4 : 1}}
      className={cn(
        'flex-row items-center gap-[8px] pl-[10px] pr-[12px] py-[12px] rounded-[12px] border-[1px]',
        isSelected
          ? 'bg-brand-5 border-brand-color'
          : 'bg-white border-gray-20',
      )}>
      {isSelected ? (
        <FilledCheckIcon width={24} height={24} />
      ) : (
        <FilledCheckOffIcon width={24} height={24} />
      )}
      <Text
        style={{
          flex: 1,
          fontFamily: font.pretendardMedium,
          fontSize: 16,
          lineHeight: 24,
          letterSpacing: -0.2,
          color: color.gray90v2,
        }}>
        {text}
      </Text>
    </SccPressable>
  );
}
