import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useAtom} from 'jotai';

import {loadingState} from '@/components/LoadingView';
import {AccessibilityInfoDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import ToastUtils from '@/utils/ToastUtils';

export function useDeleteAccessibility(
  type: 'place' | 'building',
  accessibilityDto: AccessibilityInfoDto,
) {
  const {api} = useAppComponents();
  const [loading, setLoading] = useAtom(loadingState);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (type === 'place') {
        if (!accessibilityDto.placeAccessibility) {
          throw new Error('placeAccessibility is undefined');
        }
        return await api.deletePlaceAccessibilityPost({
          placeAccessibilityId: accessibilityDto.placeAccessibility.id,
        });
      } else {
        if (!accessibilityDto.buildingAccessibility) {
          throw new Error('buildingAccessibility is undefined');
        }
        return await api.deleteBuildingAccessibilityPost({
          buildingAccessibilityId: accessibilityDto.buildingAccessibility.id,
        });
      }
    },
    onMutate: () => setLoading(new Map(loading).set('PlaceDetail', true)),
    onSuccess: (_data, _variables) => {
      queryClient.invalidateQueries({
        queryKey: ['PlaceDetail', accessibilityDto.placeAccessibility?.placeId],
      });

      queryClient.invalidateQueries({
        queryKey: ['search'],
      });

      queryClient.invalidateQueries({
        queryKey: ['ConqueredPlacesForNumberOfItems'],
      });

      queryClient.invalidateQueries({
        queryKey: ['UpvotedForNumberOfItems'],
      });

      queryClient.invalidateQueries({
        queryKey: ['ConquererActivity'],
      });

      queryClient.invalidateQueries({
        queryKey: ['ConqueredPlaces'],
      });

      queryClient.invalidateQueries({
        queryKey: ['PlacesUpvoted'],
      });

      if (type === 'place') {
        ToastUtils.show('장소 정보를 삭제했습니다.');
      } else {
        ToastUtils.show('건물 정보를 삭제했습니다.');
      }
    },
    onError: (_error, _variables) => {
      if (type === 'place') {
        ToastUtils.show('삭제할 수 없는 장소입니다.');
      } else {
        ToastUtils.show('삭제할 수 없는 건물입니다.');
      }
    },
    onSettled: () => {
      setLoading(new Map(loading).set('PlaceDetail', false));
    },
  });
}
