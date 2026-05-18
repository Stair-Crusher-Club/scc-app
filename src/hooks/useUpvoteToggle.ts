import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';

import {UpvoteTargetTypeDto} from '@/generated-sources/openapi';
import ToastUtils from '@/utils/ToastUtils';

import useAppComponents from './useAppComponents';
import {USER_TUTORIAL_PROGRESS_QUERY_KEY} from './useUserTutorialProgress';

interface UseUpvoteToggleParams {
  initialIsUpvoted: boolean;
  initialTotalCount: number | undefined;
  targetId: string | undefined;
  targetType: UpvoteTargetTypeDto;
  placeId: string;
  /**
   * mutation 성공 시 호출되는 부가 콜백. wasUpvoted = 호출 직전 isUpvoted 값.
   * (false → true 전환 시 wasUpvoted=false)
   */
  onSuccess?: (variables: {wasUpvoted: boolean}) => void;
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
  placeId,
  onSuccess,
}: UseUpvoteToggleParams): UseUpvoteToggleReturn {
  const {api} = useAppComponents();
  const queryClient = useQueryClient();

  const [isUpvoted, setIsUpvoted] = useState<boolean>(initialIsUpvoted);
  const [totalUpvoteCount, setTotalUpvoteCount] = useState<number>(
    initialTotalCount ?? 0,
  );

  useEffect(() => {
    setIsUpvoted(initialIsUpvoted);
  }, [initialIsUpvoted]);

  useEffect(() => {
    setTotalUpvoteCount(initialTotalCount ?? 0);
  }, [initialTotalCount]);

  useEffect(() => {
    setIsUpvoted(initialIsUpvoted);
    setTotalUpvoteCount(initialTotalCount ?? 0);
  }, [targetId, initialIsUpvoted, initialTotalCount]);

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
    onMutate: async wasUpvoted => {
      setIsUpvoted(!wasUpvoted);
      setTotalUpvoteCount(prev => Math.max(0, prev + (wasUpvoted ? -1 : 1)));
    },
    onSuccess: (_data, wasUpvoted) => {
      if (isUpvoted) {
        ToastUtils.show('소중한 의견 감사해요 👍');
      }

      if (!placeId) {
        return;
      }

      if (
        targetType === 'PLACE' ||
        targetType === 'PLACE_ACCESSIBILITY' ||
        targetType === 'BUILDING_ACCESSIBILITY'
      ) {
        queryClient.invalidateQueries({
          queryKey: ['PlaceDetailV2', placeId, 'Accessibility'],
        });

        // 정복한 장소 > 도움이 돼요 리스트
        queryClient.invalidateQueries({
          queryKey: ['PlacesUpvoted'],
        });

        // 정복한 장소 > 도움이 돼요 통계
        queryClient.invalidateQueries({
          queryKey: ['UpvotedForNumberOfItems'],
        });
      }

      // 윌리의 외출 NUX 튜토리얼: 도움이 돼요 미션 진행 상태 무효화
      queryClient.invalidateQueries({
        queryKey: USER_TUTORIAL_PROGRESS_QUERY_KEY,
      });

      if (targetType === 'PLACE_REVIEW' || targetType === 'TOILET_REVIEW') {
        queryClient.invalidateQueries({
          queryKey: ['PlaceDetailV2', placeId, targetType],
        });

        // 내 리뷰 > 내가 작성한 리뷰 리스트
        queryClient.invalidateQueries({
          queryKey: ['MyReviews', targetType],
        });

        // 내 리뷰 > 도움이 돼요 리스트
        queryClient.invalidateQueries({
          queryKey: ['ReviewsUpvoted', targetType],
        });

        // 내 리뷰 > 내가 작성한 리뷰, 도움이 돼요 통계
        queryClient.invalidateQueries({
          queryKey: ['ReviewHistory', 'Upvote', targetType],
        });
      }

      onSuccess?.({wasUpvoted});
    },
    onError: (error, wasUpvoted) => {
      setIsUpvoted(wasUpvoted);
      setTotalUpvoteCount(prev => Math.max(0, prev + (wasUpvoted ? 1 : -1)));
      ToastUtils.showOnApiError(error);
    },
  });

  const toggleUpvote = () => {
    if (isPending || !targetId) {
      return;
    }

    mutate(isUpvoted);
  };

  return {
    isUpvoted,
    totalUpvoteCount,
    toggleUpvote,
  };
}
