import {useQueries} from '@tanstack/react-query';
import React from 'react';

import ActivityHistoryLink from '@/components/ActivityHistoryLink';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigation from '@/navigation/useNavigation';
import {Text, View} from 'react-native';

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
      <Text className="py-5 text-[18px] leading-[29px] font-pretendard-bold text-black">
        정복 히스토리
      </Text>
      <View className="h-[1px] bg-gray-20" />
      <ActivityHistoryLink
        elementName="crusher_history_conquered_places_link"
        onPress={() => navigation.navigate('Conquerer/History')}
        title="내가 정복한 장소"
        count={totalNumberOfPlaces}
      />
      <ActivityHistoryLink
        elementName="crusher_history_helpful_link"
        onPress={() => navigation.navigate('Conquerer/Upvote')}
        title="도움이 돼요"
        count={totalNumberOfUpvote}
      />
      <ActivityHistoryLink
        elementName="crusher_history_views_link"
        title="내 정복 장소 조회수"
        isWip={true}
      />
    </View>
  );
}
