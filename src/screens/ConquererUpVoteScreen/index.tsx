import EmptyViewText from '@/components/empty/EmptyViewText';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import useAppComponents from '@/hooks/useAppComponents';
import {FlashList} from '@shopify/flash-list';
import {useInfiniteQuery} from '@tanstack/react-query';
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
      <HeaderBorder />
      <FlashList
        data={places}
        renderItem={({item}) => (
          <>
            <ItemContainer>
              <UpvotedPlaceItem item={item} />
            </ItemContainer>
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

const HeaderBorder = styled.View`
  border-bottom-width: 1px;
  border-bottom-color: ${color.gray20};
`;

const ItemContainer = styled.View`
  padding: 20px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
`;

const PaddingBottom = styled.View`
  padding-bottom: 100px;
`;
