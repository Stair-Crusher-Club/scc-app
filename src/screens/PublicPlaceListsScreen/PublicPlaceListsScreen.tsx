import {FlashList} from '@shopify/flash-list';
import {useQuery} from '@tanstack/react-query';
import React, {useCallback, useLayoutEffect, useMemo, useState} from 'react';
import styled from 'styled-components/native';

import {useMe} from '@/atoms/Auth';
import BookmarkFilledIcon from '@/assets/icon/ic_bookmark_filled.svg';
import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import MissionCompletedOverlay from '@/components/MissionCompletedOverlay';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  PlaceListAccessControlDto,
  PublicPlaceListDto,
  TutorialMissionTypeDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {useMissionCompletionWatcher} from '@/hooks/useMissionCompletionWatcher';
import {useUserTutorialProgress} from '@/hooks/useUserTutorialProgress';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';

const ESTIMATED_ITEM_HEIGHT = 72;
const PUBLIC_PLACE_LISTS_QUERY_KEY = ['PublicPlaceLists'];

export interface PublicPlaceListsScreenParams {
  /**
   * 튜토리얼 미션 컨텍스트로 진입한 경우 true.
   * 헤더 타이틀이 숨겨지고, SAVE_PLACE_LIST 미션 완료 시 오버레이가 노출된다.
   */
  fromTutorial?: boolean;
}

/**
 * 저장리스트 모음 화면. 공개된 저장 리스트 목록을 조회한다.
 *
 * 디자인: Figma 1427:9091 (save list_list)
 * - 화면 헤더: "저장리스트 모음" (튜토리얼에서는 빈 타이틀)
 * - 우측 상단 X 버튼 (variant: 'close')
 * - row 클릭 → 해당 저장리스트 상세 화면
 *
 * 데이터 소스: listPublicPlaceLists. 서버가 PUBLIC + (조건부) LINK_ONLY 리스트를 반환.
 * - 비인증/일반 사용자: PUBLIC만
 * - 튜토리얼 main 미션 모두 완료자: PUBLIC + LINK_ONLY (LINK_ONLY 우선 정렬)
 *
 * 미션 완료 오버레이는 SAVE_PLACE_LIST 미션이 미완료 → 완료로 전환된 시점에만 노출된다.
 * 즉, 사용자가 이 화면에서 리스트를 저장한 결과로 미션이 완료된 경우에만 노출된다.
 */
export default function PublicPlaceListsScreen({
  route,
  navigation,
}: ScreenProps<'PublicPlaceLists'>) {
  const fromTutorial = route.params?.fromTutorial ?? false;
  const {api} = useAppComponents();
  const {userInfo} = useMe();

  // 튜토리얼 컨텍스트(Figma 1648-38721)에서는 헤더 타이틀 없이 뒤로가기/닫기만 노출.
  // 일반/프로필 컨텍스트(Figma 1648-39054)에서는 "저장리스트 모음" 타이틀 노출.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: fromTutorial ? '' : '저장리스트 모음',
    });
  }, [fromTutorial, navigation]);

  const {data, isLoading} = useQuery({
    queryKey: PUBLIC_PLACE_LISTS_QUERY_KEY,
    queryFn: async () => (await api.listPublicPlaceLists()).data,
  });

  const placeLists = data?.placeLists ?? [];

  const handleItemPress = useCallback(
    (item: PublicPlaceListDto) => {
      navigation.navigate('PlaceListDetail', {placeListId: item.id});
    },
    [navigation],
  );

  // 미션 완료 오버레이 노출 제어.
  // SAVE_PLACE_LIST 미션이 미완료 → 완료로 전환되었고, 사용자가 이 화면 컨텍스트로
  // 진입한 경우에만 오버레이를 1회 노출한다.
  const [showMissionCompleted, setShowMissionCompleted] = useState(false);
  const {data: tutorialProgress} = useUserTutorialProgress();
  const isSavePlaceListMissionCompleted = useMemo(
    () =>
      tutorialProgress?.missions?.some(
        m =>
          m.missionType === TutorialMissionTypeDto.SavePlaceList &&
          m.completedAt != null,
      ) ?? false,
    [tutorialProgress],
  );

  useMissionCompletionWatcher({
    enabled: fromTutorial,
    isMissionCompleted: isSavePlaceListMissionCompleted,
    onJustCompleted: useCallback(() => {
      setShowMissionCompleted(true);
    }, []),
  });

  const handleMissionCompletedClose = useCallback(() => {
    setShowMissionCompleted(false);
    // 미션 화면으로 복귀하여 진행 상태 확인 유도.
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
                        <ItemPlaceCount>{item.placeCount}곳</ItemPlaceCount>
                      </ItemContent>
                    </IconTextGroup>
                    <ChevronRightIcon width={20} height={20} color="#B4B4C0" />
                  </ItemWrapper>
                </SccPressable>
              )}
              estimatedItemSize={ESTIMATED_ITEM_HEIGHT}
            />
          )}
          {showMissionCompleted && (
            <MissionCompletedOverlay
              isVisible={true}
              itemImage={require('@/assets/img/tutorial/item_map.png')}
              description={`접근성 지도 획득!\n${
                userInfo?.nickname ?? '크러셔'
              }님이 찾은 지도로 접근성 좋은\n맛집, 카페를 확인할 수 있게 됐어요!`}
              confirmElementName="tutorial_mission_2_completed_confirm"
              onClose={handleMissionCompletedClose}
            />
          )}
        </Container>
      </LogParamsProvider>
    </ScreenLayout>
  );
}

/**
 * 저장 리스트 row 아이콘 배경색.
 * - LINK_ONLY (히든 리스트): 검정 (#16181C). Figma 1427:9091 첫 번째 row 차별화.
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

const ItemPlaceCount = styled.Text`
  font-size: 13px;
  font-family: ${font.pretendardRegular};
  color: #a0a2ae;
  line-height: 18px;
  letter-spacing: -0.26px;
`;
