import type {RefObject} from 'react';
import {Linking} from 'react-native';
import type WebView from 'react-native-webview';
import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

import {APP_SCHEME_PREFIX} from '@/navigation/linkingConfig';

import {resolveTemplatedExternalUrl} from './externalUrlTemplating';

const INTENT_SCHEME_PREFIX = 'intent://';

// 앱 웹뷰 안에서 스토어로 보내는 URL 은 항상 오답이다 — 그 앱이 이미 실행 중이다.
// airbridge 딥링크 페이지는 딥링크를 시도한 뒤 "앱이 안 열렸다" 고 판단되면 타이머로
// 스토어 fallback 을 발사하는데, 우리 앱 웹뷰 안에서는 앱이 백그라운드로 가지 않으므로
// 그 판단이 늘 틀린다. 이게 "웹뷰에서 트래킹 링크를 눌렀더니 앱스토어가 뜬다" 의 원인이다.
// (앱 업데이트 유도용 스토어 이동은 네이티브 화면(HomeScreenV2/VersionRow)에만 있고
//  웹뷰를 타지 않으므로 여기서 막아도 영향이 없다.)
const STORE_URL_PREFIXES = [
  'market://',
  'itms-apps://',
  'itms-appss://',
  'https://play.google.com/store',
  'https://apps.apple.com',
];

// airbridge 트래킹 링크 / 딥링크 랜딩 호스트.
// 이 호스트는 웹뷰에 로드하지 않고 목적지를 먼저 확인한다(resolveTrackingLinkDeepLink).
// **호스트로 "앱 목적지" 라고 판정하는 게 아니다** — 성과 추적만을 위해 웹 링크를 감싼 트래킹
// 링크도 있으므로, 판정은 랜딩 페이지가 선언한 딥링크로만 한다.
const TRACKING_LINK_HOSTS = [
  'link.staircrusher.club',
  'scc.airbridge.io',
  'abr.ge',
];

/** 트래킹 링크 목적지 확인 타임아웃. 넘으면 기존 동작(웹뷰 로드)으로 폴백한다. */
const TRACKING_LINK_RESOLVE_TIMEOUT_MS = 5000;

// airbridge 는 UA 로 응답을 가른다. RN fetch 의 기본 UA(okhttp/…)로 요청하면 딥링크 페이지가
// 아니라 **웹 fallback(마케팅 사이트)** 이 돌아와서 al:*:url 메타가 아예 없다(실측 확인:
// okhttp → 336KB Framer 페이지 / 모바일 브라우저 UA → 5.6KB 딥링크 페이지).
// 목적지를 읽으려면 모바일 브라우저 UA 로 요청해야 한다 — 이 헤더를 지우면 조용히 고장난다.
const TRACKING_LINK_RESOLVE_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

// airbridge 는 안드로이드에서 앱 딥링크를 단독으로 발사하지 않는다. fallback 이 google-play 면
// **딥링크를 플레이스토어 intent 의 query param 에 실어서** 한 번만 발사한다
// (deeplink_page SDK 의 openIntent 첫 분기 — `query:{url: <딥링크>}`):
//   intent://details?id=club.staircrusher&url=stair-crusher%3A%2F%2Fplace-group%2Fx
//     #Intent;scheme=market;package=com.android.vending;end;
// 스토어가 "설치된 앱에 딥링크를 넘겨주는" 동작을 기대한 형식이다. 그래서 스토어 URL 을 그냥
// 삼키면 딥링크까지 함께 사라져서 "앱으로 이동" 버튼만 남은 fallback 페이지가 그려진다.
// 스토어 URL 에 실려온 앱 딥링크는 꺼내서 우리가 직접 처리한다.
// (iOS 는 Md.default 의 scheme 전략으로 stair-crusher:// 를 그대로 발사하므로 이 경로가 아니다)
const EMBEDDED_DEEP_LINK_PARAMS = ['url', 'airbridge_deeplink'];

export interface WebViewLoadOptions {
  userId?: string;
  webViewRef?: RefObject<WebView | null>;
  /**
   * 딥링크를 앱에 넘겼을 때 호출된다. 웹뷰가 airbridge 랜딩 페이지에 남아 있으면
   * 원래 페이지로 되돌리는 정리용 (안 하면 띄운 화면을 닫고 돌아왔을 때 빈 랜딩 페이지가 보인다).
   */
  onAppDeepLink?: () => void;
}

function startsWithAny(url: string, prefixes: string[]): boolean {
  const lowerUrl = url.toLowerCase();
  return prefixes.some(prefix => lowerUrl.startsWith(prefix));
}

/**
 * Android 웹뷰가 넘겨주는 intent URI 를 원래 스킴 URL 로 되돌린다.
 * `intent://place-group/x?a=1#Intent;scheme=stair-crusher;package=club.staircrusher;end;`
 *   → `stair-crusher://place-group/x?a=1`
 *
 * RN 의 Linking.openURL 은 Intent.parseUri 가 아니라 `Uri.parse` 로 ACTION_VIEW 를 만들기
 * 때문에(IntentModule.kt) intent:// 를 그대로 넘기면 받을 액티비티가 없어 조용히 실패한다.
 * airbridge 딥링크 페이지가 안드로이드에서 쓰는 형식이 정확히 이것이라, 복원하지 않으면
 * 딥링크는 무조건 실패하고 스토어 fallback 만 살아남는다.
 * (네이버지도 등 다른 intent:// 링크도 같은 이유로 실패했으므로 스킴을 하드코딩하지 않는다.)
 */
export function resolveIntentUri(url: string): string | null {
  if (!url.toLowerCase().startsWith(INTENT_SCHEME_PREFIX)) {
    return null;
  }
  const fragmentIndex = url.indexOf('#');
  if (fragmentIndex === -1) {
    return null;
  }
  const fragment = url.slice(fragmentIndex + 1);
  if (!fragment.toLowerCase().startsWith('intent;')) {
    return null;
  }
  const scheme = fragment.match(/(?:^|;)scheme=([^;]+)/i)?.[1];
  if (!scheme) {
    return null;
  }
  return `${scheme}://${url.slice(INTENT_SCHEME_PREFIX.length, fragmentIndex)}`;
}

/**
 * 스토어 URL 의 query param 에 실려온 앱 딥링크를 꺼낸다 (위 EMBEDDED_DEEP_LINK_PARAMS 주석).
 * 값이 앱 스킴일 때만 반환한다 — 파라미터에 웹 URL 이 실려 있으면 딥링크가 아니다.
 */
export function extractEmbeddedAppDeepLink(url: string): string | null {
  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) {
    return null;
  }
  const params = new URLSearchParams(url.slice(queryIndex + 1).split('#')[0]);
  for (const name of EMBEDDED_DEEP_LINK_PARAMS) {
    const value = params.get(name);
    if (value?.toLowerCase().startsWith(APP_SCHEME_PREFIX)) {
      return value;
    }
  }
  return null;
}

/** airbridge 트래킹 링크 / 랜딩 페이지 URL 인지. */
export function isTrackingLinkUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return TRACKING_LINK_HOSTS.some(host =>
    lowerUrl.startsWith(`https://${host}/`),
  );
}

/**
 * airbridge 랜딩 페이지 HTML 이 선언한 앱 딥링크를 꺼낸다.
 *
 * 랜딩 페이지는 `al:android:url` / `al:ios:url` 메타에 목적지 딥링크를 그대로 박아둔다.
 * 이게 "목적지가 앱 화면" 이라는 확정 신호다 — 웹 목적지 트래킹 링크에는 이 메타가 없거나
 * 앱 스킴이 아니므로 null 이 되어 기존 동작(웹뷰에서 로드)으로 떨어진다.
 */
export function extractDeclaredAppDeepLink(html: string): string | null {
  const match = html.match(
    /<meta\s+property="al:(?:android|ios):url"\s+content="([^"]*)"/i,
  );
  if (!match) {
    return null;
  }
  const declared = match[1].replace(/&amp;/g, '&');
  return declared.toLowerCase().startsWith(APP_SCHEME_PREFIX) ? declared : null;
}

/**
 * 트래킹 링크의 목적지가 앱 화면인지 확인한다 (302 를 따라가 랜딩 페이지 HTML 을 읽는다).
 *
 * 왜 웹뷰에 로드하지 않고 우리가 확인하는가: 랜딩 페이지를 웹뷰에서 실행시키면 딥링크를
 * 어떻게 발사할지가 브라우저 UA 별 전략 테이블에 따라 갈린다. 우리 인앱 웹뷰는 airbridge 의
 * 전략 테이블에 없어서 default 로 떨어지고, 그 경로는 딥링크를 **플레이스토어 intent 에
 * 감싸서** 던진 뒤 실패로 간주하고 "앱으로 이동" 버튼 페이지를 그린다 — 우리 앱 안에서는
 * 무엇도 성공할 수 없는 흐름이다. 목적지만 우리가 읽어서 직접 띄우면 이 흐름 전체가 빠진다.
 */
async function resolveTrackingLinkDeepLink(
  url: string,
): Promise<string | null> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    const html = await Promise.race([
      fetch(url, {
        headers: {'User-Agent': TRACKING_LINK_RESOLVE_USER_AGENT},
      }).then(response => response.text()),
      new Promise<null>(resolve => {
        timeoutId = setTimeout(
          () => resolve(null),
          TRACKING_LINK_RESOLVE_TIMEOUT_MS,
        );
      }),
    ]);
    return html ? extractDeclaredAppDeepLink(html) : null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function openExternalUrl(url: string): void {
  try {
    Linking.openURL(url).catch(() => {});
  } catch (_e) {
    // URL을 열 수 없는 경우 무시
  }
}

/**
 * 앱 딥링크를 OS 딥링크 경로에 넘긴다. RootScreen 의 linking subscribe 가 받아서
 * 현재 웹뷰 위로 해당 화면을 띄운다 (authDeferred 게이트, airbridge trackDeeplink 재사용).
 */
function handOffToApp(deepLinkUrl: string, opts?: WebViewLoadOptions): void {
  openExternalUrl(deepLinkUrl);
  opts?.onAppDeepLink?.();
}

function loadInWebView(
  url: string,
  webViewRef?: RefObject<WebView | null>,
): void {
  webViewRef?.current?.injectJavaScript(
    `window.location.href = ${JSON.stringify(url)}; true;`,
  );
}

/**
 * 웹뷰가 이 URL 을 자기 안에서 로드해야 하는지 판정한다. 로드하지 않는 경우의 처리
 * (앱 화면 띄우기 / 네이티브 위임 / 무시)는 이 함수 안에서 끝낸다.
 */
function decideWebViewLoad(
  requestUrl: string,
  opts?: WebViewLoadOptions,
): boolean {
  // Android intent URI 는 원래 스킴으로 되돌린 뒤 판정한다.
  const url = resolveIntentUri(requestUrl) ?? requestUrl;

  // 스토어 URL 은 삼킨다. 단 안드로이드는 딥링크가 스토어 intent 의 query param 에 실려오므로,
  // 실려 있으면 그걸 꺼내 앱으로 넘긴다 (위 EMBEDDED_DEEP_LINK_PARAMS 주석).
  if (startsWithAny(url, STORE_URL_PREFIXES)) {
    const embeddedDeepLink = extractEmbeddedAppDeepLink(url);
    if (embeddedDeepLink) {
      handOffToApp(embeddedDeepLink, opts);
    }
    return false;
  }

  // 앱 커스텀 스킴 = "목적지는 이 앱의 화면" 이라는 확정 신호. airbridge 랜딩 페이지가
  // 발사한 것이든 페이지가 직접 링크한 것이든 동일하게 OS 딥링크 경로로 넘긴다.
  // RootScreen 의 linking subscribe 가 이걸 받아 현재 웹뷰 위로 해당 화면을 띄운다 —
  // authDeferred 게이트, airbridge trackDeeplink 까지 기존 파이프라인을 그대로 재사용한다.
  // 트래킹 링크의 목적지가 웹이면 이 URL 이 나오지 않으므로 아래 http(s) 분기로 떨어져
  // 기존과 동일하게 웹뷰에서 열린다.
  if (url.toLowerCase().startsWith(APP_SCHEME_PREFIX)) {
    handOffToApp(url, opts);
    return false;
  }

  // 트래킹 링크는 웹뷰에 로드하지 않고 목적지를 먼저 확인한다. 앱 화면이면 그 화면을 띄우고,
  // 웹 목적지면 그때 웹뷰에서 연다 (확인 실패/타임아웃도 웹뷰 로드로 폴백 — 기존 동작).
  if (isTrackingLinkUrl(url)) {
    resolveTrackingLinkDeepLink(url)
      .then(deepLink => {
        if (deepLink) {
          handOffToApp(deepLink, opts);
        } else {
          loadInWebView(url, opts?.webViewRef);
        }
      })
      .catch(() => loadInWebView(url, opts?.webViewRef));
    return false;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    const resolved = resolveTemplatedExternalUrl(url, {userId: opts?.userId});
    if (resolved !== url && opts?.webViewRef?.current) {
      loadInWebView(resolved, opts.webViewRef);
      return false;
    }
    return true;
  }

  // 그 외 커스텀 스킴(tel:, mailto:, 지도앱 등)은 네이티브로 위임.
  openExternalUrl(url);
  return false;
}

/**
 * WebView의 onShouldStartLoadWithRequest 공통 핸들러.
 *
 * - airbridge 트래킹 링크는 웹뷰에 로드하지 않고 목적지를 먼저 확인한다. 앱 화면이면 그 화면을
 *   띄우고, 웹 목적지면 웹뷰에서 연다.
 * - 앱 딥링크는 앱에 넘겨 현재 웹뷰 위로 해당 화면을 띄운다. `stair-crusher://…`,
 *   Android `intent://…#Intent;scheme=stair-crusher;…`, 스토어 intent 의 `url=` 파라미터에
 *   실려온 것 모두 (랜딩 페이지가 웹뷰에서 실행되는 경로가 남아 있을 때의 안전망).
 * - 딥링크가 실려 있지 않은 스토어 URL 은 삼킨다 — 앱 안에서 스토어는 항상 오답.
 * - 그 외 http/https 는 WebView 에서 로드하고, 나머지 커스텀 스킴은 Linking 으로 위임한다.
 *
 * `opts.userId` 와 `opts.webViewRef` 가 함께 전달되고, URL 이 화이트리스트 폼 도메인의
 * `{userId}` placeholder 를 포함하면 치환된 URL 로 webview 를 재진입시킨다.
 */
export function handleWebViewShouldStartLoad(
  request: ShouldStartLoadRequest,
  opts?: WebViewLoadOptions,
): boolean {
  return decideWebViewLoad(request.url, opts);
}

/**
 * WebView의 onOpenWindow(`target="_blank"` 클릭) 공통 핸들러.
 *
 * 안드로이드는 setSupportMultipleWindows 기본값(true) 때문에 _blank 클릭이
 * onCreateWindow 로 가고, RNCWebChromeClient 가 **뷰 트리에 붙지 않는 새 WebView** 에서
 * 그 URL 을 로드한다 — 사용자에겐 아무 일도 일어나지 않고 onShouldStartLoadWithRequest 도
 * 그 URL 을 보지 못한다. onOpenWindow 를 붙이면 URL 이 JS 로 넘어오므로,
 * 같은 판정을 태우고 웹뷰가 열어야 하는 URL 이면 현재 웹뷰에서 연다(iOS 기본 동작과 동일).
 */
export function handleWebViewOpenWindow(
  targetUrl: string,
  opts?: WebViewLoadOptions,
): void {
  if (decideWebViewLoad(targetUrl, opts)) {
    loadInWebView(targetUrl, opts?.webViewRef);
  }
}
