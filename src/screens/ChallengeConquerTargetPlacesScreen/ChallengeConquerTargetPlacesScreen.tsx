import {useQuery} from '@tanstack/react-query';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AngleBracketDownIcon from '@/assets/icon/ic_angle_bracket_down.svg';
import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import MapIcon from '@/assets/icon/ic_map.svg';
import MenuIcon from '@/assets/icon/ic_menu.svg';
import {ScreenLayout} from '@/components/ScreenLayout';
import SccTouchableOpacity from '@/components/SccTouchableOpacity';
import ItemMapView, {ItemMapViewHandle} from '@/components/maps/ItemMapView';
import {MarkerItem, toPlaceMarkerItem} from '@/components/maps/MarkerItem';
import {color} from '@/constant/color';
import {PlaceListItem, SearchPlaceSortDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {usePlaceDetailScreenName} from '@/hooks/useFeatureFlags';
import {ScreenProps} from '@/navigation/Navigation.screens';
import SearchItemCard from '@/screens/SearchScreen/components/SearchItemCard';
import SearchLoading from '@/screens/SearchScreen/components/SearchLoading';
import SearchNoResult from '@/screens/SearchScreen/components/SearchNoResult';
import {cn} from '@/utils/cn';
import GeolocationUtils from '@/utils/GeolocationUtils';
import ToastUtils from '@/utils/ToastUtils';

export interface ChallengeConquerTargetPlacesScreenParams {
  challengeId: string;
}

type PlaceMarkerItem = MarkerItem & PlaceListItem;
type ViewMode = 'list' | 'map';
type LocalSortOption = 'distance' | 'accessibility_score';

// ItemMapView 카드 캐러셀 높이 (PlaceListDetailScreen 과 동일 값)
const MAP_CARD_HEIGHT = 270;

export default function ChallengeConquerTargetPlacesScreen({
  route,
  navigation,
}: ScreenProps<'ChallengeConquerTargetPlaces'>) {
  const {challengeId} = route.params;
  const {api} = useAppComponents();
  const insets = useSafeAreaInsets();
  const pdpScreen = usePlaceDetailScreenName();
  const mapRef = useRef<ItemMapViewHandle<PlaceMarkerItem>>(null);
  const hasFittedRef = useRef(false);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [onlyUnconquered, setOnlyUnconquered] = useState(true);
  const [sort, setSort] = useState<LocalSortOption>('distance');

  const queryKey = useMemo(
    () => [
      'ChallengeConquerTargetPlaces',
      challengeId,
      {onlyUnconquered, sort},
    ],
    [challengeId, onlyUnconquered, sort],
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
        onlyUnconquered,
        sort:
          sort === 'distance'
            ? SearchPlaceSortDto.Distance
            : SearchPlaceSortDto.AccessibilityScore,
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

  const items = useMemo(
    () => data?.items.map(toPlaceMarkerItem) ?? [],
    [data?.items],
  );
  const totalCount = data?.totalCount ?? 0;
  const conqueredCount = data?.conqueredCount ?? 0;

  useEffect(() => {
    if (items.length > 0 && !hasFittedRef.current) {
      hasFittedRef.current = true;
      setTimeout(() => {
        mapRef.current?.fitToItems(items, 60);
      }, 300);
    }
  }, [items]);

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
        hideActions
        hideScoreIcon
        hidePlaceTags
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
      <View
        className={cn(
          'flex-row items-center gap-[8px] h-[50px] px-[20px] py-[10px]',
          viewMode === 'list' && 'border-b border-gray-v2-15',
        )}>
        <SccTouchableOpacity
          elementName="challenge_conquer_target_places_back"
          hitSlop={10}
          onPress={() => navigation.goBack()}>
          <LeftArrowIcon width={24} height={24} color={color.black} />
        </SccTouchableOpacity>
        <Text className="text-[18px] leading-[26px] tracking-[-0.36px] font-pretendard-semibold text-black">
          {'남은 매장 '}
          <Text className="text-[15px] leading-[22px] tracking-[-0.3px] font-pretendard-regular">
            {'('}
            <Text className="text-brand-40">{conqueredCount}</Text>
            {`/${totalCount})`}
          </Text>
        </Text>
      </View>

      <View
        className={cn(
          'flex-row items-center gap-[6px]',
          viewMode === 'list'
            ? 'bg-gray-v2-10 h-[50px] px-[20px] py-[10px]'
            : 'bg-white h-[44px] px-[12px] pt-[4px] pb-[10px]',
        )}>
        <SccTouchableOpacity
          elementName="challenge_conquer_target_places_sort"
          accessibilityRole="button"
          // ponytail: 옵션이 2개뿐이라 드롭다운 메뉴 대신 탭으로 토글 — 도달 가능한
          // 결과 집합은 실제 드롭다운과 동일하다. 옵션이 3개 이상 필요해지면 BottomSheet
          // 선택 UI로 승격한다.
          onPress={() =>
            setSort(prev =>
              prev === 'distance' ? 'accessibility_score' : 'distance',
            )
          }
          className="h-[30px] min-w-[56px] px-[12px] rounded-[56px] border border-[#EAEAEF] bg-white flex-row items-center justify-center gap-[2px]">
          <Text className="text-[13px] leading-[18px] tracking-[-0.26px] font-pretendard-medium text-center text-gray-v2-90">
            {sort === 'distance' ? '가까운순' : '접근레벨 낮은순'}
          </Text>
          <AngleBracketDownIcon width={16} height={16} color={color.gray90v2} />
        </SccTouchableOpacity>
        <SccTouchableOpacity
          elementName="challenge_conquer_target_places_only_unconquered_toggle"
          accessibilityRole="button"
          accessibilityState={{selected: onlyUnconquered}}
          onPress={() => setOnlyUnconquered(prev => !prev)}
          className={cn(
            'h-[30px] min-w-[56px] px-[12px] rounded-[56px] border flex-row items-center justify-center gap-[2px]',
            onlyUnconquered
              ? 'bg-brand-5 border-brand-40'
              : 'bg-white border-[#EAEAEF]',
          )}>
          <Text
            className={cn(
              'text-[13px] leading-[18px] tracking-[-0.26px] font-pretendard-medium text-center',
              onlyUnconquered ? 'text-brand-50' : 'text-gray-v2-90',
            )}>
            정복 안 된 곳
          </Text>
        </SccTouchableOpacity>
      </View>

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
                onCameraIdle={() => {}}
                myLocationBottomOffset={16}
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
                        hideActions
                        hideScoreIcon
                        hidePlaceTags
                        onPress={() => handleItemPress(item)}
                        listQueryKey={queryKey}
                      />
                    </View>
                  )}
                />
              ))}
            <SccTouchableOpacity
              elementName={
                viewMode === 'list'
                  ? 'challenge_conquer_target_places_floating_map'
                  : 'challenge_conquer_target_places_floating_list'
              }
              onPress={toggleViewMode}
              // ponytail: shadow 는 NativeWind 미지원(마이그레이션 문서 §7-4), bottom 은
              // 카드 캐러셀 유무에 따른 런타임 계산값이라 style 유지가 불가피하다.
              style={{
                bottom: floatingBottom,
                boxShadow: [
                  {
                    offsetX: 0,
                    offsetY: 2,
                    blurRadius: 2,
                    spreadDistance: 0,
                    color: 'rgba(0, 0, 0, 0.23)',
                  },
                ],
              }}
              className={cn(
                'absolute self-center h-[40px] pl-[16px] pr-[20px] rounded-[27px] flex-row items-center gap-[4px]',
                viewMode === 'list' ? 'bg-brand-40' : 'bg-white',
              )}>
              {viewMode === 'list' ? (
                <>
                  <MapIcon width={16} height={16} color={color.white} />
                  <Text className="text-[15px] leading-[22px] tracking-[-0.3px] font-pretendard-medium text-white">
                    지도보기
                  </Text>
                </>
              ) : (
                <>
                  <MenuIcon width={16} height={16} color="#24262B" />
                  <Text className="text-[15px] leading-[22px] tracking-[-0.3px] font-pretendard-medium text-[#24262B]">
                    목록보기
                  </Text>
                </>
              )}
            </SccTouchableOpacity>
          </>
        )}
      </View>
    </ScreenLayout>
  );
}
