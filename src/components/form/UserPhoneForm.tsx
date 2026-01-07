import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, TextInput} from 'react-native';
import styled from 'styled-components/native';
import {match} from 'ts-pattern';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
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

  return (
    <Container>
      {/* 전화번호 입력 */}
      <InputRow>
        <InputWrapper
          isFocused={step === 'INPUT_PHONE'}
          isValid={step === 'INPUT_CODE' ? true : undefined}>
          <TextInput
            ref={phoneInputRef}
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            placeholder="전화번호를 입력해주세요"
            placeholderTextColor={color.gray50}
            keyboardType="number-pad"
            editable={step === 'INPUT_PHONE'}
            style={[
              styles.textInput,
              step === 'INPUT_CODE' && styles.readOnlyInput,
            ]}
          />
        </InputWrapper>
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
            <CodeInputWrapper
              isFocused={true}
              isValid={match(verificationStatus)
                .with('ERROR', () => false)
                .with('SUCCESS', () => true)
                .otherwise(() => undefined)}>
              <TextInput
                ref={codeInputRef}
                value={verificationCode}
                onChangeText={handleCodeChange}
                placeholder="인증번호를 입력해주세요"
                placeholderTextColor={color.gray50}
                keyboardType="number-pad"
                editable={
                  verificationStatus !== 'SUCCESS' &&
                  verificationStatus !== 'VERIFYING'
                }
                style={styles.textInput}
              />
              <TimerText hasValue={verificationCode.length > 0}>
                {formatTime(timeRemaining)}
              </TimerText>
            </CodeInputWrapper>
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

          {/* 상태 메시지 */}
          {verificationStatus === 'ERROR' && (
            <MessageText isError={true}>인증번호가 잘못되었습니다.</MessageText>
          )}
          {verificationStatus === 'SUCCESS' && (
            <MessageText isError={false}>인증이 완료되었습니다</MessageText>
          )}
          {isTimerExpired && verificationStatus === 'IDLE' && (
            <MessageText isError={true}>
              인증 시간이 만료되었습니다. 다시 요청해주세요.
            </MessageText>
          )}
        </>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    fontFamily: font.pretendardMedium,
    fontSize: 16,
    color: color.gray100,
    padding: 0,
  },
  readOnlyInput: {
    color: color.gray50,
  },
});

const Container = styled.View`
  padding-horizontal: 20px;
`;

const InputRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 24px;
`;

const CodeInputRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
`;

const InputWrapper = styled.View<{
  isFocused: boolean;
  isValid: boolean | undefined;
}>`
  flex: 1;
  border-bottom-width: 1px;
  border-bottom-color: ${props =>
    match({isFocused: props.isFocused, isValid: props.isValid})
      .with({isFocused: true, isValid: true}, () => color.blue50)
      .with({isFocused: true, isValid: false}, () => color.red)
      .with({isFocused: true, isValid: undefined}, () => color.gray20)
      .otherwise(() => color.gray20)};
  padding-bottom: 8px;
`;

const CodeInputWrapper = styled.View<{
  isFocused: boolean;
  isValid: boolean | undefined;
}>`
  flex: 1;
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: ${props =>
    match(props.isValid)
      .with(true, () => color.blue50)
      .with(false, () => color.red)
      .otherwise(() => color.gray20)};
  padding-bottom: 8px;
`;

const TimerText = styled.Text<{hasValue: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  color: ${props => (props.hasValue ? color.gray50 : color.red)};
  margin-left: 8px;
`;

const RequestButton = styled(SccTouchableOpacity)<{
  disabled?: boolean;
  isActive: boolean;
}>`
  padding-horizontal: 16px;
  padding-vertical: 10px;
  border-radius: 20px;
  border-width: 1px;
  border-color: ${props => (props.isActive ? color.brand40 : color.gray20)};
  background-color: ${color.white};
`;

const RequestButtonText = styled.Text<{isActive: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  color: ${props => (props.isActive ? color.brand40 : color.gray30)};
`;

const VerifyButton = styled(SccTouchableOpacity)<{
  disabled?: boolean;
  isActive: boolean;
}>`
  padding-horizontal: 16px;
  padding-vertical: 10px;
  border-radius: 20px;
  background-color: ${props => (props.isActive ? color.brand40 : color.gray15)};
`;

const VerifyButtonText = styled.Text<{isActive: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  color: ${props => (props.isActive ? color.white : color.gray30)};
`;

const MessageText = styled.Text<{isError: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 12px;
  color: ${props => (props.isError ? color.red : color.brandColor)};
  margin-top: 4px;
`;
