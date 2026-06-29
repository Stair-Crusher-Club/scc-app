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
    enforceBirthYearRange: true,
  });

  // 닉네임 pre-fill은 최초 1회만. 사용자가 X로 지우면 다시 채우지 않는다.
  const hasPrefilledRef = React.useRef(false);
  useEffect(() => {
    if (!isLoadingUser && initialNickname && !hasPrefilledRef.current) {
      hasPrefilledRef.current = true;
      updateField('nickname', initialNickname);
    }
  }, [isLoadingUser, initialNickname]);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // step1 휴대폰 인증 상태 — UserPhoneForm에서 올라옴
  const [isCodeInputStep, setIsCodeInputStep] = useState(false);
  const [isVerifyButtonActive, setIsVerifyButtonActive] = useState(false);
  const verifyHandlerRef = React.useRef<(() => void) | null>(null);

  // 인증이 막 완료된 순간(false→true 전이)에만 자동으로 step2 전환.
  // 이미 인증된 채로 step1에 돌아온 경우는 자동 전환하지 않고, 하단 "다음" 버튼으로 진행한다.
  const prevVerifiedRef = React.useRef(false);
  useEffect(() => {
    if (formValue.isPhoneVerified && !prevVerifiedRef.current && step === 1) {
      setStep(2);
    }
    prevVerifiedRef.current = formValue.isPhoneVerified;
  }, [formValue.isPhoneVerified, step]);

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
        if (formValue.isPhoneVerified) {
          // 인증 완료: 하단 버튼 = 다음 (재진입 시에도 진행 가능)
          return {
            text: '다음',
            disabled: false,
            onPress: () => setStep(2),
            rightLabel: '',
          };
        }
        if (isCodeInputStep) {
          // 인증번호 입력 단계: 하단 버튼 = 인증번호 확인
          return {
            text: '인증번호 확인',
            disabled: !isVerifyButtonActive,
            onPress: () => verifyHandlerRef.current?.(),
            rightLabel: '',
          };
        }
        // 전화번호 입력 단계: 버튼 숨김(아직 인증 시작 전)
        return {
          text: '',
          disabled: true,
          onPress: () => {},
          rightLabel: '',
          hidden: true,
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

  const buttonConfig = getButtonConfig() as ReturnType<
    typeof getButtonConfig
  > & {hidden?: boolean};

  // step1(휴대폰 인증)은 항상 마운트해두고 비활성 시 display:none으로 숨긴다.
  // → step2/3로 갔다가 돌아와도 인증 완료 UI 상태(인증번호 입력/성공)가 그대로 보존된다.
  const renderPages = () => (
    <>
      <View style={{display: step === 1 ? 'flex' : 'none'}}>
        <SignupPhonePage
          formValue={formValue}
          formState={formState}
          updateField={updateField}
          accessToken={route.params.token}
          onCodeInputStepChange={setIsCodeInputStep}
          onVerifyActiveChange={setIsVerifyButtonActive}
          onVerifyReset={() => updateField('isPhoneVerified', false)}
          onVerifyRequest={handler => {
            verifyHandlerRef.current = handler;
          }}
        />
      </View>
      {step === 2 && (
        <SignupBasicPage
          formValue={formValue}
          formState={formState}
          updateField={updateField}
        />
      )}
      {step === 3 && (
        <SignupMobilityToolPage
          formValue={formValue}
          updateField={updateField}
          onSubmit={signup}
        />
      )}
    </>
  );

  return (
    <ScreenLayout
      isHeaderVisible
      isKeyboardAvoidingView={true}
      safeAreaEdges={['bottom']}>
      <View className="flex-1 bg-white">
        <View className="px-[20px]">
          <ProgressViewer progress={progress} />
        </View>
        <ScrollView className="bg-white">{renderPages()}</ScrollView>
        {!buttonConfig.hidden && (
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
        )}
      </View>
    </ScreenLayout>
  );
}
