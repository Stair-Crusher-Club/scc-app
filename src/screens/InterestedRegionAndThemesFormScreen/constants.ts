import {UserInterestedThemeDto} from '@/generated-sources/openapi';

/**
 * 관심 지역 옵션. 1차 구현에서는 앱 하드코딩.
 * 향후 서버 API로 옮길 수 있다.
 * id는 서버에서 식별 가능한 키 (서울 자치구 코드 기반).
 */
export interface RegionOption {
  id: string;
  label: string;
}

export const REGION_OPTIONS: RegionOption[] = [
  {id: 'seoul_gangnam', label: '강남구'},
  {id: 'seoul_gangdong', label: '강동구'},
  {id: 'seoul_gangbuk', label: '강북구'},
  {id: 'seoul_gangseo', label: '강서구'},
  {id: 'seoul_gwanak', label: '관악구'},
  {id: 'seoul_gwangjin', label: '광진구'},
  {id: 'seoul_guro', label: '구로구'},
  {id: 'seoul_geumcheon', label: '금천구'},
  {id: 'seoul_nowon', label: '노원구'},
  {id: 'seoul_dobong', label: '도봉구'},
  {id: 'seoul_dongdaemun', label: '동대문구'},
  {id: 'seoul_dongjak', label: '동작구'},
  {id: 'seoul_mapo', label: '마포구'},
  {id: 'seoul_seodaemun', label: '서대문구'},
  {id: 'seoul_seocho', label: '서초구'},
  {id: 'seoul_seongdong', label: '성동구'},
  {id: 'seoul_seongbuk', label: '성북구'},
  {id: 'seoul_songpa', label: '송파구'},
  {id: 'seoul_yangcheon', label: '양천구'},
  {id: 'seoul_yeongdeungpo', label: '영등포구'},
  {id: 'seoul_yongsan', label: '용산구'},
  {id: 'seoul_eunpyeong', label: '은평구'},
  {id: 'seoul_jongno', label: '종로구'},
  {id: 'seoul_jung', label: '중구'},
  {id: 'seoul_jungnang', label: '중랑구'},
];

/**
 * 관심 테마 옵션. UserInterestedThemeDto enum을 한국어 라벨(이모지 포함)로 매핑.
 * Figma 1427-8980 화면 기준 8개 항목.
 */
export interface ThemeOption {
  value: UserInterestedThemeDto;
  label: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {value: UserInterestedThemeDto.WheelchairReview, label: '🦽 휠체어 찐후기'},
  {value: UserInterestedThemeDto.MediaHotspot, label: '🔥 방송·SNS 핫플'},
  {value: UserInterestedThemeDto.FoodCafeTour, label: '🍕 맛집·카페 투어'},
  {value: UserInterestedThemeDto.EmotionalView, label: '💼 감성·뷰 맛집'},
  {value: UserInterestedThemeDto.Sports, label: '⚾ 야구장·스포츠'},
  {value: UserInterestedThemeDto.Culture, label: '🎭 공연·전시·영화'},
  {value: UserInterestedThemeDto.Travel, label: '✈️ 훌쩍 떠나는 여행'},
  {value: UserInterestedThemeDto.Nature, label: '🌳 자연·공원 힐링'},
];
