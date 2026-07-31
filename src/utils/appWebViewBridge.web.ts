/**
 * scc-app 인앱 웹뷰 ↔ web bundle 브리지 (web 측).
 *
 * 앱 → 웹: WebViewScreen 이 `window.__SCC_APP_AUTH__` 를 주입하고
 *          `scc-app-auth-ready` 이벤트를 발화한다. 토큰이 없는 상태(로그아웃/익명)도
 *          그대로 전달되므로 "주입이 왔다" 와 "로그인돼 있다" 는 다른 뜻이다.
 *
 * 웹 → 앱: requestAppLogin() 으로 로그인을 앱에 위임한다. 웹뷰 안에서 웹이 직접
 *          로그인하지 않는 이유 —
 *            - 애플 로그인은 usePopup(window.open) 이라 RN WebView 에서 깨진다
 *            - 미가입 유저의 Signup 플로우가 웹에 없다 (앱 LoginScreen 에만 있음)
 *            - 로그인 주체를 앱 하나로 유지해야 앱/웹 세션이 갈리지 않는다
 *
 * 하위호환: 웹 배포는 즉시 전 유저에게 반영되지만 앱 OTA 는 재시작 후 반영이라
 *          "신웹 × 구앱" 조합이 반드시 생긴다. 구앱은 bridgeVersion 을 주입하지
 *          않으므로 requestAppLogin() 이 false 를 반환하고, 호출부는 기존 동작
 *          (웹 자체 로그인 플로우)으로 폴백한다.
 */

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

declare global {
  interface Window {
    __SCC_APP_AUTH__?: Partial<AppInjectedAuth>;
  }
}

const APP_MESSAGE_REQUEST_LOGIN = 'SCC_REQUEST_LOGIN';

// 인앱 웹뷰 판정은 web/utils/isInAppWebView 하나만 쓴다(구현 중복 방지).
// 이 브리지는 공용 src 코드(checkAuth, RootScreen)가 쓸 수 있는 진입점 역할.
export {getIsInAppWebView as isInAppWebView} from '../../web/utils/isInAppWebView';

/** 로그인 위임을 지원하는 최소 bridgeVersion. */
const MIN_BRIDGE_VERSION_FOR_LOGIN = 1;

export function readAppInjectedAuth(): AppInjectedAuth | null {
  if (typeof window === 'undefined') return null;
  const value = window.__SCC_APP_AUTH__;
  if (!value) return null;
  return {
    token: value.token ?? null,
    baseUrl: value.baseUrl,
    // 구앱은 두 필드를 주입하지 않는다. 그 앱은 토큰이 있을 때만 주입하므로
    // 토큰 유무로 익명 여부를 추정하고(구앱에서의 기존 동작과 동일), 위임은 끈다.
    isAnonymous: value.isAnonymous ?? !value.token,
    bridgeVersion: value.bridgeVersion ?? 0,
  };
}

/**
 * 앱에 로그인 화면을 띄워달라고 요청한다.
 *
 * @returns true = 앱에 위임했다(호출부는 자체 로그인 UI 를 띄우지 말 것).
 *          false = 웹뷰가 아니거나 위임 미지원 구앱 → 호출부가 기존 동작을 유지한다.
 */
export function requestAppLogin(): boolean {
  if (typeof window === 'undefined') return false;
  const bridge = window.ReactNativeWebView;
  if (!bridge) return false;
  const auth = readAppInjectedAuth();
  if (!auth || auth.bridgeVersion < MIN_BRIDGE_VERSION_FOR_LOGIN) return false;
  bridge.postMessage(JSON.stringify({type: APP_MESSAGE_REQUEST_LOGIN}));
  return true;
}
