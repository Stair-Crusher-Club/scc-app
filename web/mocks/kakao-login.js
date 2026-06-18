// Web mock for @react-native-seoul/kakao-login.
// Native login() opens the KakaoTalk app; on web we redirect to Kakao's OAuth
// authorize endpoint with redirect_uri=/oauth/kakao. KakaoCallbackScreen then
// exchanges the code for tokens. Because the page navigates away, the returned
// promise never resolves (the caller's subsequent code does not run on web).
// 웹 전용 Kakao REST API 키 (네이티브 앱 키 KAKAO_APP_KEY 와 다르다 — REST OAuth
// 의 client_id 로 사용). 환경별로 다르면 KAKAO_REST_API_KEY env 로 override.
const KAKAO_REST_API_KEY =
  process.env.KAKAO_REST_API_KEY || '1ae6e66e491cf3bf3041015e235c08e1';

export const login = () => {
  const origin = window.location.origin;
  const redirectUri = `${origin}/oauth/kakao`;
  // 로그인 후 돌아갈 곳: ?redirect= 가 있으면 그 경로, 없으면 홈('/').
  // (로그인 화면 경로 '/login' 으로 되돌아가지 않도록 — next param 없으면 홈)
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  const dest = redirect && redirect.startsWith('/') ? redirect : '/';
  const state = encodeURIComponent(dest);
  const authorizeUrl =
    'https://kauth.kakao.com/oauth/authorize' +
    `?client_id=${KAKAO_REST_API_KEY}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    '&response_type=code' +
    `&state=${state}`;

  window.location.href = authorizeUrl;

  // Never resolves — the page is navigating away.
  return new Promise(() => {});
};

export const logout = () => Promise.resolve();
export const unlink = () => Promise.resolve();
export const getProfile = () => Promise.reject(new Error('unavailable on web'));

export default {login, logout, unlink, getProfile};
