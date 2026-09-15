import {match} from 'ts-pattern';

import {
  BbucleRoadAccessibilityDtoBbucleRoadTypeEnum,
  PlaceListItem,
} from '@/generated-sources/openapi';
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
  | 'toilet'
  | 'bbucle_road_baseball'
  | 'bbucle_road_concert';

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
  const bbucleRoadData = item.specialAccessibility?.bbucleRoadData;
  const bbucleIcon: MarkerIcon | undefined = bbucleRoadData
    ? (() => {
        switch (bbucleRoadData.bbucleRoadType) {
          case BbucleRoadAccessibilityDtoBbucleRoadTypeEnum.BaseballStadium:
            return 'bbucle_road_baseball' as const;
          case BbucleRoadAccessibilityDtoBbucleRoadTypeEnum.ConcertHall:
            return 'bbucle_road_concert' as const;
          default: {
            const _exhaustiveCheck: never = bbucleRoadData.bbucleRoadType;
            return _exhaustiveCheck;
          }
        }
      })()
    : undefined;

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
      icon:
        bbucleIcon ??
        match<string | undefined, MarkerIcon>(item.place.category)
          .with('RESTAURANT', () => 'rest')
          .with('CAFE', () => 'cafe')
          .with('CONVENIENCE_STORE', () => 'conv')
          .with('PHARMACY', () => 'phar')
          .with('HOSPITAL', () => 'hos')
          .otherwise(() => 'default'),
      level: bbucleIcon
        ? 'none'
        : match<number | undefined | 'processing', MarkerLevel>(
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

/**
 * CTPL(정복 대상 장소 목록) 화면 전용. 접근성 점수 대신 "정복 여부"로 마커 레벨을
 * 정한다 — level '0'(초록)/'none'(회색)이 MarkerColors 를 통해 그대로 정복/미정복
 * 대비가 된다(시안과 동일). icon 값 자체는 화면이 markerIconOverride 로 브랜드
 * SVG 를 덮어씌우므로 무의미하지만, 타입 일관성을 위해 toPlaceMarkerItem 이
 * 계산한 값을 그대로 둔다.
 *
 * toPlaceMarkerItem 의 시그니처 자체를 바꾸지 않는 이유: 기존 호출부들이
 * `.map(toPlaceMarkerItem)` 처럼 콜백을 직접 참조해서, 2번째 인자를 추가하면
 * Array.map 이 넘기는 index(number)가 그 자리에 끼어들어 타입 에러가 난다.
 */
export function toConquestMarkerItem(
  item: PlaceListItem,
): MarkerItem & PlaceListItem {
  const marker = toPlaceMarkerItem(item);
  return {
    ...marker,
    markerIcon: {
      icon: marker.markerIcon?.icon ?? 'default',
      level: item.hasPlaceAccessibility ? '0' : 'none',
    },
  };
}
