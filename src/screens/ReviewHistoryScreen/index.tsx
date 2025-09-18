import EmptyViewText from '@/components/empty/EmptyViewText';
import {ScreenLayout} from '@/components/ScreenLayout';
import TabBar from '@/components/TabBar';
import {color} from '@/constant/color';
import {UpvoteTargetTypeDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {FlashList} from '@shopify/flash-list';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useState} from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';
import AchievementsSection from '../ConquererHistoryScreen/sections/AchievementsSection';
import ReviewHistoryPlaceReviewItem from './components/PlaceReviewItem';
import ReviewHistoryPlaceToiletReviewItem from './components/PlaceToiletReviewItem';
import {tabItems} from './constants';

// 지금까지 내가 작성한 리뷰
export default function ReviewHistoryScreen() {
  const {api} = useAppComponents();
  const [currentTab, setCurrentTab] =
    useState<UpvoteTargetTypeDto>('PLACE_REVIEW');

  const {data, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteQuery({
      queryKey: ['ReviewList', currentTab],
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
      <AchievementsSection
        type="review"
        totalNumberOfPlaces={totalNumberOfReviews}
      />

      <FlashList
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
                <View
                  style={{
                    padding: 20,
                    gap: 16,
                  }}>
                  <ReviewHistoryPlaceReviewItem
                    placeId={item.placeId}
                    review={item}
                  />
                </View>
                <Divider />
              </>
            );
          } else {
            return (
              <>
                <View
                  style={{
                    padding: 20,
                    gap: 16,
                  }}>
                  <ReviewHistoryPlaceToiletReviewItem
                    placeId={item.placeId}
                    review={item}
                  />
                </View>
                <Divider />
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
        ListEmptyComponent={<EmptyViewText>{/* TODO */}</EmptyViewText>}
        ListFooterComponent={<PaddingBottom />}
      />
    </ScreenLayout>
  );
}

const Divider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
`;

const PaddingBottom = styled.View`
  padding-bottom: 100px;
`;
