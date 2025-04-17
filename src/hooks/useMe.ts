import {useAtom, useSetAtom} from 'jotai';

import {featureFlagAtom, userInfoAtom} from '@/atoms/Auth';
import Logger from '@/logging/Logger';

import useAppComponents from './useAppComponents';

const GUEST_USER = {
  id: '0',
  email: '',
  nickname: '둘러보는 중',
  mobilityTools: [],
  isNewsLetterSubscriptionAgreed: false,
};

export default function useMe() {
  const {api} = useAppComponents();
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const setFeatureFlag = useSetAtom(featureFlagAtom);

  const syncUserInfo = async () => {
    // 비회원으로 둘러보기를 선택한 경우, 유저 정보를 가져오지 못함
    if (userInfo?.id === '0') {
      setUserInfo(GUEST_USER);
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
    await Logger.setUserId(data.user.id);
  };

  return {userInfo, syncUserInfo};
}
