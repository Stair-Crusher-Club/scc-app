import {UserInterestedThemeDto} from '@/generated-sources/openapi';

import {THEME_LABEL_BY_VALUE} from './constants';

/**
 * 선택된 시군구 group id 목록을 라벨 join으로 변환. 빈 배열이면 null.
 */
export function formatRegionSummary(
  selectedRegionIds: readonly string[],
  labelMap: Record<string, string>,
): string | null {
  if (selectedRegionIds.length === 0) {
    return null;
  }
  return selectedRegionIds.map(id => labelMap[id] ?? id).join(', ');
}

/**
 * 선택된 관심 테마 목록을 라벨 join으로 변환. 빈 배열이면 null.
 */
export function formatThemeSummary(
  selectedThemes: readonly UserInterestedThemeDto[],
): string | null {
  if (selectedThemes.length === 0) {
    return null;
  }
  return selectedThemes.map(theme => THEME_LABEL_BY_VALUE[theme]).join(', ');
}

/**
 * 두 배열이 set으로 동등한지 비교. 폼 변경 여부 판단에 사용한다.
 */
export function arraysEqualAsSets<T>(
  a: readonly T[],
  b: readonly T[],
): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const setB = new Set(b);
  return a.every(item => setB.has(item));
}
