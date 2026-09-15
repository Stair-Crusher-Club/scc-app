import {useQuery} from '@tanstack/react-query';
import {atom, useAtom} from 'jotai';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import ItemMapView, {ItemMapViewHandle} from '@/components/maps/ItemMapView';
import {MarkerItem, toConquestMarkerItem} from '@/components/maps/MarkerItem';
import {Region, shouldRefitCamera} from '@/components/maps/Types';
import {ScreenLayout} from '@/components/ScreenLayout';
import FilterBar from '@/components/placeList/FilterBar';
import FloatingViewModeButton from '@/components/placeList/FloatingViewModeButton';
import ListMapHeader from '@/components/placeList/ListMapHeader';
import PlaceListFilterModal from '@/components/placeList/PlaceListFilterModal';
import {PlaceListItem, SearchPlaceSortDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {usePlaceDetailScreenName} from '@/hooks/useFeatureFlags';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';
import type {
  PlaceListFilterModalState,
  PlaceListFilterOptions,
} from '@/screens/PlaceListDetailScreen/atoms';
import SearchItemCard from '@/screens/SearchScreen/components/SearchItemCard';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';
import SearchNoResult from '@/screens/SearchScreen/components/SearchNoResult';
import {cn} from '@/utils/cn';
import GeolocationUtils from '@/utils/GeolocationUtils';
import ToastUtils from '@/utils/ToastUtils';

export interface ChallengeConquerTargetPlacesScreenParams {
  challengeId: string;
  /** 진입 시 보여줄 모드. 홈 진척 카드·정복 완료 축하에서 지도로 바로 랜딩할 때 'map'. */
  initialViewMode?: 'list' | 'map';
}

type PlaceMarkerItem = MarkerItem & PlaceListItem;
type ViewMode = 'list' | 'map';

// ItemMapView 카드 캐러셀 높이 (PlaceListDetailScreen 과 동일 값)
const MAP_CARD_HEIGHT = 270;

const DEFAULT_FILTERS: PlaceListFilterOptions = {
  sortOption: 'distance',
  scoreUnder: null,
  hasSlope: null,
  // 기존 onlyUnconquered 기본값(true)과 동일한 의미 — 미정복만 노출.
  isRegistered: false,
};

// 1차 spec("전역 atom 재사용 금지")을 지키기 위한 이 화면 전용 모듈 스코프 atom.
// PlaceListDetailScreen 의 전역 placeListFilterAtom 을 절대 재사용하지 않는다 —
// 재사용하면 저장리스트 화면과 필터 상태가 섞인다.
const ctplFilterAtom = atom<PlaceListFilterOptions>(DEFAULT_FILTERS);
const ctplFilterModalStateAtom = atom<PlaceListFilterModalState>(null);

export default function ChallengeConquerTargetPlacesScreen({
  route,
  navigation,
}: ScreenProps<'ChallengeConquerTargetPlaces'>) {
  const {challengeId, initialViewMode} = route.params;
  const {api} = useAppComponents();
  const insets = useSafeAreaInsets();
  const pdpScreen = usePlaceDetailScreenName();
  const mapRef = useRef<ItemMapViewHandle<PlaceMarkerItem>>(null);
  // onCameraIdle 로 갱신되는 "현재 카메라가 보고 있는 영역". 최초 로드 시엔 null.
  const cameraRegionRef = useRef<Region | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode ?? 'list');
  const [filters, setFilters] = useAtom(ctplFilterAtom);
  const [, setFilterModalState] = useAtom(ctplFilterModalStateAtom);

  // 화면을 벗어나면 다음 진입을 위해 필터를 초기화한다 (PlaceListDetailScreen과 동일 패턴).
  useEffect(() => {
    return () => {
      setFilters(DEFAULT_FILTERS);
    };
  }, [setFilters]);

  const queryKey = useMemo(
    () => ['ChallengeConquerTargetPlaces', challengeId, filters],
    [challengeId, filters],
  );

  const {data, isLoading, isError, error} = useQuery({
    queryKey,
    queryFn: async () => {
      let currentLocation: {lat: number; lng: number} | undefined;
      try {
        const position = await GeolocationUtils.getCurrentPosition();
        currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      } catch {
        // 위치 권한 없으면 무시 — 거리 미표시, 화면은 정상 동작
      }
      const result = await api.listChallengeConquerTargetPlacesPost({
        challengeId,
        // 서버는 "미정복만" 필터만 지원한다(onlyConquered 는 없음) — "정복완료만
        // 보기"는 전체를 받아 클라에서 거른다 (아래 items 참조).
        onlyUnconquered: filters.isRegistered === false,
        sort:
          filters.sortOption === 'accessibility_score'
            ? SearchPlaceSortDto.AccessibilityScore
            : SearchPlaceSortDto.Distance,
        currentLocation,
      });
      return result.data;
    },
    // 필터/정렬 전환 시 화면을 빈 상태로 리셋하지 않는다 (반복 지적 항목)
    placeholderData: previousData => previousData,
    retry: false,
  });

  // ctpl 미연결 챌린지로 진입 시 서버가 400 을 내려준다 (spec 엣지케이스) — 토스트 후 뒤로.
  useEffect(() => {
    if (isError) {
      ToastUtils.showOnApiError(error);
      navigation.goBack();
    }
  }, [isError, error, navigation]);

  const items = useMemo(() => {
    const marked = data?.items.map(toConquestMarkerItem) ?? [];
    return filters.isRegistered === true
      ? marked.filter(item => item.hasPlaceAccessibility)
      : marked;
  }, [data?.items, filters.isRegistered]);

  const brandName = data?.conquerTargetPlaceList?.displayName;
  const markerIconOverride = data?.markerIcon
    ? {
        defaultSvg: data.markerIcon.defaultSvg,
        focusedSvg: data.markerIcon.focusedSvg ?? undefined,
      }
    : undefined;

  // 최초 로드는 항상 fit. 이후 필터/정렬로 items가 바뀌면, 그중 현재 카메라 밖에
  // 있는 장소가 있을 때만 다시 fit 한다 — 이미 보이는 부분집합이면 카메라를 그대로
  // 둬 불필요한 점프를 막는다(사용자 피드백: 필터 걸어도 랜딩 fit이 그 필터 결과
  // 기준이라 전체를 못 보던 문제 + 필터 풀었을 때 화면 밖 장소 재조정 안 되던 문제).
  useEffect(() => {
    if (shouldRefitCamera(items, cameraRegionRef.current)) {
      setTimeout(() => {
        mapRef.current?.fitToItems(items, 60);
      }, 300);
    }
  }, [items]);

  const handleCameraIdle = useCallback((region: Region) => {
    cameraRegionRef.current = region;
  }, []);

  const handleItemPress = useCallback(
    (item: PlaceMarkerItem) => {
      navigation.navigate(pdpScreen, {placeInfo: {placeId: item.place.id}});
    },
    [pdpScreen, navigation],
  );

  // ItemMapView의 ItemCard 는 {item} 만 받으므로 queryKey는 클로저로 전달한다.
  // listQueryKey가 있어야 SearchItemCard 내부 정보요청 버튼의 낙관적 업데이트/캐시
  // 무효화가 이 화면의 쿼리를 대상으로 한다 (PlaceListDetailScreen과 동일 패턴).
  const ConquerTargetItemCard = useCallback(
    ({item}: {item: PlaceMarkerItem}) => (
      <SearchItemCard
        item={item}
        isHeightFlex
        isConquestMode
        hideScoreIcon
        hidePlaceTags
        rightLabel={brandName}
        listQueryKey={queryKey}
      />
    ),
    [queryKey, brandName],
  );

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => (prev === 'list' ? 'map' : 'list'));
  }, []);

  const floatingBottom =
    viewMode === 'list'
      ? insets.bottom + 24
      : insets.bottom + (items.length > 0 ? MAP_CARD_HEIGHT + 16 : 16);

  return (
    <ScreenLayout isHeaderVisible={false} safeAreaEdges={['top']}>
      <ListMapHeader
        viewMode={viewMode}
        title="남은 매장 보기"
        onToggleViewMode={toggleViewMode}
        onClose={() => navigation.goBack()}
        toggleElementName={
          viewMode === 'list'
            ? 'challenge_conquer_target_places_map_toggle'
            : 'challenge_conquer_target_places_list_toggle'
        }
        closeElementName="challenge_conquer_target_places_close"
        closeIconSize={24}
      />

      <LogParamsProvider params={{viewMode}}>
        <FilterBar
          mode={viewMode}
          filters={filters}
          onOpenFilterModal={setFilterModalState}
          visibleChips={['filter', 'sort', 'conquered']}
        />
      </LogParamsProvider>

      <View className="flex-1">
        {isLoading && !data ? (
          <SearchLoading />
        ) : (
          <>
            {/* 지도는 unmount 하지 않고 opacity/pointerEvents 로만 은닉 (재초기화 방지) */}
            <View
              className={cn(
                'absolute inset-0',
                viewMode === 'list' && 'opacity-0',
              )}
              pointerEvents={viewMode === 'list' ? 'none' : 'auto'}>
              <ItemMapView
                ref={mapRef}
                items={items}
                ItemCard={ConquerTargetItemCard}
                isRefreshVisible={false}
                onRefresh={() => {}}
                onCameraIdle={handleCameraIdle}
                myLocationBottomOffset={16}
                markerIconOverride={markerIconOverride}
              />
            </View>
            {viewMode === 'list' &&
              (items.length === 0 ? (
                <SearchNoResult />
              ) : (
                <FlatList
                  data={items}
                  keyExtractor={item => item.place.id}
                  contentContainerStyle={{paddingBottom: 100}}
                  renderItem={({item, index}) => (
                    <View
                      className={cn(
                        'p-[20px]',
                        index !== 0 && 'border-t border-gray-v2-15',
                      )}>
                      <SearchItemCard
                        item={item}
                        isHeightFlex
                        isConquestMode
                        hideScoreIcon
                        hidePlaceTags
                        rightLabel={brandName}
                        onPress={() => handleItemPress(item)}
                        listQueryKey={queryKey}
                      />
                    </View>
                  )}
                />
              ))}
            <FloatingViewModeButton
              viewMode={viewMode}
              elementName={
                viewMode === 'list'
                  ? 'challenge_conquer_target_places_floating_map'
                  : 'challenge_conquer_target_places_floating_list'
              }
              onPress={toggleViewMode}
              style={{bottom: floatingBottom}}
            />
          </>
        )}
      </View>
      <PlaceListFilterModal
        filterAtom={ctplFilterAtom}
        modalStateAtom={ctplFilterModalStateAtom}
      />
    </ScreenLayout>
  );
}
