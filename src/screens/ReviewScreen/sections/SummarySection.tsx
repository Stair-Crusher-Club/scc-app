import {Image, Text, View} from 'react-native';

import {useMe} from '@/atoms/Auth';
import useAppComponents from '@/hooks/useAppComponents';
import {useQuery} from '@tanstack/react-query';

export default function SummarySection() {
  const {api} = useAppComponents();
  const {userInfo} = useMe();

  const {data} = useQuery({
    queryKey: ['ReviewReport'],
    queryFn: async () => (await api.getReviewActivityReportPost()).data,
  });

  const todayReviewedCount = data?.todayReviewedCount ?? 0;
  const thisMonthReviewedCount = data?.thisMonthReviewedCount ?? 0;

  return (
    <View className="h-[228px] bg-white">
      <View className="w-full h-[166px] bg-blue-50">
        <Text className="absolute top-8 left-5 text-white text-[20px] leading-[32px] font-pretendard-bold">
          {`${userInfo?.nickname}님\n리뷰 리포트`}
        </Text>
        <Image
          source={require('@/assets/img/bg_review.png')}
          className="absolute top-9 right-5 w-[150px] h-[84px]"
        />
      </View>
      <View className="absolute left-5 right-5 bottom-0 flex-row justify-between items-center h-[112px] bg-white rounded-[20px] border-2 border-gray-20">
        <View className="flex-1">
          <Text className="font-pretendard-regular text-[14px] leading-[16px] text-gray-90 mb-[10px] text-center">
            오늘의 리뷰
          </Text>
          <Text className="font-pretendard-bold text-[24px] leading-[26px] text-black text-center">
            {todayReviewedCount.toLocaleString()}개
          </Text>
        </View>
        <View className="w-px h-[48px] bg-gray-20" />
        <View className="flex-1">
          <Text className="font-pretendard-regular text-[14px] leading-[16px] text-gray-90 mb-[10px] text-center">
            이번달 리뷰
          </Text>
          <Text className="font-pretendard-bold text-[24px] leading-[26px] text-black text-center">
            {thisMonthReviewedCount.toLocaleString()}개
          </Text>
        </View>
      </View>
    </View>
  );
}
