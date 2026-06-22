// Web mock for @react-native-seoul/kakao-login.
// 네이티브 login()은 카카오톡 앱을 열지만, 웹에서는 Kakao JS SDK 의
// Kakao.Auth.authorize 로 OAuth Authorization Code 플로우를 시작한다.
//
// 왜 JS SDK 인가: 수동 REST authorize URL(client_id=REST키) 방식은 client_id 로
// 들어간 카카오 앱과 백엔드가 기대하는 카카오 앱(prod)이 달라 "audience does not
// match"(aud 불일치)를 냈다. JS SDK 는 setupWebShims 에서 환경별 JavaScript 키
// (process.env.KAKAO_JS_KEY)로 init 되고, 그 키(=해당 환경의 카카오 앱)로 authorize
// 하므로 백엔드와 aud 가 일치한다. JS 키의 사이트 도메인(허용 호스트)에
// web.staircrusher.club 이 등록돼 있어야 한다.
//
// 코드 교환은 redirect_uri(/oauth/kakao)로 돌아온 뒤 KakaoCallbackScreen 이 백엔드를
// 통해 수행한다. 페이지가 떠나므로 반환 Promise 는 resolve 되지 않는다(웹에선 caller
// 의 후속 코드가 실행되지 않음).
//
// 주의: redirect_uri(https://<도메인>/oauth/kakao)가 카카오 앱의 [카카오 로그인 >
// Redirect URI] 에 등록돼 있어야 authorize 가 성공한다.
export const login = () => {
  const origin = window.location.origin;
  const redirectUri = `${origin}/oauth/kakao`;
  // 로그인 후 돌아갈 곳 결정 (우선순위):
  //   1) ?redirect= 쿼리 (checkAuth / 라우트 게이트가 원래 경로를 넘김)
  //   2) 현재 경로 (모달 로그인이 URL 을 /login 으로 안 바꾼 경우 — 사용자가 있던 페이지)
  //   3) 홈('/')
  // 단, 인증 경로(/login·/signup·/oauth)로는 절대 되돌아가지 않는다.
  const isAuthPath = p =>
    p.startsWith('/login') ||
    p.startsWith('/signup') ||
    p.startsWith('/oauth');
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  const currentPath = window.location.pathname + window.location.search;
  let dest = '/';
  if (redirect && redirect.startsWith('/') && !isAuthPath(redirect)) {
    dest = redirect;
  } else if (currentPath.startsWith('/') && !isAuthPath(currentPath)) {
    dest = currentPath;
  }
  const state = encodeURIComponent(dest);

  const Kakao = globalThis.Kakao;
  if (Kakao && Kakao.Auth && typeof Kakao.Auth.authorize === 'function') {
    // JS SDK: init 된 JavaScript 키를 client_id 로 사용 (환경별).
    Kakao.Auth.authorize({redirectUri, state});
  } else {
    // SDK 미로딩 폴백: 수동 authorize URL (JS 키를 client_id 로).
    // 하드코딩 폴백 금지 — 빌드 시 webpack 이 KAKAO_JS_KEY 존재를 검증한다.
    const key = process.env.KAKAO_JS_KEY;
    window.location.href =
      'https://kauth.kakao.com/oauth/authorize' +
      `?client_id=${key}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      '&response_type=code' +
      `&state=${state}`;
  }

  // Never resolves — the page is navigating away.
  return new Promise(() => {});
};

export const logout = () => Promise.resolve();
export const unlink = () => Promise.resolve();
export const getProfile = () => Promise.reject(new Error('unavailable on web'));

export default {login, logout, unlink, getProfile};
