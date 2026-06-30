import {useBackHandler} from '@react-native-community/hooks';
import axios from 'axios';
import {useSetAtom} from 'jotai';
import React, {useCallback, useEffect, useState} from 'react';
import {Keyboard, ScrollView, Text, TextInput, View} from 'react-native';

import {accessTokenAtom, useMe} from '@/atoms/Auth';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {SccTouchableWithoutFeedback} from '@/components/SccTouchableWithoutFeedback';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ApiErrorResponse} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {useKeyboardVisible} from '@/hooks/useKeyboardVisible';
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
  const isKeyboardVisible = useKeyboardVisible();

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
            elementName: 'signup_step1_next',
          };
        }
        if (isCodeInputStep) {
          // 인증번호 입력 단계: 하단 버튼 = 인증번호 확인
          return {
            text: '인증번호 확인',
            disabled: !isVerifyButtonActive,
            onPress: () => verifyHandlerRef.current?.(),
            rightLabel: '',
            elementName: 'signup_phone_verify',
          };
        }
        // 전화번호 입력 단계: 버튼 숨김(아직 인증 시작 전)
        return {
          text: '',
          disabled: true,
          onPress: () => {},
          rightLabel: '',
          elementName: 'signup_phone_verify',
          hidden: true,
        };
      case 2:
        // step2 = 기본정보
        return {
          text: '다음',
          disabled: !isFirstFormValid,
          onPress: () => setStep(3),
          rightLabel: '',
          elementName: 'signup_step2_next',
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
          elementName: 'signup_step3_submit',
        };
      default:
        return {
          text: '',
          disabled: true,
          onPress: () => {},
          rightLabel: '',
          elementName: 'signup_submit',
        };
    }
  };

  const buttonConfig = getButtonConfig() as ReturnType<
    typeof getButtonConfig
  > & {hidden?: boolean; elementName: string};

  const scrollViewRef = React.useRef<ScrollView>(null);
  const scrollOffsetRef = React.useRef(0);
  // 키보드 위 도킹 푸터/컨테이너 배경색 (버튼과 동일 → 키보드 코너 radius 틈도 같은 색으로 채움)
  const footerBg = buttonConfig.disabled
    ? isKeyboardVisible
      ? '#E3E4E8'
      : color.gray15v2
    : color.brand40;

  // 포커스된 input의 하단+GAP이 뷰포트 밖일 때'만', 부족한 만큼'만' 스크롤한다.
  // KAV가 스크롤뷰를 키보드 위로 줄여주므로 뷰포트 높이(sh)만으로 판정 — 키보드 좌표 계산 불필요.
  const GAP = 60;
  const ensureFocusedInputVisible = useCallback(() => {
    type Measurable = {
      measureInWindow: (
        cb: (x: number, y: number, w: number, h: number) => void,
      ) => void;
    };
    const scrollNode = (
      scrollViewRef.current as unknown as {
        getNativeScrollRef?: () => Measurable | null;
      } | null
    )?.getNativeScrollRef?.();
    const input = TextInput.State.currentlyFocusedInput() as Measurable | null;
    if (!scrollNode || !input) return;
    scrollNode.measureInWindow((_sx, sy, _sw, sh) => {
      input.measureInWindow((_ix, iy, _iw, ih) => {
        const topRel = iy - sy;
        const bottomRel = iy + ih - sy;
        let delta = 0;
        if (bottomRel + GAP > sh) {
          delta = bottomRel + GAP - sh; // 아래로 부족한 만큼만 내림
        } else if (topRel < 0) {
          delta = topRel; // 위로 가려졌으면 그만큼만 올림
        }
        if (Math.abs(delta) > 1) {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, scrollOffsetRef.current + delta),
            animated: true,
          });
        }
      });
    });
  }, []);

  // 키보드가 완전히 올라온 뒤(레이아웃 안정) 한 번, 그리고 input 포커스 전환 시(아래 onInputFocus)에 보정.
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () =>
      ensureFocusedInputVisible(),
    );
    return () => sub.remove();
  }, [ensureFocusedInputVisible]);

  // 스텝 전환 시 스크롤 최상단으로 리셋
  useEffect(() => {
    scrollViewRef.current?.scrollTo({y: 0, animated: false});
  }, [step]);

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
          onInputFocus={ensureFocusedInputVisible}
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
        <ScrollView
          ref={scrollViewRef}
          className="bg-white"
          contentContainerStyle={{paddingBottom: 40}}
          scrollEventThrottle={16}
          // 회원가입 화면에 한해: 키보드가 떠 있어도 버튼/input 첫 탭이 즉시 동작.
          // (안드로이드는 'handled'로는 첫 탭이 씹혀 'always' 불가피)
          keyboardShouldPersistTaps="always"
          // 'always'라 빈 영역 탭으로는 안 닫히므로 닫기 수단을 따로 제공:
          // 스와이프 다운(on-drag) + 아래 SccTouchableWithoutFeedback(빈 영역 탭).
          keyboardDismissMode="on-drag"
          onScroll={e => {
            scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
          }}>
          <SccTouchableWithoutFeedback
            elementName="signup_background_dismiss_keyboard"
            disableLogging
            accessible={false}>
            <View>{renderPages()}</View>
          </SccTouchableWithoutFeedback>
        </ScrollView>
        {!buttonConfig.hidden && (
          // 키보드 떴을 때: 풀폭 플랫 바(좌우여백/라운드 없이 키보드 위 도킹).
          // 내렸을 때: 좌우 20 여백 + rounded-8 플로팅 버튼. (Figma 2439-34293/33927)
          <View
            style={
              isKeyboardVisible
                ? {backgroundColor: footerBg}
                : {
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    backgroundColor: color.white,
                  }
            }>
            <SccTouchableOpacity
              elementName={buttonConfig.elementName}
              logParams={{button_text: buttonConfig.text}}
              onPress={buttonConfig.disabled ? () => {} : buttonConfig.onPress}
              disabled={buttonConfig.disabled}
              style={{
                height: 56,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: isKeyboardVisible ? 0 : 8,
                backgroundColor: footerBg,
              }}>
              <Text
                style={{
                  fontFamily: font.pretendardSemibold,
                  fontSize: 18,
                  lineHeight: 26,
                  letterSpacing: -0.36,
                  color: buttonConfig.disabled
                    ? isKeyboardVisible
                      ? color.gray40
                      : color.gray30v2
                    : color.white,
                }}>
                {buttonConfig.text}
              </Text>
              {buttonConfig.rightLabel ? (
                <Text
                  style={{
                    position: 'absolute',
                    right: 20,
                    fontFamily: font.pretendardMedium,
                    fontSize: 14,
                    color: buttonConfig.disabled ? color.gray30v2 : color.white,
                  }}>
                  {buttonConfig.rightLabel}
                </Text>
              ) : null}
            </SccTouchableOpacity>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}
