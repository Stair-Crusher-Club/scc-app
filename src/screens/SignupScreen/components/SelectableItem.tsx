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
  // 라벨 끝의 부가설명 괄호는 작게 (예: "전동스쿠터(의료용)" → (의료용) 14px). 디자인 node 2439:35068
  const parenMatch = text.match(/^(.*?)(\([^)]+\))$/);
  return (
    <SccPressable
      elementName={elementName}
      logParams={{text}}
      onPress={onPress}
      style={{opacity: isDimmed ? 0.4 : 1}}
      className={cn(
        'flex-row items-center gap-[6px] pl-[10px] pr-[12px] py-[12px] rounded-[12px] border-[1px]',
        isSelected ? 'bg-brand-5 border-brand-50' : 'bg-white border-gray-20',
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
        {parenMatch ? (
          <>
            {parenMatch[1]}
            <Text style={{fontSize: 14, letterSpacing: -0.28}}>
              {parenMatch[2]}
            </Text>
          </>
        ) : (
          text
        )}
      </Text>
    </SccPressable>
  );
}
