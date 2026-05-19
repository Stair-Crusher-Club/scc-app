import {useMutation, useQueryClient} from '@tanstack/react-query';

import ToastUtils from '@/utils/ToastUtils';

import useAppComponents from './useAppComponents';

interface UseSavePlaceListOptions {
  /**
   * mutation 성공 시 호출되는 부가 콜백. hook 내부의 cache invalidation 직후 동기적으로
   * 호출되므로, useEffect로 query cache 변화를 watch하다가 빠른 unmount로 누락되는
   * 케이스를 피하고 싶을 때 사용한다.
   */
  onSuccess?: (variables: {isSaved: boolean; placeListId: string}) => void;
  /**
   * mutation 실패 시 호출되는 부가 콜백. 컴포넌트 단의 optimistic state 해제 등에 사용.
   * hook 내부의 cache revert + toast 표시 직후 호출된다.
   */
  onError?: () => void;
}

/**
 * onMutate에서 즉시 toggle 할 대상 query key prefix.
 * 저장리스트가 크면 서버 응답 + invalidate 후 refetch 까지 수초 걸려서 "안 눌렸나?" 라고
 * 헷갈리는 QA 이슈가 있었음. 캐시의 isSaved 만 우선 뒤집고 onError 시 revert.
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

      queryClient.invalidateQueries({queryKey: ['SavedPlaceLists']});
      queryClient.invalidateQueries({
        queryKey: [PLACE_LIST_DETAIL_QUERY_KEY_PREFIX, variables.placeListId],
      });

      options?.onSuccess?.(variables);
    },
    onError: (error, _variables, context) => {
      // optimistic update revert.
      context?.snapshots.forEach(({queryKey, data}) => {
        queryClient.setQueryData(queryKey, data);
      });
      ToastUtils.showOnApiError(error);

      options?.onError?.();
    },
  });

  const safeMutate = (args: {isSaved: boolean; placeListId: string}) => {
    if (isPending) return;
    mutate(args);
  };

  return safeMutate;
}
