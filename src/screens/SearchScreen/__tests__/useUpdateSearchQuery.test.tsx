import {describe, it, expect} from '@jest/globals';
import {renderHook, act} from '@testing-library/react-native';
import React from 'react';
import {Provider, createStore} from 'jotai';

import {
  draftCameraRegionAtom,
  searchQueryAtom,
} from '@/screens/SearchScreen/atoms';
import {useUpdateSearchQuery} from '@/screens/SearchScreen/useUpdateSearchQuery';

function createWrapper(store: ReturnType<typeof createStore>) {
  return ({children}: {children: React.ReactNode}) => (
    <Provider store={store}>{children}</Provider>
  );
}

describe('useUpdateSearchQuery', () => {
  it('text가 빈 문자열("")이면 searchQuery.text를 빈 문자열로 업데이트한다', () => {
    const store = createStore();
    store.set(draftCameraRegionAtom, null);
    store.set(searchQueryAtom, {
      text: '서울역',
      location: null,
      radiusMeter: null,
    });

    const {result} = renderHook(() => useUpdateSearchQuery(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.updateQuery({text: ''});
    });

    expect(store.get(searchQueryAtom).text).toBe('');
  });

  it('text가 undefined이면 기존 searchQuery.text를 유지한다', () => {
    // 시나리오: "이 지역 재검색" → updateQuery({useCameraRegion: true})
    // text 미제공 시 기존 searchQuery.text가 그대로 유지되어야 함
    const store = createStore();
    store.set(draftCameraRegionAtom, null);
    store.set(searchQueryAtom, {
      text: '서울역',
      location: null,
      radiusMeter: null,
    });

    const {result} = renderHook(() => useUpdateSearchQuery(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.updateQuery({});
    });

    // prev.text가 유지됨
    expect(store.get(searchQueryAtom).text).toBe('서울역');
  });

  it('카메라 영역이 있어도 호출처가 검색 영역을 명시하면 그 영역을 그대로 쓴다', () => {
    // 시나리오: 대체 검색 — 서버가 제안 판단에 실제로 검색해본 원형 영역으로 재검색해야
    // "눌렀는데 결과가 없다"가 발생하지 않는다. 카메라 영역으로 덮어쓰면 보장이 깨진다.
    const store = createStore();
    store.set(draftCameraRegionAtom, {
      northEast: {latitude: 37.6, longitude: 127.1},
      southWest: {latitude: 37.4, longitude: 126.9},
    });
    store.set(searchQueryAtom, {
      text: '대한냉면 정자',
      location: null,
      radiusMeter: null,
    });

    const {result} = renderHook(() => useUpdateSearchQuery(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.updateQuery({
        text: '한식',
        location: {lat: 37.3625, lng: 127.1086},
        radiusMeter: 1000,
      });
    });

    expect(store.get(searchQueryAtom).location).toEqual({
      lat: 37.3625,
      lng: 127.1086,
    });
    expect(store.get(searchQueryAtom).radiusMeter).toBe(1000);
  });

  it('카메라 영역이 있고 호출처가 영역을 명시하지 않으면 카메라 영역을 따라간다', () => {
    // 시나리오: "이 지역 재검색" / 카테고리 칩 — 기존 동작 회귀 방지
    const store = createStore();
    store.set(draftCameraRegionAtom, {
      northEast: {latitude: 37.6, longitude: 127.1},
      southWest: {latitude: 37.4, longitude: 126.9},
    });
    store.set(searchQueryAtom, {
      text: '카페',
      location: null,
      radiusMeter: null,
    });

    const {result} = renderHook(() => useUpdateSearchQuery(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.updateQuery({useCameraRegion: true});
    });

    expect(store.get(searchQueryAtom).location).toEqual({lat: 37.5, lng: 127});
    expect(store.get(searchQueryAtom).radiusMeter).toBeGreaterThan(0);
  });
});
