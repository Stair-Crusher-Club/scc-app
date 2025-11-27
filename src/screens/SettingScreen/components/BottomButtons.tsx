import {useSetAtom} from 'jotai';
import React, {useState} from 'react';
import {View} from 'react-native';

import {accessTokenAtom} from '@/atoms/Auth';
import {SccButton} from '@/components/atoms';
import {font} from '@/constant/font';
import useAppComponents from '@/hooks/useAppComponents';
import WithdrawConfirmBottomSheet from '@/modals/WithdrawConfirmBottomSheet/WithdrawConfirmBottomSheet';
import useNavigation from '@/navigation/useNavigation';
import ToastUtils from '@/utils/ToastUtils';

export default function BottomButtons() {
  const {api} = useAppComponents();
  const navigation = useNavigation();
  const setAccessToken = useSetAtom(accessTokenAtom);
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
    <View className="gap-[10px] pt-5 px-5 pb-3">
      <SccButton
        text="로그아웃"
        textColor="black"
        buttonColor="gray10"
        fontFamily={font.pretendardMedium}
        onPress={logout}
        elementName="setting_logout"
      />
      <SccButton
        text="탈퇴하기"
        textColor="gray80"
        buttonColor="white"
        fontFamily={font.pretendardRegular}
        onPress={() => setIsConfirmVisible(true)}
        elementName="setting_withdraw"
      />
      <WithdrawConfirmBottomSheet
        name="deleteAccount"
        isVisible={isConfirmVisible}
        onConfirmButtonPressed={withdraw}
        onCloseButtonPressed={() => setIsConfirmVisible(false)}
      />
    </View>
  );
}
