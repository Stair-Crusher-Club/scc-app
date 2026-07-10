// Web route access classification. Platform-neutral data (safe to import
// anywhere); the gate that consumes it runs only in the web branch of RootScreen.
//
// Decision:
// - web는 무로그인화되어 있다: 진입 시 항상 익명 토큰을 발행하므로(App.tsx) 어떤 앱
//   화면이든 토큰 없이 열람 가능하다. 로그인은 강제하지 않고, 익명 유저에게 1일 1회
//   로그인 유도 팝업만 띄운다(RootScreen). → 별도 requireToken 분류가 필요 없다.
// - accessibility-registration flows need a camera → app-install prompt on web.

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

export type WebRouteAccess = 'allow' | 'appOnly';

export function classifyWebRoute(routeName?: string): WebRouteAccess {
  if (!routeName) return 'allow';
  if (APP_ONLY.has(routeName)) return 'appOnly';
  return 'allow';
}
