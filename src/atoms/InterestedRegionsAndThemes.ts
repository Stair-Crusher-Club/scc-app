import {useAtom} from 'jotai';

import {atomForLocal} from '@/atoms/atomForLocal';
import {UserInterestedThemeDto} from '@/generated-sources/openapi';

/**
 * 사용자가 마지막으로 저장한 관심 지역 / 관심 주제 캐시.
 *
 * 서버 API는 write-only이므로, 프로필 수정 화면 등에서 "현재 선택된 값"을 표시하기 위해
 * 로컬 MMKV에 캐시한다. 로그아웃이나 계정 전환 시 자동 초기화되지 않으므로
 * 정확한 진실의 원천은 아니지만, 단일 디바이스에서의 UX 목적에는 충분하다.
 *
 * 추후 서버에 read 엔드포인트가 생기면 이 atom을 server query로 교체할 수 있다.
 */
export interface InterestedRegionsAndThemesCache {
  interestedRegionIds: string[];
  interestedThemes: UserInterestedThemeDto[];
}

const interestedRegionsAndThemesCacheAtom =
  atomForLocal<InterestedRegionsAndThemesCache>(
    'interestedRegionsAndThemesCache',
  );

export function useInterestedRegionsAndThemesCache() {
  const [cache, setCache] = useAtom(interestedRegionsAndThemesCacheAtom);
  return {
    interestedRegionIds: cache?.interestedRegionIds ?? [],
    interestedThemes: cache?.interestedThemes ?? [],
    setCache,
  };
}
