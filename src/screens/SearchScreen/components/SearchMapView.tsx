import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import React, {forwardRef, useImperativeHandle, useMemo, useRef} from 'react';
import styled from 'styled-components/native';
import {match} from 'ts-pattern';

import ItemMapView, {ItemMapViewHandle} from '@/components/maps/ItemMapView';
import {
  MarkerIcon,
  MarkerItem,
  MarkerLevel,
} from '@/components/maps/MarkerItem';
import {color} from '@/constant/color';
import {PlaceListItem} from '@/generated-sources/openapi';
import {
  draftCameraRegionAtom,
  searchQueryAtom,
  viewStateAtom,
} from '@/screens/SearchScreen/atoms';
import SearchItemCard from '@/screens/SearchScreen/components/SearchItemCard';
import {getPlaceAccessibilityScore} from '@/utils/accessibilityCheck';

export type SearchMapViewHandle = {
  fitToItems: (_items: MarkerItem[]) => void;
  moveToItem: (targetId: string) => void;
};

const SearchMapView = forwardRef<
  SearchMapViewHandle,
  {
    data: PlaceListItem[];
    onRefresh: () => void;
  }
>(({data, onRefresh}, ref) => {
  useImperativeHandle(ref, () => ({
    fitToItems: (_items: MarkerItem[]) => {
      mapViewRef.current?.fitToItems(_items);
    },
    moveToItem: targetId => {
      const target = datasForUI?.find(it => it.place.id === targetId);
      if (!target) return;
      mapViewRef.current?.moveToItem(target);
    },
  }));

  const mapViewRef =
    useRef<ItemMapViewHandle<MarkerItem & PlaceListItem>>(null);
  const [searchQuery, _] = useAtom(searchQueryAtom);
  const viewState = useAtomValue(viewStateAtom);
  const setDraftCameraRegion = useSetAtom(draftCameraRegionAtom);
  const datasForUI: (MarkerItem & PlaceListItem)[] = useMemo(() => {
    return data?.map(addMarkerInfo) ?? [];
  }, [data]);
  const isSearchQueryEmpty = !searchQuery.text;
  return (
    <Wrapper>
      <ItemMapView
        ref={mapViewRef}
        items={datasForUI}
        onCameraIdle={region => {
          // viewState 가 map 이 아닐 때는 제대로된 region 이 업데이트 되지 않을 수 있다
          // (by 모바일 키보드로 인한 지도 resizing 등...)
          if (viewState.type === 'map' && !viewState.inputMode) {
            setDraftCameraRegion(region);
          }
        }}
        onRefresh={onRefresh}
        isRefreshVisible={!isSearchQueryEmpty}
        ItemCard={SearchItemCard}
      />
    </Wrapper>
  );
});

export default SearchMapView;

const Wrapper = styled.View`
  background-color: ${() => color.white};
  flex-grow: 1;
  overflow: hidden;
`;

function addMarkerInfo(item: PlaceListItem): MarkerItem & PlaceListItem {
  return {
    ...item,
    id: item.place.id,
    location: item.place.location,
    displayName: item.place.name,
    markerIcon: {
      icon: match<string | undefined, MarkerIcon>(item.place.category)
        .with('RESTAURANT', () => 'rest')
        .with('CAFE', () => 'cafe')
        .with('CONVENIENCE_STORE', () => 'conv')
        .with('PHARMACY', () => 'phar')
        .with('HOSPITAL', () => 'hos')
        .otherwise(() => 'default'),
      level: match<number | undefined | 'processing', MarkerLevel>(
        getPlaceAccessibilityScore({
          score: item.accessibilityInfo?.accessibilityScore,
          hasPlaceAccessibility: item.hasPlaceAccessibility,
          hasBuildingAccessibility: item.hasBuildingAccessibility,
        }),
      )
        .with('processing', () => 'progress')
        .with(undefined, () => 'none')
        .when(
          score => score <= 0,
          () => '0',
        )
        .when(
          score => score <= 1,
          () => '1',
        )
        .when(
          score => score <= 2,
          () => '2',
        )
        .when(
          score => score <= 3,
          () => '3',
        )
        .when(
          score => score <= 4,
          () => '4',
        )
        .otherwise(() => '5'),
    },
  };
}
