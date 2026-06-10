import {useQuery} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';

import {MarkerItem} from '@/components/maps/MarkerItem.ts';
import {getCenterAndRadius} from '@/components/maps/Types.tsx';
import {
  mapSummaryToToiletDetails,
  ToiletDetails,
} from '@/components/toilet/data';
import useAppComponents from '@/hooks/useAppComponents';
import {
  draftCameraRegionAtom,
  toiletLayerActiveAtom,
} from '@/screens/SearchScreen/atoms';

export default function useToiletLayerQuery(): (ToiletDetails & MarkerItem)[] {
  const {toiletApi} = useAppComponents();
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
      const response = await toiletApi.searchToilets(
        {
          currentLocation: {
            lat: center.latitude,
            lng: center.longitude,
          },
          distanceMetersLimit: Math.round(radius),
        },
        {signal},
      );
      return response?.data.items?.map(mapSummaryToToiletDetails) ?? [];
    },
  });

  return data ?? [];
}
