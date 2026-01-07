import {useBackHandler} from '@react-native-community/hooks';
import axios from 'axios';
import {useSetAtom} from 'jotai';
import React, {useCallback, useEffect, useState} from 'react';
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

import SignupBasicPage from './SignupBasicProfilePage';
import SignupPhonePage from './SignupPhonePage';
import SignupMobilityToolPage from './SignupMobilityToolPage';
import {useUpdateUser} from './hooks/useUpdateUser';

const TOTAL_STEPS = 3;

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
    updateField('phoneNumber', '');
    updateField('isPhoneVerified', false);
    updateField('mobilityTools', []);
    updateField('isNewsLetterSubscriptionAgreed', false);
  }, []);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  const isFirstFormValid =
    formValue.nickname !== '' &&
    formValue.email !== '' &&
    formValue.birthYear !== '' &&
    formState.nickname === 'VALID' &&
    formState.email === 'VALID' &&
    formState.birthYear === 'VALID';

  const handleBack = useCallback(() => {
    if (step === 1) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
      return;
    }
    setStep(prev => prev - 1);
  }, [step, navigation]);

  // 헤더 백버튼 커스터마이즈
  useEffect(() => {
    navigation.setOptions({onBackPress: handleBack} as any);
    return () => {
      navigation.setOptions({onBackPress: undefined} as any);
    };
  }, [navigation, handleBack]);

  // 안드로이드 하드웨어 백버튼 처리
  useBackHandler(() => {
    handleBack();
    return true;
  }, [handleBack]);

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

  const getButtonConfig = () => {
    switch (step) {
      case 1:
        return {
          text: '다음',
          disabled: !isFirstFormValid,
          onPress: () => setStep(2),
          rightLabel: '',
        };
      case 2:
        return {
          text: '다음',
          disabled: !formValue.isPhoneVerified,
          onPress: () => setStep(3),
          rightLabel: '',
        };
      case 3:
        return {
          text: '가입하기',
          disabled: isSubmitting,
          onPress: signup,
          rightLabel: `${formValue.mobilityTools.length} 개`,
        };
      default:
        return {
          text: '',
          disabled: true,
          onPress: () => {},
          rightLabel: '',
        };
    }
  };

  const buttonConfig = getButtonConfig();

  const renderPage = () => {
    switch (step) {
      case 1:
        return (
          <SignupBasicPage
            formValue={formValue}
            formState={formState}
            updateField={updateField}
          />
        );
      case 2:
        return (
          <SignupPhonePage
            formValue={formValue}
            formState={formState}
            updateField={updateField}
            accessToken={route.params.token}
          />
        );
      case 3:
        return (
          <SignupMobilityToolPage
            formValue={formValue}
            updateField={updateField}
            onSubmit={signup}
          />
        );
      default:
        return null;
    }
  };

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
          {renderPage()}
        </ScrollView>
        <View
          style={{
            width: '100%',
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: color.white,
          }}>
          <SccButton
            onPress={buttonConfig.onPress}
            buttonColor="blue50"
            borderColor="blue50"
            textColor="white"
            fontFamily={font.pretendardBold}
            text={buttonConfig.text}
            isDisabled={buttonConfig.disabled}
            rightLabel={buttonConfig.rightLabel}
            elementName="signup_submit"
          />
        </View>
      </View>
    </ScreenLayout>
  );
}
