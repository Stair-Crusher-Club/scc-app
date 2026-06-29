import {MarkerItem} from '@/components/maps/MarkerItem.ts';
import {
  EpochMillisTimestamp,
  Location,
  ToiletAccessibilityDetails,
  ToiletSummaryDto,
} from '@/generated-sources/openapi';

/**
 * 화장실 카드/마커 및 TDP 공공데이터 섹션 렌더에 사용하는 화장실 표시 모델.
 * `/searchToilets`(요약) 또는 `/getToilet`(공공데이터 상세)에서 매핑된다.
 */
export interface ToiletDetails {
  /**
   * 통합 화장실(Toilet) ID. 상세 화면(`getToilet`) 이동 시 사용한다.
   * `/searchToilets`/`/getToilet` 모두 통합 Toilet id를 내려주므로 항상 존재한다.
   */
  toiletId: string;
  name: string;
  address?: string;
  location: Location;
  imageUrl?: string;
  gender?: {
    state: 'MALE' | 'FEMALE' | 'BOTH';
    desc: string;
  };
  available?: {
    state: 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN';
    desc: string;
  };
  door?: {
    state: 'AUTO' | 'SLIDE' | 'SWING' | 'FOLD' | 'UNKNOWN';
    desc: string;
  };
  entrance?: {
    state: 'SLOPE' | 'STEP' | 'UNKNOWN';
    desc: string;
  };
  stall?: {
    depth: string;
    width: string;
  };
  accessDesc?: string;
  doorSideRoom?: string;
  washStandBelowRoom?: string;
  washStandHandle?: string;
  extra?: string;
  /** 출처 표시명 (예: '스마트서울맵', '행정안전부 전국공중화장실표준데이터'). 유저 리뷰 소스는 undefined. */
  sourceName?: string | null;
  /** 마지막으로 화장실 정보가 확인된 시각. 유저 리뷰 소스는 undefined. */
  lastVerifiedAt?: EpochMillisTimestamp;
  /** 개방시간 (공공데이터 소스). */
  openingHours?: string | null;
  /** 전화번호 (공공데이터 소스). */
  phoneNumber?: string | null;
}

/**
 * 공공데이터 화장실 상세(`ToiletAccessibilityDetails`)를 파싱하여
 * 카드/TDP 렌더에 쓰이는 enriched 필드(gender/available/door/entrance/stall 등)로 변환한다.
 */
function parseToiletAccessibilityDetails(
  toiletDetails: ToiletAccessibilityDetails,
): Pick<
  ToiletDetails,
  | 'imageUrl'
  | 'gender'
  | 'available'
  | 'door'
  | 'entrance'
  | 'stall'
  | 'accessDesc'
  | 'doorSideRoom'
  | 'washStandBelowRoom'
  | 'washStandHandle'
  | 'extra'
  | 'openingHours'
  | 'phoneNumber'
> & {availableState: 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN'} {
  const genderDesc = toiletDetails.gender;
  const genderType: 'MALE' | 'FEMALE' | 'BOTH' = (() => {
    switch (genderDesc) {
      case '남자화장실':
        return 'MALE';
      case '여자화장실':
        return 'FEMALE';
      default:
        return 'BOTH';
    }
  })();
  const gender = genderDesc
    ? {
        state: genderType,
        desc: genderDesc,
      }
    : undefined;
  const availableDesc = toiletDetails.availableDesc;
  const availableState: 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN' = (() => {
    if (
      availableDesc?.includes('사용가능') ||
      availableDesc?.includes('사용 가능')
    ) {
      return 'AVAILABLE';
    }
    if (
      availableDesc?.includes('사용불가') ||
      availableDesc?.includes('사용 불가')
    ) {
      return 'UNAVAILABLE';
    }
    return 'UNKNOWN';
  })();
  const available = availableDesc
    ? {
        state: availableState,
        desc: availableDesc,
      }
    : undefined;
  const doorDesc = toiletDetails.doorDesc;
  const doorType: 'AUTO' | 'SLIDE' | 'SWING' | 'FOLD' | 'UNKNOWN' = (() => {
    if (doorDesc?.includes('자동문')) {
      return 'AUTO';
    }
    if (doorDesc?.includes('미닫이문')) {
      return 'SLIDE';
    }
    if (doorDesc?.includes('여닫이문')) {
      return 'SWING';
    }
    return 'UNKNOWN';
  })();
  const door = doorDesc
    ? {
        state: doorType,
        desc: doorDesc,
      }
    : undefined;
  const entranceDesc = toiletDetails.entranceDesc;
  const entranceType: 'SLOPE' | 'STEP' | 'UNKNOWN' = (() => {
    if (entranceDesc?.includes('무단차/경사로')) {
      return 'SLOPE';
    }
    if (entranceDesc?.includes('단차(턱)/계단')) {
      return 'STEP';
    }
    return 'UNKNOWN';
  })();
  const entrance = entranceDesc
    ? {
        state: entranceType,
        desc: entranceDesc,
      }
    : undefined;
  const stall =
    toiletDetails.stallDepth && toiletDetails.stallWidth
      ? {
          depth: toiletDetails.stallDepth,
          width: toiletDetails.stallWidth,
        }
      : undefined;
  return {
    imageUrl: toiletDetails.image_url,
    available,
    availableState,
    gender,
    door,
    stall,
    entrance,
    accessDesc: toiletDetails.accessDesc,
    doorSideRoom: toiletDetails.doorSideRoom,
    washStandBelowRoom: toiletDetails.washStandBelowRoom,
    washStandHandle: toiletDetails.washStandHandle,
    extra: toiletDetails.extraDesc,
    openingHours: toiletDetails.openingHours,
    phoneNumber: toiletDetails.phoneNumber,
  };
}

/**
 * 화장실 상세(`/getToilet`)의 공공데이터 상세(`toiletDetails`, `ToiletAccessibilityDetails`)를
 * TDP 의 "화장실 사용/접근/내부 정보" 섹션 렌더에 쓰이는 `ToiletDetails`로 매핑한다.
 */
export function mapToiletDetailsToToiletDetails(
  id: string,
  name: string,
  address: string | undefined,
  location: Location,
  toiletDetails: ToiletAccessibilityDetails,
): ToiletDetails {
  const enriched = parseToiletAccessibilityDetails(toiletDetails);
  return {
    // 상세(`/getToilet`)에서 내려온 id는 이미 통합 Toilet id이다.
    toiletId: id,
    name,
    address,
    location,
    imageUrl: enriched.imageUrl,
    gender: enriched.gender,
    available: enriched.available,
    door: enriched.door,
    entrance: enriched.entrance,
    stall: enriched.stall,
    accessDesc: enriched.accessDesc,
    doorSideRoom: enriched.doorSideRoom,
    washStandBelowRoom: enriched.washStandBelowRoom,
    washStandHandle: enriched.washStandHandle,
    extra: enriched.extra,
    openingHours: enriched.openingHours,
    phoneNumber: enriched.phoneNumber,
  };
}

/**
 * 화장실 검색(`/searchToilets`) 결과(`ToiletSummaryDto`)를
 * 카드/마커 렌더에 쓰이는 `ToiletDetails & MarkerItem`으로 매핑한다.
 *
 * 요약도 상세(`/getToilet`)와 동일한 `accessibilities[]`를 내려주므로, TDP와 같은 방식으로 집계한다:
 * - 이미지: 모든 소스의 이미지 중 첫 장을 카드 대표 이미지로 사용
 * - 공공데이터 상세(사용가능/성별/입구 등): toiletDetails를 가진 첫 번째 대표 소스에서 파싱
 */
export function mapSummaryToToiletDetails(
  summary: ToiletSummaryDto,
): ToiletDetails & MarkerItem {
  const allImages = summary.accessibilities.flatMap(
    accessibility => accessibility.images,
  );
  const representativeToiletDetails = summary.accessibilities.find(
    accessibility => accessibility.toiletDetails != null,
  )?.toiletDetails;
  const enriched = representativeToiletDetails
    ? parseToiletAccessibilityDetails(representativeToiletDetails)
    : undefined;
  // 유저 리뷰(toilet_review)로 만들어진 화장실은 등록 자체가 "사용 가능"을 의미하므로 항상 사용가능으로 표기한다.
  // (리뷰 소스는 공공데이터 toiletDetails가 없어 availableDesc가 없음 → toiletLocationType 존재로 리뷰 소스 판별)
  const isFromUserReview = summary.accessibilities.some(
    accessibility => accessibility.toiletLocationType != null,
  );
  const available: ToiletDetails['available'] =
    enriched?.available ??
    (isFromUserReview ? {state: 'AVAILABLE', desc: '사용가능'} : undefined);
  return {
    // MarkerItem 식별자. 검색 결과의 id는 통합 Toilet id이다.
    id: summary.id,
    // 검색(`/searchToilets`) 결과의 id는 이미 통합 Toilet id이므로 상세 이동에 그대로 쓴다.
    toiletId: summary.id,
    name: summary.name,
    address: summary.address ?? undefined,
    location: summary.location,
    displayName: summary.name,
    markerIcon: {
      icon: 'toilet',
      level: 'none',
    },
    // 카드가 기존(외부 접근성 검색 시절)과 동일하게 이미지 + 사용가능/성별/입구를 렌더하도록 채운다.
    imageUrl: allImages[0]?.imageUrl,
    gender: enriched?.gender,
    available,
    door: enriched?.door,
    entrance: enriched?.entrance,
    stall: enriched?.stall,
    accessDesc: enriched?.accessDesc,
    doorSideRoom: enriched?.doorSideRoom,
    washStandBelowRoom: enriched?.washStandBelowRoom,
    washStandHandle: enriched?.washStandHandle,
    extra: enriched?.extra,
    openingHours: enriched?.openingHours,
    phoneNumber: enriched?.phoneNumber,
    // 공공데이터 소스(toiletDetails 있는 첫 소스)의 sourceName/lastVerifiedAt을 카드에 표시한다.
    sourceName: summary.accessibilities.find(
      accessibility => accessibility.toiletDetails != null,
    )?.sourceName,
    lastVerifiedAt: summary.accessibilities.find(
      accessibility => accessibility.toiletDetails != null,
    )?.lastVerifiedAt,
  };
}
