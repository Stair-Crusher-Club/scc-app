import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useAtomValue} from 'jotai';

import {isAnonymousUserAtom} from '@/atoms/Auth';
import {ScreenParams} from '@/navigation/Navigation.screens';

export function useCheckAuth() {
  const navigation = useNavigation<NavigationProp<ScreenParams>>();
  const isAnonymousUser = useAtomValue(isAnonymousUserAtom);

  const checkAuth = async (onAuth: () => void, onFailed?: () => void) => {
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
