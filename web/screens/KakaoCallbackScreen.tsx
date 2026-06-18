import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Config from 'react-native-config';
import styled from 'styled-components/native';

import { storage } from '@/atoms/atomForLocal';

import { api, apiConfig } from '../config/api';

export default function KakaoCallbackScreen() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      // Decode the post-login destination from `state`. Never return to the
      // auth screens themselves — fall back to home so login lands on home when
      // there's no explicit next/redirect target.
      let decodedPath = state ? decodeURIComponent(state) : '/';
      if (
        !decodedPath.startsWith('/') ||
        decodedPath === '/login' ||
        decodedPath.startsWith('/login') ||
        decodedPath.startsWith('/signup') ||
        decodedPath.startsWith('/oauth')
      ) {
        decodedPath = '/';
      }
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
            // 웹 전용 Kakao REST API 키 (authorize와 동일해야 함).
            client_id:
              Config.KAKAO_REST_API_KEY ?? '1ae6e66e491cf3bf3041015e235c08e1',
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

        // Store into the app's MMKV-backed storage (scc-token / userInfo) so the
        // real app tree (accessTokenAtom / userInfoAtom) picks it up on reload.
        // Values are JSON-stringified to match atomForLocal's encoding.
        storage.set('scc-token', JSON.stringify(authTokens.accessToken));
        storage.set('userInfo', JSON.stringify(user));
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
