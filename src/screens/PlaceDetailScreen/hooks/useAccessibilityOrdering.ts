import {useMemo} from 'react';

import {AccessibilityInfoV2Dto} from '@/generated-sources/openapi';

export type AccessibilitySectionType =
  | 'floor'
  | 'buildingEntrance'
  | 'placeEntrance'
  | 'elevator'
  | 'indoor';

/**
 * 접근성 정보를 물리적 경로 순서로 정렬합니다.
 *
 * 케이스별 정렬:
 * - 1층 건물 외부문: 층 정보 → 매장 출입구
 * - 1층 건물 내부문: 층 정보 → 건물 출입구 → 매장 출입구 → 내부 이용 정보
 * - 여러층 건물 외부문: 층 정보 → 매장 출입구 → 층간 이동 정보 → 내부 이용 정보
 * - 여러층 건물 내부문: 층 정보 → 건물 출입구 → 매장 출입구 → 층간 이동 정보 → 내부 이용 정보
 * - 단독건물 1층: 층 정보 → 매장(건물 출입구) → 내부 이용 정보
 * - 단독건물 여러층: 층 정보 → 매장(건물 출입구) → 층간 이동 정보 → 내부 이용 정보
 */
export function useAccessibilityOrdering(
  accessibility?: AccessibilityInfoV2Dto,
): AccessibilitySectionType[] {
  return useMemo(() => {
    if (!accessibility?.placeAccessibility) {
      return ['floor', 'placeEntrance'];
    }

    const floors = accessibility.placeAccessibility.floors ?? [];
    const isFirstFloor =
      floors.length === 0
        ? accessibility.placeAccessibility.isFirstFloor
        : floors.length === 1 && floors[0] === 1;
    const isMultiFloor = !isFirstFloor;
    const hasBuildingAccessibility = !!accessibility.buildingAccessibility;

    // 단독건물 (건물 = 매장) 판별: buildingAccessibility가 없는 경우
    // 또는 placeAccessibility만 있는 경우를 단독건물로 간주
    const isStandaloneBuilding = !hasBuildingAccessibility;

    if (isStandaloneBuilding) {
      if (isMultiFloor) {
        // 단독건물 여러층: 층 정보 → 매장(건물 출입구) → 층간 이동 정보 → 내부 이용 정보
        return ['floor', 'placeEntrance', 'elevator', 'indoor'];
      }
      // 단독건물 1층: 층 정보 → 매장(건물 출입구) → 내부 이용 정보
      return ['floor', 'placeEntrance', 'indoor'];
    }

    // 건물 내부문 / 외부문 구분은 doorDirectionType이 없으므로
    // 건물 접근성이 있으면 내부문 케이스로 처리
    if (isFirstFloor) {
      // 1층 건물 내부문: 층 정보 → 건물 출입구 → 매장 출입구 → 내부 이용 정보
      return ['floor', 'buildingEntrance', 'placeEntrance', 'indoor'];
    }

    // 여러층 건물 내부문: 층 정보 → 건물 출입구 → 매장 출입구 → 층간 이동 정보 → 내부 이용 정보
    return ['floor', 'buildingEntrance', 'placeEntrance', 'elevator', 'indoor'];
  }, [accessibility]);
}
