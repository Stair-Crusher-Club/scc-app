import {useMutation, useQueryClient} from '@tanstack/react-query';

import {UpvoteTargetTypeDto} from '@/generated-sources/openapi';
import ToastUtils from '@/utils/ToastUtils';

import useAppComponents from './useAppComponents';

interface UseUpvoteToggleParams {
  initialIsUpvoted: boolean;
  initialTotalCount: number | undefined;
  targetId: string | undefined;
  targetType: UpvoteTargetTypeDto;
}

interface UseUpvoteToggleReturn {
  isUpvoted: boolean;
  totalUpvoteCount: number | undefined;
  toggleUpvote: () => void;
}

export function useUpvoteToggle({
  initialIsUpvoted,
  initialTotalCount,
  targetId,
  targetType,
}: UseUpvoteToggleParams): UseUpvoteToggleReturn {
  const {api} = useAppComponents();
  const queryClient = useQueryClient();

  const {mutate, isPending} = useMutation({
    mutationFn: async (currentIsUpvoted: boolean) => {
      if (!targetId) throw new Error('targetId is required');

      if (currentIsUpvoted) {
        return await api.cancelUpvotePost({
          id: targetId,
          targetType,
        });
      } else {
        return await api.giveUpvotePost({
          id: targetId,
          targetType,
        });
      }
    },
    onSuccess: () => {
      ToastUtils.show('좋은 의견 감사합니다!');

      queryClient.invalidateQueries({
        queryKey: ['PlaceDetail'],
      });

      queryClient.invalidateQueries({
        queryKey: ['ReviewList', targetType],
      });

      queryClient.invalidateQueries({
        queryKey: ['ReviewsUpvoted', targetType],
      });

      queryClient.invalidateQueries({
        queryKey: ['ReviewHistory', 'Upvote', targetType],
      });
    },
    onError: error => {
      ToastUtils.showOnApiError(error);
    },
  });

  const toggleUpvote = () => {
    if (isPending || !targetId) return;

    mutate(initialIsUpvoted);
  };

  return {
    isUpvoted: initialIsUpvoted,
    totalUpvoteCount: initialTotalCount,
    toggleUpvote,
  };
}
