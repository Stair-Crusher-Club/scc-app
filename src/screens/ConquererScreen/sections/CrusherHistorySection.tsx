import {useQueries} from '@tanstack/react-query';
import React from 'react';
import {Text, View} from 'react-native';

import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigation from '@/navigation/useNavigation';

export default function CrusherHistorySection() {
  const {api} = useAppComponents();
  const [totalConqueredPlaces, totalUpvotedPlaces] = useQueries({
    queries: [
      {
        queryKey: ['ConqueredPlacesForNumberOfItems'],
        queryFn: async () =>
          (await api.listConqueredPlacesPost({limit: 1})).data
            ?.totalNumberOfItems,
      },
      {
        queryKey: ['UpvotedForNumberOfItems'],
        queryFn: async () =>
          (await api.listUpvotedPlacesPost({limit: 1})).data
            ?.totalNumberOfUpvotes,
      },
    ],
  }).map(r => r.data);

  const totalNumberOfPlaces = totalConqueredPlaces ?? 0;
  const totalNumberOfUpvote = totalUpvotedPlaces ?? 0;

  const navigation = useNavigation();

  return (
    <View className="pt-3 px-5">
      <Text className="py-5 text-[18px] leading-[29px] font-pretendard-bold">
        정복 히스토리
      </Text>
      <View className="h-px bg-gray-20" />
      <SccPressable
        elementName="crusher_history_conquered_places_link"
        onPress={() => navigation.navigate('Conquerer/History')}
        className="flex-row justify-between items-center py-5">
        <View className="flex-row items-center">
          <Text className="text-[16px] leading-[24px] font-pretendard">
            내가 정복한 장소
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="py-1 px-3 rounded-xl bg-brand-5 mr-1">
            <Text className="text-[14px] leading-[22px] font-pretendard-bold text-brand-50">
              {totalNumberOfPlaces.toLocaleString()}
            </Text>
          </View>
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </View>
      </SccPressable>
      <SccPressable
        elementName="crusher_history_helpful_link"
        onPress={() => navigation.navigate('Conquerer/Upvote')}
        className="flex-row justify-between items-center py-5">
        <View className="flex-row items-center">
          <Text className="text-[16px] leading-[24px] font-pretendard">
            도움이 돼요
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="py-1 px-3 rounded-xl bg-brand-5 mr-1">
            <Text className="text-[14px] leading-[22px] font-pretendard-bold text-brand-50">
              {totalNumberOfUpvote.toLocaleString()}
            </Text>
          </View>
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </View>
      </SccPressable>
      <SccPressable
        elementName="crusher_history_views_link"
        onPress={() => {}}
        className="flex-row justify-between items-center py-5">
        <View className="flex-row items-center">
          <Text className="text-[16px] leading-[24px] font-pretendard text-gray-50">
            내 정복 장소 조회수
          </Text>
          <View className="py-1 px-1.5 rounded-[10px] bg-gray-10 ml-2">
            <Text className="text-[12px] leading-[19px] font-pretendard-bold text-gray-50">
              준비중
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </View>
      </SccPressable>
    </View>
  );
}
