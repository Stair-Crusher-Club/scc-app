import {QueryClient} from '@tanstack/react-query';

import {DefaultApi, PlaceListItem} from '@/generated-sources/openapi';

/**
 * 특정 장소의 최신 정보로 SearchScreen 캐시를 비동기로 업데이트
 * 실패해도 사용자 경험에 영향 없음
 *
 * @param api - API 인스턴스
 * @param queryClient - React Query 클라이언트
 * @param placeId - 업데이트할 장소 ID
 */
export async function updateSearchCacheForPlaceAsync(
  api: DefaultApi,
  queryClient: QueryClient,
  placeId: string,
): Promise<void> {
  try {
    const updatedPlace = await api.getPlaceWithBuildingPost({placeId});
    queryClient.setQueriesData<PlaceListItem[]>(
      {queryKey: ['search']},
      oldData => {
        if (!oldData) return oldData;
        return oldData.map(item =>
          item.place.id === placeId
            ? {
                ...item,
                place: updatedPlace.data.place,
                building: updatedPlace.data.building,
                hasPlaceAccessibility: updatedPlace.data.hasPlaceAccessibility,
                hasBuildingAccessibility:
                  updatedPlace.data.hasBuildingAccessibility,
                isAccessibilityRegistrable:
                  updatedPlace.data.isAccessibilityRegistrable,
                accessibilityInfo: updatedPlace.data.accessibilityInfo,
              }
            : item,
        );
      },
    );
  } catch (_) {
    // Silently fail - not critical for user experience
  }
}
