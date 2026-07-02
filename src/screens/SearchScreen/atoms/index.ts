import {atom} from 'jotai';

import {Region} from '@/components/maps/Types.tsx';

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

export const filterAtom = atom<FilterOptions>({
  sortOption: SortOption.LOW_SCORE,
  scoreUnder: null,
  hasSlope: null,
  isRegistered: null,
  hasReview: null,
});

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
