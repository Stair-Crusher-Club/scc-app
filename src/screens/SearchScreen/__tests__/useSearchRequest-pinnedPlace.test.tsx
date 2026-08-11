import {describe, it, expect, jest, beforeEach} from '@jest/globals';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {act, renderHook, waitFor} from '@testing-library/react-native';
import {Provider, createStore} from 'jotai';
import React from 'react';

import {
  draftCameraRegionAtom,
  filterAtom,
  pinnedPlaceAtom,
  ScoreUnder,
  searchQueryAtom,
  viewStateAtom,
} from '@/screens/SearchScreen/atoms';

jest.mock('@react-native-community/hooks', () => ({
  useKeyboard: () => ({keyboardShown: false, keyboardHeight: 0}),
}));

const mockSearchPlacesPost = jest.fn();
jest.mock('@/hooks/useAppComponents', () => () => ({
  api: {searchPlacesPost: mockSearchPlacesPost},
  toiletApi: {},
}));
jest.mock('@/logging/useLogger', () => ({
  useLogger: () => ({logElementClick: jest.fn()}),
}));
jest.mock('@/components/DevTool/useDevTool', () => ({
  useDevTool: () => ({
    searchRegion: {trackCircle: jest.fn(), trackRectangle: jest.fn()},
  }),
}));
jest.mock('@/utils/GeolocationUtils', () => ({
  __esModule: true,
  default: {getCurrentPosition: jest.fn()},
}));
jest.mock('@/utils/ToastUtils', () => ({
  __esModule: true,
  default: {show: jest.fn(), showOnApiError: jest.fn()},
}));

import useSearchRequest from '@/screens/SearchScreen/useSearchRequest';

const PINNED = {
  place: {
    id: 'PLC_1',
    name: '대한냉면 정자점',
    location: {lat: 37.36, lng: 127.1},
  },
} as never;

function renderWithPin(pinned: unknown) {
  const store = createStore();
  store.set(draftCameraRegionAtom, null);
  store.set(searchQueryAtom, {
    text: '대한냉면 정자점',
    location: {lat: 37.36, lng: 127.1},
    radiusMeter: null,
  });
  store.set(viewStateAtom, {type: 'map', inputMode: false});
  store.set(pinnedPlaceAtom, pinned as never);

  const queryClient = new QueryClient({
    defaultOptions: {queries: {retry: false, gcTime: 0}},
  });
  return {
    store,
    ...renderHook(() => useSearchRequest(), {
      wrapper: ({children}: {children: React.ReactNode}) => (
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>{children}</Provider>
        </QueryClientProvider>
      ),
    }),
  };
}

describe('useSearchRequest - 자동완성에서 고른 장소 고정', () => {
  beforeEach(() => {
    mockSearchPlacesPost.mockReset();
    mockSearchPlacesPost.mockResolvedValue({
      data: {mode: 'PLACE', items: [{place: {id: 'OTHER'}}]},
    } as never);
  });

  it('고정된 장소가 있으면 그 1건만 반환하고 서버에 검색하지 않는다', async () => {
    const {result} = renderWithPin(PINNED);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([PINNED]);
    // 장소명으로 재검색하면 동명 장소가 섞인다 — 그래서 아예 묻지 않는다.
    expect(mockSearchPlacesPost).not.toHaveBeenCalled();
  });

  it('필터를 바꾸면 고정이 풀리고 서버 검색을 한다', async () => {
    // 안 풀리면 "필터를 바꿨는데 결과가 그대로인" 고장 난 화면이 된다.
    const {result, store} = renderWithPin(PINNED);

    await waitFor(() => expect(result.current.data).toEqual([PINNED]));

    act(() => {
      store.set(filterAtom, prev => ({...prev, scoreUnder: ScoreUnder.TWO}));
    });

    await waitFor(() => expect(mockSearchPlacesPost).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(result.current.data).toEqual([{place: {id: 'OTHER'}}]),
    );
  });

  it('고정이 없으면 평소대로 서버 검색을 한다', async () => {
    const {result} = renderWithPin(null);

    await waitFor(() => expect(mockSearchPlacesPost).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([{place: {id: 'OTHER'}}]);
  });
});
