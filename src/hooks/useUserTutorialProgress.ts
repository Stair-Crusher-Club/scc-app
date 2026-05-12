import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import {useAtomValue} from 'jotai';
import {useEffect} from 'react';

import {accessTokenAtom, isAnonymousUserAtom} from '@/atoms/Auth';
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
  const accessToken = useAtomValue(accessTokenAtom);
  const queryClient = useQueryClient();

  // 로그인 / 로그아웃 시 cache invalidate.
  // accessToken atom이 바뀌면 (로그인 / 로그아웃) tutorial progress도 무효화하여
  // 새 사용자의 진행 상태가 다시 fetch되도록 한다.
  useEffect(() => {
    queryClient.invalidateQueries({queryKey: USER_TUTORIAL_PROGRESS_QUERY_KEY});
  }, [accessToken, queryClient]);

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
      // 400은 호출처(TutorialMissionScreen)에서 "tally 제출 미확인" 안내 토스트로 처리한다.
      // 여기서 추가 토스트를 띄우면 중복 노출되므로 400은 무시.
      if (error instanceof AxiosError && error.response?.status === 400) {
        return;
      }
      ToastUtils.showOnApiError(error);
    },
  });
}
