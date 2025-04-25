import {FlashList} from '@shopify/flash-list';
import {useInfiniteQuery} from '@tanstack/react-query';
import React from 'react';
import styled from 'styled-components/native';

import {ScreenLayout} from '@/components/ScreenLayout';
import useAppComponents from '@/hooks/useAppComponents';
import ConqueredPlaceItem from '@/screens/ConquererHistoryScreen/sections/ConqueredPlaceItem';

import AchivementsSection from './sections/AchivementsSection';

export default function ConquererHistoryScreen() {
  const {api} = useAppComponents();
  const {data, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteQuery({
      queryKey: ['ConqueredPlaces'],
      queryFn: async ({pageParam}) =>
        (
          await api.listConqueredPlacesPost({
            nextToken: pageParam,
            limit: 20,
          })
        ).data,
      getNextPageParam: lastPage => {
        return lastPage.nextToken;
      },
      initialPageParam: undefined as string | undefined,
    });
  const places = data?.pages.flatMap(page => page.items ?? []);

  return (
    <ScreenLayout isHeaderVisible={true}>
      <ListContainer>
        <FlashList
          contentContainerStyle={{backgroundColor: 'white'}}
          ListHeaderComponent={
            <AchivementsSection
              totalNumberOfPlaces={data?.pages[0].totalNumberOfItems ?? 0}
            />
          }
          data={places}
          renderItem={({item}) => <ConqueredPlaceItem p={item} />}
          estimatedItemSize={50}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
        />
      </ListContainer>
    </ScreenLayout>
  );
}

const ListContainer = styled.View`
  flex: 1;
`;
