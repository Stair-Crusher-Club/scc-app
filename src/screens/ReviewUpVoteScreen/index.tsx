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
import {tabItems} from '../ReviewHistoryScreen/constants';
import ReviewUpvoteItem from './components/ReviewUpvoteItem';

export default function ReviewUpVoteScreen() {
  const {api} = useAppComponents();
  const [currentTab, setCurrentTab] =
    useState<UpvoteTargetTypeDto>('PLACE_REVIEW');

  const {data, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteQuery({
      queryKey: ['ReviewsUpvoted', currentTab],
      queryFn: async ({pageParam}) => {
        if (currentTab === 'PLACE_REVIEW') {
          return (
            await api.listUpvotedPlaceReviewsPost({
              nextToken: pageParam,
              limit: 20,
            })
          ).data;
        } else {
          return (
            await api.listUpvotedToiletReviewsPost({
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

  return (
    <ScreenLayout isHeaderVisible={true}>
      <TabBar items={tabItems} current={currentTab} onChange={setCurrentTab} />

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
        renderItem={({item}) => (
          <>
            <View
              style={{
                padding: 20,
              }}>
              <ReviewUpvoteItem item={item} />
            </View>
            <Divider />
          </>
        )}
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
