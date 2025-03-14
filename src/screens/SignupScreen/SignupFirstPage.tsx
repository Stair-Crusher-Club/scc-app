import React, {useRef} from 'react';
import {View, TextInput} from 'react-native';
import styled from 'styled-components/native';

import UserBirthYearForm, {
  UserBirthYearFormRef,
} from '@/components/form/UserBirthYearForm';
import UserEmailForm from '@/components/form/UserEmailForm';
import UserNicknameForm from '@/components/form/UserNicknameForm';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

import {UserFormValue, UserFormState} from './hooks/useUpdateUser';

interface SignupFirstPageProps {
  formValue: UserFormValue;
  formState: UserFormState;
  updateField: (field: keyof UserFormValue, value: any) => Promise<void>;
}

export default function SignupFirstPage({
  formValue,
  formState,
  updateField,
}: SignupFirstPageProps) {
  const emailInputRef = useRef<TextInput>(null);
  const birthYearRef = useRef<UserBirthYearFormRef>(null);

  return (
    <>
      <View
        style={{
          paddingHorizontal: 20,
          flexDirection: 'column',
          display: 'flex',
        }}>
        <TitleText style={{marginTop: 12}}>크러셔님 환영합니다!</TitleText>
        <SubTitleText style={{marginTop: 4}}>
          서비스사용에 필요한 정보를 알려주세요
        </SubTitleText>
      </View>
      <View style={{gap: 36, marginTop: 36}}>
        <UserNicknameForm
          value={formValue.nickname}
          state={formState.nickname}
          onChangeText={value => updateField('nickname', value)}
          onSubmitEditing={() => emailInputRef.current?.focus()}
        />
        <UserEmailForm
          ref={emailInputRef}
          value={formValue.email}
          state={formState.email}
          onChangeText={value => updateField('email', value)}
          onSubmitEditing={() => birthYearRef.current?.show()}
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

const TitleText = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 24px;
  color: ${color.gray100};
`;

const SubTitleText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  color: ${color.gray90};
`;
