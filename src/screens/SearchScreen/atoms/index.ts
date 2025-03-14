import {atom} from 'recoil';

import {Region} from '@/components/maps/Types.tsx';

export const searchKeywordAtom = atom<string>({
  key: 'searchKeywordAtomMap',
  default: '',
});

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
  key: 'searchFilterAtom',
  default: {
    sortOption: SortOption.ACCURACY,
    scoreUnder: null,
    hasSlope: null,
    isRegistered: null,
  },
});

export const viewStateAtom = atom<{
  type: 'map' | 'list';
  inputMode: boolean;
}>({
  key: 'viewStateAtom',
  default: {type: 'map', inputMode: true},
});

export const filterModalStateAtom = atom<FilterType | 'All' | null>({
  key: 'filterModalStateAtom',
  default: null,
});

export type SearchQuery = {
  text: string | null;
  location: {lat: number; lng: number} | null;
  radiusMeter: number | null;
};

export const searchQueryAtom = atom<SearchQuery>({
  key: 'searchQueryAtom',
  default: {text: null, location: null, radiusMeter: null},
});

export const draftCameraRegionAtom = atom<Region | null>({
  key: 'draftCameraRegionAtom',
  default: null,
});

export const draftKeywordAtom = atom<string | null>({
  key: 'draftKeywordAtom',
  default: null,
});
