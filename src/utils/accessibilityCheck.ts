/**
 * "접근 가능"으로 보는 접근레벨의 상한. 0=계단 없음, 1=경사로 있음, 2=계단 1개.
 * 검색 결과에 이 이하가 하나도 없으면 대체 검색을 제안할 상황(부정경험)이다.
 */
export const GOOD_ACCESSIBILITY_MAX_SCORE = 2;

export function getPlaceAccessibilityScore({
  score,
  hasPlaceAccessibility,
  hasBuildingAccessibility,
}: {
  score?: number;
  hasPlaceAccessibility?: boolean;
  hasBuildingAccessibility?: boolean;
}) {
  if (typeof score === 'number') {
    return score;
  }

  if (
    score === undefined &&
    hasPlaceAccessibility &&
    !hasBuildingAccessibility
  ) {
    return 'processing';
  }

  return undefined;
}
