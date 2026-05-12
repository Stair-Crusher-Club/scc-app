import {useMutation, useQueryClient} from '@tanstack/react-query';

import {
  TutorialMissionTypeDto,
  UserTutorialProgressDto,
} from '@/generated-sources/openapi';
import ToastUtils from '@/utils/ToastUtils';

import useAppComponents from './useAppComponents';
import {USER_TUTORIAL_PROGRESS_QUERY_KEY} from './useUserTutorialProgress';

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
      // 윌리의 외출 NUX 튜토리얼: SavePlaceList 미션이 아직 완료되지 않은
      // 경우에만 진행 상태를 무효화한다. 미션은 한 번 완료되면 다시 미완료로
      // 돌아가지 않으므로 이미 완료된 상태면 refetch는 불필요.
      const progress = queryClient.getQueryData<UserTutorialProgressDto>(
        USER_TUTORIAL_PROGRESS_QUERY_KEY,
      );
      const savePlaceListMissionCompleted = progress?.missions?.some(
        m =>
          m.missionType === TutorialMissionTypeDto.SavePlaceList &&
          m.completedAt != null,
      );
      if (!savePlaceListMissionCompleted) {
        queryClient.invalidateQueries({
          queryKey: USER_TUTORIAL_PROGRESS_QUERY_KEY,
        });
      }

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
