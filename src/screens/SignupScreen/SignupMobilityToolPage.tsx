import React from 'react';
import {ScrollView, Text, View} from 'react-native';

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
        <Text className="font-pretendard-bold text-[24px] text-gray-100 mt-[12px]">
          나에게 해당하는 이동 유형을{'\n'}모두 선택해주세요.{' '}
          <Text className="text-gray-50 font-pretendard-regular text-[16px]">
            (중복선택가능)
          </Text>
        </Text>
        <Text className="font-pretendard-medium text-[16px] text-gray-90 mt-[4px]">
          맞춤 정보 제공 및 탐색을 위해 필요한 정보입니다.
        </Text>
      </View>
      <ScrollView keyboardDismissMode={'interactive'} className="mt-[24px]">
        <UserMobilityToolsForm
          value={formValue.mobilityTools}
          onChangeValue={value => updateField('mobilityTools', value)}
          onSubmit={onSubmit}
        />
      </ScrollView>
    </>
  );
}
