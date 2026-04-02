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
    if (
      draftCameraRegion !== null &&
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
