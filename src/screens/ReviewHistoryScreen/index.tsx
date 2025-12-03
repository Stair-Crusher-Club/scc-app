import {View} from 'react-native';

import EmptyViewText from '@/components/empty/EmptyViewText';
import {ScreenLayout} from '@/components/ScreenLayout';
import TabBar from '@/components/TabBar';
import {UpvoteTargetTypeDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {FlashList} from '@shopify/flash-list';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AchievementsSection from '../ConquererHistoryScreen/sections/AchievementsSection';
import ReviewHistoryPlaceReviewItem from './components/PlaceReviewItem';
import ReviewHistoryPlaceToiletReviewItem from './components/PlaceToiletReviewItem';
import {tabItems} from './constants';

// 내가 작성한 리뷰
export default function ReviewHistoryScreen() {
  const insets = useSafeAreaInsets();

  const {api} = useAppComponents();
  const [currentTab, setCurrentTab] =
    useState<UpvoteTargetTypeDto>('PLACE_REVIEW');

  const {data, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteQuery({
      queryKey: ['MyReviews', currentTab],
      queryFn: async ({pageParam}) => {
        if (currentTab === 'PLACE_REVIEW') {
          return (
            await api.listRegisteredPlaceReviewsPost({
              nextToken: pageParam,
              limit: 20,
            })
          ).data;
        } else {
          return (
            await api.listRegisteredToiletReviewsPost({
              nextToken: pageParam,
              limit: 20,
            })
          ).data;
        }
      },
      getNextPageParam: lastPage => {
        return lastPage.nextToken;
      },
      initialPageParam: undefined as string | undefined,
    });

  const totalNumberOfReviews = data?.pages[0].totalNumberOfItems ?? 0;

  return (
    <ScreenLayout isHeaderVisible={true}>
      <TabBar items={tabItems} current={currentTab} onChange={setCurrentTab} />
      <FlashList
        contentContainerStyle={{
          paddingBottom: insets.bottom,
        }}
        data={
          data?.pages.flatMap(page => {
            if (currentTab === 'PLACE_REVIEW') {
              return (page as any).placeReviews;
            } else {
              return (page as any).toiletReviews;
            }
          }) ?? []
        }
        renderItem={({item}) => {
          if (currentTab === 'PLACE_REVIEW') {
            return (
              <>
                <View className="p-5 gap-4">
                  <ReviewHistoryPlaceReviewItem
                    placeId={item.placeId}
                    review={item}
                  />
                </View>
                <View className="h-px bg-gray-20" />
              </>
            );
          } else {
            return (
              <>
                <View className="p-5 gap-4">
                  <ReviewHistoryPlaceToiletReviewItem
                    placeId={item.placeId}
                    review={item}
                  />
                </View>
                <View className="h-px bg-gray-20" />
              </>
            );
          }
        }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <AchievementsSection
            type="review"
            totalNumberOfPlaces={totalNumberOfReviews}
          />
        }
        ListEmptyComponent={<EmptyViewText>{/* TODO */}</EmptyViewText>}
      />
    </ScreenLayout>
  );
}
