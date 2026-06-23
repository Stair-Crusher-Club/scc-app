/**
 * 뿌클로드 web 의 카카오 로그인/로그아웃 공통 로직.
 *
 * 로그인은 redirect 기반 OAuth — authorize 로 카카오로 이동했다가 `/oauth/kakao`
 * 콜백(KakaoCallbackScreen)이 토큰을 교환/저장하고 원래 경로로 풀리로드한다.
 * 따라서 로그인/로그아웃 모두 풀페이지 전환을 거치므로, 로그인 상태는 마운트 시
 * 1회 읽기로 충분하다.
 */

import {storage, getStorageValue} from '@/atoms/atomForLocal';
import {ANONYMOUS_USER_TEMPLATE} from '@/atoms/Auth';
import {User} from '@/generated-sources/openapi';

import {apiConfig} from '../config/api';

// Kakao JS SDK v2 (web/index.html 에서 로드, setupWebShims 에서 init).
declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (appKey: string) => void;
      Auth: {
        authorize: (options: {
          redirectUri: string;
          scope?: string;
          state?: string;
        }) => void;
        setAccessToken: (token: string) => void;
        getAccessToken: () => string | null;
        logout: () => Promise<void>;
      };
    };
  }
}

/** scc-app 메인 앱 로그인 토큰 키. 카카오 콜백이 기록하는 실제 유저 토큰. */
const REAL_TOKEN_KEY = 'scc-token';

/**
 * "실제 로그인"(카카오/애플로 식별된 IDENTIFIED 유저) 여부.
 *
 * 토큰 존재만으로는 부족하다 — 익명(비회원) 유저도 토큰을 갖는다:
 * - 뿌클로드 상세의 익명 플로우: localStorage `anonymousAccessToken`
 * - 메인 앱 게스트 로그인(LoginScreen.guestLogin): 익명 토큰을 `scc-token`(MMKV)에
 *   저장하고 userInfo 를 ANONYMOUS_USER_TEMPLATE(닉네임 '비회원')로 기록한다.
 *
 * 따라서 `scc-token` 존재만 보면 익명 게스트를 로그인으로 오인한다. 식별 여부는
 * userInfo 가 익명 템플릿(id '0' 또는 닉네임 '비회원')이 아닌지로 판정한다
 * (앱의 isAnonymousUserAtom 과 동일 기준).
 * legacy sccAccessToken(EditSidebar 실제 로그인)은 그대로 로그인으로 친다.
 */
export function getIsLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.localStorage.getItem('sccAccessToken')) return true;
  if (!getStorageValue<string>(REAL_TOKEN_KEY)) return false;
  const userInfo = getStorageValue<User>('userInfo');
  if (!userInfo) return false;
  return (
    userInfo.id !== '0' &&
    userInfo.nickname !== ANONYMOUS_USER_TEMPLATE.nickname
  );
}

export interface KakaoLoginResult {
  ok: boolean;
  error?: string;
}

/**
 * 카카오 OAuth authorize 로 이동한다(현재 경로를 state 로 전달).
 * 성공 시 페이지를 떠나므로 반환되지 않는다; SDK 미초기화 시 ok=false 로 즉시 반환.
 */
export function loginWithKakao(): KakaoLoginResult {
  if (typeof window === 'undefined') return {ok: false, error: 'no window'};
  if (!window.Kakao?.isInitialized()) {
    return {ok: false, error: '카카오 로그인을 초기화하지 못했습니다.'};
  }
  const nextUrl = window.location.pathname + window.location.search;
  window.Kakao.Auth.authorize({
    redirectUri: window.location.origin + '/oauth/kakao',
    state: encodeURIComponent(nextUrl),
  });
  return {ok: true};
}

/**
 * 로컬 토큰을 정리하고 카카오 세션을 로그아웃한다.
 * 익명 토큰(anonymousAccessToken)은 유지 — 로그아웃 후에도 좋아요 등 익명 기능이 동작.
 * 화면 갱신(reload 등)은 호출부 책임.
 */
export async function logoutFromKakao(): Promise<void> {
  if (typeof window === 'undefined') return;
  storage.delete(REAL_TOKEN_KEY);
  storage.delete('userInfo');
  window.localStorage.removeItem('sccAccessToken');
  window.localStorage.removeItem('sccUserName');
  window.localStorage.removeItem('bbucleRoadUserId');
  apiConfig.accessToken = undefined;
  try {
    if (window.Kakao?.Auth?.getAccessToken()) {
      await window.Kakao.Auth.logout();
    }
  } catch (_e) {
    // 토큰은 이미 로컬에서 제거됨 — 카카오 세션 정리는 best-effort.
  }
}
