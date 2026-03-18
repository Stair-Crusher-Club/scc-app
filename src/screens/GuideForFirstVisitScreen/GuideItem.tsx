import React from 'react';
import {Text, View} from 'react-native';

interface GuideItemProps {
  title: string;
  description: string;
}

export default function GuideItem({title, description}: GuideItemProps) {
  return (
    <View className="gap-[4px]">
      <Text className="font-pretendard-semibold text-[18px] leading-[26px] text-black">
        {title}
      </Text>
      <Text className="font-pretendard-regular text-[15px] leading-[24px] text-gray-90">
        {description}
      </Text>
    </View>
  );
}
