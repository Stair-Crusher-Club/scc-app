import {
  TutorialMissionTypeDto,
  type UserTutorialMissionDto,
} from '@/generated-sources/openapi';
import type {ScreenParams} from '@/navigation/Navigation.screens';

import type {BubbleVariant} from './components/SpeechBubble';

/**
 * 윌리의 외출 NUX 튜토리얼 미션 카드 메타데이터.
 * 미션의 표시 텍스트 / 외출템 이미지 / 시작 버튼 navigate target 등을
 * 앱에서 하드코딩으로 관리한다 (서버는 진행 상태 + **미션 구성/순서**를 관리).
 *
 * 미션 순서는 여기에 담지 않는다 — 가입 시점에 따라 서로 다른 미션 셋(v1/v2)이
 * 내려오므로 순서는 서버 응답 `progress.missions` 배열 순서만이 정답이다.
 */
export interface MissionMeta {
  /** 외출템 이미지 (require'd local asset). 미션 카드 좌측에 표시 */
  itemImage: number;
  /** 외출템 이미지의 너비 (Figma quest_card 안 Mask group 기준) */
  itemImageWidth: number;
  /** 외출템 이미지의 높이 (Figma quest_card 안 Mask group 기준) */
  itemImageHeight: number;
  /** "계뿌클 앱이 설치된 스마트폰" 같은 부제 (highlight 부분과 함께) */
  subtitle: string;
  /** highlight bold 처리할 부분 (subtitle 끝에 매칭) */
  subtitleBoldSuffix: string;
  /** 카드 본문 (제목) */
  title: string;
  /** 미션 시작 버튼 클릭 시 이동할 screen name */
  navigateTo: keyof ScreenParams | 'TallyForm';
  /** 이 미션이 진행 중일 때 hero 에 띄울 말풍선 variant */
  bubbleVariant: BubbleVariant;
}

export const TUTORIAL_MISSION_META: Record<
  TutorialMissionTypeDto,
  MissionMeta
> = {
  VIEW_TUTORIAL_IMAGES: {
    itemImage: require('@/assets/img/tutorial/item_magnifier.png'),
    itemImageWidth: 72,
    itemImageHeight: 72,
    subtitle: '계뿌클을 둘러볼 수 있는 ',
    subtitleBoldSuffix: '돋보기',
    title: '튜토리얼 이미지 확인하기',
    // 튜토리얼 이미지 3장 화면(TutorialScreen)에서 마지막 장 CTA 로 미션 완료.
    navigateTo: 'BasicUsageTutorial',
    bubbleVariant: 'v1_seek_item',
  },
  REGISTER_INTERESTED_REGIONS_AND_THEMES: {
    itemImage: require('@/assets/img/tutorial/item_smartphone.png'),
    itemImageWidth: 72,
    itemImageHeight: 72,
    subtitle: '계뿌클 앱이 설치된 ',
    subtitleBoldSuffix: '스마트폰',
    title: '관심 지역, 관심 주제 등록하기',
    navigateTo: 'InterestedRegionAndThemes',
    bubbleVariant: 'v1_seek_item',
  },
  SAVE_PLACE_LIST: {
    itemImage: require('@/assets/img/tutorial/item_map.png'),
    itemImageWidth: 72,
    itemImageHeight: 72,
    subtitle: '접근성 좋은 장소가 표시된 ',
    subtitleBoldSuffix: '지도',
    title: '관심있는 저장리스트 저장하기',
    navigateTo: 'PublicPlaceLists',
    bubbleVariant: 'v2_seek_map',
  },
  UPVOTE_ACCESSIBILITY: {
    itemImage: require('@/assets/img/tutorial/item_magnifier.png'),
    itemImageWidth: 72,
    itemImageHeight: 72,
    subtitle: '상세정보를 확인할 수 있는 ',
    subtitleBoldSuffix: '돋보기',
    title: '상세정보에 [도움이 돼요] 누르기',
    // 가짜 PDP 화면으로 진입해 학습용 인터랙션 수행 후 미션 완료 API 호출.
    navigateTo: 'TutorialUpvoteAccessibilityMission',
    bubbleVariant: 'v3_seek_detail',
  },
  HIDDEN_APP_SURVEY: {
    itemImage: require('@/assets/img/tutorial/item_hat.png'),
    itemImageWidth: 60,
    itemImageHeight: 60,
    subtitle: '계뿌클 ',
    subtitleBoldSuffix: '히든 맛집 리스트',
    title: '윌리의 외출 모자 받기',
    navigateTo: 'TallyForm',
    // 히든 미션은 카드/말풍선 매핑에 쓰이지 않는다 (sticky CTA 로만 진입).
    bubbleVariant: 'v5_seek_hidden',
  },
};

/**
 * 메인 미션 목록(hidden 제외)을 **서버 응답 배열 순서 그대로** 반환.
 *
 * 가입 시점에 따라 미션 구성/순서가 다른 셋(v1/v2)이 내려오므로 앱은 순서를
 * 하드코딩하지 않는다.
 */
export const mainMissionTypesOf = (
  missions: UserTutorialMissionDto[],
): TutorialMissionTypeDto[] =>
  missions
    .map(m => m.missionType)
    .filter(type => type !== TutorialMissionTypeDto.HiddenAppSurvey);

/**
 * 메인 미션을 **전부** 완료했는지. 판정은 반드시 이 함수를 거친다.
 *
 * 빈 미션 배열은 "전부 완료"가 아니라 **"해당 없음"(false)** 이다. 서버는
 * `USER_TUTORIAL` feature flag 미대상(익명 사용자 포함)에게 `missions: []` 를
 * 내려주는데, `[].every()` 는 true 라서 그대로 쓰면 아무 미션도 안 한 사용자가
 * "완료자"로 판정된다. 그 결과 인트로 팝업이 영구히 억제되거나(가입 전환 유저에게
 * 치명적) 외출템 수집 완료 팝업/히든 CTA 가 헛발사된다.
 */
export const allMainMissionsCompletedIn = (
  missions: UserTutorialMissionDto[],
): boolean => {
  const mainTypes = mainMissionTypesOf(missions);
  if (mainTypes.length === 0) {
    return false;
  }
  return mainTypes.every(
    type => missions.find(m => m.missionType === type)?.completedAt != null,
  );
};

/**
 * 튜토리얼 미션 화면에서 즉시 이탈시켜야 하는지. 두 개의 독립 신호를 OR 로 본다.
 *
 * - `isTutorialFlagEnabled`: `getUserInfo` 의 `USER_TUTORIAL` flag 보유 여부.
 *   `undefined` = 아직 모름(응답 전 **또는 익명 유저**) → 대기.
 * - `missions`: 서버 progress 의 미션 배열. `undefined` = 로딩 중 → 대기.
 *
 * flag 신호만으로는 부족하다: 익명 유저는 `_syncUserInfo` 가 getUserInfo 를 스킵해
 * featureFlags 가 **영원히 null** 이므로 flag 가드가 절대 발동하지 않는다. 서버가
 * 메인 미션을 0개로 내려준 것( `getUserTutorialProgress` 는 익명에게 `missions: []` )
 * 자체가 "이 사용자는 튜토리얼 대상이 아니다" 라는 확정 신호라 이것만으로도 이탈시킨다.
 */
export const shouldExitTutorialMission = (
  isTutorialFlagEnabled: boolean | undefined,
  missions: UserTutorialMissionDto[] | undefined,
): boolean => {
  if (isTutorialFlagEnabled === false) {
    return true;
  }
  return missions !== undefined && mainMissionTypesOf(missions).length === 0;
};

/**
 * 1-based 순서를 한글 서수("두 번째")로. 미션 개수가 늘어도 안전하게 fallback.
 */
const KOREAN_ORDINALS = [
  '첫 번째',
  '두 번째',
  '세 번째',
  '네 번째',
  '다섯 번째',
  '여섯 번째',
];
export const koreanOrdinal = (n: number) =>
  KOREAN_ORDINALS[n - 1] ?? `${n}번째`;

/**
 * 숫자 뒤에 붙는 목적격 조사. 한글 읽기의 끝소리가 모음인 2(이)/4(사)/5(오)/9(구)
 * 는 '를', 나머지는 '을'. (Figma 카피: "외출템 2를 모으면, …")
 */
export const objectParticle = (n: number) =>
  [2, 4, 5, 9].includes(n % 10) ? '를' : '을';
