import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import { api, apiConfig } from '../config/api';

export default function KakaoCallbackScreen() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      // Decode nextUrl from state parameter and make it absolute
      const decodedPath = state ? decodeURIComponent(state) : '/';
      const nextUrl = window.location.origin + decodedPath;

      if (!code) {
        setError('인증 코드가 없습니다.');
        setTimeout(() => {
          window.location.href = nextUrl;
        }, 2000);
        return;
      }

      try {
        // Exchange code for tokens using Kakao REST API
        const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: '1ae6e66e491cf3bf3041015e235c08e1',
            redirect_uri: window.location.origin + '/oauth/kakao',
            code: code,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Token exchange failed');
        }

        const kakaoTokens = await tokenResponse.json();
        const now = Date.now();
        const accessTokenExpiresAt = now + kakaoTokens.expires_in * 1000;
        const refreshTokenExpiresAt = now + (kakaoTokens.refresh_token_expires_in || 5184000) * 1000;

        // Call backend login API
        const response = await api.loginWithKakaoPost({
          kakaoTokens: {
            accessToken: kakaoTokens.access_token,
            refreshToken: kakaoTokens.refresh_token || '',
            idToken: kakaoTokens.id_token || '',
            accessTokenExpiresAt: { value: accessTokenExpiresAt },
            refreshTokenExpiresAt: { value: refreshTokenExpiresAt },
          },
        });

        const { authTokens, user } = response.data;

        // Store tokens
        window.localStorage.setItem('sccAccessToken', authTokens.accessToken);
        window.localStorage.setItem('sccUserName', user.nickname || user.email || '사용자');
        apiConfig.accessToken = authTokens.accessToken;

        console.log('Kakao login successful, redirecting to:', nextUrl);

        // Redirect to original page
        window.location.href = nextUrl;
      } catch (err) {
        console.error('OAuth callback handling failed:', err);
        setError('로그인 처리 중 오류가 발생했습니다.');
        setTimeout(() => {
          window.location.href = nextUrl;
        }, 2000);
      }
    };

    handleOAuthCallback();
  }, []);

  return (
    <Container>
      {error ? (
        <>
          <ErrorText>{error}</ErrorText>
          <SubText>잠시 후 이전 페이지로 이동합니다...</SubText>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color="#007AFF" />
          <LoadingText>카카오 로그인 처리 중...</LoadingText>
        </>
      )}
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

const ErrorText = styled(Text)`
  font-size: 16px;
  color: #dc3545;
  margin-bottom: 8px;
`;

const SubText = styled(Text)`
  font-size: 14px;
  color: #666666;
`;
