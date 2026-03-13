import React from 'react';
import {Text, View} from 'react-native';

import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';

interface ActivityHistoryLinkProps {
  elementName: string;
  onPress?: () => void;
  title: string;
  count?: number;
  isWip?: boolean;
}

export default function ActivityHistoryLink({
  elementName,
  onPress,
  title,
  count,
  isWip = false,
}: ActivityHistoryLinkProps) {
  return (
    <SccPressable
      className="flex-row justify-between items-center py-5"
      elementName={elementName}
      onPress={onPress}>
      <View className="flex-row items-center">
        <Text
          className={`text-[16px] leading-[24px] font-pretendard-regular ${
            isWip ? 'text-gray-50' : 'text-black'
          }`}>
          {title}
        </Text>
        {isWip && (
          <View className="py-1 px-[6px] rounded-[10px] bg-gray-10 ml-2">
            <Text className="text-[12px] leading-[19px] font-pretendard-bold text-gray-50">
              준비중
            </Text>
          </View>
        )}
      </View>
      <View className="flex-row items-center">
        {count !== undefined && !isWip && (
          <View className="py-1 px-3 rounded-[12px] bg-brand-5 mr-1">
            <Text className="text-[14px] leading-[22px] font-pretendard-bold text-brand-50">
              {count.toLocaleString()}
            </Text>
          </View>
        )}
        <ChevronRightIcon width={20} height={20} color={color.gray30} />
      </View>
    </SccPressable>
  );
}
