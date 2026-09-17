import {useQuery} from '@tanstack/react-query';
import {atom, useAtom} from 'jotai';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, Platform, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {getMarkerSvg, MarkerColors} from '@/assets/markers';
import ItemMapView, {ItemMapViewHandle} from '@/components/maps/ItemMapView';
import {MarkerItem, toPlaceMarkerItem} from '@/components/maps/MarkerItem';
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
  // 네이티브 지도 SDK가 실제로 초기화됐는지. Android는 getMapAsync 로 비동기
  // 초기화되어 그 전에 보낸 fitToItems/animateToRegion 커맨드는 native 에서 조용히
  // 무시된다 — onCameraIdle 최초 1회 수신을 "지도 준비됨" 신호로 사용한다
  // (setTimeout 추측 대신 신호 기반. 네이티브 쪽엔 별도 ready 이벤트가 없다).
  // 네이티브 지도가 카메라 커맨드를 받을 준비가 됐는지.
  // Android 는 getMapAsync 로 **비동기** 초기화되어 그 전 커맨드가 조용히 무시되므로
  // onCameraIdle 최초 수신을 준비 신호로 쓴다. iOS 는 RNTMapView 가 NMFMapView 를 직접
  // 상속해 **동기**로 만들어지고(getMapAsync 없음), 게다가 사용자가 지도를 만지기 전까지는
  // onCameraIdle 이 오지 않는다 — iOS 에서 idle 을 기다리면 fit 이 영영 실행되지 않고
  // "첫 pan 을 해야 그제서야 fit 되는" 증상이 된다. 그래서 iOS 는 처음부터 준비된 것으로 본다.
  const isMapReadyRef = useRef(Platform.OS !== 'android');
  // fit 이 필요한데 아직 지도가 준비되지 않았을 때 true로 걸어두고, 준비되는 순간
  // (또는 map 모드로 전환되는 순간) 소비한다.
  const needsFitRef = useRef(false);
  const itemsRef = useRef<PlaceMarkerItem[]>([]);

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
    const marked = data?.items.map(toPlaceMarkerItem) ?? [];
    return filters.isRegistered === true
      ? marked.filter(item => item.hasPlaceAccessibility)
      : marked;
  }, [data?.items, filters.isRegistered]);
  // effect 밖(카메라 idle 콜백)에서도 항상 최신 items 로 fit 할 수 있도록 ref 로 미러링.
  itemsRef.current = items;
  // 정복(등록)된 장소만 브랜드 SVG 핀. 미등록은 실제 접근성 점수가 있어도
  // 항상 회색 점 마커로 고정한다(iconColor 도 강제) — Figma 166:7080.
  const markerIconOverride = useCallback(
    (item: PlaceMarkerItem) =>
      data?.markerIcon && item.hasPlaceAccessibility
        ? {
            defaultSvg: data.markerIcon.defaultSvg,
            focusedSvg: data.markerIcon.focusedSvg ?? undefined,
          }
        : {
            // getMarkerSvg('default', false, false)는 markers.ts 스위치의 'default'
            // 케이스로 항상 값을 반환하지만 시그니처상 undefined 가능이라 가드로 폴백.
            defaultSvg: getMarkerSvg('default', false, false) ?? '',
            iconColor: MarkerColors.none,
          },
    [data?.markerIcon],
  );

  // needsFitRef 가 걸려 있고 지도가 준비된 상태일 때만 실제로 fit을 실행한다.
  // 준비 전이면 아무것도 하지 않고 남겨둔다 — onCameraIdle 최초 수신 시 다시 호출된다.
  const attemptFitCamera = useCallback(() => {
    if (!needsFitRef.current || !isMapReadyRef.current) {
      return;
    }
    needsFitRef.current = false;
    mapRef.current?.fitToItems(itemsRef.current, 60);
  }, []);

  // 최초 로드는 항상 fit. 이후 필터/정렬로 items가 바뀌면, 그중 현재 카메라 밖에
  // 있는 장소가 있을 때만 다시 fit 한다 — 이미 보이는 부분집합이면 카메라를 그대로
  // 둬 불필요한 점프를 막는다(사용자 피드백: 필터 걸어도 랜딩 fit이 그 필터 결과
  // 기준이라 전체를 못 보던 문제 + 필터 풀었을 때 화면 밖 장소 재조정 안 되던 문제).
  useEffect(() => {
    if (shouldRefitCamera(items, cameraRegionRef.current)) {
      needsFitRef.current = true;
      attemptFitCamera();
    }
  }, [items, attemptFitCamera]);

  // 리스트 모드로 진입해 지도가 opacity:0 으로 숨어 있던 동안 온 준비 신호를 못
  // 썼을 가능성에 대비해, map 모드로 전환되는 시점에도 pending fit을 한 번 더 확인한다.
  useEffect(() => {
    if (viewMode === 'map') {
      attemptFitCamera();
    }
  }, [viewMode, attemptFitCamera]);

  const handleCameraIdle = useCallback(
    (region: Region) => {
      cameraRegionRef.current = region;
      // 최초 수신 = 네이티브 지도 SDK 초기화 완료 신호. 이후 호출은 no-op(이미 true).
      isMapReadyRef.current = true;
      attemptFitCamera();
    },
    [attemptFitCamera],
  );

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
        hideRegisterShortcuts
        listQueryKey={queryKey}
      />
    ),
    [queryKey],
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
                        hideRegisterShortcuts
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
