import {atom, useAtom, useSetAtom} from 'jotai';

import {atomForLocal} from '@/atoms/atomForLocal';
import {User} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import Logger from '@/logging/Logger';
import {logDebug} from '@/utils/DebugUtils';
import {useEffect} from 'react';

const userInfoAtom = atomForLocal<User>('userInfo');

export const ANONYMOUS_USER_TEMPLATE: User = {
  id: '0',
  nickname: '비회원',
  mobilityTools: [],
  isNewsLetterSubscriptionAgreed: false,
};

export const isAnonymousUserAtom = atom(get => {
  const userInfo = get(userInfoAtom);
  // 비회원 체크: nickname이 '비회원'인 경우
  // (id가 '0'인 경우는 레거시 케이스이며, 실제로는 채번된 userId를 가짐)
  return (
    userInfo?.id === '0' ||
    userInfo?.nickname === ANONYMOUS_USER_TEMPLATE.nickname
  );
});

export const accessTokenAtom = atomForLocal<string>('scc-token');

export const featureFlagAtom = atom<{
  isAlbumUploadAllowed: boolean;
  isCrew: boolean;
} | null>(null);

// Key: 실험 이름 (e.g., 'UPVOTE_BUTTON_STYLE')
// Value: { variant: 배정된 variant, availableVariants: 가능한 variant 목록 }
export const experimentAtom = atom<Record<
  string,
  {variant: string; availableVariants: string[]}
> | null>(null);

// DevTool용 로컬 오버라이드 (앱 재시작 시 초기화됨, DB 저장 안 함)
export const experimentOverrideAtom = atom<Record<string, string>>({});

// useMe hook - centralized userInfo management
export function useMe() {
  const {api} = useAppComponents();
  const [userInfo, _setUserInfoAtom] = useAtom(userInfoAtom);
  const setFeatureFlag = useSetAtom(featureFlagAtom);
  const setExperiment = useSetAtom(experimentAtom);

  const _syncUserInfo = async (newUserInfo: User) => {
    logDebug('syncUserInfo', newUserInfo);

    // 레거시; 과거에 비회원 유저의 id를 '0'으로 저장하던 시기를 처리하기 위한 로직.
    if (newUserInfo?.id === '0') {
      _setUserInfoAtom(ANONYMOUS_USER_TEMPLATE);
      setExperiment(null);
      return;
    }

    // 이 함수의 목적은 userInfo.id를 기반으로 userInfo를 갱신하는 것이므로,
    // userInfo 혹은 userInfo.id가 null인 경우는 sync를 스킵한다.
    if (newUserInfo?.id == null) {
      setExperiment(null);
      return;
    }

    // 비회원 유저이더라도 userInfo.id는 올바르게 채번되어 있으므로 Logger에 userId를 세팅해준다.
    await Logger.setUserId(newUserInfo?.id!);

    // 이후 작업은 IDENTIFIED 유저에 대해서만 진행한다.
    if (newUserInfo?.nickname === ANONYMOUS_USER_TEMPLATE.nickname) {
      setExperiment(null);
      return;
    }

    // 이미 저장된 유저 정보가 있으면 상태 업데이트
    // 메인화면 진입 시마다 새로 유저 정보를 업데이트한다.
    const {data} = await api.getUserInfoGet();
    _setUserInfoAtom(data.user);
    setFeatureFlag({
      isAlbumUploadAllowed: data.isAlbumUploadAllowed ?? false,
      isCrew: data.isCrew ?? false,
    });

    // 실험 배정 파싱
    const experimentsMap: Record<
      string,
      {variant: string; availableVariants: string[]}
    > = {};
    data.experiments?.forEach(exp => {
      if (exp.experiment?.name && exp.variant) {
        experimentsMap[exp.experiment.name] = {
          variant: exp.variant,
          availableVariants: exp.experiment.variants?.map(v => v.name) ?? [],
        };
      }
    });
    setExperiment(experimentsMap);
  };

  const setUserInfo = async (user: User) => {
    _setUserInfoAtom(user);
    _syncUserInfo(user);
  };

  const syncUserInfo = async () => {
    userInfo && (await _syncUserInfo(userInfo));
  };

  // Auto-sync when userInfo is loaded from storage
  useEffect(() => {
    if (
      userInfo &&
      userInfo.id &&
      userInfo.nickname !== ANONYMOUS_USER_TEMPLATE.nickname
    ) {
      _syncUserInfo(userInfo);
    }
  }, [userInfo?.id]);

  return {userInfo, setUserInfo, syncUserInfo};
}
