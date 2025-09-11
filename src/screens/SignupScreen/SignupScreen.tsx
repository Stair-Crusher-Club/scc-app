import {useBackHandler} from '@react-native-community/hooks';
import axios from 'axios';
import {useSetAtom} from 'jotai';
import React, {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';

import {accessTokenAtom, useMe} from '@/atoms/Auth';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ApiErrorResponse} from '@/generated-sources/openapi';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ProgressViewer from '@/screens/SignupScreen/components/ProgressViewer';
import ToastUtils from '@/utils/ToastUtils';

import SignupFirstPage from './SignupFirstPage';
import SignupSecondPage from './SignupSecondPage';
import {useUpdateUser} from './hooks/useUpdateUser';

export interface SignupScreenParams {
  token: string;
  asModal?: boolean;
}

export default function SignupScreen({
  route,
  navigation,
}: ScreenProps<'Signup'>) {
  const setAccessToken = useSetAtom(accessTokenAtom);
  const {setUserInfo} = useMe();
  const {formValue, updateField, formState, submit} = useUpdateUser({
    accessToken: route.params.token,
  });

  useEffect(() => {
    updateField('nickname', '');
    updateField('email', '');
    updateField('birthYear', '');
    updateField('mobilityTools', []);
    updateField('isNewsLetterSubscriptionAgreed', false);
  }, []);

  const [progress, setProgress] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFirstPage = progress === 50;
  const isFirstFormValid =
    formValue.nickname !== '' &&
    formValue.email !== '' &&
    formValue.birthYear !== '' &&
    formState.nickname === 'VALID' &&
    formState.email === 'VALID' &&
    formState.birthYear === 'VALID';

  useBackHandler(() => {
    if (isFirstPage) {
      return false;
    } else {
      setProgress(50);
    }
    return true;
  });

  const onPressSubmit = async () => {
    if (isFirstPage && isFirstFormValid) {
      setProgress(100);
    } else {
      signup();
    }
  };

  async function signup() {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const accessToken = route.params.token;
      const user = await submit();
      // 회원 정보 업데이트 후, 기기에 토큰을 저장한다.
      setAccessToken(accessToken);
      await setUserInfo(user);

      ToastUtils.show('회원가입이 완료되었습니다.');
      if (route.params.asModal) {
        navigation.goBack();
      } else {
        navigation.navigate('Main');
      }
    } catch (e) {
      let msg = '회원가입중 오류가 발생했습니다.';
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as ApiErrorResponse;
        if (data?.msg) {
          msg = data.msg;
        }
      }
      ToastUtils.show(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  const buttonText = isFirstPage ? '다음' : '가입하기';
  const rightLabel = !isFirstPage ? `${formValue.mobilityTools.length} 개` : '';
  const isButtonDisabled = isFirstPage ? !isFirstFormValid : isSubmitting;

  return (
    <ScreenLayout
      isHeaderVisible
      isKeyboardAvoidingView={false}
      safeAreaEdges={['bottom']}>
      <View style={{flex: 1, backgroundColor: color.white}}>
        <View style={{paddingHorizontal: 20}}>
          <ProgressViewer progress={progress} />
        </View>
        <ScrollView style={{backgroundColor: color.white}}>
          {isFirstPage ? (
            <SignupFirstPage
              formValue={formValue}
              formState={formState}
              updateField={updateField}
            />
          ) : (
            <SignupSecondPage
              formValue={formValue}
              updateField={updateField}
              onSubmit={signup}
            />
          )}
        </ScrollView>
        <View
          style={{
            width: '100%',
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: color.white,
          }}>
          <SccButton
            onPress={onPressSubmit}
            buttonColor="blue50"
            borderColor="blue50"
            textColor="white"
            fontFamily={font.pretendardBold}
            text={buttonText}
            isDisabled={isButtonDisabled}
            rightLabel={rightLabel}
            elementName="signup_submit"
          />
        </View>
      </View>
    </ScreenLayout>
  );
}
