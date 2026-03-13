import React from 'react';
import {Image, Text, View} from 'react-native';

interface ActivityReportSummaryProps {
  type: 'review' | 'conquer';
  nickname?: string;
  todayCount: number;
  monthCount: number;
}

export default function ActivityReportSummary({
  type,
  nickname = '',
  todayCount = 0,
  monthCount = 0,
}: ActivityReportSummaryProps) {
  const isReview = type === 'review';
  const title = isReview ? '리뷰 리포트' : '정복 리포트';
  const todayLabel = isReview ? '오늘의 리뷰' : '오늘의 정복';
  const monthLabel = isReview ? '이번달 리뷰' : '이번달 정복';
  const imageSource = isReview
    ? require('@/assets/img/bg_review.png')
    : require('@/assets/img/bg_confetti.png');
  const imageClassName = isReview
    ? 'absolute right-5 top-9 w-[150px] h-[84px]'
    : 'absolute right-5 top-8 w-[150px] h-[120px]';

  return (
    <View className="h-[228px] bg-white">
      <View className="w-full h-[166px] bg-blue-50">
        <Text className="absolute top-8 left-5 text-white text-[20px] leading-[32px] font-pretendard-bold">
          {`${nickname}님\n${title}`}
        </Text>
        <Image className={imageClassName} source={imageSource} />
      </View>
      <View className="absolute left-5 right-5 bottom-0 flex-row justify-between items-center h-[112px] bg-white rounded-[20px] border-[2px] border-gray-20">
        <View className="flex-[0.5]">
          <Text className="font-pretendard-regular text-[14px] leading-[16px] text-gray-90 mb-[10px] text-center">
            {todayLabel}
          </Text>
          <Text className="font-pretendard-bold text-[24px] leading-[26px] text-black text-center">
            {todayCount.toLocaleString()}개
          </Text>
        </View>
        <View className="w-[1px] h-12 bg-gray-20" />
        <View className="flex-[0.5]">
          <Text className="font-pretendard-regular text-[14px] leading-[16px] text-gray-90 mb-[10px] text-center">
            {monthLabel}
          </Text>
          <Text className="font-pretendard-bold text-[24px] leading-[26px] text-black text-center">
            {monthCount.toLocaleString()}개
          </Text>
        </View>
      </View>
    </View>
  );
}
