import {MarkerItem} from '@/components/maps/MarkerItem.ts';
import {ExternalAccessibility} from '@/generated-sources/openapi';

export type ToiletDetails = Omit<
  ExternalAccessibility & {
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
  'toilet_details'
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
