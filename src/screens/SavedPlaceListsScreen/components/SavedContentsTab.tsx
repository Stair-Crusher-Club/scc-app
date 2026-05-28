import {FlashList} from '@shopify/flash-list';
import {useInfiniteQuery} from '@tanstack/react-query';
import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import BookmarkFilledIcon from '@/assets/icon/ic_bookmark_filled.svg';
import {SccPressable} from '@/components/SccPressable';
import SccRemoteImage from '@/components/SccRemoteImage';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {UserSavedContentDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigation from '@/navigation/useNavigation';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';

const ESTIMATED_ITEM_HEIGHT = 88;

export default function SavedContentsTab() {
  const navigation = useNavigation();
  const {api} = useAppComponents();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['SavedContents'],
    queryFn: async ({pageParam}) =>
      (
        await api.listSavedContents({
          nextToken: pageParam ?? undefined,
          limit: 20,
        })
      ).data,
    getNextPageParam: lastPage => {
      return lastPage.nextToken ?? undefined;
    },
    initialPageParam: undefined as string | undefined,
  });

  const items: UserSavedContentDto[] =
    data?.pages.flatMap(page => page.items ?? []) ?? [];

  const handleItemPress = (item: UserSavedContentDto) => {
    navigation.navigate('Webview', {url: item.sccContent.url});
  };

  if (isLoading) {
    return <SearchLoading />;
  }

  if (isError) {
    return (
      <NoResultContainer>
        <NoResultText>저장한 컨텐츠를 불러올 수 없습니다.</NoResultText>
      </NoResultContainer>
    );
  }

  if (items.length === 0) {
    return (
      <NoResultContainer>
        <NoResultText>저장한 컨텐츠가 없습니다.</NoResultText>
      </NoResultContainer>
    );
  }

  return (
    <ListContainer>
      <FlashList
        contentContainerStyle={{
          backgroundColor: color.white,
        }}
        data={items}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => (
          <SccPressable
            elementName="saved_content_item"
            logParams={{sccContentId: item.sccContent.id}}
            onPress={() => handleItemPress(item)}>
            <ItemWrapper isFirst={index === 0}>
              {item.sccContent.thumbnailUrl ? (
                <ThumbnailWrapper>
                  <SccRemoteImage
                    imageUrl={item.sccContent.thumbnailUrl}
                    fixedHeight={56}
                    resizeMode="cover"
                    style={{width: 56, height: 56, borderRadius: 8}}
                  />
                </ThumbnailWrapper>
              ) : (
                <ThumbnailPlaceholder>
                  <BookmarkFilledIcon
                    width={20}
                    height={20}
                    color={color.gray50}
                  />
                </ThumbnailPlaceholder>
              )}
              <ItemContent>
                <ItemTitle numberOfLines={2}>
                  {item.sccContent.title ?? item.sccContent.url}
                </ItemTitle>
              </ItemContent>
            </ItemWrapper>
          </SccPressable>
        )}
        estimatedItemSize={ESTIMATED_ITEM_HEIGHT}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </ListContainer>
  );
}

const ListContainer = styled(View)`
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
  flex-direction: row;
  align-items: center;
  padding-left: 20px;
  padding-right: 16px;
  padding-vertical: 16px;
  border-top-width: ${({isFirst}) => (isFirst ? '0' : '1px')};
  border-top-color: #f2f2f5;
  gap: 12px;
`;

const ThumbnailWrapper = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${color.gray15};
`;

const ThumbnailPlaceholder = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background-color: ${color.gray15};
  align-items: center;
  justify-content: center;
`;

const ItemContent = styled.View`
  flex: 1;
  gap: 2px;
`;

const ItemTitle = styled.Text`
  font-size: 15px;
  font-family: ${() => font.pretendardMedium};
  color: #16181c;
  line-height: 22px;
  letter-spacing: -0.3px;
`;
