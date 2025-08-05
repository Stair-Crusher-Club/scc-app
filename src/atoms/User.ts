import {atom} from 'jotai';

import {userInfoAtom} from '@/atoms/Auth';
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

export const isGuestUserAtom = atom(get => {
  const userInfo = get(userInfoAtom);
  return userInfo?.id === '0';
});

export const recentlyUsedMobilityToolAtom = atomForLocal<{
  name: UserMobilityToolMapDto;
  timestamp: number;
}>('recentlyUsedMobilityTool');
