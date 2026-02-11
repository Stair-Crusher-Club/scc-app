import {atom} from 'jotai';

import {ScoreUnder} from '@/screens/SearchScreen/atoms';

export type PlaceListSortOption = 'distance' | 'accessibility_score' | null;

export type PlaceListFilterOptions = {
  sortOption: PlaceListSortOption;
  scoreUnder: ScoreUnder | null;
  hasSlope: boolean | null;
  isRegistered: boolean | null;
};

export type PlaceListFilterModalState =
  | 'All'
  | 'sortOption'
  | 'scoreUnder'
  | 'hasSlope'
  | 'isRegistered'
  | null;

export const placeListFilterAtom = atom<PlaceListFilterOptions>({
  sortOption: null,
  scoreUnder: null,
  hasSlope: null,
  isRegistered: null,
});

export const placeListFilterModalStateAtom =
  atom<PlaceListFilterModalState>(null);
