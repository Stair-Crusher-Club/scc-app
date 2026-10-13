import dayjs from 'dayjs';

import {useMe} from '@/atoms/Auth';
import useAppComponents from '@/hooks/useAppComponents';

import ToastUtils from './ToastUtils';

// 정보통신망법: 동의·철회 시 일시와 결과를 통지한다. 문구는 이 함수 한 곳에서만 만든다.
export function marketingPushAgreementResultMessage(isAgreed: boolean) {
  return `${dayjs().format('YYYY.MM.DD')} 계단뿌셔클럽 마케팅 정보 수신${
    isAgreed ? '에 동의했어요' : '을 거부했어요'
  }`;
}

// 서버 저장 → 유저 정보 갱신 → 결과 통지 토스트. 성공 여부를 반환하고, 실패 시 에러 토스트를 띄운다.
export function useUpdateMarketingPushAgreement() {
  const {api} = useAppComponents();
  const {setUserInfo} = useMe();

  return async (isAgreed: boolean): Promise<boolean> => {
    try {
      const res = await api.updateMarketingPushAgreementPost({isAgreed});
      await setUserInfo(res.data.user);
      ToastUtils.show(marketingPushAgreementResultMessage(isAgreed));
      return true;
    } catch (e) {
      ToastUtils.showOnApiError(e);
      return false;
    }
  };
}
