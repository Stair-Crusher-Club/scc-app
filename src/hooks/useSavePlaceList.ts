import {useMutation, useQueryClient} from '@tanstack/react-query';

import ToastUtils from '@/utils/ToastUtils';

import useAppComponents from './useAppComponents';
import {USER_TUTORIAL_PROGRESS_QUERY_KEY} from './useUserTutorialProgress';

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
      // 윌리의 외출 NUX 튜토리얼: 저장리스트 저장 미션 진행 상태 무효화
      queryClient.invalidateQueries({
        queryKey: USER_TUTORIAL_PROGRESS_QUERY_KEY,
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
