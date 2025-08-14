import {atom} from 'jotai';

import {userInfoAtom} from '@/atoms/Auth';
import {atomForLocal, atomForLocalNonNull} from '@/atoms/atomForLocal';
import {UserMobilityToolMapDto} from '@/constant/review';
import {User} from '@/generated-sources/openapi';

export const ANONYMOUS_USER_TEMPLATE: User = {
  id: '0',
  nickname: '비회원',
  mobilityTools: [],
  isNewsLetterSubscriptionAgreed: false,
};

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

export const isAnonymousUserAtom = atom(get => {
  const userInfo = get(userInfoAtom);
  // 비회원 체크: nickname이 '비회원'인 경우
  // (id가 '0'인 경우는 레거시 케이스이며, 실제로는 채번된 userId를 가짐)
  return userInfo?.id === '0' || userInfo?.nickname === ANONYMOUS_USER_TEMPLATE.nickname;
});

export const recentlyUsedMobilityToolAtom = atomForLocal<{
  name: UserMobilityToolMapDto;
  timestamp: number;
}>('recentlyUsedMobilityTool');
