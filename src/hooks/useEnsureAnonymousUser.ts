import {useSetAtom} from 'jotai';

import {accessTokenAtom, ANONYMOUS_USER_TEMPLATE, useMe} from '@/atoms/Auth';
import {User} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';

/**
 * 익명(비회원) 계정을 발행해 토큰/유저정보를 세팅한다.
 * LoginScreen "비회원 둘러보기"와 web 전역 무로그인 부트스트랩(App.tsx)이 공유한다.
 */
export function useEnsureAnonymousUser() {
  const {api} = useAppComponents();
  const setAccessToken = useSetAtom(accessTokenAtom);
  const {setUserInfo} = useMe();

  return async () => {
    const res = await api.createAnonymousUserPost();
    const {authTokens, userId} = res.data;
    const anonymousUser: User = {
      ...ANONYMOUS_USER_TEMPLATE,
      id: userId, // createAnonymousUser 완료 시 이미 채번된 userId
    };
    setAccessToken(authTokens.accessToken);
    await setUserInfo(anonymousUser);
    return authTokens.accessToken;
  };
}
