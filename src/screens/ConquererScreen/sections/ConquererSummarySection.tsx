import {View, Text, Image} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import React from 'react';

import useAppComponents from '@/hooks/useAppComponents';
import {useMe} from '@/atoms/Auth';

export default function ConquererSummarySection() {
  const {api} = useAppComponents();
  const {userInfo} = useMe();
  const {data} = useQuery({
    queryKey: ['ConquererActivity'],
    queryFn: async () => (await api.getAccessibilityActivityReportPost()).data,
  });

  return (
    <View className="h-[228px] bg-white">
      <View className="w-full h-[166px] bg-blue-50">
        <Text className="absolute top-8 left-5 text-white text-[20px] leading-[32px] font-pretendard-bold">
          {`${userInfo?.nickname}님\n정복 리포트`}
        </Text>
        <Image
          source={require('@/assets/img/bg_confetti.png')}
          className="absolute top-8 right-5 w-[150px] h-[120px]"
        />
      </View>
      <View className="absolute left-5 right-5 bottom-0 flex-row justify-between items-center h-[112px] bg-white rounded-[20px] border-2 border-gray-20">
        <View className="flex-1">
          <Text className="font-pretendard text-[14px] leading-[16px] text-gray-90 mb-[10px] text-center">
            오늘의 정복
          </Text>
          <Text className="font-pretendard-bold text-[24px] leading-[26px] text-black text-center">
            {data?.todayConqueredCount}개
          </Text>
        </View>
        <View className="w-px h-[48px] bg-gray-20" />
        <View className="flex-1">
          <Text className="font-pretendard text-[14px] leading-[16px] text-gray-90 mb-[10px] text-center">
            이번달 정복
          </Text>
          <Text className="font-pretendard-bold text-[24px] leading-[26px] text-black text-center">
            {data?.thisMonthConqueredCount.toLocaleString()}개
          </Text>
        </View>
      </View>
    </View>
  );
}
