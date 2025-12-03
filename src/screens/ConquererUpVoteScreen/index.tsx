import {View} from 'react-native';

import EmptyViewText from '@/components/empty/EmptyViewText';
import {ScreenLayout} from '@/components/ScreenLayout';
import useAppComponents from '@/hooks/useAppComponents';
import {FlashList} from '@shopify/flash-list';
import {useInfiniteQuery} from '@tanstack/react-query';

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
      <View className="border-b border-gray-20" />
      <FlashList
        data={places}
        renderItem={({item}) => (
          <>
            <View className="p-5">
              <UpvotedPlaceItem item={item} />
            </View>
            <View className="h-px bg-gray-20" />
          </>
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<EmptyViewText>{/* TODO */}</EmptyViewText>}
        ListFooterComponent={<View className="pb-[100px]" />}
      />
    </ScreenLayout>
  );
}
