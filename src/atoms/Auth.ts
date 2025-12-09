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
  isMapVisible: boolean;
  isToiletVisible: boolean;
  isAlbumUploadAllowed: boolean;
  isRegisterAccessibilityV2: boolean;
} | null>(null);

// useMe hook - centralized userInfo management
export function useMe() {
  const {api} = useAppComponents();
  const [userInfo, _setUserInfoAtom] = useAtom(userInfoAtom);
  const setFeatureFlag = useSetAtom(featureFlagAtom);

  const _syncUserInfo = async (newUserInfo: User) => {
    logDebug('syncUserInfo', newUserInfo);

    // 레거시; 과거에 비회원 유저의 id를 '0'으로 저장하던 시기를 처리하기 위한 로직.
    if (newUserInfo?.id === '0') {
      _setUserInfoAtom(ANONYMOUS_USER_TEMPLATE);
      return;
    }

    // 이 함수의 목적은 userInfo.id를 기반으로 userInfo를 갱신하는 것이므로,
    // userInfo 혹은 userInfo.id가 null인 경우는 sync를 스킵한다.
    if (newUserInfo?.id == null) {
      return;
    }

    // 비회원 유저이더라도 userInfo.id는 올바르게 채번되어 있으므로 Logger에 userId를 세팅해준다.
    await Logger.setUserId(newUserInfo?.id!);

    // 이후 작업은 IDENTIFIED 유저에 대해서만 진행한다.
    if (newUserInfo?.nickname === ANONYMOUS_USER_TEMPLATE.nickname) {
      return;
    }

    // 이미 저장된 유저 정보가 있으면 상태 업데이트
    // 메인화면 진입 시마다 새로 유저 정보를 업데이트한다.
    const {data} = await api.getUserInfoGet();
    _setUserInfoAtom(data.user);
    setFeatureFlag({
      isMapVisible: data.flags?.includes('MAP_VISIBLE') ?? false,
      isToiletVisible: data.flags?.includes('TOILET_VISIBLE') ?? false,
      isAlbumUploadAllowed: data.isAlbumUploadAllowed ?? false,
      isRegisterAccessibilityV2:
        data.flags?.includes('REGISTER_ACCESSIBILITY_V2') ?? false,
    });
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
