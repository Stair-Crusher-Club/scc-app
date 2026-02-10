import {FlashList} from '@shopify/flash-list';
import {useInfiniteQuery} from '@tanstack/react-query';
import React from 'react';
import styled from 'styled-components/native';

import {ScreenLayout} from '@/components/ScreenLayout';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PlaceListDto, PlaceListTypeDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigation from '@/navigation/useNavigation';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';

export default function SavedPlaceListsScreen() {
  const navigation = useNavigation();
  const {api} = useAppComponents();

  const {data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading} =
    useInfiniteQuery({
      queryKey: ['SavedPlaceLists'],
      queryFn: async ({pageParam}) =>
        (
          await api.listSavedPlaceLists({
            cursor: pageParam ?? undefined,
            limit: 20,
          })
        ).data,
      getNextPageParam: lastPage => {
        return lastPage.cursor ?? undefined;
      },
      initialPageParam: undefined as string | undefined,
    });

  const placeLists = data?.pages.flatMap(page => page.items ?? []) ?? [];

  const handleItemPress = (item: PlaceListDto) => {
    navigation.navigate('PlaceListDetail', {placeListId: item.id});
  };

  return (
    <ScreenLayout isHeaderVisible={true}>
      {isLoading ? (
        <SearchLoading />
      ) : placeLists.length === 0 ? (
        <NoResultContainer>
          <NoResultText>저장한 리스트가 없습니다.</NoResultText>
        </NoResultContainer>
      ) : (
        <ListContainer>
          <FlashList
            contentContainerStyle={{
              backgroundColor: 'white',
              paddingBottom: 100,
            }}
            data={placeLists}
            renderItem={({item, index}) => (
              <SccPressable
                elementName="saved_place_list_item"
                logParams={{placeListId: item.id}}
                onPress={() => handleItemPress(item)}>
                <ItemWrapper isFirst={index === 0}>
                  <ItemContent>
                    <ItemNameRow>
                      <ItemName numberOfLines={1}>{item.name}</ItemName>
                      {item.type === PlaceListTypeDto.MyPlaces && (
                        <TypeBadge>
                          <TypeBadgeText>MY</TypeBadgeText>
                        </TypeBadge>
                      )}
                    </ItemNameRow>
                    <ItemPlaceCount>{item.placeCount}개의 장소</ItemPlaceCount>
                  </ItemContent>
                </ItemWrapper>
              </SccPressable>
            )}
            estimatedItemSize={80}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
          />
        </ListContainer>
      )}
    </ScreenLayout>
  );
}

const ListContainer = styled.View`
  flex: 1;
`;

const NoResultContainer = styled.View`
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const NoResultText = styled.Text`
  font-size: 14px;
  font-family: ${() => font.pretendardMedium};
  padding-bottom: 120px;
  color: ${() => color.gray50};
`;

const ItemWrapper = styled.View<{isFirst: boolean}>`
  padding: 16px 20px;
  border-top-width: ${({isFirst}) => (isFirst ? '0' : '1px')};
  border-top-color: ${() => color.gray20};
`;

const ItemContent = styled.View`
  gap: 4px;
`;

const ItemNameRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const ItemName = styled.Text`
  font-size: 16px;
  font-family: ${() => font.pretendardBold};
  color: ${() => color.black};
  flex-shrink: 1;
`;

const TypeBadge = styled.View`
  background-color: ${() => color.blue5};
  border-radius: 4px;
  padding: 2px 6px;
`;

const TypeBadgeText = styled.Text`
  font-size: 11px;
  font-family: ${() => font.pretendardMedium};
  color: ${() => color.blue50};
`;

const ItemPlaceCount = styled.Text`
  font-size: 13px;
  font-family: ${() => font.pretendardRegular};
  color: ${() => color.gray50};
`;
