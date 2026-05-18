import {UserInterestedThemeDto} from '@/generated-sources/openapi';

import {SelectedChip} from './components/InterestedFormFields';
import {THEME_LABEL_BY_VALUE} from './constants';

/**
 * 선택된 시군구 group id 목록을 chip 데이터로 변환.
 */
export function regionsToChips(
  selectedRegionIds: readonly string[],
  labelMap: Record<string, string>,
): SelectedChip[] {
  return selectedRegionIds.map(id => ({id, label: labelMap[id] ?? id}));
}

/**
 * 선택된 관심 테마 목록을 chip 데이터로 변환.
 */
export function themesToChips(
  selectedThemes: readonly UserInterestedThemeDto[],
): SelectedChip[] {
  return selectedThemes.map(theme => ({
    id: theme,
    label: THEME_LABEL_BY_VALUE[theme],
  }));
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
