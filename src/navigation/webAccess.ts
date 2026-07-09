// Web route access classification. Platform-neutral data (safe to import
// anywhere); the gate that consumes it runs only in the web branch of RootScreen.
//
// Decision:
// - app screens that also exist in the native app require a token (even a guest
//   token) on web → redirect to Login when absent.
// - web-only content (bbucle-road) and auth screens are viewable with no token.
// - accessibility-registration flows need a camera → app-install prompt on web.

// Viewable without any token.
const NO_TOKEN_ALLOWED = new Set<string>([
  'Intro', // self-redirects based on token
  'Login',
  'Signup',
  'KakaoCallback',
  'AppleCallback',
  'BbucleRoad',
  'BbucleRoadList',
  // 공유 링크 랜딩. web 변형(index.web.tsx)이 getSccContent(public) 로 resolve 후
  // window.location.replace 로 현재 탭을 원본 컨텐츠로 직접 보낸다 — Webview 라우트를
  // 거치지 않으므로 'Webview' 를 여기 넣을 필요가 없다(기존 Webview 진입점의 토큰 게이트 보존).
  'ResolvingSccContent',
]);

// Camera / photo capture flows — not possible on web → app install prompt.
const APP_ONLY = new Set<string>([
  'Camera',
  'PlaceFormV2',
  'BuildingFormV2',
  'ReviewForm/Place',
  'ReviewForm/Toilet',
  'ReportCorrectionForm',
  'PlacePhotoGuide',
]);

export type WebRouteAccess = 'allow' | 'requireToken' | 'appOnly';

export function classifyWebRoute(routeName?: string): WebRouteAccess {
  if (!routeName) return 'allow';
  if (APP_ONLY.has(routeName)) return 'appOnly';
  if (NO_TOKEN_ALLOWED.has(routeName)) return 'allow';
  return 'requireToken';
}
