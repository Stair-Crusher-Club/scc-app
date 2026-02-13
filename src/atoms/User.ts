import {atomForLocal, atomForLocalNonNull} from '@/atoms/atomForLocal';
import {UserMobilityToolMapDto} from '@/constant/review';
import type {FilterOptions} from '@/screens/SearchScreen/atoms';

export const searchHistoriesAtom = atomForLocalNonNull<string[]>(
  'searchHistories',
  [],
);

export const hasBeenRegisteredAccessibilityAtom = atomForLocalNonNull<boolean>(
  'hasBeenRegisteredAccessibility',
  false,
);

export const hasShownGuideForEntrancePhotoAtom = atomForLocalNonNull<boolean>(
  'hasShownGuideForEnterancePhoto',
  false,
);

export const hasShownGuideForReviewPhotoAtom = atomForLocalNonNull<boolean>(
  'hasShownGuideForReviewPhoto',
  false,
);

export const hasShownGuideForToiletPhotoAtom = atomForLocalNonNull<boolean>(
  'hasShownGuideForToiletPhoto',
  false,
);

export const hasShownGuideForFirstVisitAtom = atomForLocalNonNull<boolean>(
  'hasShownGuideForFirstVisit',
  false,
);

export const hasShownCoachMarkForFirstVisitAtom = atomForLocalNonNull<boolean>(
  'hasShownCoachMarkForFirstVisit',
  false,
);

export const hasShownMapIconTooltipForFirstVisitAtom =
  atomForLocalNonNull<boolean>('hasShownMapIconTooltipForFirstVisit', false);

// PlaceFormV2 Guide 모달 "다시보지않기" 상태
export type PlaceFormV2GuideDismissed = {
  firstFloor: boolean;
  otherFloor: boolean;
  multipleFloors: boolean;
  standaloneSingleFloor: boolean;
  standaloneMultipleFloors: boolean;
};

export const placeFormV2GuideDismissedAtom =
  atomForLocalNonNull<PlaceFormV2GuideDismissed>('placeFormV2GuideDismissed', {
    firstFloor: false,
    otherFloor: false,
    multipleFloors: false,
    standaloneSingleFloor: false,
    standaloneMultipleFloors: false,
  });

export const recentlyUsedMobilityToolAtom = atomForLocal<{
  name: UserMobilityToolMapDto;
  timestamp: number;
}>('recentlyUsedMobilityTool');

// 마지막으로 사용한 검색 필터 (MMKV 저장)
export const savedSearchFilterAtom = atomForLocalNonNull<FilterOptions | null>(
  'savedSearchFilter',
  null,
);

// 저장된 필터 복원 말풍선 표시 여부 (최초 1회)
export const hasShownSavedFilterTooltipAtom = atomForLocalNonNull<boolean>(
  'hasShownSavedFilterTooltip',
  false,
);
