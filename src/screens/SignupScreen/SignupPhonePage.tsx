import React, {useCallback} from 'react';
import {Text, View} from 'react-native';

import UserPhoneForm from '@/components/form/UserPhoneForm';

import {UserFormState, UserFormValue} from './hooks/useUpdateUser';

interface SignupPhonePageProps {
  formValue: UserFormValue;
  formState: UserFormState;
  updateField: (field: keyof UserFormValue, value: any) => Promise<void>;
  accessToken?: string;
}

export default function SignupPhonePage({
  formValue,
  updateField,
  accessToken,
}: SignupPhonePageProps) {
  const handlePhoneNumberChange = useCallback(
    (value: string) => {
      updateField('phoneNumber', value);
    },
    [updateField],
  );

  const handleVerificationComplete = useCallback(() => {
    updateField('isPhoneVerified', true);
  }, [updateField]);

  return (
    <>
      <View className="px-[20px] flex-col">
        <Text className="font-pretendard-bold text-[24px] text-gray-100 mt-[12px]">
          크러셔님 환영합니다!
        </Text>
        <Text className="font-pretendard-regular text-[16px] text-gray-70 mt-[4px]">
          서비스 사용에 필요한 정보를 알려주세요.
        </Text>
      </View>
      <View className="mt-[36px]">
        <UserPhoneForm
          phoneNumber={formValue.phoneNumber}
          onPhoneNumberChange={handlePhoneNumberChange}
          onVerificationComplete={handleVerificationComplete}
          accessToken={accessToken}
        />
      </View>
    </>
  );
}
