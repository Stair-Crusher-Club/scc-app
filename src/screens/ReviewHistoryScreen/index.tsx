import EmptyViewText from '@/components/empty/EmptyViewText';
import {ScreenLayout} from '@/components/ScreenLayout';
import TabBar from '@/components/TabBar';
import {color} from '@/constant/color';
import useAppComponents from '@/hooks/useAppComponents';
import {UpdateUpvoteStatusParams} from '@/screens/PlaceDetailScreen/types';
import ToastUtils from '@/utils/ToastUtils';
import {FlashList} from '@shopify/flash-list';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useState} from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';
import AchievementsSection from '../ConquererHistoryScreen/sections/AchievementsSection';
import PlaceReviewItem from './components/PlaceReviewItem';
import PlaceToiletReviewItem from './components/PlaceToiletReviewItem';
import {tabItems} from './constants';
import {ReviewHistoryTab} from './types';

export default function ReviewHistoryScreen() {
  const {api} = useAppComponents();
  const [currentTab, setCurrentTab] = useState<ReviewHistoryTab>('place');

  const updateUpvoteStatus = async ({
    id,
    newUpvotedStatus,
    targetType,
  }: UpdateUpvoteStatusParams) => {
    try {
      if (newUpvotedStatus === false) {
        await api.cancelUpvotePost({
          id,
          targetType,
        });
      } else {
        await api.giveUpvotePost({
          id,
          targetType,
        });
      }
      ToastUtils.show('좋은 의견 감사합니다!');
      return true;
    } catch (error: any) {
      ToastUtils.showOnApiError(error);
      return false;
    }
  };

  const {data, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteQuery({
      queryKey: ['ReviewList', currentTab],
      queryFn: async ({pageParam}) => {
        if (currentTab === 'place') {
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
            if (currentTab === 'place') {
              return (page as any).placeReviews;
            } else {
              return (page as any).toiletReviews;
            }
          }) ?? []
        }
        renderItem={({item}) => {
          if (currentTab === 'place') {
            return (
              <>
                <View
                  style={{
                    padding: 20,
                    gap: 16,
                  }}>
                  <PlaceReviewItem
                    placeId={item.placeId}
                    review={item}
                    updateUpvoteStatus={updateUpvoteStatus}
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
                  <PlaceToiletReviewItem
                    placeId={item.placeId}
                    review={item}
                    updateUpvoteStatus={updateUpvoteStatus}
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
      />
    </ScreenLayout>
  );
}

const Divider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
`;
