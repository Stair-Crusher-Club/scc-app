import {useQuery} from '@tanstack/react-query';
import {useMemo} from 'react';

import {InterestedRegionSidoDto} from '@/generated-sources/openapi';

import useAppComponents from './useAppComponents';

export const LIST_INTERESTED_REGIONS_QUERY_KEY = ['ListInterestedRegions'];

/**
 * 관심 지역(시도/시군구 그룹) 목록을 서버에서 조회한다.
 *
 * 서버에서 시도 14개와 각 시도의 시군구 그룹을 반환한다. 현재 서울만 그룹이
 * 구체적으로 정의되어 있고 나머지 시도는 빈 그룹으로 내려온다 (UI에서 "준비 중"
 * 안내 노출).
 *
 * 데이터가 거의 변하지 않으므로 staleTime을 1시간으로 길게 잡아 화면 진입 시
 * 매번 재요청되지 않도록 한다.
 */
export function useListInterestedRegions() {
  const {api} = useAppComponents();

  return useQuery<InterestedRegionSidoDto[]>({
    queryKey: LIST_INTERESTED_REGIONS_QUERY_KEY,
    queryFn: async () => (await api.listInterestedRegions()).data.sidos,
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * 그룹 id → 라벨 lookup. 사용자가 이미 저장한 관심 지역 id 목록을
 * UI에 라벨로 풀어줄 때 사용한다.
 *
 * 서버 응답이 아직 도착하지 않았거나 실패한 경우 빈 map을 반환한다. 호출처에서는
 * `map[id] ?? id` 패턴으로 fallback (id 그대로 표시)을 처리해야 한다.
 */
export function useInterestedRegionGroupLabelMap(): Record<string, string> {
  const {data: sidos} = useListInterestedRegions();

  return useMemo(() => {
    const map: Record<string, string> = {};
    if (!sidos) {
      return map;
    }
    for (const sido of sidos) {
      for (const group of sido.groups) {
        map[group.id] = group.label;
      }
    }
    return map;
  }, [sidos]);
}
