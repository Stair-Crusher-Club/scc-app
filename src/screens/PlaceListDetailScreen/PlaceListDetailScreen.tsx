import {useQuery} from '@tanstack/react-query';
import {useAtom} from 'jotai';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, ListRenderItemInfo, Share} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import BookmarkIcon from '@/assets/icon/ic_bookmark.svg';
import BookmarkOnIcon from '@/assets/icon/ic_bookmark_on.svg';
import ExitIcon from '@/assets/icon/ic_exit.svg';
import MapIcon from '@/assets/icon/ic_map.svg';
import MenuIcon from '@/assets/icon/ic_menu.svg';
import ShareIcon from '@/assets/icon/ic_share.svg';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import ItemMapView, {ItemMapViewHandle} from '@/components/maps/ItemMapView';
import {MarkerItem, toPlaceMarkerItem} from '@/components/maps/MarkerItem';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PlaceListItem, SearchPlaceSortDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {useSavePlaceList} from '@/hooks/useSavePlaceList';
import {ScreenProps} from '@/navigation/Navigation.screens';
import SearchItemCard from '@/screens/SearchScreen/components/SearchItemCard';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {useCheckAuth} from '@/utils/checkAuth';
import {useDetailScreenVersion} from '@/utils/accessibilityFlags';

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
  const mapRef = useRef<ItemMapViewHandle<PlaceMarkerItem>>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const detailVersion = useDetailScreenVersion();
  const checkAuth = useCheckAuth();
  const toggleSave = useSavePlaceList();
  const insets = useSafeAreaInsets();
  const [filters] = useAtom(placeListFilterAtom);
  const [, setFilterModalState] = useAtom(placeListFilterModalStateAtom);

  const {data, isLoading, isError} = useQuery({
    queryKey: ['PlaceListDetail', placeListId, filters],
    queryFn: async () => {
      let sort: SearchPlaceSortDto | undefined;
      if (filters.sortOption === 'distance') {
        sort = SearchPlaceSortDto.Distance;
      } else if (filters.sortOption === 'accessibility_score') {
        sort = SearchPlaceSortDto.AccessibilityScore;
      }

      const result = await api.getPlaceList({
        placeListId,
        sort,
        filters: {
          maxAccessibilityScore: filters.scoreUnder ?? undefined,
          hasSlope: filters.hasSlope ?? undefined,
          isRegistered: filters.isRegistered ?? undefined,
        },
      });
      return result.data;
    },
  });

  const items = useMemo(() => {
    return data?.places?.map(toPlaceMarkerItem) ?? [];
  }, [data?.places]);

  useEffect(() => {
    if (items.length > 0) {
      setTimeout(() => {
        mapRef.current?.fitToItems(items, 60);
      }, 300);
    }
  }, [items]);

  const title = data?.placeList?.name ?? '장소 리스트';
  const description = data?.placeList?.description;
  const isSaved = data?.placeList?.isSaved ?? false;

  const handleItemPress = useCallback(
    (item: PlaceMarkerItem) => {
      if (detailVersion === 'v2') {
        navigation.navigate('PlaceDetailV2', {
          placeInfo: {placeId: item.place.id},
        });
        return;
      }
      navigation.navigate('PlaceDetail', {
        placeInfo: {placeId: item.place.id},
      });
    },
    [detailVersion, navigation],
  );

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => (prev === 'map' ? 'list' : 'map'));
  }, []);

  const handleToggleSave = useCallback(() => {
    checkAuth(() => {
      toggleSave({isSaved, placeListId});
    });
  }, [checkAuth, toggleSave, isSaved, placeListId]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `[${title}] 장소 리스트를 계단뿌셔클럽 앱에서 확인해보세요!`,
      });
    } catch {
      // ignore
    }
  }, [title]);

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
        onPress={props.onPress}
      />
    ),
    [],
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
                  <BookmarkOnIcon
                    width={16}
                    height={16}
                    color={color.brandColor}
                  />
                ) : (
                  <BookmarkIcon width={16} height={16} color={color.white} />
                )}
                <SaveButtonText $isSaved={isSaved}>
                  리스트 저장하기
                </SaveButtonText>
              </SaveButtonContainer>
              <ShareButtonContainer
                elementName="place_list_detail_share_button"
                activeOpacity={0.8}
                onPress={handleShare}>
                <ShareIcon width={20} height={20} color="#24262B" />
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
            onPress={() => handleItemPress(item.data)}
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
          <ExitIcon width={24} height={24} color={color.black} />
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
                      width={24}
                      height={24}
                      color={color.brandColor}
                    />
                  ) : (
                    <BookmarkIcon width={24} height={24} color="#3F3F45" />
                  )}
                </FloatingCircleButton>
                <FloatingCircleButton
                  elementName="place_list_detail_map_share"
                  activeOpacity={0.8}
                  onPress={handleShare}>
                  <ShareIcon width={24} height={24} color={color.black} />
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
  height: 40px;
  border-radius: 8px;
  background-color: ${({$isSaved}) => ($isSaved ? '#F2F2F5' : '#0C76F7')};
  gap: 6px;
`;

const SaveButtonText = styled.Text<{$isSaved: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  color: ${({$isSaved}) => ($isSaved ? '#24262B' : color.white)};
`;

const ShareButtonContainer = styled(SccTouchableOpacity)`
  width: 40px;
  height: 40px;
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
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 10px;
  elevation: 20;
`;

const FloatingViewModeText = styled.Text<{$isBlue: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
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
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${color.white};
  align-items: center;
  justify-content: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.15;
  shadow-radius: 4px;
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
