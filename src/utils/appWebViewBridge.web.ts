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
  /**
   * 앱 유저의 id (비회원도 채번된 값이 있다). 로그아웃 상태면 null.
   * GA 이벤트를 앱과 같은 신원으로 남기기 위한 것 — bridgeVersion 2 부터.
   */
  userId: string | null;
  /** 주입 payload 스키마 버전. 0 = 이 필드가 없는 구버전 앱 = 로그인 위임 미지원. */
  bridgeVersion: number;
}

declare global {
  interface Window {
    __SCC_APP_AUTH__?: Partial<AppInjectedAuth>;
  }
}

import {getStorageValue, storage} from '@/atoms/atomForLocal';

const APP_MESSAGE_REQUEST_LOGIN = 'SCC_REQUEST_LOGIN';

/** 앱/웹 공통 access token 저장 키 (atomForLocal, web 에선 localStorage 백업). */
const APP_TOKEN_KEY = 'scc-token';
const USER_INFO_KEY = 'userInfo';

/** 같은 사용자 액션에서 위임 요청이 여러 번 나가는 것을 막는 창(ms). */
const LOGIN_REQUEST_DEDUP_MS = 1500;
let lastLoginRequestAt = 0;

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
    // bridgeVersion 1 이하의 구앱은 userId 를 주입하지 않는다 → null.
    // 그 경우 GA 신원은 web 자체 세션(localStorage)으로 폴백한다(기존 동작).
    userId: value.userId ?? null,
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
  // 한 번의 사용자 액션에서 요청이 두 번 이상 나가면 로그인 화면이 겹쳐 뜬다.
  // 앱 쪽에도 idempotent 가드가 있지만 원천에서도 막는다. 시간창 방식이라
  // (플래그와 달리) 로그인하지 않고 닫아도 잠긴 채로 남지 않는다.
  const now = Date.now();
  if (now - lastLoginRequestAt < LOGIN_REQUEST_DEDUP_MS) return true;
  lastLoginRequestAt = now;
  bridge.postMessage(JSON.stringify({type: APP_MESSAGE_REQUEST_LOGIN}));
  return true;
}

/**
 * 앱이 주입한 로그인 상태를 web 저장소(`scc-token`)에 반영한다.
 *
 * 왜 필요한가: 웹 화면의 API 호출은 두 갈래로 인증된다.
 *   1. `web/config/api.ts` 의 `apiConfig.accessToken` — 주입 토큰이 들어가는 곳
 *   2. `useAppComponents().api` — App.tsx 가 **accessToken 없는 Configuration** 으로 만든
 *      인스턴스라, 인증은 전적으로 globalAxios 인터셉터(App.tsx)가 매 요청마다
 *      저장소의 `scc-token` 을 읽어 붙인다
 * 저장(`useSaveContent`)·저장상태조회는 2번 경로다. 그래서 주입 토큰을 저장소에
 * 반영하지 않으면 웹뷰 안에서도 **웹이 자체 발급한 익명 유저**로 호출되고,
 * `/saveContent` 는 spec 상 `Identified` 전용이라 403 이 난다.
 *
 * 주입이 없으면(브라우저) 아무것도 건드리지 않는다 — 웹 자체 세션이 진실이다.
 */
export function syncAppInjectedAuthToStorage(): void {
  const auth = readAppInjectedAuth();
  if (!auth) return;
  if (auth.token) {
    // atomForLocal 인코딩(JSON)에 맞춘다 — KakaoCallbackScreen 과 동일.
    storage.set(APP_TOKEN_KEY, JSON.stringify(auth.token));
    // 저장된 userInfo 가 앱 신원과 다르면 **버린다**. 웹뷰의 localStorage 는 세션 간
    // 살아있어서, 예전에 앱이 로그아웃 상태로 웹뷰를 띄웠을 때 web 이 자체 발급한 익명
    // userInfo 가 남아있을 수 있다. 그게 남아 있으면 useMe 의 _syncUserInfo 가 그 id 로
    // Logger.setUserId 를 불러 GA 신원을 앱 유저가 아닌 값으로 덮어쓴다.
    //
    // 새 userInfo 를 합성하지 않고 삭제만 하는 이유: 브리지엔 nickname 이 없고,
    // 비회원 판정(isAnonymousUser)이 nickname 을 본다 — 추측한 nickname 을 심으면
    // 판정이 틀어진다. 삭제하면 "웹뷰 첫 진입"과 동일한 상태이고, 토큰이 있으므로
    // App.tsx 의 익명 부트스트랩도 다시 돌지 않는다.
    if (auth.userId) {
      const storedUserInfo = getStorageValue<{id?: string}>(USER_INFO_KEY);
      if (storedUserInfo?.id && storedUserInfo.id !== auth.userId) {
        storage.delete(USER_INFO_KEY);
      }
    }
    return;
  }
  // 앱이 로그아웃 상태 → 웹뷰에 남아있는 이전 세션 흔적을 지운다.
  storage.delete(APP_TOKEN_KEY);
  storage.delete(USER_INFO_KEY);
}
