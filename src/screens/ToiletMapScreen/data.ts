import {MarkerItem} from '@/components/maps/MarkerItem.ts';
import {
  ExternalAccessibility,
  ToiletAccessibilityDetails,
  ToiletSummaryDto,
} from '@/generated-sources/openapi';

export type ToiletDetails = Omit<
  ExternalAccessibility & {
    /**
     * 병합된 통합 화장실(Toilet) ID. 상세 화면(`getToilet`) 이동 시 사용한다.
     * `id`(ExternalAccessibility id)와는 별개이며, 동기화된 데이터에만 존재한다.
     */
    toiletId?: string;
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
  },
  'toilet_details' | 'category'
>;

export function mapToToiletDetails(
  toilet: ExternalAccessibility,
): ToiletDetails & MarkerItem {
  const genderDesc = toilet.toilet_details?.gender;
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
  const availableDesc = toilet.toilet_details?.availableDesc;
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
  const doorDesc = toilet.toilet_details?.doorDesc;
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
    if (doorDesc?.includes('문')) {
      return 'UNKNOWN';
    }
    return 'UNKNOWN';
  })();
  const door = doorDesc
    ? {
        state: doorType,
        desc: doorDesc,
      }
    : undefined;
  const entranceDesc = toilet.toilet_details?.entranceDesc;
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
    toilet.toilet_details?.stallDepth && toilet.toilet_details?.stallWidth
      ? {
          depth: toilet.toilet_details.stallDepth,
          width: toilet.toilet_details.stallWidth,
        }
      : undefined;
  return {
    ...toilet,
    toiletId: toilet.toiletId ?? undefined,
    imageUrl: toilet.toilet_details?.image_url,
    available,
    gender,
    door,
    stall,
    entrance,
    accessDesc: toilet.toilet_details?.accessDesc,
    doorSideRoom: toilet.toilet_details?.doorSideRoom,
    washStandBelowRoom: toilet.toilet_details?.washStandBelowRoom,
    washStandHandle: toilet.toilet_details?.washStandHandle,
    extra: toilet.toilet_details?.extraDesc,
    displayName: toilet.name,
    markerIcon: {
      icon: 'toilet',
      level:
        availableState === 'AVAILABLE'
          ? '0'
          : availableState === 'UNAVAILABLE'
            ? '5'
            : 'none',
    },
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
  location: ExternalAccessibility['location'],
  toiletDetails: ToiletAccessibilityDetails,
): ToiletDetails {
  const externalShaped: ExternalAccessibility = {
    id,
    // 상세(`/getToilet`)에서 내려온 id는 이미 통합 Toilet id이다.
    toiletId: id,
    name,
    address,
    location,
    category: 'TOILET',
    toilet_details: toiletDetails,
  };
  return mapToToiletDetails(externalShaped);
}

/**
 * 화장실 검색(`/searchToilets`) 결과(`ToiletSummaryDto`)를
 * 카드/마커 렌더에 쓰이는 `ToiletDetails & MarkerItem`으로 매핑한다.
 * 검색 응답에는 성별/입구 등 상세 필드가 없으므로 이름/주소만 채운다.
 */
export function mapSummaryToToiletDetails(
  summary: ToiletSummaryDto,
): ToiletDetails & MarkerItem {
  return {
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
  };
}
