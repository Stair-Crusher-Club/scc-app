import {useAtomValue} from 'jotai';
import React, {useState} from 'react';
import {Switch, Text, View} from 'react-native';

import {isAnonymousUserAtom, useMe} from '@/atoms/Auth';
import {color} from '@/constant/color';
import {useUpdateMarketingPushAgreement} from '@/utils/marketingPushAgreement';

export default function MarketingPushAgreementRow() {
  const {userInfo} = useMe();
  const isAnonymousUser = useAtomValue(isAnonymousUserAtom);
  const updateAgreement = useUpdateMarketingPushAgreement();
  // 낙관적 업데이트용. null 이면 서버 값을 그대로 쓴다. 실패 시 null 로 되돌려 롤백.
  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  if (isAnonymousUser) return null;

  const value = optimistic ?? userInfo?.isMarketingPushAgreed ?? false;

  async function onToggle(next: boolean) {
    setOptimistic(next);
    await updateAgreement(next);
    setOptimistic(null);
  }

  return (
    <View className="px-5 py-5">
      <Text className="mb-[8px] font-pretendard-regular text-[14px] leading-[20px] text-gray-50">
        마케팅 정보 수신 동의
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="font-pretendard-medium text-[16px] leading-[26px] text-black">
          이벤트·혜택 소식을 푸시로 받아요
        </Text>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{false: color.gray20, true: color.brand30}}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}
