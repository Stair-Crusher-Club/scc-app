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

/**
 * 마지막으로 관측한 앨범 업로드 허용 여부. "방금 활성화됐다" 판정(카메라 진입 시
 * lastKnown === false && 현재 true)의 기준값이라 boolean 대신 3치(null 포함) atom을 쓴다.
 *
 * null = 아직 관측 전(업데이트 직후의 기존 유저) — 이 상태에서는 활성화 툴팁을 띄우지 않고
 * 현재 값만 기록한다(strict === false 비교라 null은 자연히 걸러진다).
 */
export const lastKnownAlbumUploadAllowedAtom = atomForLocal<boolean>(
  'lastKnownAlbumUploadAllowed',
);

// 앨범 비활성 상태에서 "N개 등록하면 앨범이 열려요" 툴팁을 이미 본 유저(최초 1회만 노출).
export const hasShownAlbumLockedTooltipAtom = atomForLocalNonNull<boolean>(
  'hasShownAlbumLockedTooltip',
  false,
);

// "가이드 버튼" 소개 툴팁을 이미 본 유저(최초 1회만 노출).
export const hasShownCameraGuideTooltipAtom = atomForLocalNonNull<boolean>(
  'hasShownCameraGuideTooltip',
  false,
);

// 카메라 촬영 가이드 오버레이(프리뷰 위 프레임/계단 안내) on/off. 기본 ON.
export const isCameraGuideOverlayEnabledAtom = atomForLocalNonNull<boolean>(
  'isCameraGuideOverlayEnabled',
  true,
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
