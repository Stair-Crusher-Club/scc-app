import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import React, {forwardRef, useImperativeHandle, useMemo, useRef} from 'react';
import styled from 'styled-components/native';

import ItemMapView, {ItemMapViewHandle} from '@/components/maps/ItemMapView';
import {MarkerItem, toPlaceMarkerItem} from '@/components/maps/MarkerItem';
import {color} from '@/constant/color';
import {PlaceListItem} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {
  draftCameraRegionAtom,
  searchQueryAtom,
  viewStateAtom,
} from '@/screens/SearchScreen/atoms';
import SearchItemCard from '@/screens/SearchScreen/components/SearchItemCard';

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
    moveToItem: (targetId: string) => {
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
    return data?.map(toPlaceMarkerItem) ?? [];
  }, [data]);
  const isSearchQueryEmpty = !searchQuery.text;
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
          ItemCard={SearchItemCard}
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
