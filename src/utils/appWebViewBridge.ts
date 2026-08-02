// Native stub — 실제 구현은 appWebViewBridge.web.ts (앱 웹뷰 안에서 실행되는 web bundle 전용).
// native 앱 자신은 LoginScreen 을 직접 띄우므로 위임할 대상이 없다.
// (socialLoginWeb.ts / appInstallPrompt.ts 와 동일한 플랫폼 분기 패턴)

export interface AppInjectedAuth {
  /** 앱에 토큰이 없으면(로그아웃) null. 익명(비회원) 토큰도 값이 들어온다. */
  token: string | null;
  /** 앱이 호출하는 BASE_URL. 비어있으면 web 측 default 사용. */
  baseUrl?: string;
  /** 앱 유저가 미식별(비회원/로그아웃) 상태인지. 토큰 존재만으로는 알 수 없다. */
  isAnonymous: boolean;
  /** 주입 payload 스키마 버전. 0 = 이 필드가 없는 구버전 앱 = 로그인 위임 미지원. */
  bridgeVersion: number;
}

export function isInAppWebView(): boolean {
  return false;
}

export function readAppInjectedAuth(): AppInjectedAuth | null {
  return null;
}

export function requestAppLogin(): boolean {
  return false;
}

export function syncAppInjectedAuthToStorage(): void {
  // native 는 저장소가 곧 앱 세션이라 동기화할 대상이 없다.
}
