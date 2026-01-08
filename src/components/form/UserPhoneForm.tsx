import React, {useCallback, useEffect, useRef, useState} from 'react';
import {TextInput} from 'react-native';
import styled from 'styled-components/native';
import {match} from 'ts-pattern';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import UnderlineInput, {UnderlineInputState} from '@/components/UnderlineInput';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import useAppComponents from '@/hooks/useAppComponents';
import ToastUtils from '@/utils/ToastUtils';

type VerificationStep = 'INPUT_PHONE' | 'INPUT_CODE';
type VerificationStatus = 'IDLE' | 'VERIFYING' | 'SUCCESS' | 'ERROR';

interface UserPhoneFormProps {
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  onVerificationComplete: () => void;
  accessToken?: string;
}

const TIMER_DURATION = 180; // 3분

export default function UserPhoneForm({
  phoneNumber,
  onPhoneNumberChange,
  onVerificationComplete,
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

  // 전화번호 입력 (숫자만)
  const handlePhoneNumberChange = useCallback(
    (text: string) => {
      const numbersOnly = text.replace(/[^0-9]/g, '');
      onPhoneNumberChange(numbersOnly);
    },
    [onPhoneNumberChange],
  );

  // 인증번호 입력 (숫자만)
  const handleCodeChange = useCallback((text: string) => {
    const numbersOnly = text.replace(/[^0-9]/g, '');
    setVerificationCode(numbersOnly);
    // 입력 시 오류 상태 초기화
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

      // 타이머 정리
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

  // 버튼 텍스트
  const requestButtonText =
    step === 'INPUT_PHONE' ? '인증번호 받기' : '다시받기';

  // 전화번호 입력 상태
  const phoneInputState: UnderlineInputState =
    step === 'INPUT_CODE' ? 'VALID' : undefined;

  // 인증번호 입력 상태
  const codeInputState: UnderlineInputState = match(verificationStatus)
    .with('ERROR', () => 'INVALID' as const)
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

  return (
    <Container>
      {/* 전화번호 입력 */}
      <FieldLabelText>휴대전화번호</FieldLabelText>
      <InputRow>
        <InputFlexWrapper>
          <UnderlineInput
            ref={phoneInputRef}
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            placeholder="'-' 없이 입력해주세요"
            keyboardType="number-pad"
            editable={step === 'INPUT_PHONE'}
            state={phoneInputState}
          />
        </InputFlexWrapper>
        <RequestButton
          elementName="phone_verification_request"
          onPress={handleRequestCode}
          disabled={!isPhoneValid || isRequesting}
          isActive={isPhoneValid && !isRequesting}>
          <RequestButtonText isActive={isPhoneValid && !isRequesting}>
            {isRequesting ? '발송중...' : requestButtonText}
          </RequestButtonText>
        </RequestButton>
      </InputRow>

      {/* 인증번호 입력 (인증번호 요청 후 표시) */}
      {step === 'INPUT_CODE' && (
        <>
          <CodeInputRow>
            <InputFlexWrapper>
              <UnderlineInput
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
                timer={formatTime(timeRemaining)}
              />
            </InputFlexWrapper>
            <VerifyButton
              elementName="phone_verification_confirm"
              onPress={handleVerifyCode}
              disabled={
                !isCodeValid ||
                isTimerExpired ||
                verificationStatus === 'VERIFYING' ||
                verificationStatus === 'SUCCESS'
              }
              isActive={
                isCodeValid &&
                !isTimerExpired &&
                verificationStatus !== 'VERIFYING' &&
                verificationStatus !== 'SUCCESS'
              }>
              <VerifyButtonText
                isActive={
                  isCodeValid &&
                  !isTimerExpired &&
                  verificationStatus !== 'VERIFYING' &&
                  verificationStatus !== 'SUCCESS'
                }>
                인증번호 확인
              </VerifyButtonText>
            </VerifyButton>
          </CodeInputRow>
          {getCodeCaption() && (
            <CaptionText status={verificationStatus}>
              {getCodeCaption()}
            </CaptionText>
          )}
        </>
      )}
    </Container>
  );
}

const Container = styled.View`
  padding-horizontal: 20px;
  padding-bottom: 20px;
`;

const FieldLabelText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 18px;
  color: ${color.gray80};
  margin-bottom: 8px;
`;

const InputRow = styled.View`
  flex-direction: row;
  align-items: flex-end;
  gap: 8px;
`;

const CodeInputRow = styled.View`
  flex-direction: row;
  align-items: flex-end;
  gap: 8px;
  margin-top: 12px;
`;

const InputFlexWrapper = styled.View`
  flex: 1;
`;

const RequestButton = styled(SccTouchableOpacity)<{
  disabled?: boolean;
  isActive: boolean;
}>`
  width: 120px;
  height: 40px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  border-width: 1px;
  border-color: ${props => (props.isActive ? color.brand40 : color.gray20)};
  background-color: ${color.white};
`;

const RequestButtonText = styled.Text<{isActive: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  color: ${props => (props.isActive ? color.brand40 : color.gray25)};
`;

const VerifyButton = styled(SccTouchableOpacity)<{
  disabled?: boolean;
  isActive: boolean;
}>`
  width: 120px;
  height: 40px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  background-color: ${props => (props.isActive ? color.brand40 : color.gray15)};
`;

const VerifyButtonText = styled.Text<{isActive: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  color: ${props => (props.isActive ? color.white : color.gray30)};
`;

const CaptionText = styled.Text<{status: VerificationStatus}>`
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  margin-top: 4px;
  color: ${props =>
    match(props.status)
      .with('ERROR', () => color.red)
      .with('SUCCESS', () => color.brandColor)
      .otherwise(() => color.gray40)};
`;
