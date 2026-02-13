import {atom} from 'jotai';

import {Region} from '@/components/maps/Types.tsx';

export type SearchMode = 'place' | 'toilet';
export const searchModeAtom = atom<SearchMode>('place');

export const searchKeywordAtom = atom<string>('');

export type FilterOptions = {
  sortOption: SortOption;
  scoreUnder: ScoreUnder | null;
  hasSlope: boolean | null;
  isRegistered: boolean | null;
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
  sortOption: SortOption.ACCURACY,
  scoreUnder: null,
  hasSlope: null,
  isRegistered: null,
});

export const viewStateAtom = atom<{
  type: 'map' | 'list';
  inputMode: boolean;
}>({type: 'map', inputMode: true});

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
