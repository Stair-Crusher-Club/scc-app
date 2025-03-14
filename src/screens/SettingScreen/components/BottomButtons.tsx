import React, {useState} from 'react';
import {useSetRecoilState} from 'recoil';

import {accessTokenAtom} from '@/atoms/Auth';
import {SccButton} from '@/components/atoms';
import {font} from '@/constant/font';
import useAppComponents from '@/hooks/useAppComponents';
import WithdrawConfirmBottomSheet from '@/modals/WithdrawConfirmBottomSheet/WithdrawConfirmBottomSheet';
import useNavigation from '@/navigation/useNavigation';
import ToastUtils from '@/utils/ToastUtils';

import * as S from './BottomButtons.style';

export default function BottomButtons() {
  const {api} = useAppComponents();
  const navigation = useNavigation();
  const setAccessToken = useSetRecoilState(accessTokenAtom);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  async function logout() {
    setAccessToken(null);
    ToastUtils.show('로그아웃했습니다');
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  }

  async function withdraw() {
    try {
      await api.deleteUserPost({});
      ToastUtils.show('탈퇴했습니다');
      setIsConfirmVisible(false);
      setAccessToken(null);
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error: any) {
      ToastUtils.showOnApiError(error);
    }
  }

  return (
    <S.BottomButtons>
      <SccButton
        text="로그아웃"
        textColor="black"
        buttonColor="gray10"
        fontFamily={font.pretendardMedium}
        onPress={logout}
      />
      <SccButton
        text="탈퇴하기"
        textColor="gray80"
        buttonColor="white"
        fontFamily={font.pretendardRegular}
        onPress={() => setIsConfirmVisible(true)}
      />
      <WithdrawConfirmBottomSheet
        name="deleteAccount"
        isVisible={isConfirmVisible}
        onConfirmButtonPressed={withdraw}
        onCloseButtonPressed={() => setIsConfirmVisible(false)}
      />
    </S.BottomButtons>
  );
}
