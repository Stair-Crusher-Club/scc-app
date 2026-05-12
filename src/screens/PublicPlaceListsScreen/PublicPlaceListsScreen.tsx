import {FlashList} from '@shopify/flash-list';
import {useInfiniteQuery} from '@tanstack/react-query';
import React, {useCallback, useLayoutEffect} from 'react';
import styled from 'styled-components/native';

import BookmarkFilledIcon from '@/assets/icon/ic_bookmark_filled.svg';
import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PlaceListDto, PlaceListTypeDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';

const ESTIMATED_ITEM_HEIGHT = 72;

export interface PublicPlaceListsScreenParams {
  /**
   * 튜토리얼 미션 컨텍스트로 진입한 경우 true.
   * (현재 디자인에서는 별도 동작 없음. 추후 미션 완료 트래킹 등에 사용 가능.)
   */
  fromTutorial?: boolean;
}

/**
 * 저장리스트 모음 화면. 공개된 저장 리스트 목록을 조회한다.
 *
 * 디자인: Figma 1427:9091 (save list_list)
 * - 화면 헤더: "저장리스트 모음"
 * - 우측 상단 X 버튼 (variant: 'close')
 * - row 클릭 → 해당 저장리스트 상세 화면 (MyPlaces 타입은 FavoritePlaces로)
 *
 * 데이터 소스: listSavedPlaceLists. 서버가 MY_PLACES + NORMAL 리스트를 반환.
 * 히든 리스트 필터링은 서버에서 처리한다 (앱은 응답 그대로 노출).
 */
export default function PublicPlaceListsScreen({
  route,
  navigation,
}: ScreenProps<'PublicPlaceLists'>) {
  const fromTutorial = route.params?.fromTutorial ?? false;
  const {api} = useAppComponents();

  // 튜토리얼 컨텍스트(Figma 1648-38721)에서는 헤더 타이틀 없이 뒤로가기/닫기만 노출.
  // 일반/프로필 컨텍스트(Figma 1648-39054)에서는 "저장리스트 모음" 타이틀 노출.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: fromTutorial ? '' : '저장리스트 모음',
    });
  }, [fromTutorial, navigation]);

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
      getNextPageParam: lastPage => lastPage.cursor ?? undefined,
      initialPageParam: undefined as string | undefined,
    });

  const placeLists = data?.pages.flatMap(page => page.items ?? []) ?? [];

  const handleItemPress = useCallback(
    (item: PlaceListDto) => {
      if (item.type === PlaceListTypeDto.MyPlaces) {
        navigation.navigate('FavoritePlaces');
        return;
      }
      navigation.navigate('PlaceListDetail', {placeListId: item.id});
    },
    [navigation],
  );

  return (
    <ScreenLayout isHeaderVisible={true}>
      <LogParamsProvider params={{displaySectionName: 'public_place_lists'}}>
        <Container>
          {isLoading ? (
            <SearchLoading />
          ) : placeLists.length === 0 ? (
            <NoResultContainer>
              <NoResultText>공개된 저장 리스트가 없습니다.</NoResultText>
            </NoResultContainer>
          ) : (
            <FlashList
              data={placeLists}
              keyExtractor={item => item.id}
              renderItem={({item, index}) => (
                <SccPressable
                  elementName="public_place_list_item"
                  logParams={{placeListId: item.id, position: index}}
                  onPress={() => handleItemPress(item)}>
                  <ItemWrapper isFirst={index === 0}>
                    <IconTextGroup>
                      <IconCircle
                        bgColor={
                          item.type === PlaceListTypeDto.MyPlaces
                            ? '#67AEFF'
                            : (item.iconColor ?? '#FFC01E')
                        }>
                        <BookmarkFilledIcon
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
              estimatedItemSize={ESTIMATED_ITEM_HEIGHT}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.5}
            />
          )}
        </Container>
      </LogParamsProvider>
    </ScreenLayout>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${color.white};
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
  font-family: ${font.pretendardMedium};
  padding-bottom: 120px;
  color: ${color.gray50};
`;

const ItemWrapper = styled.View<{isFirst: boolean}>`
  flex-direction: row;
  align-items: center;
  padding-left: 20px;
  padding-right: 16px;
  padding-vertical: 20px;
  gap: 8px;
  background-color: ${color.white};
  border-top-width: ${({isFirst}) => (isFirst ? '0' : '1px')};
  border-top-color: #f2f2f5;
`;

const IconTextGroup = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
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
  font-family: ${font.pretendardRegular};
  color: #16181c;
  line-height: 24px;
  letter-spacing: -0.32px;
`;

const ItemPlaceCount = styled.Text`
  font-size: 13px;
  font-family: ${font.pretendardRegular};
  color: #a0a2ae;
  line-height: 18px;
  letter-spacing: -0.26px;
`;
