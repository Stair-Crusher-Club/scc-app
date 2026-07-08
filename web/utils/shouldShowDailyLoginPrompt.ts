/**
 * 로그인 유도 팝업을 띄우면 안 되는 인증 관련 경로들.
 * 이미 로그인/회원가입/OAuth 콜백 페이지에 있는데 로그인 유도를 띄우면 안 된다.
 * (경로는 src/navigation/linkingConfig.ts 의 Login/Signup/KakaoCallback/AppleCallback 과 일치)
 */
const AUTH_PATH_PREFIXES = ['/login', '/signup', '/oauth/'];

function isAuthPath(pathname: string): boolean {
  return AUTH_PATH_PREFIXES.some(p => pathname.startsWith(p));
}

/**
 * 하루 1회 로그인 유도 팝업 노출 여부의 순수 결정 함수.
 * (부수효과/스토리지/네이티브 모듈 의존 없음 — 단위 테스트 대상.)
 *
 * - sessionStarted=true(이미 열린 세션의 이동)면 무조건 false — 자정 경계여도 안 띄운다.
 * - 인증 페이지(/login, /signup, /oauth/*)면 false — 이미 로그인 중인데 유도할 이유가 없다.
 * - 앱 in-app WebView 면 토큰(익명/식별) 여부와 무관하게 false.
 * - 식별(실제 로그인) 유저면 false.
 * - 그 외엔 오늘 아직 안 띄웠으면(today ≠ lastShownDate) true.
 */
export function shouldShowDailyLoginPrompt(args: {
  inAppWebView: boolean;
  loggedIn: boolean;
  sessionStarted: boolean;
  pathname: string;
  today: string;
  lastShownDate: string | null;
}): boolean {
  if (args.sessionStarted) return false;
  if (isAuthPath(args.pathname)) return false;
  if (args.inAppWebView) return false;
  if (args.loggedIn) return false;
  return args.today !== args.lastShownDate;
}
