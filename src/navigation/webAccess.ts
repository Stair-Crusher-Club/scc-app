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
  'BbucleRoad',
  'BbucleRoadList',
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
