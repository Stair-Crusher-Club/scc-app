import {match} from 'ts-pattern';

import {PlaceListItem} from '@/generated-sources/openapi';
import {getPlaceAccessibilityScore} from '@/utils/accessibilityCheck';

export type MarkerItem = {
  id: string;
  markerIcon?: {icon: MarkerIcon; level: MarkerLevel};
  displayName: string;
  location?: {lat: number; lng: number};
  hasReview?: boolean;
};

export type MarkerIcon =
  | 'cafe'
  | 'conv'
  | 'phar'
  | 'rest'
  | 'hos'
  | 'default'
  | 'toilet';

export type MarkerLevel =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | 'none'
  | 'progress';

export function toPlaceMarkerItem(
  item: PlaceListItem,
): MarkerItem & PlaceListItem {
  return {
    ...item,
    id: item.place.id,
    location: item.place.location,
    displayName: item.place.name,
    hasReview:
      item.accessibilityInfo?.reviewCount !== undefined
        ? item.accessibilityInfo.reviewCount > 0
        : false,
    markerIcon: {
      icon: match<string | undefined, MarkerIcon>(item.place.category)
        .with('RESTAURANT', () => 'rest')
        .with('CAFE', () => 'cafe')
        .with('CONVENIENCE_STORE', () => 'conv')
        .with('PHARMACY', () => 'phar')
        .with('HOSPITAL', () => 'hos')
        .otherwise(() => 'default'),
      level: match<number | undefined | 'processing', MarkerLevel>(
        getPlaceAccessibilityScore({
          score: item.accessibilityInfo?.accessibilityScore,
          hasPlaceAccessibility: item.hasPlaceAccessibility,
          hasBuildingAccessibility: item.hasBuildingAccessibility,
        }),
      )
        .with('processing', () => 'progress')
        .with(undefined, () => 'none')
        .when(
          score => score <= 0,
          () => '0',
        )
        .when(
          score => score <= 1,
          () => '1',
        )
        .when(
          score => score <= 2,
          () => '2',
        )
        .when(
          score => score <= 3,
          () => '3',
        )
        .when(
          score => score <= 4,
          () => '4',
        )
        .otherwise(() => '5'),
    },
  };
}
