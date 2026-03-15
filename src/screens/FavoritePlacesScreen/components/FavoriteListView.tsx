import {FlashList} from '@shopify/flash-list';
import {useInfiniteQuery} from '@tanstack/react-query';
import React from 'react';
import {View} from 'react-native';

import {cn} from '@/utils/cn';
import useAppComponents from '@/hooks/useAppComponents';
import {usePlaceDetailScreenName} from '@/hooks/useFeatureFlags';
import useNavigation from '@/navigation/useNavigation';
import SearchItemCard from '@/screens/SearchScreen/components/SearchItemCard';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';

import FavoriteNoResult from './FavoriteNoResult';

export default function FavoriteListView() {
  const navigation = useNavigation();
  const pdpScreen = usePlaceDetailScreenName();
  const {api} = useAppComponents();
  const {data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading} =
    useInfiniteQuery({
      queryKey: ['FavoritePlaces'],
      queryFn: async ({pageParam}) =>
        (
          await api.listPlaceFavoritesPost({
            nextToken: pageParam,
            limit: 20,
          })
        ).data,
      getNextPageParam: lastPage => {
        return lastPage.nextToken;
      },
      initialPageParam: undefined as string | undefined,
    });
  const places = data?.pages.flatMap(page => page.items ?? []) ?? [];

  return (
    <>
      {isLoading ? (
        <SearchLoading />
      ) : places.length === 0 ? (
        <FavoriteNoResult />
      ) : (
        <View className="flex-1">
          <FlashList
            className="bg-white"
            contentContainerClassName="bg-white pb-[100px]"
            data={places}
            renderItem={({item, index}) => (
              <View
                key={item.place.id}
                className={cn(
                  'border-gray-20 p-5',
                  index === 0 ? 'border-t-0' : 'border-t-[1px]',
                )}>
                <SearchItemCard
                  item={item}
                  isHeightFlex
                  onPress={() => {
                    navigation.navigate(pdpScreen, {
                      placeInfo: {
                        placeId: item.place.id,
                      },
                    });
                  }}
                />
              </View>
            )}
            estimatedItemSize={220}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
          />
        </View>
      )}
    </>
  );
}
