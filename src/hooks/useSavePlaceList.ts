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
}

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
    onSuccess: (_data, variables) => {
      if (!variables.isSaved) {
        ToastUtils.show('리스트를 [메뉴 > 저장한 장소]에 저장했습니다.');
      } else {
        ToastUtils.show('리스트 저장을 해제했습니다.');
      }

      queryClient.invalidateQueries({queryKey: ['SavedPlaceLists']});
      queryClient.invalidateQueries({
        queryKey: ['PlaceListDetail', variables.placeListId],
      });

      options?.onSuccess?.(variables);
    },
    onError: error => {
      ToastUtils.showOnApiError(error);
    },
  });

  const safeMutate = (args: {isSaved: boolean; placeListId: string}) => {
    if (isPending) return;
    mutate(args);
  };

  return safeMutate;
}
