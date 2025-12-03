import React from 'react';
import {Text, View} from 'react-native';

import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
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
    +(placeUpvote?.totalNumberOfUpvotes ?? 0) +
    (toiletUpvote?.totalNumberOfUpvotes ?? 0);

  return (
    <View className="pt-3 px-5">
      <Text className="py-5 text-[18px] leading-[29px] font-pretendard-bold">
        리뷰 히스토리
      </Text>
      <View className="h-px bg-gray-20" />
      <SccPressable
        elementName="review_link"
        onPress={() => navigation.navigate('Review/History')}
        className="flex-row justify-between items-center py-5">
        <View className="flex-row items-center">
          <Text className="text-[16px] leading-[24px] font-pretendard">
            내가 작성한 리뷰
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="py-1 px-3 rounded-xl bg-brand-5 mr-1">
            <Text className="text-[14px] leading-[22px] font-pretendard-bold text-brand-50">
              {totalNumberOfReviews.toLocaleString()}
            </Text>
          </View>
          <ChevronRightIcon width={20} height={20} color={color.gray30} />
        </View>
      </SccPressable>
      <SccPressable
        elementName="review_upvote_link"
        onPress={() => navigation.navigate('Review/Upvote')}
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
    </View>
  );
}
