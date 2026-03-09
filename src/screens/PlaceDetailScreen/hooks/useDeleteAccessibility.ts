import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useAtom} from 'jotai';

import {loadingState} from '@/components/LoadingView';
import {
  AccessibilityInfoV2Dto,
  EpochMillisTimestamp,
  PlaceAccessibility,
  BuildingAccessibility,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {updateSearchCacheForPlaceAsync} from '@/utils/SearchPlacesUtils';
import ToastUtils from '@/utils/ToastUtils';

function findDeletableItem<
  T extends {isDeletable: boolean; createdAt: EpochMillisTimestamp},
>(items: T[] | undefined, fallback: T | undefined): T | undefined {
  const deletableItems = items?.filter(a => a.isDeletable);
  if (deletableItems && deletableItems.length > 0) {
    return deletableItems.sort(
      (a, b) => b.createdAt.value - a.createdAt.value,
    )[0];
  }
  return fallback?.isDeletable ? fallback : undefined;
}

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
        const target = findDeletableItem<PlaceAccessibility>(
          accessibilityDto.placeAccessibilities,
          accessibilityDto.placeAccessibility,
        );
        if (!target) {
          throw new Error('No deletable placeAccessibility found');
        }
        return await api.deletePlaceAccessibilityPost({
          placeAccessibilityId: target.id,
        });
      } else {
        const target = findDeletableItem<BuildingAccessibility>(
          accessibilityDto.buildingAccessibilities,
          accessibilityDto.buildingAccessibility,
        );
        if (!target) {
          throw new Error('No deletable buildingAccessibility found');
        }
        return await api.deleteBuildingAccessibilityPost({
          buildingAccessibilityId: target.id,
        });
      }
    },
    onMutate: () => setLoading(new Map(loading).set('PlaceDetail', true)),
    onSuccess: (_data, _variables) => {
      const placeId =
        accessibilityDto.placeAccessibilities?.[0]?.placeId ??
        accessibilityDto.placeAccessibility?.placeId;

      queryClient.invalidateQueries({
        queryKey: ['PlaceDetail', placeId],
      });

      // PlaceDetailV2Screen uses 'PlaceDetailV2' as query key prefix
      queryClient.invalidateQueries({
        queryKey: ['PlaceDetailV2', placeId],
      });

      // Asynchronously update search cache with full latest data
      if (placeId) {
        updateSearchCacheForPlaceAsync(api, queryClient, placeId);
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
