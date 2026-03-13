import React from 'react';
import {Text, View} from 'react-native';

import ActivityHistoryLink from '@/components/ActivityHistoryLink';
import {UpvoteTargetTypeDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigation from '@/navigation/useNavigation';
import {useQueries} from '@tanstack/react-query';

export default function HistorySection() {
  const {api} = useAppComponents();
  const navigation = useNavigation();

  const [placeReview, toiletReview] = useQueries({
    queries: [
      {
        queryKey: ['ReviewHistory', 'Review', UpvoteTargetTypeDto.PlaceReview],
        queryFn: async () =>
          (await api.listRegisteredPlaceReviewsPost({limit: 1})).data,
      },
      {
        queryKey: ['ReviewHistory', 'Review', UpvoteTargetTypeDto.ToiletReview],
        queryFn: async () =>
          (await api.listRegisteredToiletReviewsPost({limit: 1})).data,
      },
    ],
  }).map(r => r.data);

  const [placeUpvote, toiletUpvote] = useQueries({
    queries: [
      {
        queryKey: ['ReviewHistory', 'Upvote', UpvoteTargetTypeDto.PlaceReview],
        queryFn: async () =>
          (await api.listUpvotedPlaceReviewsPost({limit: 1})).data,
      },
      {
        queryKey: ['ReviewHistory', 'Upvote', UpvoteTargetTypeDto.ToiletReview],
        queryFn: async () =>
          (await api.listUpvotedToiletReviewsPost({limit: 1})).data,
      },
    ],
  }).map(r => r.data);

  const totalNumberOfReviews =
    (placeReview?.totalNumberOfItems ?? 0) +
    (toiletReview?.totalNumberOfItems ?? 0);

  const totalNumberOfUpvote =
    (placeUpvote?.totalNumberOfUpvotes ?? 0) +
    (toiletUpvote?.totalNumberOfUpvotes ?? 0);

  return (
    <View className="pt-3 px-5">
      <Text className="py-5 text-[18px] leading-[29px] font-pretendard-bold text-black">
        리뷰 히스토리
      </Text>
      <View className="h-[1px] bg-gray-20" />
      <ActivityHistoryLink
        elementName="review_link"
        onPress={() => navigation.navigate('Review/History')}
        title="내가 작성한 리뷰"
        count={totalNumberOfReviews}
      />
      <ActivityHistoryLink
        elementName="review_upvote_link"
        onPress={() => navigation.navigate('Review/Upvote')}
        title="도움이 돼요"
        count={totalNumberOfUpvote}
      />
    </View>
  );
}
