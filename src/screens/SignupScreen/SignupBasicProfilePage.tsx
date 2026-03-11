import React, {useRef} from 'react';
import {Text, TextInput, View} from 'react-native';

import UserBirthYearForm, {
  UserBirthYearFormRef,
} from '@/components/form/UserBirthYearForm';
import UserEmailForm from '@/components/form/UserEmailForm';
import UserNicknameForm from '@/components/form/UserNicknameForm';

import {UserFormState, UserFormValue} from './hooks/useUpdateUser';

interface SignupFirstPageProps {
  formValue: UserFormValue;
  formState: UserFormState;
  updateField: (field: keyof UserFormValue, value: any) => Promise<void>;
}

export default function SignupBasicPage({
  formValue,
  formState,
  updateField,
}: SignupFirstPageProps) {
  const emailInputRef = useRef<TextInput>(null);
  const birthYearRef = useRef<UserBirthYearFormRef>(null);

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
      <View className="gap-[36px] mt-[36px]">
        <UserNicknameForm
          value={formValue.nickname}
          state={formState.nickname}
          onChangeText={value => updateField('nickname', value)}
          onSubmitEditing={() => emailInputRef.current?.focus()}
        />
        <UserEmailForm
          ref={emailInputRef}
          value={{
            email: formValue.email,
            isNewsLetterSubscriptionAgreed:
              formValue.isNewsLetterSubscriptionAgreed,
          }}
          state={{
            email: formState.email,
            isNewsLetterSubscriptionAgreed:
              formState.isNewsLetterSubscriptionAgreed,
          }}
          onChangeNewsLetterSubscriptionAgreed={value =>
            updateField('isNewsLetterSubscriptionAgreed', value)
          }
          onChangeText={value => updateField('email', value)}
        />
        <UserBirthYearForm
          ref={birthYearRef}
          value={formValue.birthYear}
          state={formState.birthYear}
          onChangeText={value => updateField('birthYear', value)}
        />
      </View>
    </>
  );
}
