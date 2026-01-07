import React, {useCallback} from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import UserPhoneForm from '@/components/form/UserPhoneForm';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

import {UserFormValue, UserFormState} from './hooks/useUpdateUser';

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
      <View style={{marginTop: 36}}>
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
