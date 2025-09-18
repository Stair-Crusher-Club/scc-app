import {useEffect, useState} from 'react';

import {useCheckAuth} from '@/utils/checkAuth';
import {useQueryClient} from '@tanstack/react-query';

import {UpvoteTargetTypeDto} from '@/generated-sources/openapi';
import {UpdateUpvoteStatusParams} from '@/screens/PlaceDetailScreen/types';

interface UseUpvoteToggleParams {
  initialIsUpvoted: boolean;
  initialTotalCount: number | undefined;
  targetId: string | undefined;
  targetType: UpvoteTargetTypeDto;
  updateUpvoteStatus?: (params: UpdateUpvoteStatusParams) => Promise<boolean>;
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
  updateUpvoteStatus,
}: UseUpvoteToggleParams): UseUpvoteToggleReturn {
  const checkAuth = useCheckAuth();
  const queryClient = useQueryClient();

  const [isUpvoted, setIsUpvoted] = useState(initialIsUpvoted);
  const [totalUpvoteCount, setTotalUpvoteCount] = useState<number | undefined>(
    initialTotalCount,
  );

  useEffect(() => {
    setIsUpvoted(initialIsUpvoted);
    setTotalUpvoteCount(initialTotalCount);
  }, [initialIsUpvoted, initialTotalCount]);

  const toggleUpvote = () => {
    checkAuth(async () => {
      if (!targetId) return;

      const newIsUpvoted = !isUpvoted;

      // API call
      const success = await updateUpvoteStatus?.({
        id: targetId,
        newUpvotedStatus: newIsUpvoted,
        targetType,
      });

      // Only update state and invalidate queries on success
      if (success) {
        setIsUpvoted(newIsUpvoted);
        setTotalUpvoteCount(prev => {
          const currentCount = prev ?? 0;
          return newIsUpvoted ? currentCount + 1 : currentCount - 1;
        });

        queryClient.invalidateQueries({
          queryKey: ['PlaceDetail'],
        });

        queryClient.invalidateQueries({
          queryKey: ['ReviewList'],
        });

        queryClient.invalidateQueries({
          queryKey: ['ReviewsUpvoted'],
        });

        queryClient.invalidateQueries({
          queryKey: ['ReviewHistory'],
        });
      }
    });
  };

  return {
    isUpvoted,
    totalUpvoteCount,
    toggleUpvote,
  };
}
