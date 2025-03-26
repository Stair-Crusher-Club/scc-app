import axios from 'axios';
import React from 'react';
import {ScrollView, View} from 'react-native';
import styled from 'styled-components/native';
import {match} from 'ts-pattern';

import {SccButton} from '@/components/atoms/SccButton';
import UserBirthYearForm from '@/components/form/UserBirthYearForm';
import UserEmailForm from '@/components/form/UserEmailForm';
import UserMobilityToolsForm from '@/components/form/UserMobilityToolsForm';
import UserNicknameForm from '@/components/form/UserNicknameForm';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ApiErrorResponse} from '@/generated-sources/openapi';
import useMe from '@/hooks/useMe';
import {ScreenProps} from '@/navigation/Navigation.screens';
import useNavigation from '@/navigation/useNavigation';
import {useUpdateUser} from '@/screens/SignupScreen/hooks/useUpdateUser';
import ToastUtils from '@/utils/ToastUtils';

export interface ProfileEditorDetailScreenParams {
  field: 'nickname' | 'email' | 'birthYear' | 'mobilityTools';
}

export default function ProfileEditorDetailScreen({
  route,
}: ScreenProps<'ProfileEditor/Detail'>) {
  const {field} = route.params;
  const {userInfo, syncUserInfo} = useMe();
  const navigation = useNavigation();
  const {formState, formValue, updateField, submit} = useUpdateUser({
    initialValues: {
      nickname: userInfo?.nickname ?? '',
      email: userInfo?.email ?? '',
      birthYear: userInfo?.birthYear?.toString() ?? '',
      mobilityTools: userInfo?.mobilityTools ?? [],
      isNewsLetterSubscriptionAgreed:
        userInfo?.isNewsLetterSubscriptionAgreed ?? false,
    },
  });

  const onSubmit = async () => {
    try {
      await submit();
      await syncUserInfo();
      ToastUtils.show('변경되었습니다.');
      navigation.goBack();
    } catch (error) {
      let msg = '오류가 발생했습니다.';
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as ApiErrorResponse;
        if (data?.msg) {
          msg = data.msg;
        }
      }
      ToastUtils.show(msg);
    }
  };

  const title = match(field)
    .with('nickname', () => '닉네임을 입력해주세요')
    .with('email', () => '이메일을 입력해주세요')
    .with('birthYear', () => '태어난 해를 알려주세요')
    .with(
      'mobilityTools',
      () => '나의 이동 상황에 해당하는 유형을 모두 알려주세요',
    )
    .exhaustive();

  const renderForm = () => {
    switch (field) {
      case 'nickname':
        return (
          <UserNicknameForm
            value={formValue.nickname}
            state={formState.nickname}
            onChangeText={value => updateField('nickname', value)}
            isClearable={true}
          />
        );
      case 'email':
        return (
          <UserEmailForm
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
            onChangeText={value => updateField('email', value)}
            onChangeNewsLetterSubscriptionAgreed={value =>
              updateField('isNewsLetterSubscriptionAgreed', value)
            }
            isClearable={true}
          />
        );
      case 'birthYear':
        return (
          <UserBirthYearForm
            value={formValue.birthYear}
            state={formState.birthYear}
            onChangeText={value => updateField('birthYear', value)}
          />
        );
      case 'mobilityTools':
        return (
          <UserMobilityToolsForm
            value={formValue.mobilityTools}
            onChangeValue={value => updateField('mobilityTools', value)}
            onSubmit={onSubmit}
          />
        );
    }
  };
  const isValid = match(field)
    .with('nickname', () => formState.nickname === 'VALID')
    .with(
      'email',
      () =>
        (formState.email === 'VALID' &&
          formState.isNewsLetterSubscriptionAgreed === 'VALID') ||
        (formState.email === 'VALID' &&
          formState.isNewsLetterSubscriptionAgreed === undefined) ||
        (formState.email === undefined &&
          formState.isNewsLetterSubscriptionAgreed === 'VALID'),
    )
    .with('birthYear', () => formState.birthYear === 'VALID')
    .with('mobilityTools', () => formState.mobilityTools === 'VALID')
    .exhaustive();

  return (
    <Container>
      <Title>
        {title}
        {title === 'mobilityTools' ? <Details>(중복선택 가능)</Details> : null}
      </Title>
      <ScrollView style={{marginTop: 32}}>{renderForm()}</ScrollView>
      <View
        style={{
          width: '100%',
          backgroundColor: color.white,
          padding: 20,
        }}>
        <SccButton
          onPress={onSubmit}
          buttonColor="blue50"
          borderColor="blue50"
          textColor="white"
          fontFamily={font.pretendardBold}
          text="확인"
          isDisabled={!isValid}
        />
      </View>
    </Container>
  );
}

const Details = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 16px;
  color: ${color.gray50};
`;

const Container = styled.View`
  flex: 1;
  background-color: white;
`;

const Title = styled.Text`
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 32px;
  font-family: ${font.pretendardBold};
  font-size: 24px;
  color: ${color.gray100};
`;
