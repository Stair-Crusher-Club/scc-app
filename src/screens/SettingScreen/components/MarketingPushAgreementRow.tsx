import {useAtomValue} from 'jotai';
import React, {useState} from 'react';
import {Text, View} from 'react-native';

import {isAnonymousUserAtom, useMe} from '@/atoms/Auth';
import {SccPressable} from '@/components/SccPressable';
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
        <Toggle value={value} onChange={onToggle} />
      </View>
    </View>
  );
}

// ponytail: RN 기본 Switch 는 iOS 26 에서 실제 크기가 레이아웃보다 커서 우측 여백을 넘고, off 트랙이 배경과 구분되지 않아
// 크기·색을 직접 정하는 토글로 그린다. 다른 화면에서도 필요해지면 components 로 올린다.
function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <SccPressable
      elementName="setting_marketing_push_agreement_toggle"
      logParams={{next: !value}}
      accessibilityRole="switch"
      accessibilityState={{checked: value}}
      hitSlop={8}
      onPress={() => onChange(!value)}
      className="h-[28px] w-[48px] justify-center rounded-full px-[3px]"
      style={{backgroundColor: value ? color.brand30 : color.gray30}}>
      <View
        className="h-[22px] w-[22px] rounded-full bg-white"
        style={{alignSelf: value ? 'flex-end' : 'flex-start'}}
      />
    </SccPressable>
  );
}
