import {describe, it, expect, jest, beforeEach, afterEach} from '@jest/globals';
import React from 'react';
import {render, fireEvent, act} from '@testing-library/react-native';
import {Provider, createStore} from 'jotai';

import {
  draftKeywordAtom,
  searchQueryAtom,
  viewStateAtom,
} from '@/screens/SearchScreen/atoms';
import SearchInputText from '../SearchInputText';

// Mock SVG icons — testID를 부여해서 렌더링 검증 가능하게
jest.mock('@/assets/icon/ic_arrow_left.svg', () => {
  const {View} = require('react-native');
  return (props: any) => <View testID="arrow-left-icon" {...props} />;
});
jest.mock('@/assets/icon/ic_clear.svg', () => {
  const {View} = require('react-native');
  return (props: any) => <View testID="clear-icon" {...props} />;
});
jest.mock('@/assets/icon/ic_list.svg', () => {
  const {View} = require('react-native');
  return (props: any) => <View testID="list-icon" {...props} />;
});
jest.mock('@/assets/icon/ic_map.svg', () => {
  const {View} = require('react-native');
  return (props: any) => <View testID="map-icon" {...props} />;
});
jest.mock('@/assets/icon/ic_search.svg', () => {
  const {View} = require('react-native');
  return (props: any) => <View testID="search-icon" {...props} />;
});

// Mock navigation
jest.mock('@/navigation/useNavigation.ts', () => () => ({
  goBack: jest.fn(),
}));

// Mock SccTouchableOpacity — elementName을 testID로 매핑하여 버튼 식별 가능
jest.mock('@/components/SccTouchableOpacity', () => {
  const {TouchableOpacity} = require('react-native');
  return {
    SccTouchableOpacity: ({elementName, ...props}: any) => (
      <TouchableOpacity testID={elementName} {...props} />
    ),
  };
});

function renderSearchInput({
  store,
  onTextUpdate = jest.fn(),
  onBack = jest.fn(() => false),
  autoFocus = false,
}: {
  store: ReturnType<typeof createStore>;
  onTextUpdate?: jest.Mock;
  onBack?: jest.Mock<() => boolean>;
  autoFocus?: boolean;
}) {
  const utils = render(
    <Provider store={store}>
      <SearchInputText
        onTextUpdate={onTextUpdate}
        onBack={onBack}
        autoFocus={autoFocus}
      />
    </Provider>,
  );
  const input = utils.getByPlaceholderText('장소, 주소 검색');
  return {...utils, input, onTextUpdate};
}

function createTestStore(overrides?: {
  draftKeyword?: string | null;
  searchQueryText?: string | null;
  inputMode?: boolean;
}) {
  const store = createStore();
  if (overrides?.draftKeyword !== undefined) {
    store.set(draftKeywordAtom, overrides.draftKeyword);
  }
  if (overrides?.searchQueryText !== undefined) {
    store.set(searchQueryAtom, {
      text: overrides.searchQueryText,
      location: null,
      radiusMeter: null,
    });
  }
  if (overrides?.inputMode !== undefined) {
    store.set(viewStateAtom, {type: 'map', inputMode: overrides.inputMode});
  }
  return store;
}

describe('SearchInputText - Korean IME race condition', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('searchQuery.text가 업데이트돼도 draftKeyword가 리셋되지 않아야 한다', () => {
    // 이 테스트는 핵심 race condition을 재현한다:
    // 유저가 "서울역"을 입력했는데, debounce가 중간값 "서울"로 발동하여
    // searchQuery.text="서울"이 됨. 이때 draftKeyword("서울역")가 null로
    // 리셋되면 TextInput value가 "서울"로 튀는 버그.
    const store = createTestStore({inputMode: true});
    const {input} = renderSearchInput({store});

    // 유저가 빠르게 "서울역" 입력
    fireEvent.changeText(input, '서울역');
    expect(input.props.value).toBe('서울역');

    // debounce가 중간값 "서울"로 searchQuery.text를 업데이트하는 상황
    // (실제로는 debounce 타이밍에 따라 발생 가능)
    act(() => {
      store.set(searchQueryAtom, {
        text: '서울',
        location: null,
        radiusMeter: null,
      });
    });

    // 핵심 assertion: draftKeyword가 null로 리셋되면 안 됨
    expect(store.get(draftKeywordAtom)).toBe('서울역');
    // value는 draftKeyword를 보여줘야 함 (inputMode이므로)
    expect(input.props.value).toBe('서울역');
  });

  it('debounce 발동 후 타이핑을 재개하면 최신 입력값이 유지된다', () => {
    // 시나리오: "서" 입력 → 300ms 멈춤 → debounce 발동 → 바로 "울" 추가
    const store = createTestStore({inputMode: true});
    const {input} = renderSearchInput({store});

    // "서" 입력
    fireEvent.changeText(input, '서');
    expect(input.props.value).toBe('서');

    // 300ms → debounce 발동
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // searchQuery.text가 "서"로 업데이트됨
    act(() => {
      store.set(searchQueryAtom, {
        text: '서',
        location: null,
        radiusMeter: null,
      });
    });

    // debounce 발동 후에도 value가 변하지 않아야 함 (버벅임 방지)
    expect(input.props.value).toBe('서');

    // 바로 타이핑 재개 → "서울"
    fireEvent.changeText(input, '서울');

    // 핵심: 최신 입력값 "서울"이 유지되어야 함
    expect(input.props.value).toBe('서울');
    expect(store.get(draftKeywordAtom)).toBe('서울');
  });

  it('느린 타이핑으로 debounce가 매 글자마다 발동해도 입력이 안정적이다', () => {
    const store = createTestStore({inputMode: true});
    const {input} = renderSearchInput({store});

    // 1글자씩 느리게 입력 — 매번 debounce 발동
    const chars = ['서', '서울', '서울역'];
    for (let i = 0; i < chars.length; i++) {
      fireEvent.changeText(input, chars[i]);

      act(() => {
        jest.advanceTimersByTime(300);
      });
      // debounce 발동 후 searchQuery.text 업데이트
      act(() => {
        store.set(searchQueryAtom, {
          text: chars[i],
          location: null,
          radiusMeter: null,
        });
      });

      // 매 단계에서 입력값이 유지되어야 함
      expect(input.props.value).toBe(chars[i]);
    }

    // 최종 확인: draftKeyword가 살아있어야 함
    expect(store.get(draftKeywordAtom)).toBe('서울역');
  });

  it('inputMode=false에서는 searchQuery.text를 표시한다', () => {
    // 검색 결과를 보고 있는 상태 (inputMode=false)에서는
    // draftKeyword가 아닌 searchQuery.text를 보여줘야 한다.
    const store = createTestStore({
      inputMode: false,
      searchQueryText: '서울역',
    });
    const {input} = renderSearchInput({store});

    expect(input.props.value).toBe('서울역');

    // 외부에서 draftKeyword가 설정되더라도 inputMode=false에서는 무시
    act(() => {
      store.set(draftKeywordAtom, '다른 검색어');
    });
    expect(input.props.value).toBe('서울역');
  });

  it('inputMode 재진입 시 draftKeyword가 즉시 searchQuery.text로 세팅된다', () => {
    const store = createTestStore({
      inputMode: false,
      searchQueryText: '서울역',
    });
    const {input} = renderSearchInput({store});

    // inputMode=false → searchQuery.text 표시
    expect(input.props.value).toBe('서울역');

    // input focus → inputMode 전환: 진입 즉시 draftKeyword = searchQuery.text
    fireEvent(input, 'focus');

    // 핵심: draftKeyword가 즉시 세팅되어야 함 (버벅임 없이)
    expect(store.get(draftKeywordAtom)).toBe('서울역');
    expect(input.props.value).toBe('서울역');

    // 타이핑으로 수정
    fireEvent.changeText(input, '서울역 맛집');
    expect(input.props.value).toBe('서울역 맛집');
  });

  it('inputMode 재진입 시 stale draftKeyword가 아닌 최신 searchQuery.text로 복원된다', () => {
    // 시나리오: 유저가 "서울역"을 검색 → submit → inputMode=false
    // 이후 카테고리 클릭으로 searchQuery.text="카페"로 변경
    // 다시 input focus → draftKeyword는 "카페"여야 함 (stale "서울역" 아님)
    const store = createTestStore({
      inputMode: false,
      searchQueryText: '서울역',
      draftKeyword: '서울역', // submit 후 남아있는 stale draftKeyword
    });
    const {input} = renderSearchInput({store});

    // inputMode=false → searchQuery.text 표시
    expect(input.props.value).toBe('서울역');

    // 외부에서 카테고리 클릭 → searchQuery.text 변경
    act(() => {
      store.set(searchQueryAtom, {
        text: '카페',
        location: null,
        radiusMeter: null,
      });
    });
    expect(input.props.value).toBe('카페');

    // re-focus: draftKeyword는 최신 searchQuery.text("카페")로 세팅되어야 함
    fireEvent(input, 'focus');
    expect(store.get(draftKeywordAtom)).toBe('카페');
    expect(input.props.value).toBe('카페');
  });

  it('inputMode=true + draftKeyword=null 상태에서 re-focus 시 searchQuery.text를 복원한다', () => {
    // 이 테스트는 리뷰에서 발견된 edge case:
    // inputMode가 이미 true인데 draftKeyword가 null인 상태에서
    // focus 이벤트가 다시 발생할 때 빈 input이 보이지 않아야 한다.
    const store = createTestStore({
      inputMode: true,
      searchQueryText: '서울역',
      draftKeyword: null,
    });
    const {input} = renderSearchInput({store});

    // inputMode=true이지만 draftKeyword=null → value는 '' (빈 문자열)
    // 이 상태에서 re-focus가 발생하면 복원해야 한다.
    fireEvent(input, 'focus');

    // draftKeyword가 searchQuery.text로 복원되어야 함
    expect(store.get(draftKeywordAtom)).toBe('서울역');
    expect(input.props.value).toBe('서울역');
  });

  it('onClear 버튼 클릭 후 re-focus 시 정상 동작한다', () => {
    const store = createTestStore({inputMode: true});
    const onTextUpdate = jest.fn();
    const {input, getByTestId} = renderSearchInput({store, onTextUpdate});

    // 타이핑
    fireEvent.changeText(input, '서울역');
    expect(input.props.value).toBe('서울역');

    // searchQuery.text가 debounce를 통해 업데이트된 상태
    act(() => {
      store.set(searchQueryAtom, {
        text: '서울역',
        location: null,
        radiusMeter: null,
      });
    });

    // 실제 clear 버튼 클릭
    const clearButton = getByTestId('search_clear_or_submit_button');
    fireEvent.press(clearButton);

    // onClear 동작 검증: draftKeyword=null, onTextUpdate('', false) 호출
    expect(store.get(draftKeywordAtom)).toBeNull();
    expect(onTextUpdate).toHaveBeenCalledWith('', false);

    // onTextUpdate 호출 후 searchQuery.text가 외부에서 ''로 업데이트되는 상황
    act(() => {
      store.set(searchQueryAtom, {
        text: '',
        location: null,
        radiusMeter: null,
      });
    });

    // clear 후 value는 빈 문자열이어야 함
    expect(input.props.value).toBe('');

    // 다시 focus → draftKeyword 복원
    fireEvent(input, 'focus');
    expect(store.get(draftKeywordAtom)).toBe('');
    // 새로 타이핑 가능
    fireEvent.changeText(input, '강남역');
    expect(input.props.value).toBe('강남역');
  });

  it('타이핑 중 debounce 미발동 상태에서 clear 버튼이 올바르게 표시된다', () => {
    // draftKeyword가 있지만 searchQuery.text가 아직 없는 상태에서
    // clear(X) 아이콘이 표시되어야 한다 (검색 아이콘이 아니라).
    const store = createTestStore({
      inputMode: true,
      searchQueryText: '', // debounce 미발동 — searchQuery.text는 빈 문자열
    });
    const {input, queryByTestId} = renderSearchInput({store});

    // 초기 상태: 텍스트 없음 → 검색 아이콘 표시
    expect(queryByTestId('search-icon')).not.toBeNull();
    expect(queryByTestId('clear-icon')).toBeNull();

    // 타이핑 시작
    fireEvent.changeText(input, '강남');

    // draftKeyword='강남', searchQuery.text='' (debounce 미발동)
    // isTextExists가 draftKeyword 기반이므로 clear 아이콘 표시
    expect(queryByTestId('clear-icon')).not.toBeNull();
    expect(queryByTestId('search-icon')).toBeNull();
  });
});
