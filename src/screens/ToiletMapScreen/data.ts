import {MarkerItem} from '@/components/maps/MarkerItem.ts';
import {
  ExternalAccessibility,
  ToiletAccessibilityDetailDto,
  ToiletAccessibilitySourceTypeDto,
  ToiletAccessibilitySummaryDto,
} from '@/generated-sources/openapi';

export type ToiletDetails = Omit<
  ExternalAccessibility & {
    sourceType: ToiletAccessibilitySourceTypeDto;
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
    sourceType: ToiletAccessibilitySourceTypeDto.ExternalAccessibility,
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
 * 통합 화장실 상세(`/getToiletAccessibility`) 응답(`ToiletAccessibilityDetailDto`, EXTERNAL 소스)을
 * 기존 TDP 렌더에 쓰이는 `ToiletDetails`로 매핑한다.
 */
export function mapDetailToToiletDetails(
  detail: ToiletAccessibilityDetailDto,
): ToiletDetails {
  const externalShaped: ExternalAccessibility = {
    id: detail.id,
    name: detail.name,
    address: detail.address ?? undefined,
    location: detail.location,
    category: 'TOILET',
    toilet_details: detail.toiletDetails,
  };
  return mapToToiletDetails(externalShaped);
}

/**
 * 통합 화장실 검색(`/searchToiletAccessibilities`) 결과(`ToiletAccessibilitySummaryDto`)를
 * 카드/마커 렌더에 쓰이는 `ToiletDetails & MarkerItem`으로 매핑한다.
 * USER 소스는 성별/입구 등 상세 필드가 없으므로 태그/사용가능 라벨 없이 이름/주소/썸네일만 채운다.
 */
export function mapSummaryToToiletDetails(
  summary: ToiletAccessibilitySummaryDto,
): ToiletDetails & MarkerItem {
  return {
    id: summary.id,
    sourceType: summary.sourceType,
    name: summary.name,
    address: summary.address ?? undefined,
    location: summary.location,
    imageUrl: summary.thumbnailUrl ?? undefined,
    displayName: summary.name,
    markerIcon: {
      icon: 'toilet',
      level: 'none',
    },
  };
}
