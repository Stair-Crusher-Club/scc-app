import {FlashList} from '@shopify/flash-list';
import {useInfiniteQuery} from '@tanstack/react-query';
import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {PlaceListItem} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigation from '@/navigation/useNavigation';
import SearchItemCard from '@/screens/SearchScreen/components/SearchItemCard';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';

import FavoriteNoResult from './FavoriteNoResult';

export default function FavoriteListView() {
  const navigation = useNavigation();
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

  // TODO: api yaml 업데이트
  const places = data?.pages.flatMap(
    page => (page.items as unknown as PlaceListItem[]) ?? [],
  );

  return (
    <>
      {isLoading ? (
        <SearchLoading />
      ) : places?.length === 0 ? (
        <FavoriteNoResult />
      ) : (
        <ListContainer>
          <FlashList
            contentContainerStyle={{
              backgroundColor: 'white',
              paddingBottom: 100,
            }}
            data={places}
            renderItem={({item, index}) => (
              <ItemWrapper key={item.place.id} isFirst={index === 0}>
                <SearchItemCard
                  item={item}
                  isHeightFlex
                  onPress={() => {
                    navigation.navigate('PlaceDetail', {
                      placeInfo: {
                        placeId: item.place.id,
                      },
                    });
                  }}
                />
              </ItemWrapper>
            )}
            estimatedItemSize={220}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
          />
        </ListContainer>
      )}
    </>
  );
}

const ListContainer = styled.View`
  flex: 1;
`;

const ItemWrapper = styled.View<{isFirst: boolean}>`
  padding: 20px;
  border-top-width: ${({isFirst}) => (isFirst ? '0' : '1px')};
  border-top-color: ${() => color.gray20};
`;
