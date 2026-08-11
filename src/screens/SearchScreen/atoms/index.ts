import {atom} from 'jotai';
import type {SetStateAction} from 'react';

import {Region} from '@/components/maps/Types.tsx';
import {PlaceListItem} from '@/generated-sources/openapi';

export type SearchMode = 'place' | 'toilet';
export const searchModeAtom = atom<SearchMode>('place');

// 공백 제거 후 정확히 일치하는 검색어만 화장실 검색으로 취급.
// "화장실" 칩(keyword="장애인 화장실")과 동일하게 toilet 모드로 라우팅하기 위함.
// ponytail: exact-match. "근처 화장실" 같은 부분일치 요구가 생기면 그때 substring으로 확장.
const TOILET_SEARCH_KEYWORDS = new Set(['화장실', '장애인화장실']);
export function isToiletSearchKeyword(text?: string | null): boolean {
  return !!text && TOILET_SEARCH_KEYWORDS.has(text.replace(/\s/g, ''));
}

export const searchKeywordAtom = atom<string>('');

export type FilterOptions = {
  sortOption: SortOption;
  scoreUnder: ScoreUnder | null;
  hasSlope: boolean | null;
  isRegistered: boolean | null;
  hasReview: boolean | null;
};

export enum SortOption {
  DISTANCE = 'distance',
  ACCURACY = 'accuracy',
  LOW_SCORE = 'lowscore',
}

export enum ScoreUnder {
  ZERO = 0,
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

export type FilterType = keyof FilterOptions;

// 자동완성 목록에서 특정 장소를 선택했을 때 그 장소. 세팅되어 있으면 검색 결과를
// 이 장소 1건으로 고정한다(서버 재검색 없음) — 장소명으로 다시 검색하면 동명/유사명
// 장소가 섞여 "내가 고른 그곳"이 아닌 목록이 나온다.
//
// 해제 조건은 두 가지고, 둘 다 호출부가 아니라 **진입점 한 곳**에서 강제한다:
//   1. 새로운 검색 의도 → SearchScreen 의 onQueryUpdate (검색 호출부 9곳이 전부 경유)
//   2. 필터/정렬 변경   → 아래 [filterAtom] 의 writer (setFilter 호출부가 전부 경유)
export const pinnedPlaceAtom = atom<PlaceListItem | null>(null);

const filterStateAtom = atom<FilterOptions>({
  sortOption: SortOption.LOW_SCORE,
  scoreUnder: null,
  hasSlope: null,
  isRegistered: null,
  hasReview: null,
});

/**
 * 검색 필터/정렬. 값이 바뀌면 [pinnedPlaceAtom] 고정도 함께 풀린다 — 고정된 채로는
 * 결과가 1건 그대로라 "필터가 안 먹는 화면"이 되기 때문이다.
 * 해제를 setFilter 호출부(필터 모달·프리뷰 칩·추천 칩·대체 검색·초기 정렬)에 맡기면
 * 반드시 하나가 샌다. 여기 한 곳에서 강제한다.
 */
export const filterAtom = atom(
  get => get(filterStateAtom),
  (_get, set, update: SetStateAction<FilterOptions>) => {
    set(filterStateAtom, update);
    set(pinnedPlaceAtom, null);
  },
);

// 기본 상태: Map 탭 진입 시의 empty view (input focus 없음).
// 검색 바를 눌러 진입할 때는 TextInput onFocus가 inputMode=true로 전환한다.
export const viewStateAtom = atom<{
  type: 'map' | 'list';
  inputMode: boolean;
}>({type: 'map', inputMode: false});

export const filterModalStateAtom = atom<FilterType | 'All' | null>(null);

export type SearchQuery = {
  text: string | null;
  location: {lat: number; lng: number} | null;
  radiusMeter: number | null;
  useCameraRegion?: boolean; // 카메라 영역 검색 플래그 - "이 지역 재검색" 버튼용
};

export const searchQueryAtom = atom<SearchQuery>({
  text: null,
  location: null,
  radiusMeter: null,
});

export const draftCameraRegionAtom = atom<Region | null>(null);

export const draftKeywordAtom = atom<string | null>(null);

export const searchRequestIdAtom = atom<string | null>(null);

export const toiletLayerActiveAtom = atom(false);

// 현재 검색 결과가 "주위 다른 OOO 확인하기"(대체 검색)로 얻어진 것인지.
// true인 동안에는 대체 검색 CTA를 절대 노출하지 않는다 (대체 검색의 대체 검색 방지).
export const isAlternativeSearchAtom = atom(false);
