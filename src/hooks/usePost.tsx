import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useAtom} from 'jotai';

import {loadingState} from '@/components/LoadingView';
import ToastUtils from '@/utils/ToastUtils';

export default function usePost<TParams = unknown, TResult = unknown>(
  mutationKey: string[],
  apiFn: (params: TParams) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useAtom(loadingState);
  return useMutation({
    mutationKey: mutationKey,
    mutationFn: async (params: TParams) => await apiFn(params),
    onSettled: () =>
      setLoading(new Map(loading).set(mutationKey.join(','), false)),
    onMutate: () =>
      setLoading(new Map(loading).set(mutationKey.join(','), true)),
    onError: error => {
      ToastUtils.showOnApiError(error);
    },
    onSuccess: _ =>
      queryClient.invalidateQueries({
        queryKey: mutationKey,
      }),
  });
}
