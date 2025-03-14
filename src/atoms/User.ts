import {selector} from 'recoil';

import {userInfoAtom} from '@/atoms/Auth';
import {atomForLocalNonNull} from '@/atoms/atomForLocal';

export const searchHistoriesAtom = atomForLocalNonNull<string[]>(
  'searchHistories',
  [],
);

export const hasBeenRegisteredAccessibilityAtom = atomForLocalNonNull<boolean>(
  'hasBeenRegisteredAccessibility',
  false,
);

export const hasShownGuideForEnterancePhotoAtom = atomForLocalNonNull<boolean>(
  'hasShownGuideForEnterancePhoto',
  false,
);

export const hasShownGuideForFirstVisitAtom = atomForLocalNonNull<boolean>(
  'hasShownGuideForFirstVisit',
  false,
);

export const isGuestUserSelector = selector({
  key: 'isGuestUser',
  get: ({get}) => {
    const userInfo = get(userInfoAtom);
    return userInfo?.id === '0';
  },
});
