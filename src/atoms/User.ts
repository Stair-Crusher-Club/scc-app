import {atomForLocal, atomForLocalNonNull} from '@/atoms/atomForLocal';
import {UserMobilityToolMapDto} from '@/constant/review';

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

// PlaceFormV2 Guide 모달 "확인했어요" 상태 (1일간 안 보기 - timestamp)
export type PlaceFormV2GuideDismissedUntil = {
  firstFloor: number | null;
  otherFloor: number | null;
  multipleFloors: number | null;
  standaloneSingleFloor: number | null;
  standaloneMultipleFloors: number | null;
};

export const placeFormV2GuideDismissedUntilAtom =
  atomForLocalNonNull<PlaceFormV2GuideDismissedUntil>(
    'placeFormV2GuideDismissedUntil',
    {
      firstFloor: null,
      otherFloor: null,
      multipleFloors: null,
      standaloneSingleFloor: null,
      standaloneMultipleFloors: null,
    },
  );

export const recentlyUsedMobilityToolAtom = atomForLocal<{
  name: UserMobilityToolMapDto;
  timestamp: number;
}>('recentlyUsedMobilityTool');
