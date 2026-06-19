import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useAtomValue} from 'jotai';
import {Platform} from 'react-native';

import {isAnonymousUserAtom} from '@/atoms/Auth';
import {ScreenParams} from '@/navigation/Navigation.screens';

export function useCheckAuth() {
  const navigation = useNavigation<NavigationProp<ScreenParams>>();
  const isAnonymousUser = useAtomValue(isAnonymousUserAtom);

  // 3번째 인자(message)는 네이티브 호환용 자리. 웹의 앱 전용(카메라 등록 등) 기능
  // 진입은 message 가 아니라 RootScreen 라우트 게이트(APP_ONLY 라우트 진입 시 앱 설치
  // 유도)가 일괄 처리한다. 도움돼요/저장처럼 웹에서 가능한 액션은 그대로 실행한다.
  const checkAuth = (
    onAuth: () => void,
    onFailed?: () => void,
    _message?: string,
  ) => {
    // 비회원이라면 로그인 페이지를 열고 (웹도 로그인 지원 → 웹/네이티브 공통)
    if (isAnonymousUser) {
      onFailed?.();
      console.log('anonymous user! open login');
      // 웹: 카카오 로그인은 풀 페이지 리다이렉트라 모달 네비 스택이 소실된다.
      // 로그인 후 원래 페이지로 돌아오도록 현재 경로를 redirect 로 넘긴다.
      if (Platform.OS === 'web') {
        const loc = (
          globalThis as {location?: {pathname?: string; search?: string}}
        ).location;
        const current = loc
          ? (loc.pathname ?? '') + (loc.search ?? '')
          : undefined;
        navigation.navigate('Login', {asModal: true, redirect: current});
        return;
      }
      navigation.navigate('Login', {asModal: true});
      return;
    }
    // 회원이라면 주어진 콜백을 실행
    onAuth();
  };

  return checkAuth;
}
