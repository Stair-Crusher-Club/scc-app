import {useQuery} from '@tanstack/react-query';
import {useAtom} from 'jotai';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, ListRenderItemInfo, Share} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import {useMe} from '@/atoms/Auth';
import BookmarkIcon from '@/assets/icon/ic_bookmark.svg';
import BookmarkOnIcon from '@/assets/icon/ic_bookmark_on.svg';
import CheckColoredIcon from '@/assets/icon/ic_check_colored.svg';
import CloseIcon from '@/assets/icon/close.svg';
import MapIcon from '@/assets/icon/ic_map.svg';
import MenuIcon from '@/assets/icon/ic_menu.svg';
import ShareIcon from '@/assets/icon/ic_share_web.svg';
import MissionCompletedOverlay from '@/components/MissionCompletedOverlay';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import ItemMapView, {ItemMapViewHandle} from '@/components/maps/ItemMapView';
import {MarkerItem, toPlaceMarkerItem} from '@/components/maps/MarkerItem';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  PlaceListItem,
  SearchPlaceSortDto,
  TutorialMissionTypeDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {useSavePlaceList} from '@/hooks/useSavePlaceList';
import {useUserTutorialProgress} from '@/hooks/useUserTutorialProgress';
import {ScreenProps} from '@/navigation/Navigation.screens';
import SearchItemCard from '@/screens/SearchScreen/components/SearchItemCard';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {usePlaceDetailScreenName} from '@/hooks/useFeatureFlags';
import {useCheckAuth} from '@/utils/checkAuth';
import GeolocationUtils from '@/utils/GeolocationUtils';

import {placeListFilterAtom, placeListFilterModalStateAtom} from './atoms';
import FilterBar from './sections/FilterBar';
import PlaceListFilterModal from './sections/PlaceListFilterModal';

export interface PlaceListDetailScreenParams {
  placeListId: string;
}

type PlaceMarkerItem = MarkerItem & PlaceListItem;

type ViewMode = 'map' | 'list';

type ListSection =
  | {type: 'header'; key: string}
  | {type: 'filter'; key: string}
  | {type: 'place'; key: string; data: PlaceMarkerItem};

const PlaceListDetailScreen = ({
  route,
  navigation,
}: ScreenProps<'PlaceListDetail'>) => {
  const {placeListId} = route.params;
  const {api} = useAppComponents();
  const {userInfo} = useMe();
  const mapRef = useRef<ItemMapViewHandle<PlaceMarkerItem>>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const pdpScreen = usePlaceDetailScreenName();
  const checkAuth = useCheckAuth();
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useAtom(placeListFilterAtom);
  const [, setFilterModalState] = useAtom(placeListFilterModalStateAtom);

  // SAVE_PLACE_LIST 미션이 "아직 미완료" 상태일 때만 저장 액션이 미션 완료 트리거가 된다.
  // 기존엔 currentMissionType 으로 판단했는데, 미션 완료 후에도 useSavePlaceList 가
  // USER_TUTORIAL_PROGRESS 캐시를 invalidate 하지 않아서 currentMissionType 이 SavePlaceList
  // 로 stuck 되는 상황이 있었음 → 사용자가 같은 화면에서 저장 해제 → 다시 저장 시 완료 팝업이
  // 또 떴다. mission.completedAt 으로 판단하면 서버가 한 번 set 한 시점부터 영원히 true 이므로
  // 재노출이 원천 차단된다.
  const {data: tutorialProgress} = useUserTutorialProgress();
  const isSavePlaceListMissionCompleted =
    tutorialProgress?.missions.find(
      m => m.missionType === TutorialMissionTypeDto.SavePlaceList,
    )?.completedAt != null;
  // 현재 세션에서 이미 한 번 팝업을 보여줬으면 같은 진입 동안 다시 띄우지 않는다.
  const hasShownSaveMissionCompletedRef = useRef<boolean>(false);
  const [showSaveMissionCompleted, setShowSaveMissionCompleted] =
    useState(false);

  // 서버 응답까지 버튼 상태가 안 바뀐다는 QA 이슈 (round3). useSavePlaceList 의 onMutate
  // optimistic update 가 React Query cache 를 즉시 toggle 하지만, 큰 리스트의 경우
  // useQuery 의 placeholderData / structuralSharing 등 내부 동작과 맞물려 화면 반영이
  // 지연되는 케이스가 있다. 컴포넌트 단에서도 별도 optimistic state 를 두고 mutate 호출
  // 즉시 toggle 하여, query cache 동작과 무관하게 다음 렌더에서 바로 반영되도록 한다.
  // mutation 완료 후 (성공 / 실패 모두) null 로 리셋해 query data 가 다시 source of truth 가 된다.
  const [optimisticIsSaved, setOptimisticIsSaved] = useState<boolean | null>(
    null,
  );

  const toggleSave = useSavePlaceList({
    onSuccess: ({isSaved: prevIsSaved}) => {
      // 서버가 받은 결과를 반영했으므로 optimistic override 는 해제.
      setOptimisticIsSaved(null);

      // 저장 → unsave가 아니라 저장 액션일 때만 미션 완료로 간주.
      // 이미 완료된 미션이면 노출 X. 같은 진입 안에서 두 번 띄우지도 않는다.
      if (prevIsSaved) {
        return;
      }
      if (isSavePlaceListMissionCompleted) {
        return;
      }
      if (hasShownSaveMissionCompletedRef.current) {
        return;
      }
      hasShownSaveMissionCompletedRef.current = true;
      setShowSaveMissionCompleted(true);
    },
    onError: () => {
      // 실패 시 optimistic override 를 풀어 서버 값으로 되돌린다.
      setOptimisticIsSaved(null);
    },
  });

  useEffect(() => {
    return () => {
      setFilters({
        sortOption: null,
        scoreUnder: null,
        hasSlope: null,
        isRegistered: null,
      });
    };
  }, [setFilters]);

  const placeListQueryKey = useMemo(
    () => ['PlaceListDetail', placeListId, filters],
    [placeListId, filters],
  );

  const {data, isLoading, isError} = useQuery({
    queryKey: placeListQueryKey,
    queryFn: async () => {
      let sort: SearchPlaceSortDto | undefined;
      if (filters.sortOption === 'distance') {
        sort = SearchPlaceSortDto.Distance;
      } else if (filters.sortOption === 'accessibility_score') {
        sort = SearchPlaceSortDto.AccessibilityScore;
      }

      let currentLocation: {lat: number; lng: number} | undefined;
      try {
        const pos = await GeolocationUtils.getCurrentPosition();
        currentLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
      } catch {
        // 위치 권한 없으면 무시
      }

      const result = await api.getPlaceList({
        placeListId,
        currentLocation,
        sort,
        filters: {
          maxAccessibilityScore: filters.scoreUnder ?? undefined,
          hasSlope: filters.hasSlope ?? undefined,
          isRegistered: filters.isRegistered ?? undefined,
        },
      });
      return result.data;
    },
    placeholderData: previousData => previousData,
  });

  const items = useMemo(() => {
    return data?.places?.map(toPlaceMarkerItem) ?? [];
  }, [data?.places]);

  const hasFittedRef = useRef(false);
  useEffect(() => {
    if (items.length > 0 && !hasFittedRef.current) {
      hasFittedRef.current = true;
      setTimeout(() => {
        mapRef.current?.fitToItems(items, 60);
      }, 300);
    }
  }, [items]);

  const title = data?.placeList?.name ?? '장소 리스트';
  const description = data?.placeList?.description;
  // optimistic override 가 set 되어 있으면 그 값을 우선. mutation 완료 시점에 null 로
  // 리셋되어 서버 응답이 반영된 query data 가 다시 진실의 원천이 된다.
  const isSaved =
    optimisticIsSaved !== null
      ? optimisticIsSaved
      : (data?.placeList?.isSaved ?? false);

  const handleItemPress = useCallback(
    (item: PlaceMarkerItem) => {
      navigation.navigate(pdpScreen, {
        placeInfo: {placeId: item.place.id},
        specialAccessibility: item.specialAccessibility,
      });
    },
    [pdpScreen, navigation],
  );

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => (prev === 'map' ? 'list' : 'map'));
  }, []);

  const handleToggleSave = useCallback(() => {
    checkAuth(() => {
      // optimistic 즉시 반영: mutate 호출 직후 다음 렌더에서 버튼 상태가 바뀌도록.
      // 큰 리스트의 경우 서버 응답까지 1~2초 걸려 "안 눌렸나?" 헷갈리는 QA 이슈 (round3)
      // 해결. mutation 완료 시 onSuccess/onError 에서 null 로 리셋.
      setOptimisticIsSaved(!isSaved);
      toggleSave({isSaved, placeListId});
    });
  }, [checkAuth, toggleSave, isSaved, placeListId]);

  const handleShare = useCallback(async () => {
    try {
      const url = `https://link.staircrusher.club/7o6ck7?placeListId=${encodeURIComponent(placeListId)}`;
      await Share.share({
        message: `[${title}] 장소 리스트를 계단뿌셔클럽 앱에서 확인해보세요!\n${url}`,
      });
    } catch {
      // ignore
    }
  }, [title, placeListId]);

  const listData: ListSection[] = useMemo(
    () => [
      {type: 'header', key: 'header'},
      {type: 'filter', key: 'filter'},
      ...items.map(item => ({
        type: 'place' as const,
        key: item.place.id,
        data: item,
      })),
    ],
    [items],
  );

  // Wrapper for ItemMapView's ItemCard prop with hideActions
  const PlaceListItemCard = useCallback(
    (props: {item: PlaceMarkerItem; onPress?: () => void}) => (
      <SearchItemCard
        item={props.item}
        isHeightFlex
        hideActions
        hideScoreIcon
        onPress={props.onPress}
        listQueryKey={placeListQueryKey}
      />
    ),
    [placeListQueryKey],
  );

  // Card height from ItemMapList (242 + 28 = 270)
  const MAP_CARD_HEIGHT = 270;
  const floatingBottom =
    insets.bottom + (items.length > 0 ? MAP_CARD_HEIGHT + 16 : 16);

  const renderListItem = useCallback(
    ({item}: ListRenderItemInfo<ListSection>) => {
      if (item.type === 'header') {
        return (
          <HeaderSection>
            {description ? (
              <DescriptionContainer>
                <DescriptionText>{description}</DescriptionText>
              </DescriptionContainer>
            ) : null}
            <SaveShareRow>
              <SaveButtonContainer
                elementName="place_list_detail_save_button"
                activeOpacity={0.8}
                onPress={handleToggleSave}
                $isSaved={isSaved}>
                {isSaved ? (
                  <CheckColoredIcon width={20} height={20} />
                ) : (
                  <BookmarkIcon viewBox="-2 -1 20 20" color={color.white} />
                )}
                <SaveButtonText $isSaved={isSaved}>
                  {isSaved ? '리스트 저장됨' : '리스트 저장하기'}
                </SaveButtonText>
              </SaveButtonContainer>
              <ShareButtonContainer
                elementName="place_list_detail_share_button"
                activeOpacity={0.8}
                onPress={handleShare}>
                <ShareIcon width={24} height={24} color="#24262B" />
              </ShareButtonContainer>
            </SaveShareRow>
          </HeaderSection>
        );
      }
      if (item.type === 'filter') {
        return (
          <LogParamsProvider params={{viewMode: 'list'}}>
            <FilterBar
              mode="list"
              filters={filters}
              onOpenFilterModal={setFilterModalState}
            />
          </LogParamsProvider>
        );
      }
      return (
        <ListItemWrapper isFirst={items.indexOf(item.data) === 0}>
          <SearchItemCard
            item={item.data}
            isHeightFlex
            hideActions
            hideScoreIcon
            onPress={() => handleItemPress(item.data)}
            listQueryKey={placeListQueryKey}
          />
        </ListItemWrapper>
      );
    },
    [
      description,
      isSaved,
      handleToggleSave,
      handleShare,
      handleItemPress,
      items,
      filters,
      setFilterModalState,
      placeListQueryKey,
    ],
  );

  return (
    <Layout isHeaderVisible={false} safeAreaEdges={['top']}>
      <HeaderRow $isMapMode={viewMode === 'map'}>
        <HeaderLeftToggle
          elementName={
            viewMode === 'list'
              ? 'place_list_detail_map_toggle'
              : 'place_list_detail_list_toggle'
          }
          activeOpacity={0.8}
          onPress={toggleViewMode}>
          {viewMode === 'list' ? (
            <MapIcon width={24} height={24} color={color.black} />
          ) : (
            <MenuIcon width={24} height={24} color={color.black} />
          )}
          <HeaderToggleText>
            {viewMode === 'list' ? '지도' : '목록'}
          </HeaderToggleText>
        </HeaderLeftToggle>
        <HeaderTitle numberOfLines={1}>{title}</HeaderTitle>
        <SccTouchableOpacity
          elementName="place_list_detail_close"
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}>
          <CloseIcon width={16} height={16} color={color.black} />
        </SccTouchableOpacity>
      </HeaderRow>

      {isLoading ? (
        <SearchLoading />
      ) : isError ? (
        <ErrorContainer>
          <ErrorText>리스트를 불러올 수 없습니다.</ErrorText>
        </ErrorContainer>
      ) : (
        <ContentContainer>
          {/* Fix 1: 지도 항상 렌더링 (뒤에 깔아두기) */}
          <MapAbsoluteContainer
            style={viewMode === 'list' ? {opacity: 0} : undefined}
            pointerEvents={viewMode === 'list' ? 'none' : 'auto'}>
            <ItemMapView
              ref={mapRef}
              items={items}
              ItemCard={PlaceListItemCard}
              isRefreshVisible={false}
              onRefresh={() => {}}
              onCameraIdle={() => {}}
              myLocationBottomOffset={16}
            />
          </MapAbsoluteContainer>

          {viewMode === 'list' ? (
            <ListOverlay>
              <FlatList
                data={listData}
                keyExtractor={item => item.key}
                stickyHeaderIndices={[1]}
                contentContainerStyle={{paddingBottom: 100}}
                renderItem={renderListItem}
              />
              <FloatingViewModeButton
                elementName="place_list_detail_floating_map"
                activeOpacity={0.8}
                onPress={toggleViewMode}
                style={{bottom: insets.bottom + 24}}
                $isBlue>
                <MapIcon width={16} height={16} color={color.white} />
                <FloatingViewModeText $isBlue>지도보기</FloatingViewModeText>
              </FloatingViewModeButton>
            </ListOverlay>
          ) : (
            <>
              <LogParamsProvider params={{viewMode: 'map'}}>
                <MapFilterOverlay>
                  <FilterBar
                    mode="map"
                    filters={filters}
                    onOpenFilterModal={setFilterModalState}
                  />
                </MapFilterOverlay>
              </LogParamsProvider>
              <MapRightFloatingContainer>
                <FloatingCircleButton
                  elementName="place_list_detail_map_save"
                  activeOpacity={0.8}
                  onPress={handleToggleSave}>
                  {isSaved ? (
                    <BookmarkOnIcon
                      width={16}
                      height={20}
                      viewBox="-2.5 -0.5 20 20"
                      color={color.brand40}
                    />
                  ) : (
                    <BookmarkIcon
                      width={16}
                      height={20}
                      viewBox="-2.5 -0.5 20 20"
                      color={color.gray90}
                    />
                  )}
                </FloatingCircleButton>
                <FloatingCircleButton
                  elementName="place_list_detail_map_share"
                  activeOpacity={0.8}
                  onPress={handleShare}>
                  <ShareIcon width={20} height={20} color={color.black} />
                </FloatingCircleButton>
              </MapRightFloatingContainer>
              {/* Fix 2: 동적 bottom으로 카드 위에 배치 */}
              <FloatingViewModeButton
                elementName="place_list_detail_floating_list"
                activeOpacity={0.8}
                onPress={toggleViewMode}
                style={{bottom: floatingBottom}}
                $isBlue={false}>
                <MenuIcon width={16} height={16} color="#24262B" />
                <FloatingViewModeText $isBlue={false}>
                  목록보기
                </FloatingViewModeText>
              </FloatingViewModeButton>
            </>
          )}
        </ContentContainer>
      )}
      <PlaceListFilterModal />
      {showSaveMissionCompleted && (
        <MissionCompletedOverlay
          isVisible={true}
          itemImage={require('@/assets/img/tutorial/mission_complete_img_map.png')}
          description={`접근성 지도 획득!\n${
            userInfo?.nickname ?? '크러셔'
          }님이 찾은 지도로 접근성 좋은\n맛집, 카페를 확인할 수 있게 됐어요 👍`}
          confirmElementName="tutorial_mission_2_completed_confirm"
          onClose={() => {
            // 팝업 닫기만 한다. 일반 저장리스트 화면에서 진입한 사용자가 history back
            // 으로 튕겨나가는 어색한 UX 방지. 뒤로가기는 사용자가 직접 누르도록.
            setShowSaveMissionCompleted(false);
          }}
        />
      )}
    </Layout>
  );
};

export default PlaceListDetailScreen;

// Styled Components

const Layout = styled(ScreenLayout)`
  background-color: ${color.white};
`;

const HeaderRow = styled.View<{$isMapMode: boolean}>`
  flex-direction: row;
  align-items: center;
  padding-horizontal: 20px;
  padding-vertical: 7px;
  gap: 12px;
  background-color: ${color.white};
`;

const HeaderLeftToggle = styled(SccTouchableOpacity)`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 38px;
`;

const HeaderToggleText = styled.Text`
  font-size: 10px;
  font-family: ${font.pretendardRegular};
  color: ${color.black};
`;

const HeaderTitle = styled.Text`
  flex: 1;
  font-size: 18px;
  font-family: ${font.pretendardSemibold};
  color: ${color.black};
`;

const HeaderSection = styled.View`
  background-color: ${color.white};
  padding-horizontal: 20px;
  padding-top: 20px;
  padding-bottom: 16px;
`;

const DescriptionContainer = styled.View`
  padding-bottom: 12px;
`;

const DescriptionText = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardRegular};
  line-height: 22px;
  letter-spacing: -0.28px;
  color: ${color.gray60};
`;

const SaveShareRow = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const SaveButtonContainer = styled(SccTouchableOpacity)<{$isSaved: boolean}>`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 44px;
  border-radius: 8px;
  background-color: ${({$isSaved}) => ($isSaved ? '#D6EBFF' : '#0C76F7')};
  padding: 12px 28px 12px 24px;
  gap: 4px;
`;

const SaveButtonText = styled.Text<{$isSaved: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.3px;
  color: ${({$isSaved}) => ($isSaved ? color.black : color.white)};
  vertical-align: center;
`;

const ShareButtonContainer = styled(SccTouchableOpacity)`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border-width: 1px;
  border-color: #e3e4e8;
  background-color: ${color.white};
  align-items: center;
  justify-content: center;
`;

const ContentContainer = styled.View`
  flex: 1;
`;

const MapAbsoluteContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`;

const ListOverlay = styled.View`
  flex: 1;
  background-color: ${color.white};
`;

const ListItemWrapper = styled.View<{isFirst: boolean}>`
  padding: 20px;
  border-top-width: ${({isFirst}) => (isFirst ? '0' : '1px')};
  border-top-color: #eff0f2;
`;

const FloatingViewModeButton = styled(SccTouchableOpacity)<{$isBlue: boolean}>`
  position: absolute;
  bottom: 40px;
  align-self: center;
  z-index: 20;
  flex-direction: row;
  align-items: center;
  padding-left: 16px;
  padding-right: 20px;
  padding-vertical: 10px;
  border-radius: 27px;
  background-color: ${({$isBlue}) => ($isBlue ? '#0C76F7' : color.white)};
  gap: 4px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.23;
  shadow-radius: 2px;
  elevation: 8;
`;

const FloatingViewModeText = styled.Text<{$isBlue: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 15px;
  line-height: 22px;
  letter-spacing: -0.3px;
  color: ${({$isBlue}) => ($isBlue ? color.white : '#24262B')};
`;

const MapFilterOverlay = styled.View`
  z-index: 10;
  elevation: 10;
`;

const MapRightFloatingContainer = styled.View`
  position: absolute;
  top: 60px;
  right: 16px;
  gap: 8px;
  z-index: 20;
  elevation: 20;
`;

const FloatingCircleButton = styled(SccTouchableOpacity)`
  width: 38px;
  height: 38px;
  border-radius: 20px;
  background-color: ${color.white};
  align-items: center;
  justify-content: center;
  shadow-color: #000;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.16;
  shadow-radius: 4.5px;
  elevation: 3;
`;

const ErrorContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const ErrorText = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray50};
`;
