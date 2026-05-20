import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import {useAtomValue} from 'jotai';
import {useEffect} from 'react';

import {accessTokenAtom, isAnonymousUserAtom} from '@/atoms/Auth';
import {
  CompleteUserTutorialMissionRequestDto,
  RegisterUserInterestedRegionsAndThemesRequestDto,
  TutorialMissionTypeDto,
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

  return useMutation({
    mutationFn: async (
      params: RegisterUserInterestedRegionsAndThemesRequestDto,
    ) => {
      return (await api.registerUserInterestedRegionsAndThemes(params)).data;
    },
    onError: error => {
      ToastUtils.showOnApiError(error);
    },
  });
}

/**
 * 윌리의 외출 NUX 튜토리얼 미션 완료 통합 mutation hook.
 *
 * 튜토리얼 화면을 거쳐 들어온 케이스에서만 호출한다. 실제 데이터 등록/저장 API
 * (registerUserInterestedRegionsAndThemes, savePlaceList, giveAccessibilityUpvote)
 * 는 더 이상 미션을 자동 완료하지 않으므로, 진입 컨텍스트가 튜토리얼인 경우만 이 hook 으로
 * 명시 호출하면 미션이 완료된다.
 *
 * missionType 별 입력:
 *  - REGISTER_INTERESTED_REGIONS_AND_THEMES / UPVOTE_ACCESSIBILITY: 추가 입력 없음
 *  - SAVE_PLACE_LIST: { placeListId } 가 savePlaceListContext 로 필수
 *  - HIDDEN_APP_SURVEY: 추가 입력 없음 — 서버가 tally 제출 기록을 검증, 미제출 시 400
 */
export function useCompleteUserTutorialMission() {
  const {api} = useAppComponents();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CompleteUserTutorialMissionRequestDto) => {
      return (await api.completeUserTutorialMission(request)).data;
    },
    onSuccess: (data: UserTutorialProgressDto) => {
      queryClient.setQueryData(USER_TUTORIAL_PROGRESS_QUERY_KEY, data);
    },
    onError: (error, variables) => {
      // hidden mission 400 은 호출처(TutorialMissionScreen) 가 "tally 제출 미확인"
      // 안내 토스트로 처리하므로 여기서 중복 노출하지 않는다.
      if (
        variables.missionType === TutorialMissionTypeDto.HiddenAppSurvey &&
        error instanceof AxiosError &&
        error.response?.status === 400
      ) {
        return;
      }
      ToastUtils.showOnApiError(error);
    },
  });
}
