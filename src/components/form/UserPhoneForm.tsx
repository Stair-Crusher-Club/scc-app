import React, {useCallback, useEffect, useRef, useState} from 'react';
import {TextInput} from 'react-native';
import styled from 'styled-components/native';
import {match} from 'ts-pattern';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import useAppComponents from '@/hooks/useAppComponents';
import SignupBoxInput from '@/screens/SignupScreen/components/SignupBoxInput';
import {FormState} from '@/screens/SignupScreen/hooks/useUpdateUser';
import ToastUtils from '@/utils/ToastUtils';

type VerificationStep = 'INPUT_PHONE' | 'INPUT_CODE';
type VerificationStatus = 'IDLE' | 'VERIFYING' | 'SUCCESS' | 'ERROR';

interface UserPhoneFormProps {
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  onVerificationComplete: () => void;
  onVerifyReset?: () => void;
  onCodeInputStepChange?: (isCodeInputStep: boolean) => void;
  onVerifyActiveChange?: (isActive: boolean) => void;
  onVerifyRequest?: (handler: () => void) => void;
  accessToken?: string;
}

const TIMER_DURATION = 180; // 3분

export default function UserPhoneForm({
  phoneNumber,
  onPhoneNumberChange,
  onVerificationComplete,
  onVerifyReset,
  onCodeInputStepChange,
  onVerifyActiveChange,
  onVerifyRequest,
  accessToken,
}: UserPhoneFormProps) {
  const {api} = useAppComponents();

  const [step, setStep] = useState<VerificationStep>('INPUT_PHONE');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>('IDLE');
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
  const [token, setToken] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const phoneInputRef = useRef<TextInput>(null);
  const codeInputRef = useRef<TextInput>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 타이머 포맷 (m:ss)
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 타이머 시작
  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimeRemaining(TIMER_DURATION);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // 타이머 만료 시 정리
  useEffect(() => {
    if (timeRemaining === 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [timeRemaining]);

  // 전화번호 입력 (숫자만). 인증번호 요청/완료 후 번호를 수정하면 인증을 처음부터 초기화한다.
  const handlePhoneNumberChange = useCallback(
    (text: string) => {
      const numbersOnly = text.replace(/[^0-9]/g, '');
      onPhoneNumberChange(numbersOnly);
      if (step === 'INPUT_CODE') {
        setStep('INPUT_PHONE');
        setVerificationCode('');
        setVerificationStatus('IDLE');
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // 이미 인증 완료된 번호를 수정한 경우 → 부모의 인증 완료 플래그도 해제
        onVerifyReset?.();
      }
    },
    [onPhoneNumberChange, step, onVerifyReset],
  );

  // 인증번호 입력 (숫자만)
  const handleCodeChange = useCallback((text: string) => {
    const numbersOnly = text.replace(/[^0-9]/g, '');
    setVerificationCode(numbersOnly);
    setVerificationStatus('IDLE');
  }, []);

  // 인증번호 요청
  const handleRequestCode = useCallback(async () => {
    if (isRequesting) {
      return;
    }

    setIsRequesting(true);
    try {
      const response = await api.sendPhoneNumberVerifCodeSmsPost(
        {phoneNumber},
        {
          headers: {
            ...(accessToken && {Authorization: `Bearer ${accessToken}`}),
          },
        },
      );

      setToken(response.data.token);
      setStep('INPUT_CODE');
      setVerificationCode('');
      setVerificationStatus('IDLE');
      startTimer();

      // 인증번호 입력 필드로 포커스 이동
      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 100);
    } catch {
      ToastUtils.show('인증번호 발송에 실패했습니다.');
    } finally {
      setIsRequesting(false);
    }
  }, [api, phoneNumber, startTimer, isRequesting, accessToken]);

  // 인증번호 확인
  const handleVerifyCode = useCallback(async () => {
    setVerificationStatus('VERIFYING');

    try {
      await api.updatePhoneNumberWithVerifCodePost(
        {
          phoneNumber,
          verifCode: verificationCode,
          token,
        },
        {
          headers: {
            ...(accessToken && {Authorization: `Bearer ${accessToken}`}),
          },
        },
      );

      setVerificationStatus('SUCCESS');

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      onVerificationComplete();
    } catch {
      setVerificationStatus('ERROR');
    }
  }, [
    api,
    phoneNumber,
    verificationCode,
    token,
    onVerificationComplete,
    accessToken,
  ]);

  const isPhoneValid = phoneNumber.length >= 10;
  const isCodeValid = verificationCode.length >= 4;
  const isTimerExpired = timeRemaining === 0;

  // step 변경 알림
  useEffect(() => {
    onCodeInputStepChange?.(step === 'INPUT_CODE');
  }, [step, onCodeInputStepChange]);

  // 전화번호 입력 상태 (인증번호 전송 후 → VALID로 표시)
  const phoneInputState: FormState | undefined =
    step === 'INPUT_CODE' ? 'VALID' : undefined;

  // 인증번호 입력 상태
  const codeInputState: FormState | undefined = match(verificationStatus)
    .with(
      'ERROR',
      () => ({errorMessage: '인증번호가 잘못되었습니다.'}) as const,
    )
    .with('SUCCESS', () => 'VALID' as const)
    .otherwise(() => undefined);

  // 인증번호 캡션
  const getCodeCaption = () => {
    if (verificationStatus === 'ERROR') {
      return '인증번호가 잘못되었습니다.';
    }
    if (verificationStatus === 'SUCCESS') {
      return '인증이 완료되었습니다';
    }
    if (isTimerExpired && verificationStatus === 'IDLE') {
      return '인증 시간이 만료되었습니다. 다시 요청해주세요.';
    }
    return undefined;
  };

  const getCodeCaptionColor = () => {
    if (verificationStatus === 'ERROR') return color.red;
    if (verificationStatus === 'SUCCESS') return color.brand40;
    return color.gray50v2;
  };

  const isRequestButtonActive = isPhoneValid && !isRequesting;
  const isVerifyButtonActive =
    isCodeValid &&
    !isTimerExpired &&
    verificationStatus !== 'VERIFYING' &&
    verificationStatus !== 'SUCCESS';

  // 인증 버튼 활성 상태 알림
  useEffect(() => {
    onVerifyActiveChange?.(isVerifyButtonActive);
  }, [isVerifyButtonActive, onVerifyActiveChange]);

  // 인증번호 확인 핸들러 등록
  useEffect(() => {
    onVerifyRequest?.(handleVerifyCode);
  }, [handleVerifyCode, onVerifyRequest]);

  return (
    <Container>
      {/* 전화번호 입력 */}
      <PhoneSection>
        <PhoneLabelRow>
          <FieldLabelText>휴대전화번호</FieldLabelText>
          <RequiredMark> *</RequiredMark>
        </PhoneLabelRow>

        {/* 전화번호 박스 입력 (label은 위에서 직접 그림) */}
        <SignupBoxInput
          ref={phoneInputRef}
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          placeholder="'-' 없이 입력해주세요"
          keyboardType="number-pad"
          state={phoneInputState}
        />

        {/* 인증번호 다시 받기 (INPUT_CODE 상태) — 오른쪽 정렬 텍스트 링크 */}
        {step === 'INPUT_CODE' && (
          <ResendButtonRow>
            <SccTouchableOpacity
              elementName="phone_verification_resend"
              onPress={handleRequestCode}
              disabled={isRequesting}>
              <ResendButtonText>인증번호 다시 받기</ResendButtonText>
            </SccTouchableOpacity>
          </ResendButtonRow>
        )}
      </PhoneSection>

      {/* 인증번호 입력 (인증번호 요청 후 표시) */}
      {step === 'INPUT_CODE' && (
        <CodeSection>
          <SignupBoxInput
            ref={codeInputRef}
            value={verificationCode}
            onChangeText={handleCodeChange}
            placeholder="인증번호를 입력해주세요"
            keyboardType="number-pad"
            editable={
              verificationStatus !== 'SUCCESS' &&
              verificationStatus !== 'VERIFYING'
            }
            state={codeInputState}
            timer={
              verificationStatus === 'SUCCESS'
                ? undefined
                : formatTime(timeRemaining)
            }
            caption={getCodeCaption()}
            captionColor={getCodeCaptionColor()}
          />
        </CodeSection>
      )}

      {/* 인증번호 받기 — 풀폭 버튼 (INPUT_PHONE 상태에서만) */}
      {step === 'INPUT_PHONE' && (
        <ActionButton
          elementName="phone_verification_request"
          onPress={handleRequestCode}
          disabled={!isRequestButtonActive}
          isActive={isRequestButtonActive}>
          <ActionButtonText isActive={isRequestButtonActive}>
            {isRequesting ? '발송중...' : '인증번호 받기'}
          </ActionButtonText>
        </ActionButton>
      )}
    </Container>
  );
}

const Container = styled.View`
  padding-horizontal: 20px;
  gap: 12px;
`;

const PhoneSection = styled.View`
  gap: 8px;
`;

const PhoneLabelRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding-left: 6px;
`;

const FieldLabelText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.gray80v2};
`;

const RequiredMark = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 18px;
  color: ${color.red};
`;

const ResendButtonRow = styled.View`
  align-items: flex-end;
`;

const ResendButtonText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.gray50v2};
  text-decoration-line: underline;
`;

const CodeSection = styled.View`
  gap: 12px;
`;

const ActionButton = styled(SccTouchableOpacity)<{
  disabled?: boolean;
  isActive: boolean;
}>`
  height: 56px;
  width: 100%;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background-color: ${props =>
    props.isActive ? color.brand40 : color.gray15v2};
`;

const ActionButtonText = styled.Text<{isActive: boolean}>`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${props => (props.isActive ? color.white : color.gray30v2)};
`;
