import {FlashList} from '@shopify/flash-list';
import {useInfiniteQuery} from '@tanstack/react-query';
import React from 'react';
import {Dimensions, Image, Linking} from 'react-native';
import styled from 'styled-components/native';

import BookmarkIcon from '@/assets/icon/ic_bookmark.svg';
import BannerDecoration from '@/assets/icon/ic_banner_decoration.svg';
import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
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
        <ListContainer>
          <FlashList
            contentContainerStyle={{
              backgroundColor: color.white,
              paddingBottom: 140,
            }}
            data={placeLists}
            keyExtractor={item => item.id}
            renderItem={({item, index}) => (
              <SccPressable
                elementName="saved_place_list_item"
                logParams={{placeListId: item.id}}
                onPress={() => handleItemPress(item)}>
                <ItemWrapper isFirst={index === 0}>
                  <IconCircle
                    isMyPlaces={item.type === PlaceListTypeDto.MyPlaces}>
                    <BookmarkIcon width={20} height={20} color={color.white} />
                  </IconCircle>
                  <ItemContent>
                    <ItemName numberOfLines={1}>{item.name}</ItemName>
                    <ItemPlaceCount>{item.placeCount}곳</ItemPlaceCount>
                  </ItemContent>
                  <ChevronRightIcon width={20} height={20} color="#B4B4C0" />
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
          <BannerContainer>
            <SccPressable
              elementName="saved_place_lists_request_banner"
              onPress={handleBannerPress}>
              <BannerContent>
                <BannerTextContainer>
                  <BannerSubText>
                    계단뿌셔클럽이 직접 만들어 드릴게요!
                  </BannerSubText>
                  <BannerMainText>저장리스트를 요청해주세요~</BannerMainText>
                </BannerTextContainer>
                <MegaphoneImage
                  source={require('@/assets/img/banner_megaphone.png')}
                />
                <DecorationContainer>
                  <BannerDecoration width={24} height={18} />
                </DecorationContainer>
              </BannerContent>
            </SccPressable>
          </BannerContainer>
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
  border-top-color: #eff0f2;
  gap: 12px;
`;

const IconCircle = styled.View<{isMyPlaces: boolean}>`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${({isMyPlaces}) => (isMyPlaces ? '#67AEFF' : '#FFC01E')};
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
`;

const ItemPlaceCount = styled.Text`
  font-size: 13px;
  font-family: ${() => font.pretendardRegular};
  color: #a0a2ae;
  line-height: 18px;
`;

const BannerContainer = styled.View`
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  align-items: center;
`;

const BannerContent = styled.View`
  width: ${Math.min(350, Dimensions.get('window').width - 40)}px;
  height: 67px;
  background-color: rgba(103, 174, 255, 0.8);
  border-radius: 6px;
  flex-direction: row;
  align-items: center;
  padding-left: 12px;
  padding-right: 16px;
  overflow: hidden;
`;

const BannerTextContainer = styled.View`
  flex: 1;
  gap: 4px;
`;

const BannerSubText = styled.Text`
  font-size: 11px;
  font-family: ${() => font.pretendardRegular};
  color: ${() => color.white};
  letter-spacing: -0.44px;
`;

const BannerMainText = styled.Text`
  font-size: 16px;
  font-family: ${() => font.pretendardBold};
  color: ${() => color.white};
  letter-spacing: -0.32px;
  line-height: 19.2px;
`;

const MegaphoneImage = styled(Image)`
  width: 71px;
  height: 71px;
  transform: rotate(1.23deg);
`;

const DecorationContainer = styled.View`
  position: absolute;
  bottom: -4px;
  right: 40px;
  transform: rotate(-7.64deg);
`;
