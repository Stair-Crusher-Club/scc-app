import {useBackHandler} from '@react-native-community/hooks';
import axios from 'axios';
import {useSetAtom} from 'jotai';
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';

import {accessTokenAtom, useMe} from '@/atoms/Auth';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccButton} from '@/components/atoms';
import {font} from '@/constant/font';
import {ApiErrorResponse} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ProgressViewer from '@/screens/SignupScreen/components/ProgressViewer';
import ToastUtils from '@/utils/ToastUtils';

import SignupBasicPage from './SignupBasicProfilePage';
import SignupMobilityToolPage from './SignupMobilityToolPage';
import SignupPhonePage from './SignupPhonePage';
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
  const {api} = useAppComponents();
  const setAccessToken = useSetAtom(accessTokenAtom);
  const {setUserInfo} = useMe();

  const [initialNickname, setInitialNickname] = useState<string>('');
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const fetchInitialNickname = async () => {
      try {
        const response = await api.getUserInfoGet({
          headers: {Authorization: `Bearer ${route.params.token}`},
        });
        setInitialNickname(response.data.user.nickname ?? '');
      } catch {
        setInitialNickname('');
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchInitialNickname();
  }, []);

  const {formValue, updateField, formState, submit} = useUpdateUser({
    accessToken: route.params.token,
  });

  useEffect(() => {
    if (!isLoadingUser && initialNickname) {
      updateField('nickname', initialNickname);
    }
  }, [isLoadingUser, initialNickname]);

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

      if (route.params.asModal) {
        navigation.goBack();
      } else {
        navigation.replace('GuideForFirstVisit');
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
        // step1 = 휴대폰 인증
        return {
          text: '다음',
          disabled: !formValue.isPhoneVerified,
          onPress: () => setStep(2),
          rightLabel: '',
        };
      case 2:
        // step2 = 기본정보
        return {
          text: '다음',
          disabled: !isFirstFormValid,
          onPress: () => setStep(3),
          rightLabel: '',
        };
      case 3:
        // step3 = 이동유형
        return {
          text: '가입하기',
          disabled: isSubmitting || formValue.mobilityTools.length === 0,
          onPress: signup,
          rightLabel:
            formValue.mobilityTools.length > 0
              ? `${formValue.mobilityTools.length} 개`
              : '',
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
        // step1 = 휴대폰 인증
        return (
          <SignupPhonePage
            formValue={formValue}
            formState={formState}
            updateField={updateField}
            accessToken={route.params.token}
          />
        );
      case 2:
        // step2 = 기본정보
        return (
          <SignupBasicPage
            formValue={formValue}
            formState={formState}
            updateField={updateField}
            initialNickname={initialNickname}
          />
        );
      case 3:
        // step3 = 이동유형
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
      isKeyboardAvoidingView={true}
      safeAreaEdges={['bottom']}>
      <View className="flex-1 bg-white">
        <View className="px-[20px]">
          <ProgressViewer progress={progress} />
        </View>
        <ScrollView className="bg-white">{renderPage()}</ScrollView>
        <View className="w-full px-[20px] py-[10px] bg-white">
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
