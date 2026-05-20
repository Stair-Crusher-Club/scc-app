import {useMutation, useQueryClient} from '@tanstack/react-query';

import ToastUtils from '@/utils/ToastUtils';

import useAppComponents from './useAppComponents';

interface UseSavePlaceListOptions {
  /**
   * mutation 성공 시 호출되는 부가 콜백. 빠른 unmount로 useEffect 가 query cache
   * 변화를 놓치는 케이스를 피하고 싶을 때 사용한다.
   */
  onSuccess?: (variables: {isSaved: boolean; placeListId: string}) => void;
}

/**
 * onMutate에서 즉시 toggle 할 대상 query key prefix.
 * 저장리스트가 크면 PlaceListDetail 재조회까지 수초 걸려서 "안 눌렸나?" 라고
 * 헷갈리는 QA 이슈가 있었음. 캐시의 isSaved 만 우선 뒤집고 onError 시 revert.
 *
 * 도메인 hook은 도메인만 책임진다 (CLAUDE.md `Hook 설계 원칙`):
 * 따라서 SavedPlaceLists 등 다른 도메인 query 의 invalidate 는 호출처가 책임진다.
 */
const PLACE_LIST_DETAIL_QUERY_KEY_PREFIX = 'PlaceListDetail';

export function useSavePlaceList(options?: UseSavePlaceListOptions) {
  const {api} = useAppComponents();
  const queryClient = useQueryClient();

  const {mutate, isPending} = useMutation({
    mutationFn: async ({
      isSaved,
      placeListId,
    }: {
      isSaved: boolean;
      placeListId: string;
    }) => {
      if (isSaved) {
        return await api.unsavePlaceList({placeListId});
      } else {
        return await api.savePlaceList({placeListId});
      }
    },
    // 서버 응답 + invalidate refetch 사이의 지연을 가리기 위해 캐시의 isSaved 만 즉시 toggle.
    // PlaceListDetail 캐시는 filters 까지 포함한 키 (['PlaceListDetail', placeListId, filters]).
    // 같은 placeListId 의 모든 filters 변형을 한 번에 뒤집기 위해 prefix match 로 순회한다.
    onMutate: async ({isSaved, placeListId}) => {
      await queryClient.cancelQueries({
        queryKey: [PLACE_LIST_DETAIL_QUERY_KEY_PREFIX, placeListId],
      });

      type PlaceListDetailCache =
        | {placeList?: {isSaved?: boolean} | null; [key: string]: unknown}
        | undefined;
      const snapshots: Array<{
        queryKey: readonly unknown[];
        data: PlaceListDetailCache;
      }> = [];

      queryClient
        .getQueryCache()
        .findAll({
          queryKey: [PLACE_LIST_DETAIL_QUERY_KEY_PREFIX, placeListId],
        })
        .forEach(query => {
          const prevData = query.state.data as PlaceListDetailCache;
          snapshots.push({queryKey: query.queryKey, data: prevData});
          if (prevData?.placeList) {
            queryClient.setQueryData(query.queryKey, {
              ...prevData,
              placeList: {
                ...prevData.placeList,
                isSaved: !isSaved,
              },
            });
          }
        });

      return {snapshots};
    },
    onSuccess: (_data, variables) => {
      if (!variables.isSaved) {
        ToastUtils.show('리스트를 [메뉴 > 저장한 장소]에 저장했습니다.');
      } else {
        ToastUtils.show('리스트 저장을 해제했습니다.');
      }
      // PlaceListDetail invalidate 없음 — onMutate 의 setQueryData 가 isSaved 만 토글했고
      // 서버 응답이 204 (no body) 라 재조회로 갱신될 다른 필드가 없다.
      // SavedPlaceLists invalidate 도 없음 — 호출처 (SavedPlaceListsScreen 의 useFocusEffect) 가 책임.
      options?.onSuccess?.(variables);
    },
    onError: (error, _variables, context) => {
      // optimistic update revert.
      context?.snapshots.forEach(({queryKey, data}) => {
        queryClient.setQueryData(queryKey, data);
      });
      ToastUtils.showOnApiError(error);
    },
  });

  const safeMutate = (args: {isSaved: boolean; placeListId: string}) => {
    if (isPending) return;
    mutate(args);
  };

  return safeMutate;
}
