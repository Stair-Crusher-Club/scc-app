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
    // 웹: 앱 전용 기능(message가 지정된 액션 = 정보 등록/리뷰/신고 등)은 진입 시도
    // 즉시 앱 설치 유도. 위치 확인 모달/네비게이션까지 가지 않고 버튼 누르자마자 뜬다.
    // (RootScreen의 라우트 게이트는 직접 URL 진입에 대한 backstop으로 유지.)
    if (Platform.OS === 'web' && message) {
      onFailed?.();
      showAppInstallPrompt(message);
      return;
    }
    // 비회원이라면 로그인 페이지를 열고
    if (isAnonymousUser) {
      onFailed?.();
      console.log('anonymous user! open login');
      navigation.navigate('Login', {asModal: true});
    }
    // 회원이라면 주어진 콜백을 실행
    else onAuth();
  };

  return checkAuth;
}
