/**
 * 현재 페이지가 scc-app 의 in-app WebView 안에서 떠 있는지 여부.
 *
 * react-native-webview 는 자신이 로드하는 모든 페이지에 `window.ReactNativeWebView`
 * 객체를 주입한다(앱 로그인/토큰 주입 여부와 무관). 웹은 이미 이 객체로 OG 메타를
 * 앱에 postMessage 한다(WebViewScreen 의 SCC_OG_META 추출 스크립트).
 *
 * 토큰 기반 `useAppInjectedAuth` 와 달리, 로그아웃 상태로 앱 webview 가 떠도 감지된다.
 * 뿌클로드 로그인 버튼은 "앱 webview 면 토큰 여부와 무관하게 항상 숨김" 이므로 이 신호를 쓴다.
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export function getIsInAppWebView(): boolean {
  return typeof window !== 'undefined' && !!window.ReactNativeWebView;
}
