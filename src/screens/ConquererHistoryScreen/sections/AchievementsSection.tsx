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
        className="w-full h-[120px]"
        source={require('@/assets/img/img_slope.jpg')}
        resizeMode="cover"
      />
      <View className="flex-row items-center justify-center ml-[20px] mt-[20px]">
        <Text
          className="font-pretendard-regular text-gray-90"
          style={{fontSize: 16, lineHeight: 26}}>
          지금까지
        </Text>
      </View>
      <View className="flex-row items-center justify-center ml-[20px]">
        <Text
          className="font-pretendard-regular text-gray-90"
          style={{fontSize: 16, lineHeight: 26}}>
          총{' '}
        </Text>
        <Text
          className="font-pretendard-bold text-black"
          style={{fontSize: 28, lineHeight: 42, verticalAlign: 'middle'}}>
          {totalNumberOfPlaces.toLocaleString()}
        </Text>
        <Text
          className="font-pretendard-regular text-gray-90"
          style={{fontSize: 16, lineHeight: 26}}>
          {' '}
          개 {type === 'conquer' && '장소 정복'}
          {type === 'review' && '리뷰 작성'}중
        </Text>
      </View>
    </View>
  );
}
