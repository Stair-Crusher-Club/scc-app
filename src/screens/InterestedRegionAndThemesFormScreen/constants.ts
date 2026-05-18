import {UserInterestedThemeDto} from '@/generated-sources/openapi';

/**
 * 튜토리얼 미션 1 (Figma 1648-38721) 화면에서 노출되는 subtitle.
 * 미션 카드와 같은 톤을 유지하기 위해 별도 상수로 분리.
 */
export const TUTORIAL_MISSION_1_DESCRIPTION =
  '관심 지역과 관심 테마를 알려주세요. 크러셔님의 취향을 저격하는 정보만 쏙쏙 골라 추천해 드릴게요.';

/**
 * 관심 테마 옵션. UserInterestedThemeDto enum을 한국어 라벨(이모지 포함)로 매핑.
 * Figma 1629:29991 기준 8개 항목.
 */
export interface ThemeOption {
  value: UserInterestedThemeDto;
  label: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {value: UserInterestedThemeDto.WheelchairReview, label: '🧑‍🦽 휠체어 찐후기'},
  {value: UserInterestedThemeDto.MediaHotspot, label: '🔥 방송·SNS 핫플'},
  {value: UserInterestedThemeDto.FoodCafeTour, label: '🍕 맛집·카페 투어'},
  {value: UserInterestedThemeDto.EmotionalView, label: '📸 감성·뷰 맛집'},
  {value: UserInterestedThemeDto.Sports, label: '⚾ 야구장·스포츠'},
  {value: UserInterestedThemeDto.Culture, label: '🎭 공연·전시·영화'},
  {value: UserInterestedThemeDto.Travel, label: '✈️ 훌쩍 떠나는 여행'},
  {value: UserInterestedThemeDto.Nature, label: '🌳 자연·공원 힐링'},
];

/** value → label lookup. 프로필 화면 등 외부 화면에서 사용한다. */
export const THEME_LABEL_BY_VALUE: Record<UserInterestedThemeDto, string> =
  THEME_OPTIONS.reduce<Record<UserInterestedThemeDto, string>>(
    (acc, option) => {
      acc[option.value] = option.label;
      return acc;
    },
    {} as Record<UserInterestedThemeDto, string>,
  );
