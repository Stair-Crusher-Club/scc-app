import {useAtom, useSetAtom} from 'jotai';

import {featureFlagAtom, userInfoAtom} from '@/atoms/Auth';
import {ANONYMOUS_USER_TEMPLATE} from '@/constant/constant';
import Logger from '@/logging/Logger';

import useAppComponents from './useAppComponents';

export default function useMe() {
  const {api} = useAppComponents();
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const setFeatureFlag = useSetAtom(featureFlagAtom);

  const syncUserInfo = async () => {
    // 레거시; 과거에 비회원 유저의 id를 '0'으로 저장하던 시기를 처리하기 위한 로직.
    if (userInfo?.id === '0') {
      setUserInfo(ANONYMOUS_USER_TEMPLATE);
      return;
    }

    // 비회원 유저이더라도 userInfo.id는 올바르게 채번되어 있으므로 Logger에 userId를 세팅해준다.
    await Logger.setUserId(userInfo?.id!);

    // 이후 작업은 IDENTIFIED 유저에 대해서만 진행한다.
    if (userInfo?.nickname === ANONYMOUS_USER_TEMPLATE.nickname) {
      return;
    }
    
    // 이미 저장된 유저 정보가 있으면 상태 업데이트
    // 메인화면 진입 시마다 새로 유저 정보를 업데이트한다.
    const {data} = await api.getUserInfoGet();
    setUserInfo(data.user);
    setFeatureFlag({
      isMapVisible: data.flags?.includes('MAP_VISIBLE') ?? false,
      isToiletVisible: data.flags?.includes('TOILET_VISIBLE') ?? false,
    });
  };

  return {userInfo, syncUserInfo};
}
