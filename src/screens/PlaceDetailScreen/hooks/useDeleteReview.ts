import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useAtom} from 'jotai';

import {loadingState} from '@/components/LoadingView';
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
          queryKey: ['PlaceDetail', placeId, 'Review'],
        });
        ToastUtils.show('장소 리뷰를 삭제했습니다.');
      } else {
        queryClient.invalidateQueries({
          queryKey: ['PlaceDetail', placeId, 'Toilet'],
        });
        ToastUtils.show('화장실 리뷰를 삭제했습니다.');
      }
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
