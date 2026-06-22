import React from 'react';
import {View, Text} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {SccPressable} from '@/components/SccPressable';

import {getIsInAppWebView} from '../utils/isInAppWebView';
import {getIsLoggedIn, loginWithKakao, logoutFromKakao} from '../utils/kakaoAuth';

interface LoginButtonProps {
  /** 로깅용 위치 식별자 (예: 'list-header', 'detail-header'). */
  location: string;
}

/**
 * 뿌클로드 web 공통 로그인/로그아웃 버튼.
 * - 앱 webview: 토큰 여부와 무관하게 항상 숨김(null).
 * - 웹 + 미로그인: '로그인' → 카카오 OAuth.
 * - 웹 + 로그인: '로그아웃' → 토큰 정리 후 reload.
 *
 * 훅을 쓰지 않으므로 조건부 early-return 이 안전하다(로그인/로그아웃은 풀페이지
 * 전환을 거치므로 마운트 시 1회 상태 읽기로 충분).
 */
export default function LoginButton({location}: LoginButtonProps) {
  if (getIsInAppWebView()) return null;

  const isLoggedIn = getIsLoggedIn();

  const handlePress = async () => {
    if (isLoggedIn) {
      await logoutFromKakao();
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
      return;
    }
    const result = loginWithKakao();
    if (!result.ok && typeof window !== 'undefined') {
      window.alert(result.error ?? '로그인을 시작하지 못했습니다.');
    }
  };

  return (
    <SccPressable
      elementName="bbucle-road-login-button"
      logParams={{location, mode: isLoggedIn ? 'logout' : 'login'}}
      onPress={handlePress}>
      <ButtonBox>
        <ButtonText>{isLoggedIn ? '로그아웃' : '로그인'}</ButtonText>
      </ButtonBox>
    </SccPressable>
  );
}

const ButtonBox = styled(View)`
  border-width: 1px;
  border-color: ${color.black};
  border-radius: 4px;
  padding: 6px 20px;
  align-items: center;
  justify-content: center;
`;

const ButtonText = styled(Text)`
  font-family: Pretendard;
  font-size: 15px;
  font-weight: 600;
  color: ${color.black};
  letter-spacing: -0.3px;
  line-height: 24px;
`;
