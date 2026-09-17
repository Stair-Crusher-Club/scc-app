import {describe, expect, it} from '@jest/globals';
import {createStore} from 'jotai';

import {currentLocationAtom} from '../Location';

describe('currentLocationAtom', () => {
  it('같은 좌표를 다시 쓰면 값이 바뀌지 않는다 (구독처 리렌더 방지)', () => {
    const store = createStore();
    store.set(currentLocationAtom, {latitude: 37.5, longitude: 127.0});
    const first = store.get(currentLocationAtom);

    store.set(currentLocationAtom, {latitude: 37.5, longitude: 127.0});

    expect(store.get(currentLocationAtom)).toBe(first);
  });

  it('좌표가 달라지면 갱신한다', () => {
    const store = createStore();
    store.set(currentLocationAtom, {latitude: 37.5, longitude: 127.0});
    const first = store.get(currentLocationAtom);

    store.set(currentLocationAtom, {latitude: 37.5001, longitude: 127.0});

    expect(store.get(currentLocationAtom)).not.toBe(first);
    expect(store.get(currentLocationAtom)).toEqual({
      latitude: 37.5001,
      longitude: 127.0,
    });
  });

  it('null 로 초기화한 상태에서 null 을 다시 써도 바뀌지 않는다', () => {
    const store = createStore();
    expect(store.get(currentLocationAtom)).toBeNull();

    store.set(currentLocationAtom, null);

    expect(store.get(currentLocationAtom)).toBeNull();
  });
});
