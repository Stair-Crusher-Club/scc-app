import {describe, it, expect, jest, beforeEach, afterEach} from '@jest/globals';
import {renderHook, act} from '@testing-library/react-native';
import React from 'react';
import {Provider, createStore} from 'jotai';

import {
  searchQueryAtom,
  draftCameraRegionAtom,
  viewStateAtom,
} from '@/screens/SearchScreen/atoms';

// 키보드 상태를 외부에서 제어
let mockKeyboardShown = true;
jest.mock('@react-native-community/hooks', () => ({
  useKeyboard: () => ({
    keyboardShown: mockKeyboardShown,
    keyboardHeight: mockKeyboardShown ? 300 : 0,
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: [
      {place: {id: '1', name: '서울역', location: {lat: 37.5, lng: 127.0}}},
    ],
    isFetching: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/hooks/useAppComponents', () => () => ({api: {}}));
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

function createWrapper(store: ReturnType<typeof createStore>) {
  return ({children}: {children: React.ReactNode}) => (
    <Provider store={store}>{children}</Provider>
  );
}

describe('useSearchRequest - pendingCallback 초기화', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockKeyboardShown = true;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('clear 후 키보드가 내려가도 이전 검색 결과로 카메라 피팅이 발생하지 않는다', () => {
    // 전체 버그 시나리오 재현:
    // 1. 키보드 올라온 상태 + 검색 결과 있음 + inputMode=true
    // 2. fitToItems 콜백 세팅
    // 3. inputMode=false 전환 → useEffect가 onFetchCompleted.current 호출
    //    → 키보드 올라와 있으므로 → pendingCallbackRef에 저장!
    // 4. clear: setOnFetchCompleted(no-op)
    // 5. 키보드 내려감 → pendingCallback 실행 → 버그!
    const store = createStore();
    store.set(draftCameraRegionAtom, null);
    store.set(searchQueryAtom, {
      text: '서울역',
      location: null,
      radiusMeter: null,
    });
    store.set(viewStateAtom, {type: 'map', inputMode: true});

    const fitCallback = jest.fn();

    const {result, rerender} = renderHook(() => useSearchRequest(), {
      wrapper: createWrapper(store),
    });

    // 1. 카메라 피팅 콜백 세팅
    act(() => {
      result.current.setOnFetchCompleted(fitCallback);
    });

    // 2. inputMode=false 전환 → useEffect 트리거
    //    hasActiveSearch=true (text='서울역'), isTransitioningToMapView=true
    //    → onFetchCompleted.current(data) 호출
    //    → 키보드 올라와 있으므로 → pendingCallbackRef에 저장
    act(() => {
      store.set(viewStateAtom, {type: 'map', inputMode: false});
    });

    // setTimeout 실행 (useEffect 내부)
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // 이 시점에서 fitCallback은 아직 호출 안 됨 (pending 상태)
    expect(fitCallback).not.toHaveBeenCalled();

    // 3. clear 동작: setOnFetchCompleted(no-op)
    act(() => {
      result.current.setOnFetchCompleted(() => {});
    });

    // 4. 키보드 내려감
    mockKeyboardShown = false;
    rerender({});

    // setTimeout 실행 (keyboard useEffect 내부의 setTimeout)
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // 핵심: fitCallback이 호출되면 안 됨!
    // pendingCallbackRef가 초기화되지 않았으면 여기서 호출됨 → 카메라 이동 버그
    expect(fitCallback).not.toHaveBeenCalled();
  });
});
