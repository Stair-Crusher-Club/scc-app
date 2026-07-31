import {useEffect, useState} from 'react';

import {
  type AppInjectedAuth,
  readAppInjectedAuth,
} from '@/utils/appWebViewBridge';

/**
 * scc-app 의 in-app WebView 가 주입한 로그인 상태를 감지하는 web 전용 hook.
 *
 * 앱은 WebViewScreen 에서 허용 origin 의 URL 을 띄울 때:
 *   1. window.__SCC_APP_AUTH__ = { token, baseUrl, isAnonymous, bridgeVersion } 를 set
 *   2. window.dispatchEvent(new Event('scc-app-auth-ready')) 를 발화
 *
 * `token` 은 null 일 수 있다(앱 로그아웃). 즉 **주입이 왔다 ≠ 로그인돼 있다** —
 * 로그인 여부는 `isAnonymous` 로 판정한다(앱은 게스트 로그인만 해도 익명 토큰을 갖는다).
 *
 * baseUrl 도 같이 받아야 하는 이유:
 *   web.staircrusher.club 의 prod web bundle 은 default 로 prod API (https://api.staircrusher.club)
 *   를 가리킨다. sandbox 앱 안에서 띄우면 sandbox 토큰으로 prod API 호출 → 미배포 endpoint 404 등
 *   사고가 난다. 앱이 자신의 BASE_URL 도 같이 inject 해서 web 이 이 환경에 맞는 서버로 호출하게 한다.
 *
 * 주입 타이밍이 페이지 JS 보다 빠를 수도 (injectedJavaScriptBeforeContentLoaded),
 * 늦을 수도 (onLoadEnd / 로그인 완료 후 재주입) 있으므로
 *   - 초기 마운트 시 window.__SCC_APP_AUTH__ 존재 여부 체크 (이른 주입 케이스)
 *   - 이벤트 리스너 등록 (늦은 주입 + 로그인/로그아웃 후 상태 갱신 케이스)
 * 둘 다 처리한다.
 */

export type {AppInjectedAuth};

export const SCC_APP_AUTH_READY_EVENT = 'scc-app-auth-ready';

export function useAppInjectedAuth(): AppInjectedAuth | null {
  const [auth, setAuth] = useState<AppInjectedAuth | null>(() =>
    readAppInjectedAuth(),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      setAuth(readAppInjectedAuth());
    };
    window.addEventListener(SCC_APP_AUTH_READY_EVENT, handler);
    return () => window.removeEventListener(SCC_APP_AUTH_READY_EVENT, handler);
  }, []);

  return auth;
}
