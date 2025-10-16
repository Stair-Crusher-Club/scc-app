import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';

import {UpvoteTargetTypeDto} from '@/generated-sources/openapi';
import ToastUtils from '@/utils/ToastUtils';

import useAppComponents from './useAppComponents';

interface UseUpvoteToggleParams {
  initialIsUpvoted: boolean;
  initialTotalCount: number | undefined;
  targetId: string | undefined;
  targetType: UpvoteTargetTypeDto;
  placeId: string;
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
    onSuccess: () => {
      ToastUtils.show('좋은 의견 감사합니다!');

      if (!placeId) {
        return;
      }

      if (
        targetType === 'PLACE_ACCESSIBILITY' ||
        targetType === 'BUILDING_ACCESSIBILITY'
      ) {
        if (placeId) {
          queryClient.invalidateQueries({
            queryKey: ['PlaceDetail', placeId, 'Accessibility'],
          });

          queryClient.invalidateQueries({
            queryKey: ['PlacesUpvoted'],
          });

          queryClient.invalidateQueries({
            queryKey: ['UpvotedForNumberOfItems'],
          });
        }
      }

      if (targetType === 'PLACE_REVIEW' || targetType === 'TOILET_REVIEW') {
        queryClient.invalidateQueries({
          queryKey: ['PlaceDetail', placeId, 'Review'],
        });

        queryClient.invalidateQueries({
          queryKey: ['PlaceDetail', placeId, 'Toilet'],
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
      }
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
