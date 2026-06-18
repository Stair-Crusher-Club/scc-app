import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useAtomValue} from 'jotai';
import {Platform} from 'react-native';

import {isAnonymousUserAtom} from '@/atoms/Auth';
import {ScreenParams} from '@/navigation/Navigation.screens';
import {showAppInstallPrompt} from '@/utils/appInstallPrompt';

export function useCheckAuth() {
  const navigation = useNavigation<NavigationProp<ScreenParams>>();
  const isAnonymousUser = useAtomValue(isAnonymousUserAtom);

  const checkAuth = (
    onAuth: () => void,
    onFailed?: () => void,
    message?: string,
  ) => {
    // 비회원이라면 로그인 페이지를 열고 (웹도 로그인 지원 → 웹/네이티브 공통)
    if (isAnonymousUser) {
      onFailed?.();
      console.log('anonymous user! open login');
      navigation.navigate('Login', {asModal: true});
      return;
    }
    // 웹: 로그인했지만 웹에서 불가능한 앱 전용 기능(message 지정 = 정보 등록/리뷰/
    // 신고 등)은 진입 시도 즉시 앱 설치 유도. 위치 확인 모달/네비게이션까지 가지
    // 않고 버튼 누르자마자 뜬다. (RootScreen 라우트 게이트는 직접 URL 진입 backstop.)
    if (Platform.OS === 'web' && message) {
      onFailed?.();
      showAppInstallPrompt(message);
      return;
    }
    // 회원이라면 주어진 콜백을 실행
    onAuth();
  };

  return checkAuth;
}
