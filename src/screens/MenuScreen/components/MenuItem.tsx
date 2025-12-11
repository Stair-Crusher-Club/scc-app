import React from 'react';
import {Text, View} from 'react-native';

import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {tailwindColor} from '@/constant/tailwindColor';
import {cn} from '@/utils/cn';

interface MenuItemProps {
  elementName: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  text: string;
  showBadge?: boolean;
  hidden?: boolean;
}

export default function MenuItem({
  elementName,
  onPress,
  icon,
  text,
  showBadge = false,
  hidden = false,
}: MenuItemProps) {
  return (
    <SccTouchableOpacity
      elementName={elementName}
      onPress={onPress}
      className={cn(hidden && 'hidden')}>
      <View className="flex-row justify-between items-center py-5 pl-5 pr-[15px]">
        <View className="flex-row justify-center items-center gap-[10px]">
          {icon}
          <Text
            className={cn(
              'font-pretendard-regular text-[16px]',
              showBadge ? 'text-gray-50' : 'text-black',
            )}>
            {text}
          </Text>
        </View>
        {showBadge && <NotAvailableBadge />}
        <ChevronRightIcon
          width={20}
          height={20}
          color={tailwindColor.gray[30]}
        />
      </View>
    </SccTouchableOpacity>
  );
}

const NotAvailableBadge = () => {
  return (
    <View className="py-1 px-1.5 ml-2 mr-auto bg-gray-10 rounded-[10px]">
      <Text className="font-pretendard-regular text-[12px] text-gray-50 leading-[19px]">
        준비중
      </Text>
    </View>
  );
};
