import {FlashList} from '@shopify/flash-list';
import {useInfiniteQuery} from '@tanstack/react-query';
import React, {useState} from 'react';
import {Dimensions, Image, Linking, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import BookmarkOnIcon from '@/assets/icon/ic_bookmark_on.svg';
import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PlaceListDto, PlaceListTypeDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigation from '@/navigation/useNavigation';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';

const BANNER_WIDTH = Math.min(350, Dimensions.get('window').width - 40);
const BANNER_HEIGHT = (BANNER_WIDTH / 350) * 67;
const ESTIMATED_ITEM_HEIGHT = 80;
const BANNER_GAP = 16;

export default function SavedPlaceListsScreen() {
  const navigation = useNavigation();
  const {api} = useAppComponents();
  const insets = useSafeAreaInsets();
  const [containerHeight, setContainerHeight] = useState(0);

  const bannerBottomOffset = insets.bottom + 80;
  const bannerTotalHeight = BANNER_HEIGHT + BANNER_GAP;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
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

  // 리스트 아이템이 배너 영역과 겹치는지 판단
  const estimatedContentHeight = placeLists.length * ESTIMATED_ITEM_HEIGHT;
  const bannerAreaTop =
    containerHeight - bannerBottomOffset - bannerTotalHeight;
  const shouldInlineBanner =
    containerHeight > 0 && estimatedContentHeight > bannerAreaTop;

  const handleItemPress = (item: PlaceListDto) => {
    if (item.type === PlaceListTypeDto.MyPlaces) {
      navigation.navigate('FavoritePlaces');
      return;
    }
    navigation.navigate('PlaceListDetail', {placeListId: item.id});
  };

  const handleBannerPress = () => {
    // TODO: 실제 URL 연결
    Linking.openURL('https://www.staircrusher.club');
  };

  const renderBanner = () => (
    <BannerWrapper>
      <SccPressable
        elementName="saved_place_lists_request_banner"
        onPress={handleBannerPress}>
        <BannerImage
          source={require('@/assets/img/saved_place_lists_banner.png')}
          resizeMode="contain"
        />
      </SccPressable>
    </BannerWrapper>
  );

  return (
    <ScreenLayout isHeaderVisible={true}>
      {isLoading ? (
        <SearchLoading />
      ) : isError ? (
        <NoResultContainer>
          <NoResultText>리스트를 불러올 수 없습니다.</NoResultText>
        </NoResultContainer>
      ) : placeLists.length === 0 ? (
        <NoResultContainer>
          <NoResultText>저장한 장소가 없습니다.</NoResultText>
        </NoResultContainer>
      ) : (
        <ListContainer
          onLayout={e => setContainerHeight(e.nativeEvent.layout.height)}>
          <FlashList
            contentContainerStyle={{
              backgroundColor: color.white,
              paddingBottom: shouldInlineBanner
                ? BANNER_GAP
                : bannerBottomOffset + bannerTotalHeight,
            }}
            data={placeLists}
            keyExtractor={item => item.id}
            renderItem={({item, index}) => (
              <SccPressable
                elementName="saved_place_list_item"
                logParams={{placeListId: item.id}}
                onPress={() => handleItemPress(item)}>
                <ItemWrapper isFirst={index === 0}>
                  <IconTextGroup>
                    <IconCircle
                      bgColor={
                        item.type === PlaceListTypeDto.MyPlaces
                          ? '#67AEFF'
                          : (item.iconColor ?? '#FFC01E')
                      }>
                      <BookmarkOnIcon
                        width={20}
                        height={20}
                        color={color.white}
                      />
                    </IconCircle>
                    <ItemContent>
                      <ItemName numberOfLines={1}>{item.name}</ItemName>
                      <ItemPlaceCount>{item.placeCount}곳</ItemPlaceCount>
                    </ItemContent>
                  </IconTextGroup>
                  <ChevronRightIcon width={20} height={20} color="#B4B4C0" />
                </ItemWrapper>
              </SccPressable>
            )}
            ListFooterComponent={shouldInlineBanner ? renderBanner : undefined}
            estimatedItemSize={ESTIMATED_ITEM_HEIGHT}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
          />
          {!shouldInlineBanner && (
            <View
              style={{
                position: 'absolute',
                bottom: bannerBottomOffset,
                left: 0,
                right: 0,
                alignItems: 'center',
              }}>
              {renderBanner()}
            </View>
          )}
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
  flex-direction: row;
  align-items: center;
  padding-left: 20px;
  padding-right: 16px;
  padding-vertical: 20px;
  border-top-width: ${({isFirst}) => (isFirst ? '0' : '1px')};
  border-top-color: #f2f2f5;
  gap: 8px;
`;

const IconTextGroup = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
`;

const IconCircle = styled.View<{bgColor: string}>`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${({bgColor}) => bgColor};
  align-items: center;
  justify-content: center;
`;

const ItemContent = styled.View`
  flex: 1;
  gap: 2px;
`;

const ItemName = styled.Text`
  font-size: 16px;
  font-family: ${() => font.pretendardRegular};
  color: #16181c;
  line-height: 24px;
  letter-spacing: -0.32px;
`;

const ItemPlaceCount = styled.Text`
  font-size: 13px;
  font-family: ${() => font.pretendardRegular};
  color: #a0a2ae;
  line-height: 18px;
  letter-spacing: -0.26px;
`;

const BannerWrapper = styled.View`
  align-items: center;
  padding-vertical: ${BANNER_GAP}px;
`;

const BannerImage = styled(Image)`
  width: ${BANNER_WIDTH}px;
  height: ${BANNER_HEIGHT}px;
  border-radius: 6px;
`;
