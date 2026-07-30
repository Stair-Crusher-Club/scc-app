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

export const hasShownHomeTutorialAtom = atomForLocalNonNull<boolean>(
  'hasShownHomeTutorial',
  false,
);

/**
 * 윌리의 외출 NUX 튜토리얼: 외출 유도 전면 팝업을 **이미 본 유저의 id**.
 *
 * 팝업은 "가입 유저당 1회"라서 기기 단위가 아니라 유저 단위로 기록해야 한다. 같은 기기에서
 * 계정을 바꾸면(재가입/계정 전환) 새 유저는 팝업을 한 번 봐야 하고, 같은 계정으로 다시
 * 로그인하면 봐선 안 된다 — id 를 저장하면 두 경우가 모두 맞아떨어진다.
 */
export const tutorialIntroPopupShownUserIdAtom = atomForLocal<string>(
  'tutorialIntroPopupShownUserId',
);

/**
 * @deprecated 기기 단위 boolean 이라 계정을 바꿔도 리셋되지 않았다
 * ([tutorialIntroPopupShownUserIdAtom] 로 대체).
 *
 * 이 값이 true 인 기존 기기가 업데이트 후 팝업을 다시 보지 않도록, 최초 1회
 * "현재 로그인한 유저가 본 것"으로 이관하는 판정에만 남겨둔다. 이관 로직을 지울 때 함께 삭제.
 */
export const hasShownTutorialIntroPopupAtom = atomForLocalNonNull<boolean>(
  'hasShownTutorialIntroPopup',
  false,
);

export const hasShownOutingItemsCollectedPopupAtom =
  atomForLocalNonNull<boolean>('hasShownOutingItemsCollectedPopupV2', false);

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

// 홈 팝업 "다시 보지 않기" 상태 (팝업 ID → dismissed 여부)
export const dismissedHomePopupIdsAtom = atomForLocalNonNull<
  Record<string, boolean>
>('dismissedHomePopupIds', {});

export const recentlyUsedMobilityToolAtom = atomForLocal<{
  name: UserMobilityToolMapDto;
  timestamp: number;
}>('recentlyUsedMobilityTool');
