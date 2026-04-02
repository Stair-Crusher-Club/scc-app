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
});
