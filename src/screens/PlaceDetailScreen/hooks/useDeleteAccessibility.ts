import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useAtom} from 'jotai';

import {loadingState} from '@/components/LoadingView';
import {AccessibilityInfoV2Dto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {updateSearchCacheForPlaceAsync} from '@/utils/SearchPlacesUtils';
import ToastUtils from '@/utils/ToastUtils';

export function useDeleteAccessibility(
  type: 'place' | 'building',
  accessibilityDto: AccessibilityInfoV2Dto,
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

      // Asynchronously update search cache with full latest data
      if (accessibilityDto.placeAccessibility?.placeId) {
        updateSearchCacheForPlaceAsync(
          api,
          queryClient,
          accessibilityDto.placeAccessibility.placeId,
        );
      }

      // 정복한 장소 > 내가 정복한 장소 통계
      queryClient.invalidateQueries({
        queryKey: ['ConqueredPlacesForNumberOfItems'],
      });

      // 정복한 장소 > 도움이 돼요 통계
      queryClient.invalidateQueries({
        queryKey: ['UpvotedForNumberOfItems'],
      });

      // 정복한 장소 > 정복 리포트 통계
      queryClient.invalidateQueries({
        queryKey: ['ConquererActivity'],
      });

      // 정복한 장소 > 내가 정복한 장소 리스트
      queryClient.invalidateQueries({
        queryKey: ['ConqueredPlaces'],
      });

      //  정복한 장소 > 도움이 돼요 리스트
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
