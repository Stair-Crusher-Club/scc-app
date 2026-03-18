import React from 'react';
import {Text, View} from 'react-native';

export default function FavoriteNoResult() {
  return (
    <View className="grow items-center justify-center gap-4">
      <Text className="pb-[120px] font-pretendard-medium text-[14px] leading-[20px] text-gray-50">
        저장한 장소가 없습니다.
      </Text>
    </View>
  );
}
