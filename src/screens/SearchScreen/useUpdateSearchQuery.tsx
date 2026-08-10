import {useAtomValue, useSetAtom} from 'jotai';

import {getCenterAndRadius} from '@/components/maps/Types.tsx';
import {
  draftCameraRegionAtom,
  SearchQuery,
  searchQueryAtom,
} from '@/screens/SearchScreen/atoms';

export function useUpdateSearchQuery() {
  const setSearchQuery = useSetAtom(searchQueryAtom);
  const draftCameraRegion = useAtomValue(draftCameraRegionAtom);

  const updateQuery = (queryUpdate: Partial<SearchQuery>) => {
    const query: Partial<SearchQuery> = queryUpdate;
    // 검색 영역 결정 규칙 — 세 갈래뿐이고, 우선순위대로 하나만 적용된다.
    //
    // ① 호출처가 영역을 명시 (대체 검색: 서버가 판단에 쓴 원형 영역 그대로) → 그 값을 쓴다.
    // ② useCameraRegion === true (지도 화면을 보면서 한 검색 — "이 지역 재검색", 지도 모드
    //    카테고리 칩) → 현재 지도 영역으로 고정한다. draftCameraRegion 은 queryKey 에 없으므로
    //    center/radius 를 여기서 주입해야 지도를 옮긴 뒤 재검색이 실제로 refetch 된다.
    // ③ 그 외 (검색어 입력 화면에서의 타이핑·히스토리·추천, 딥링크, initKeyword)
    //    → **지도 영역에 고정하지 않는다.** null 로 비워 GPS 현위치 + 기본 반경으로 검색한다.
    //    이전 지도 검색이 atom 에 남긴 location/radiusMeter 를 물려받으면, 입력 화면에서
    //    "정자역 맛집" 을 검색해도 직전에 보던 지도 영역 안에서만 찾는다.
    const hasExplicitRegion =
      query.location !== undefined || query.radiusMeter !== undefined;
    if (!hasExplicitRegion) {
      if (query.useCameraRegion === true && draftCameraRegion !== null) {
        const {center, radius} = getCenterAndRadius(draftCameraRegion);
        query.location = {lat: center.latitude, lng: center.longitude};
        query.radiusMeter = radius;
      } else {
        query.location = null;
        query.radiusMeter = null;
      }
    }
    setSearchQuery(prev => {
      return {
        location: query.location ?? null,
        radiusMeter: query.radiusMeter ?? null,
        text: query.text ?? prev.text,
        useCameraRegion: query.useCameraRegion === true,
      };
    });
  };
  return {updateQuery};
}
