import React from 'react';

import {Image, Text, View} from 'react-native';

type AchievementType = 'conquer' | 'review';

export default function AchievementsSection({
  totalNumberOfPlaces,
  type = 'conquer',
}: {
  totalNumberOfPlaces: number;
  type?: AchievementType;
}) {
  return (
    <View className="w-full pb-[14px]">
      <Image
        className="w-full max-h-[108px]"
        source={require('@/assets/img/img_slope.jpg')}
        resizeMode="cover"
      />
      <View className="flex-row items-center justify-center ml-5 mt-5">
        <Text className="text-[16px] leading-[26px] font-pretendard-regular text-gray-90">
          지금까지
        </Text>
      </View>
      <View className="flex-row items-center justify-center ml-5">
        <Text className="text-[16px] leading-[26px] font-pretendard-regular text-gray-90">
          총{' '}
        </Text>
        <Text className="text-[28px] leading-[42px] font-pretendard-bold text-black align-middle">
          {totalNumberOfPlaces.toLocaleString()}
        </Text>
        <Text className="text-[16px] leading-[26px] font-pretendard-regular text-gray-90">
          {' '}
          개 {type === 'conquer' && '장소 정복'}
          {type === 'review' && '리뷰 작성'}중
        </Text>
      </View>
    </View>
  );
}
