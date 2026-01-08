import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import styled from 'styled-components/native';

import UserMobilityToolsForm from '@/components/form/UserMobilityToolsForm';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

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
      <View
        style={{
          paddingHorizontal: 20,
          flexDirection: 'column',
          display: 'flex',
        }}>
        <TitleText style={{marginTop: 12}}>
          나에게 해당하는 이동 유형을{'\n'}모두 선택해주세요.{' '}
          <Text
            style={{
              color: color.gray50,
              fontFamily: font.pretendardRegular,
              fontSize: 16,
            }}>
            (중복선택가능)
          </Text>
        </TitleText>
        <SubTitleText style={{marginTop: 4}}>
          맞춤 정보 제공 및 탐색을 위해 필요한 정보입니다.
        </SubTitleText>
      </View>
      <ScrollView keyboardDismissMode={'interactive'} style={{marginTop: 24}}>
        <UserMobilityToolsForm
          value={formValue.mobilityTools}
          onChangeValue={value => updateField('mobilityTools', value)}
          onSubmit={onSubmit}
        />
      </ScrollView>
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
