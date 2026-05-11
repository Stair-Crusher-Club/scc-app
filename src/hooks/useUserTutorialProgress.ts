import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';

import {isAnonymousUserAtom} from '@/atoms/Auth';
import {
  RegisterUserInterestedRegionsAndThemesRequestDto,
  UserTutorialProgressDto,
} from '@/generated-sources/openapi';
import ToastUtils from '@/utils/ToastUtils';

import useAppComponents from './useAppComponents';

export const USER_TUTORIAL_PROGRESS_QUERY_KEY = ['UserTutorialProgress'];

export function useUserTutorialProgress() {
  const {api} = useAppComponents();
  const isAnonymousUser = useAtomValue(isAnonymousUserAtom);

  return useQuery<UserTutorialProgressDto>({
    queryKey: USER_TUTORIAL_PROGRESS_QUERY_KEY,
    queryFn: async () => (await api.getUserTutorialProgress()).data,
    // 비회원도 호출 가능하나, 모든 미션은 미완료로 반환됨
    enabled: true,
    staleTime: isAnonymousUser ? Infinity : 30 * 1000,
  });
}

export function useRegisterUserInterestedRegionsAndThemes() {
  const {api} = useAppComponents();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      params: RegisterUserInterestedRegionsAndThemesRequestDto,
    ) => {
      return (await api.registerUserInterestedRegionsAndThemes(params)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_TUTORIAL_PROGRESS_QUERY_KEY,
      });
    },
    onError: error => {
      ToastUtils.showOnApiError(error);
    },
  });
}

export function useCompleteUserTutorialHiddenMission() {
  const {api} = useAppComponents();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return (await api.completeUserTutorialHiddenMission()).data;
    },
    onSuccess: (data: UserTutorialProgressDto) => {
      queryClient.setQueryData(USER_TUTORIAL_PROGRESS_QUERY_KEY, data);
    },
    onError: error => {
      ToastUtils.showOnApiError(error);
    },
  });
}
