import {useRecoilValue, useSetRecoilState} from 'recoil';

import {getCenterAndRadius} from '@/components/maps/Types.tsx';
import {
  draftCameraRegionAtom,
  draftKeywordAtom,
  SearchQuery,
  searchQueryAtom,
} from '@/screens/SearchScreen/atoms';

export function useUpdateSearchQuery() {
  const setSearchQuery = useSetRecoilState(searchQueryAtom);
  const draftCameraRegion = useRecoilValue(draftCameraRegionAtom);
  const draftKeyword = useRecoilValue(draftKeywordAtom);

  const updateQuery = (queryUpdate: Partial<SearchQuery>) => {
    const query: Partial<SearchQuery> = queryUpdate;
    if (
      draftCameraRegion !== null &&
      query.location !== null &&
      query.radiusMeter !== null
    ) {
      const {center, radius} = getCenterAndRadius(draftCameraRegion!);
      query.location = {lat: center.latitude, lng: center.longitude};
      query.radiusMeter = radius;
    }
    if (draftKeyword !== null && !query.text) {
      query.text = draftKeyword;
    }
    setSearchQuery(prev => {
      return {
        location: query.location ?? prev.location,
        radiusMeter: query.radiusMeter ?? prev.radiusMeter,
        text: query.text ?? prev.text,
      };
    });
  };
  return {updateQuery};
}
