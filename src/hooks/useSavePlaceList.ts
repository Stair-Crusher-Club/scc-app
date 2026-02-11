import {useMutation, useQueryClient} from '@tanstack/react-query';

import ToastUtils from '@/utils/ToastUtils';

import useAppComponents from './useAppComponents';

export function useSavePlaceList() {
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
