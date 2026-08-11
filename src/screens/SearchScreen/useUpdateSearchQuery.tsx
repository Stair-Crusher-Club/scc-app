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
    //    → **중심은 마지막으로 본 지도 위치를 유지하고, 반경만 비운다.**
    //    중심까지 비우면 GPS 현위치로 튀어서, 정자역을 보다가 입력 화면에서 검색했는데
    //    시청역 주변 결과가 나온다. 반경을 비우는 것만으로 "지도 영역 안에서만 찾는" 문제는
    //    해소된다 (기본 반경으로 넓게 검색).
    const hasExplicitRegion =
      query.location !== undefined || query.radiusMeter !== undefined;
    if (!hasExplicitRegion) {
      const cameraCenter =
        draftCameraRegion !== null
          ? getCenterAndRadius(draftCameraRegion)
          : null;
      if (query.useCameraRegion === true && cameraCenter !== null) {
        query.location = {
          lat: cameraCenter.center.latitude,
          lng: cameraCenter.center.longitude,
        };
        query.radiusMeter = cameraCenter.radius;
      } else {
        // 지도를 본 적이 없으면(앱 진입 직후 등) null → GPS 현위치로 폴백한다.
        query.location =
          cameraCenter !== null
            ? {
                lat: cameraCenter.center.latitude,
                lng: cameraCenter.center.longitude,
              }
            : null;
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
