import React from 'react';
import {Text, View} from 'react-native';

import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import {color} from '@/constant/color';
import {cn} from '@/utils/cn';

import {SccTouchableOpacity} from './SccTouchableOpacity';

interface MenuRowProps {
  elementName: string;
  title: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  hidden?: boolean;
  badgeText?: string;
}

export default function MenuRow({
  elementName,
  title,
  icon,
  onPress,
  disabled = false,
  hidden = false,
  badgeText,
}: MenuRowProps) {
  if (hidden) {
    return null;
  }

  return (
    <SccTouchableOpacity
      className="flex-row items-center justify-between py-5 pl-5 pr-[15px]"
      disabled={disabled}
      elementName={elementName}
      onPress={onPress}>
      <View className="flex-row items-center">
        <View className="mr-[10px]">{icon}</View>
        <Text
          className={cn(
            'font-pretendard-regular text-[16px] leading-[24px]',
            disabled ? 'text-gray-50' : 'text-black',
          )}>
          {title}
        </Text>
        {badgeText ? (
          <View className="ml-2 rounded-[10px] bg-gray-10 px-[6px] py-1">
            <Text className="font-pretendard-regular text-[12px] leading-[19px] text-gray-50">
              {badgeText}
            </Text>
          </View>
        ) : null}
      </View>
      <ChevronRightIcon width={20} height={20} color={color.gray30} />
    </SccTouchableOpacity>
  );
}
