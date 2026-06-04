import {useEffect, useState} from 'react';

/**
 * scc-app 의 in-app WebView 에서 주입한 access token 을 감지하는 web 전용 hook.
 *
 * 앱은 WebViewScreen 에서 web.staircrusher.club URL 을 띄울 때:
 *   1. window.__SCC_APP_AUTH__ = { token: '...' } 를 set
 *   2. window.dispatchEvent(new Event('scc-app-auth-ready')) 를 발화
 *
 * 주입 타이밍이 페이지 JS 보다 빠를 수도 (injectedJavaScriptBeforeContentLoaded),
 * 늦을 수도 (onLoadEnd 의 injectJavaScript) 있으므로
 *   - 초기 마운트 시 window.__SCC_APP_AUTH__ 존재 여부 체크 (이른 주입 케이스)
 *   - 이벤트 리스너 등록 (늦은 주입 케이스)
 * 둘 다 처리한다.
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    __SCC_APP_AUTH__?: {token: string};
  }
}

export const SCC_APP_AUTH_READY_EVENT = 'scc-app-auth-ready';

export function useAppInjectedAuth(): string | null {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.__SCC_APP_AUTH__?.token ?? null;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      setToken(window.__SCC_APP_AUTH__?.token ?? null);
    };
    window.addEventListener(SCC_APP_AUTH_READY_EVENT, handler);
    return () => window.removeEventListener(SCC_APP_AUTH_READY_EVENT, handler);
  }, []);

  return token;
}
