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
