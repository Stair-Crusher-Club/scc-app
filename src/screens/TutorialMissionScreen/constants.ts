import {TutorialMissionTypeDto} from '@/generated-sources/openapi';
import {ScreenParams} from '@/navigation/Navigation.screens';

/**
 * 윌리의 외출 NUX 튜토리얼 미션 카드 메타데이터.
 * 미션의 표시 텍스트 / 외출템 이미지 / 시작 버튼 navigate target 등을
 * 앱에서 하드코딩으로 관리한다 (서버는 진행 상태만 관리).
 */
export interface MissionMeta {
  /** 미션 번호 (1-based, hidden은 0 또는 별도 처리) */
  order: number;
  /** 외출템 이미지 (require'd local asset). 미션 카드 좌측에 표시 */
  itemImage: number;
  /** "계뿌클 앱이 설치된 스마트폰" 같은 부제 (highlight 부분과 함께) */
  subtitle: string;
  /** highlight bold 처리할 부분 (subtitle 끝에 매칭) */
  subtitleBoldSuffix: string;
  /** "관심지역, 관심테마 등록하기" 본문 */
  title: string;
  /** 미션 시작 버튼 클릭 시 이동할 screen name */
  navigateTo: keyof ScreenParams | 'TallyForm';
  /** 외출템 수집 시 노출되는 팝업 제목 */
  collectPopupTitle: string;
  /** 외출템 수집 시 노출되는 팝업 본문 */
  collectPopupDescription: string;
}

export const TUTORIAL_MISSION_META: Record<
  TutorialMissionTypeDto,
  MissionMeta
> = {
  REGISTER_INTERESTED_REGIONS_AND_THEMES: {
    order: 1,
    itemImage: require('@/assets/img/tutorial/item_smartphone.png'),
    subtitle: '계뿌클 앱이 설치된 ',
    subtitleBoldSuffix: '스마트폰',
    title: '관심지역, 관심테마 등록하기',
    navigateTo: 'InterestedRegionAndThemes',
    collectPopupTitle: '외출템 1을 모았어요!',
    collectPopupDescription:
      '계뿌클 앱이 설치된 스마트폰을 모았어요!\n다음 미션도 도전해주세요.',
  },
  SAVE_PLACE_LIST: {
    order: 2,
    itemImage: require('@/assets/img/tutorial/item_map.png'),
    subtitle: '접근성 좋은 장소가 표시된 ',
    subtitleBoldSuffix: '지도',
    title: '관심있는 저장리스트 저장하기',
    navigateTo: 'PublicPlaceLists',
    collectPopupTitle: '외출템 2를 모았어요!',
    collectPopupDescription:
      '접근성 좋은 장소가 표시된 지도를 모았어요!\n다음 미션도 도전해주세요.',
  },
  UPVOTE_ACCESSIBILITY: {
    order: 3,
    itemImage: require('@/assets/img/tutorial/item_magnifier.png'),
    subtitle: '상세정보를 확인할 수 있는 ',
    subtitleBoldSuffix: '돋보기',
    title: '상세정보에 [도움이 돼요] 누르기',
    navigateTo: 'Main',
    collectPopupTitle: '외출템 3을 모았어요!',
    collectPopupDescription:
      '상세정보를 확인할 수 있는 돋보기를 모았어요!\n다음 미션도 도전해주세요.',
  },
  WRITE_PLACE_REVIEW: {
    order: 4,
    itemImage: require('@/assets/img/tutorial/item_camera.png'),
    subtitle: '리뷰를 남길 때 쓸 ',
    subtitleBoldSuffix: '카메라',
    title: '가본 장소 내부 리뷰 남기기',
    navigateTo: 'Main',
    collectPopupTitle: '외출템 4를 모았어요!',
    collectPopupDescription:
      '리뷰를 남길 때 쓸 카메라를 모았어요!\n마지막 히든 미션도 도전해주세요!',
  },
  COLLECT_HIDDEN_ITEM: {
    order: 0,
    itemImage: require('@/assets/img/tutorial/item_hat.png'),
    subtitle: '계뿌클 ',
    subtitleBoldSuffix: '히든 맛집 리스트',
    title: '윌리의 외출 모자 받기',
    navigateTo: 'TallyForm',
    collectPopupTitle: '히든 외출템을 모았어요!',
    collectPopupDescription:
      '계뿌클 히든 맛집 리스트를 받아보세요!\n모든 미션을 완료했어요!',
  },
};

/**
 * 메인 미션 4개 (hidden 제외)를 TutorialMissionTypeDto 순서대로 반환.
 */
export const MAIN_MISSION_TYPES: TutorialMissionTypeDto[] = [
  TutorialMissionTypeDto.RegisterInterestedRegionsAndThemes,
  TutorialMissionTypeDto.SavePlaceList,
  TutorialMissionTypeDto.UpvoteAccessibility,
  TutorialMissionTypeDto.WritePlaceReview,
];
