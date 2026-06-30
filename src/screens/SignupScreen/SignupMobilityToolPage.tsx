import React from 'react';
import {Text, View} from 'react-native';

import UserMobilityToolsForm from '@/components/form/UserMobilityToolsForm';

import {UserFormValue} from './hooks/useUpdateUser';

interface SignupSecondPageProps {
  formValue: UserFormValue;
  updateField: (field: keyof UserFormValue, value: any) => Promise<void>;
  onSubmit: () => void;
}

export default function SignupMobilityToolPage({
  formValue,
  updateField,
  onSubmit,
}: SignupSecondPageProps) {
  return (
    <>
      <View className="px-[20px] flex-col">
        <View className="mt-[12px]">
          <Text className="font-pretendard-bold text-[24px] leading-[33.6px] text-gray-100">
            나에게 해당하는 이동 유형을
          </Text>
          <View className="flex-row items-center">
            <Text className="font-pretendard-bold text-[24px] leading-[33.6px] text-gray-100">
              모두 선택해주세요.{' '}
            </Text>
            <Text className="text-gray-50 font-pretendard-regular text-[16px]">
              (최대 3개까지 선택)
            </Text>
          </View>
        </View>
        <Text className="font-pretendard-medium text-[16px] text-gray-70 mt-[4px]">
          맞춤 정보 제공 및 탐색을 위해 필요한 정보입니다.
        </Text>
      </View>
      <View className="mt-[36px]">
        <UserMobilityToolsForm
          value={formValue.mobilityTools}
          onChangeValue={value => updateField('mobilityTools', value)}
          onSubmit={onSubmit}
        />
      </View>
    </>
  );
}
