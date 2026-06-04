import {FlashList} from '@shopify/flash-list';
import {useInfiniteQuery} from '@tanstack/react-query';
import React, {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import SccRemoteImage from '@/components/SccRemoteImage';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {UserSavedContentDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigation from '@/navigation/useNavigation';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';

const ESTIMATED_ITEM_HEIGHT = 200;

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

  const handleItemPress = useCallback(
    (item: UserSavedContentDto) => {
      navigation.navigate('Webview', {url: item.sccContent.url});
    },
    [navigation],
  );

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
        contentContainerStyle={{backgroundColor: color.white}}
        data={items}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => (
          <SavedContentItem
            item={item}
            isFirst={index === 0}
            onPress={() => handleItemPress(item)}
          />
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

interface SavedContentItemProps {
  item: UserSavedContentDto;
  isFirst: boolean;
  onPress: () => void;
}

function SavedContentItem({item, isFirst, onPress}: SavedContentItemProps) {
  const {sccContent} = item;
  const webPageDetail = sccContent.webPageDetail;
  const imageUrls = webPageDetail?.imageUrls ?? [];
  const displayedImages = imageUrls.slice(0, 5);
  const extraImageCount = Math.max(0, imageUrls.length - 5);

  return (
    <SccPressable
      elementName="saved-content-item"
      logParams={{sccContentId: sccContent.id}}
      onPress={onPress}>
      <ItemContainer isFirst={isFirst}>
        {webPageDetail?.title ? (
          <ItemTitle numberOfLines={2}>{webPageDetail.title}</ItemTitle>
        ) : (
          <ItemTitle numberOfLines={2}>{sccContent.url}</ItemTitle>
        )}

        {webPageDetail?.description ? (
          <ItemDescription numberOfLines={2}>
            {webPageDetail.description}
          </ItemDescription>
        ) : null}

        {displayedImages.length === 0 ? null : displayedImages.length < 5 ? (
          <ItemImageRow>
            {displayedImages.map((url, i) => (
              <SccRemoteImage
                key={`${url}-${i}`}
                imageUrl={url}
                resizeMode="cover"
                wrapperBackgroundColor={null}
                style={{width: 72, height: 72, borderRadius: 6}}
              />
            ))}
          </ItemImageRow>
        ) : (
          <ItemImageRow>
            {displayedImages.map((url, i) => (
              <ItemImageCell key={`${url}-${i}`}>
                <SccRemoteImage
                  imageUrl={url}
                  resizeMode="cover"
                  wrapperBackgroundColor={null}
                  style={StyleSheet.absoluteFillObject}
                />
                {i === displayedImages.length - 1 && extraImageCount > 0 ? (
                  <ItemImageOverlay>
                    <ItemImageOverlayText>
                      +{extraImageCount}
                    </ItemImageOverlayText>
                  </ItemImageOverlay>
                ) : null}
              </ItemImageCell>
            ))}
          </ItemImageRow>
        )}
      </ItemContainer>
    </SccPressable>
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

const ItemContainer = styled.View<{isFirst: boolean}>`
  padding: 16px 20px;
  background-color: ${color.white};
  border-top-width: ${({isFirst}) => (isFirst ? '0' : '1px')};
  border-top-color: #f2f2f5;
`;

const ItemTitle = styled.Text`
  font-size: 17px;
  font-family: ${() => font.pretendardBold};
  color: ${color.brand50};
  line-height: 24px;
  margin-bottom: 4px;
`;

const ItemDescription = styled.Text`
  font-size: 13px;
  font-family: ${() => font.pretendardRegular};
  color: ${color.gray70};
  line-height: 20px;
  margin-bottom: 12px;
`;

const ItemImageRow = styled.View`
  flex-direction: row;
  gap: 4px;
`;

const ItemImageCell = styled.View`
  flex: 1;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  background-color: ${color.gray15};
  position: relative;
`;

const ItemImageOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
  align-items: center;
  justify-content: center;
`;

const ItemImageOverlayText = styled.Text`
  color: ${color.white};
  font-size: 14px;
  font-family: ${() => font.pretendardSemibold};
`;
