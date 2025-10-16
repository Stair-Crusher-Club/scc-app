import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useAtom} from 'jotai';

import {loadingState} from '@/components/LoadingView';
import {UpvoteTargetTypeDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import ToastUtils from '@/utils/ToastUtils';

export function useDeleteReview({
  type,
  reviewId,
  placeId,
}: {
  type: 'place' | 'toilet';
  reviewId: string;
  placeId: string;
}) {
  const {api} = useAppComponents();
  const [loading, setLoading] = useAtom(loadingState);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (type === 'place') {
        return await api.deletePlaceReviewPost({
          placeReviewId: reviewId,
        });
      } else {
        return await api.deleteToiletReviewPost({
          toiletReviewId: reviewId,
        });
      }
    },
    onMutate: () => setLoading(new Map(loading).set('PlaceDetail', true)),
    onSuccess: (_data, _variables) => {
      if (type === 'place') {
        queryClient.invalidateQueries({
          queryKey: ['PlaceDetail', placeId, UpvoteTargetTypeDto.PlaceReview],
        });
        queryClient.invalidateQueries({
          queryKey: ['ReviewList', UpvoteTargetTypeDto.PlaceReview],
        });
        queryClient.invalidateQueries({
          queryKey: [
            'ReviewHistory',
            'Review',
            UpvoteTargetTypeDto.PlaceReview,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            'ReviewHistory',
            'Upvote',
            UpvoteTargetTypeDto.PlaceReview,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: ['ReviewsUpvoted', UpvoteTargetTypeDto.PlaceReview],
        });
        ToastUtils.show('장소 리뷰를 삭제했습니다.');
      } else {
        queryClient.invalidateQueries({
          queryKey: ['PlaceDetail', placeId, UpvoteTargetTypeDto.ToiletReview],
        });
        queryClient.invalidateQueries({
          queryKey: ['ReviewsUpvoted', UpvoteTargetTypeDto.ToiletReview],
        });
        queryClient.invalidateQueries({
          queryKey: ['ReviewList', UpvoteTargetTypeDto.ToiletReview],
        });
        queryClient.invalidateQueries({
          queryKey: [
            'ReviewHistory',
            'Review',
            UpvoteTargetTypeDto.ToiletReview,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            'ReviewHistory',
            'Upvote',
            UpvoteTargetTypeDto.ToiletReview,
          ],
        });
        ToastUtils.show('화장실 리뷰를 삭제했습니다.');
      }
      queryClient.invalidateQueries({
        queryKey: ['ReviewReport'],
      });
    },
    onError: (_error, _variables) => {
      if (type === 'place') {
        ToastUtils.show('삭제할 수 없는 리뷰입니다.');
      } else {
        ToastUtils.show('삭제할 수 없는 화장실 리뷰입니다.');
      }
    },
    onSettled: () => {
      setLoading(new Map(loading).set('PlaceDetail', false));
    },
  });
}
