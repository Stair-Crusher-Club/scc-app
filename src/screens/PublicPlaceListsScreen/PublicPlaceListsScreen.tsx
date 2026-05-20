import {useFocusEffect} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import {useQuery} from '@tanstack/react-query';
import React, {useCallback} from 'react';
import styled from 'styled-components/native';

import BookmarkFilledIcon from '@/assets/icon/ic_bookmark_filled.svg';
import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  PlaceListAccessControlDto,
  PublicPlaceListDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';

const ESTIMATED_ITEM_HEIGHT = 72;
const PUBLIC_PLACE_LISTS_QUERY_KEY = ['PublicPlaceLists'];

export interface PublicPlaceListsScreenParams {
  /**
   * 튜토리얼 미션 컨텍스트로 진입한 경우 true.
   * 자식 PlaceListDetailScreen에서 SAVE_PLACE_LIST 미션 완료 시 overlay를 띄우는
   * 데에는 이 값이 직접 필요하지 않으나, 진입 트래킹 등에 활용된다.
   */
  fromTutorial?: boolean;
}

export default function PublicPlaceListsScreen({
  route,
  navigation,
}: ScreenProps<'PublicPlaceLists' | 'TutorialMissionSavePlaceList'>) {
  const {api} = useAppComponents();

  // 동일 컴포넌트가 두 라우트로 등록되어 있다 (PublicPlaceLists / TutorialMissionSavePlaceList).
  // 라우트 이름 자체로 진입 컨텍스트를 식별하므로 props.fromTutorial 보다 우선한다.
  const fromTutorial =
    route.name === 'TutorialMissionSavePlaceList' ||
    route.params?.fromTutorial === true;

  const {data, isLoading, refetch} = useQuery({
    queryKey: PUBLIC_PLACE_LISTS_QUERY_KEY,
    queryFn: async () => (await api.listPublicPlaceLists()).data,
  });

  // 튜토리얼 메인 미션 완료 직후 reward 히든 리스트가 응답에 prepend 되는데,
  // 캐시된 이전 응답이 살아있으면 신규 리스트가 노출되지 않는다. 화면 focus 마다 refetch.
  // 추가로, 미션 3 완료 시점에 호출자가 캐시 자체를 removeQueries 해 다음 진입이
  // empty → loading → fresh 흐름이 되도록 보장한다.
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const placeLists = data?.placeLists ?? [];

  const handleItemPress = useCallback(
    (item: PublicPlaceListDto) => {
      navigation.navigate('PlaceListDetail', {
        placeListId: item.id,
        fromTutorial,
      });
    },
    [navigation, fromTutorial],
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
                  logParams={{
                    placeListId: item.id,
                    position: index,
                    accessControl: item.accessControl,
                  }}
                  onPress={() => handleItemPress(item)}>
                  <ItemWrapper isFirst={index === 0}>
                    <IconTextGroup>
                      <IconCircle bgColor={resolveIconColor(item)}>
                        <BookmarkFilledIcon
                          width={20}
                          height={20}
                          color={color.white}
                        />
                      </IconCircle>
                      <ItemContent>
                        <ItemName numberOfLines={1}>{item.name}</ItemName>
                      </ItemContent>
                    </IconTextGroup>
                    <ChevronRightIcon width={20} height={20} color="#B4B4C0" />
                  </ItemWrapper>
                </SccPressable>
              )}
              estimatedItemSize={ESTIMATED_ITEM_HEIGHT}
            />
          )}
        </Container>
      </LogParamsProvider>
    </ScreenLayout>
  );
}

/**
 * 저장 리스트 row 아이콘 배경색.
 * - LINK_ONLY (히든 리스트): 검정 (#16181C).
 * - PUBLIC: 서버가 내려준 iconColor, 없으면 기본색 (#FFC01E).
 */
function resolveIconColor(item: PublicPlaceListDto): string {
  if (item.accessControl === PlaceListAccessControlDto.LinkOnly) {
    return '#16181C';
  }
  return item.iconColor ?? '#FFC01E';
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
