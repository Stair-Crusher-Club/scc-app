import EmptyViewText from '@/components/empty/EmptyViewText';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import useAppComponents from '@/hooks/useAppComponents';
import {FlashList} from '@shopify/flash-list';
import {useInfiniteQuery} from '@tanstack/react-query';
import {View} from 'react-native';
import styled from 'styled-components/native';
import UpvotedPlaceItem from './components/UpvotedPlaceItem';

export default function ConquererUpvoteScreen() {
  const {api} = useAppComponents();

  const {data, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteQuery({
      queryKey: ['PlacesUpvoted'],
      queryFn: async ({pageParam}) => {
        const result = await api.listUpvotedPlacesPost({
          nextToken: pageParam,
          limit: 20,
        });
        return result.data;
      },
      getNextPageParam: lastPage => {
        return lastPage.nextToken;
      },
      initialPageParam: undefined as string | undefined,
    });

  const places = data?.pages.flatMap(page => page.places ?? []) ?? [];

  return (
    <ScreenLayout isHeaderVisible={false}>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: color.gray20,
        }}
      />
      <FlashList
        data={places}
        renderItem={({item}) => (
          <>
            <View
              style={{
                padding: 20,
              }}>
              <UpvotedPlaceItem item={item} />
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
