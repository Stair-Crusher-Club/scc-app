import {useEffect, useState} from 'react';

/**
 * scc-app 의 in-app WebView 에서 주입한 access token + baseUrl 을 감지하는 web 전용 hook.
 *
 * 앱은 WebViewScreen 에서 web.staircrusher.club URL 을 띄울 때:
 *   1. window.__SCC_APP_AUTH__ = { token: '...', baseUrl: '...' } 를 set
 *   2. window.dispatchEvent(new Event('scc-app-auth-ready')) 를 발화
 *
 * baseUrl 도 같이 받아야 하는 이유:
 *   web.staircrusher.club 의 prod web bundle 은 default 로 prod API (https://api.staircrusher.club)
 *   를 가리킨다. sandbox 앱 안에서 띄우면 sandbox 토큰으로 prod API 호출 → 미배포 endpoint 404 등
 *   사고가 난다. 앱이 자신의 BASE_URL 도 같이 inject 해서 web 이 이 환경에 맞는 서버로 호출하게 한다.
 *
 * 주입 타이밍이 페이지 JS 보다 빠를 수도 (injectedJavaScriptBeforeContentLoaded),
 * 늦을 수도 (onLoadEnd 의 injectJavaScript) 있으므로
 *   - 초기 마운트 시 window.__SCC_APP_AUTH__ 존재 여부 체크 (이른 주입 케이스)
 *   - 이벤트 리스너 등록 (늦은 주입 케이스)
 * 둘 다 처리한다.
 */

export interface AppInjectedAuth {
  token: string;
  /**
   * 앱이 자신이 호출하는 BASE_URL 을 같이 inject. 비어있으면 web 측 default 사용.
   * (앱 native 의 react-native-config 의 BASE_URL — sandbox 면 dev API, production 이면 prod API)
   */
  baseUrl?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    __SCC_APP_AUTH__?: AppInjectedAuth;
  }
}

export const SCC_APP_AUTH_READY_EVENT = 'scc-app-auth-ready';

function readInjectedAuth(): AppInjectedAuth | null {
  if (typeof window === 'undefined') return null;
  const value = window.__SCC_APP_AUTH__;
  if (!value || !value.token) return null;
  return value;
}

export function useAppInjectedAuth(): AppInjectedAuth | null {
  const [auth, setAuth] = useState<AppInjectedAuth | null>(() =>
    readInjectedAuth(),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      setAuth(readInjectedAuth());
    };
    window.addEventListener(SCC_APP_AUTH_READY_EVENT, handler);
    return () => window.removeEventListener(SCC_APP_AUTH_READY_EVENT, handler);
  }, []);

  return auth;
}
