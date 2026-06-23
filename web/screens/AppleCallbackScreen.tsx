import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

// Apple "Sign in with Apple" web flow uses the JS SDK in popup mode
// (usePopup: true, see utils/socialLoginWeb.web.ts). Apple still redirects the
// popup to the registered Return URL (`${origin}/oauth/apple`) after auth, so
// this route exists only to catch that redirect and avoid an SPA unknown-route.
//
// Unlike KakaoCallback, there is NO token exchange here: the opener window's
// `AppleID.auth.signIn()` promise receives the credential directly. This screen
// is just the transient popup content — try to close the popup, otherwise show
// a simple loading state.
export default function AppleCallbackScreen() {
  useEffect(() => {
    try {
      window.close();
    } catch {
      // Some browsers refuse to close windows not opened via script; the popup
      // simply stays on this loading screen until the opener resolves.
    }
  }, []);

  return (
    <Container>
      <ActivityIndicator size="large" color="#007AFF" />
      <LoadingText>로그인 처리 중...</LoadingText>
    </Container>
  );
}

const Container = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
`;

const LoadingText = styled(Text)`
  font-size: 16px;
  color: #333333;
  margin-top: 16px;
`;
