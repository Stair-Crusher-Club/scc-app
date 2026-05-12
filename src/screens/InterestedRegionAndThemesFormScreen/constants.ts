import {UserInterestedThemeDto} from '@/generated-sources/openapi';

/**
 * 튜토리얼 미션 1 (Figma 1648-38721) 화면에서 노출되는 subtitle.
 * 미션 카드와 같은 톤을 유지하기 위해 별도 상수로 분리.
 */
export const TUTORIAL_MISSION_1_DESCRIPTION =
  '관심 지역과 관심 테마를 알려주세요. 크러셔님의 취향을 저격하는 정보만 쏙쏙 골라 추천해 드릴게요.';

/**
 * 관심 지역 옵션. Figma 디자인 1629-29602 기준의 시도/시군구 그룹 구조.
 *
 * - 좌측 컬럼: 시도 (서울, 경기, 인천, 부산, ...).
 * - 우측 컬럼: 선택된 시도에 속하는 "시군구 그룹". 사용자는 그룹 단위로 다중 선택한다.
 *
 * 1차 구현에서는 앱 하드코딩. 추후 서버 API로 옮길 수 있다.
 * id는 서버에서 식별 가능한 안정 키이며, 시군구 그룹 단위로 고유하다.
 *
 * Figma에는 서울만 그룹이 구체적으로 정의되어 있다. 다른 시도는 동일 디자인 패턴이
 * 적용될 예정이지만 현재는 빈 그룹으로 둔다 (선택 시 "준비중입니다." 등).
 */
export interface RegionGroupOption {
  /** 그룹 단위의 안정 키. 서버에 전송된다. e.g. 'seoul_gangnam_seocho' */
  id: string;
  /** UI 라벨. e.g. '강남/서초' */
  label: string;
}

export interface RegionProvinceOption {
  /** 시도 식별 키. 그룹과 같은 prefix 를 사용한다. e.g. 'seoul' */
  id: string;
  /** UI 라벨. e.g. '서울' */
  label: string;
  /** 시군구 그룹 목록. 비어있으면 "준비중"으로 표시. */
  groups: RegionGroupOption[];
}

export const REGION_PROVINCES: RegionProvinceOption[] = [
  {
    id: 'seoul',
    label: '서울',
    groups: [
      {id: 'seoul_gangnam_seocho', label: '강남/서초'},
      {id: 'seoul_jamsil_songpa_gangdong', label: '잠실/송파/강동'},
      {id: 'seoul_hongdae_hapjeong_mapo', label: '홍대/합정/마포'},
      {id: 'seoul_konkuk_seongsu_dongdaemun', label: '건대/성수/동대문'},
      {id: 'seoul_jongno_junggu_yongsan', label: '종로/중구/용산'},
      {id: 'seoul_yeongdeungpo_yeouido_gangseo', label: '영등포/여의도/강서'},
      {id: 'seoul_guro_gwanak_dongjak', label: '구로/관악/동작'},
      {id: 'seoul_seongbuk_nowon_gangbuk', label: '성북/노원/강북'},
    ],
  },
  {id: 'gyeonggi', label: '경기', groups: []},
  {id: 'incheon', label: '인천', groups: []},
  {id: 'busan', label: '부산', groups: []},
  {id: 'daegu', label: '대구', groups: []},
  {id: 'gwangju', label: '광주', groups: []},
  {id: 'daejeon', label: '대전', groups: []},
  {id: 'ulsan', label: '울산', groups: []},
  {id: 'sejong', label: '세종', groups: []},
  {id: 'gangwon', label: '강원', groups: []},
  {id: 'jeju', label: '제주', groups: []},
  {id: 'chungcheong', label: '충남/충북', groups: []},
  {id: 'jeolla', label: '전남/전북', groups: []},
  {id: 'gyeongsang', label: '경남/경북', groups: []},
];

/** 평탄화된 그룹 목록. 라벨 lookup에 사용. */
export const REGION_GROUPS_BY_ID: Record<string, RegionGroupOption> =
  REGION_PROVINCES.reduce<Record<string, RegionGroupOption>>(
    (acc, province) => {
      for (const group of province.groups) {
        acc[group.id] = group;
      }
      return acc;
    },
    {},
  );

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
