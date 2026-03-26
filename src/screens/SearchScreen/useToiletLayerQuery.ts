import {useQuery} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';

import {MarkerItem} from '@/components/maps/MarkerItem.ts';
import {getCenterAndRadius} from '@/components/maps/Types.tsx';
import useAppComponents from '@/hooks/useAppComponents';
import {
  draftCameraRegionAtom,
  toiletLayerActiveAtom,
} from '@/screens/SearchScreen/atoms';
import {
  mapToToiletDetails,
  ToiletDetails,
} from '@/screens/ToiletMapScreen/data';

export default function useToiletLayerQuery(): (ToiletDetails & MarkerItem)[] {
  const {api} = useAppComponents();
  const toiletLayerActive = useAtomValue(toiletLayerActiveAtom);
  const draftCameraRegion = useAtomValue(draftCameraRegionAtom);

  const {data} = useQuery<(ToiletDetails & MarkerItem)[]>({
    queryKey: [
      'toilet-layer',
      toiletLayerActive,
      draftCameraRegion
        ? {
            ne: draftCameraRegion.northEast,
            sw: draftCameraRegion.southWest,
          }
        : null,
    ],
    enabled: toiletLayerActive && draftCameraRegion != null,
    staleTime: 30_000,
    placeholderData: previousData => previousData,
    queryFn: async ({signal}): Promise<(ToiletDetails & MarkerItem)[]> => {
      if (!draftCameraRegion) {
        return [];
      }
      const {center, radius} = getCenterAndRadius(draftCameraRegion);
      const response = await api.searchExternalAccessibilitiesPost(
        {
          searchText: '화장실',
          currentLocation: {
            lat: center.latitude,
            lng: center.longitude,
          },
          distanceMetersLimit: Math.round(radius),
          categories: [],
        },
        {signal},
      );
      return response?.data.items?.map(mapToToiletDetails) ?? [];
    },
  });

  return data ?? [];
}
