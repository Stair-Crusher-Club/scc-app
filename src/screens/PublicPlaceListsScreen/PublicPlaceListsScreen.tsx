import {FlashList} from '@shopify/flash-list';
import {useInfiniteQuery} from '@tanstack/react-query';
import React, {useCallback, useState} from 'react';
import styled from 'styled-components/native';

import BookmarkFilledIcon from '@/assets/icon/ic_bookmark_filled.svg';
import BookmarkIcon from '@/assets/icon/ic_bookmark.svg';
import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PlaceListDto, PlaceListTypeDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {useFormExitConfirm} from '@/hooks/useFormExitConfirm';
import {useSavePlaceList} from '@/hooks/useSavePlaceList';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import FormExitConfirmBottomSheet from '@/modals/FormExitConfirmBottomSheet';
import {ScreenProps} from '@/navigation/Navigation.screens';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';
import {useCheckAuth} from '@/utils/checkAuth';

import MissionItemCollectedBottomSheet from './components/MissionItemCollectedBottomSheet';

const ESTIMATED_ITEM_HEIGHT = 80;

export interface PublicPlaceListsScreenParams {
  /** 튜토리얼 미션 컨텍스트로 진입한 경우 true. 저장 성공 시 외출템 수집 팝업을 노출. */
  fromTutorial?: boolean;
}

/**
 * 공개 저장 리스트 목록을 조회 및 저장(좋아요)할 수 있는 화면.
 * 미션 2 ("관심있는 저장리스트 저장하기")의 수행 화면.
 *
 * 현재 scc-api에는 "공개 리스트 목록" 전용 endpoint가 없으므로 listSavedPlaceLists를
 * 재사용. (서버가 MY_PLACES와 NORMAL 타입 리스트를 함께 반환)
 */
export default function PublicPlaceListsScreen({
  route,
  navigation,
}: ScreenProps<'PublicPlaceLists'>) {
  const fromTutorial = route.params?.fromTutorial ?? false;
  const {api} = useAppComponents();
  const checkAuth = useCheckAuth();
  const [showCollected, setShowCollected] = useState(false);
  // 저장 액션이 한 번이라도 발생했는지 추적 (form dirty 판단용).
  // useState로 관리해야 useFormExitConfirm의 enabled에 변경이 전파된다 (ref는 re-render
  // 를 트리거 안 함 → enabled가 영원히 초기값으로 고정됨).
  const [hasSavedAny, setHasSavedAny] = useState(false);

  // 튜토리얼 컨텍스트에서 새로 저장이 성공하면 외출템 수집 팝업을 즉시 set.
  // useEffect로 placeLists 변화를 watch하는 방식은 save → back 빠른 입력 시 unmount
  // 전에 placeLists가 반영되지 않으면 누락되므로, mutation 완료 직후 동기적으로 트리거.
  const toggleSave = useSavePlaceList({
    onSuccess: variables => {
      if (fromTutorial && !variables.isSaved) {
        // !isSaved → 방금 새로 저장됨
        setShowCollected(true);
      }
    },
  });

  // form dirty 시(저장 액션이 한 번 이상 발생했을 때만) 뒤로 가기 확인 modal trigger
  const formExitConfirm = useFormExitConfirm(
    action => {
      navigation.dispatch(action);
    },
    {enabled: hasSavedAny},
  );

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

  const handleToggleSave = useCallback(
    (item: PlaceListDto) => {
      checkAuth(() => {
        if (!item.isSaved) {
          setHasSavedAny(true);
        }
        toggleSave({isSaved: item.isSaved, placeListId: item.id});
      });
    },
    [checkAuth, toggleSave],
  );

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

  const handleCollectedClose = useCallback(() => {
    setShowCollected(false);
    navigation.goBack();
  }, [navigation]);

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
                    {item.type === PlaceListTypeDto.Normal ? (
                      <SaveButton
                        elementName="public_place_list_save_button"
                        logParams={{
                          placeListId: item.id,
                          isSaved: item.isSaved,
                        }}
                        onPress={() => handleToggleSave(item)}>
                        {item.isSaved ? (
                          <BookmarkFilledIcon
                            width={24}
                            height={24}
                            color={color.brand40}
                          />
                        ) : (
                          <BookmarkIcon
                            width={24}
                            height={24}
                            color={color.gray50}
                          />
                        )}
                      </SaveButton>
                    ) : (
                      <ChevronRightIcon
                        width={20}
                        height={20}
                        color="#B4B4C0"
                      />
                    )}
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
          {/*
           * dirty 조건은 useFormExitConfirm의 enabled로 처리하므로 BottomSheet는
           * 항상 마운트. (조건부 렌더링하면 enabled=true가 된 직후 첫 back 시 modal이
           * 마운트 전이라 사용자가 stuck 될 수 있다.)
           */}
          <FormExitConfirmBottomSheet
            isVisible={formExitConfirm.isVisible}
            onConfirm={formExitConfirm.onConfirm}
            onCancel={formExitConfirm.onCancel}
          />
          {showCollected && (
            <MissionItemCollectedBottomSheet
              isVisible={true}
              onClose={handleCollectedClose}
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

const SaveButton = styled(SccPressable)`
  padding: 4px;
`;
