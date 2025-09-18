import {useEffect, useState} from 'react';

import {useCheckAuth} from '@/utils/checkAuth';

import {UpdateUpvoteStatusParams} from '@/screens/PlaceDetailScreen/types';

interface UseUpvoteToggleParams {
  initialIsUpvoted: boolean;
  initialTotalCount: number | undefined;
  targetId: string | undefined;
  targetType: UpdateUpvoteStatusParams['targetType'];
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

      // Optimistic update
      const newIsUpvoted = !isUpvoted;
      setIsUpvoted(newIsUpvoted);
      setTotalUpvoteCount(prev => {
        const currentCount = prev ?? 0;
        return newIsUpvoted ? currentCount + 1 : currentCount - 1;
      });

      // API call
      const success = await updateUpvoteStatus?.({
        id: targetId,
        newUpvotedStatus: newIsUpvoted,
        targetType,
      });

      // Rollback on failure
      if (!success) {
        setIsUpvoted(isUpvoted);
        setTotalUpvoteCount(prev => {
          const currentCount = prev ?? 0;
          return isUpvoted ? currentCount + 1 : currentCount - 1;
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
