import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components/native';

import ItemMapView, {ItemMapViewHandle} from '@/components/maps/ItemMapView';
import {MarkerItem, toPlaceMarkerItem} from '@/components/maps/MarkerItem';
import {color} from '@/constant/color';
import {PlaceListItem} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {
  draftCameraRegionAtom,
  searchModeAtom,
  searchQueryAtom,
  toiletLayerActiveAtom,
  viewStateAtom,
} from '@/screens/SearchScreen/atoms';
import SearchItemCard from '@/screens/SearchScreen/components/SearchItemCard';
import useToiletLayerQuery from '@/screens/SearchScreen/useToiletLayerQuery';
import ToiletCard from '@/screens/ToiletMapScreen/ToiletCard';
import {ToiletDetails} from '@/screens/ToiletMapScreen/data';
import type {SearchResultItem} from '@/screens/SearchScreen/useSearchRequest';

export type SearchMapViewHandle = {
  fitToItems: (_items: MarkerItem[]) => void;
  moveToItem: (targetId: string) => void;
  clearOverlayFocus: () => void;
  hasOverlayFocus: () => boolean;
};

type MapViewItem = (MarkerItem & PlaceListItem) | (ToiletDetails & MarkerItem);

const SearchMapView = forwardRef<
  SearchMapViewHandle,
  {
    data: SearchResultItem[];
    onRefresh: () => void;
  }
>(({data, onRefresh}, ref) => {
  const searchMode = useAtomValue(searchModeAtom);
  const [toiletLayerActive, setToiletLayerActive] = useAtom(
    toiletLayerActiveAtom,
  );
  const toiletLayerData = useToiletLayerQuery();

  // 화장실 pin 클릭 시 임시 포커스 (history stack에 쌓이지 않음)
  const [overlayFocusedItem, setOverlayFocusedItem] = useState<
    (ToiletDetails & MarkerItem) | null
  >(null);

  useImperativeHandle(ref, () => ({
    fitToItems: (_items: MarkerItem[]) => {
      mapViewRef.current?.fitToItems(_items);
    },
    moveToItem: (targetId: string) => {
      const target = datasForUI?.find(it => it.id === targetId);
      if (!target) return;
      mapViewRef.current?.moveToItem(target);
    },
    clearOverlayFocus: () => {
      setOverlayFocusedItem(null);
    },
    hasOverlayFocus: () => overlayFocusedItem != null,
  }));

  const mapViewRef = useRef<ItemMapViewHandle<MapViewItem>>(null);
  const [searchQuery, _] = useAtom(searchQueryAtom);
  const viewState = useAtomValue(viewStateAtom);
  const setDraftCameraRegion = useSetAtom(draftCameraRegionAtom);
  const datasForUI: MapViewItem[] = useMemo(() => {
    if (searchMode === 'toilet') {
      // Toilet data is already mapped with MarkerItem
      return (data as (ToiletDetails & MarkerItem)[]) ?? [];
    }
    // Place data needs to be mapped
    return (data as PlaceListItem[])?.map(toPlaceMarkerItem) ?? [];
  }, [data, searchMode]);
  const isSearchQueryEmpty = !searchQuery.text;

  // TODO: 기능 출시 시 `searchMode !== 'toilet'`로 복원
  const showToiletLayerToggle = false;

  const handleOverlayMarkerPress = useCallback(
    (item: MarkerItem) => {
      const toiletItem = toiletLayerData.find(t => t.id === item.id);
      if (toiletItem) {
        setOverlayFocusedItem(toiletItem);
      }
    },
    [toiletLayerData],
  );

  const handleOverlayDismiss = useCallback(() => {
    setOverlayFocusedItem(null);
  }, []);

  const handleToiletLayerToggle = useCallback(() => {
    const newActive = !toiletLayerActive;
    setToiletLayerActive(newActive);
    if (!newActive) {
      setOverlayFocusedItem(null);
    }
  }, [toiletLayerActive, setToiletLayerActive]);

  return (
    <LogParamsProvider params={{search_view_mode: 'map'}}>
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
          ItemCard={
            (searchMode === 'toilet'
              ? ToiletCard
              : SearchItemCard) as React.FC<{
              item: MapViewItem;
            }>
          }
          // 화장실 레이어 overlay
          overlayMarkers={
            showToiletLayerToggle && toiletLayerActive
              ? toiletLayerData
              : undefined
          }
          overlayFocusedItem={overlayFocusedItem}
          onOverlayMarkerPress={handleOverlayMarkerPress}
          onOverlayDismiss={handleOverlayDismiss}
          OverlayItemCard={ToiletCard as React.FC<{item: MarkerItem}>}
          // 토글 버튼
          toiletLayerActive={toiletLayerActive}
          onToiletLayerToggle={handleToiletLayerToggle}
          showToiletLayerToggle={showToiletLayerToggle}
        />
      </Wrapper>
    </LogParamsProvider>
  );
});

export default SearchMapView;

const Wrapper = styled.View`
  background-color: ${() => color.white};
  flex-grow: 1;
  overflow: hidden;
`;
