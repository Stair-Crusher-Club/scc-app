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
    // 호출처가 검색 영역을 명시한 경우(대체 검색: 서버가 판단에 쓴 원형 영역 그대로)는
    // 카메라 영역으로 덮어쓰지 않는다. 명시하지 않았을 때만 현재 지도 영역을 따라간다.
    const hasExplicitRegion =
      query.location !== undefined || query.radiusMeter !== undefined;
    if (
      draftCameraRegion !== null &&
      !hasExplicitRegion &&
      query.location !== null &&
      query.radiusMeter !== null
    ) {
      const {center, radius} = getCenterAndRadius(draftCameraRegion!);
      query.location = {lat: center.latitude, lng: center.longitude};
      query.radiusMeter = radius;
    }
    setSearchQuery(prev => {
      return {
        location: query.location ?? prev.location,
        radiusMeter: query.radiusMeter ?? prev.radiusMeter,
        text: query.text ?? prev.text,
        useCameraRegion: query.useCameraRegion === true,
      };
    });
  };
  return {updateQuery};
}
