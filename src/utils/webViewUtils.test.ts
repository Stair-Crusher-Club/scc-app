import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import {Linking} from 'react-native';
import type WebView from 'react-native-webview';
import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

import {
  extractDeclaredAppDeepLink,
  extractEmbeddedAppDeepLink,
  handleWebViewOpenWindow,
  handleWebViewShouldStartLoad,
  isTrackingLinkUrl,
  resolveIntentUri,
} from './webViewUtils';

jest.mock('react-native', () => ({
  Linking: {openURL: jest.fn(() => Promise.resolve(true))},
}));

const openURL = jest.mocked(Linking.openURL);

/** airbridge 딥링크 페이지가 안드로이드에서 실제로 발사하는 형식. */
const ANDROID_INTENT_URL =
  'intent://place-group/bbucle-road-gocheok-skydome?airbridge_referrer=abc' +
  '#Intent;scheme=stair-crusher;package=club.staircrusher;S.browser_fallback_url=market%3A%2F%2Fdetails%3Fid%3Dclub.staircrusher;end;';
const DEEP_LINK_URL =
  'stair-crusher://place-group/bbucle-road-gocheok-skydome?airbridge_referrer=abc';

function fakeWebViewRef(): {
  ref: React.RefObject<WebView | null>;
  injectJavaScript: jest.Mock;
} {
  const injectJavaScript = jest.fn();
  return {
    ref: {
      current: {injectJavaScript},
    } as unknown as React.RefObject<WebView | null>,
    injectJavaScript,
  };
}

function shouldLoad(url: string, onAppDeepLink?: () => void): boolean {
  return handleWebViewShouldStartLoad(
    {url} as unknown as ShouldStartLoadRequest,
    {
      onAppDeepLink,
    },
  );
}

beforeEach(() => {
  openURL.mockClear();
});

describe('resolveIntentUri', () => {
  it('intent URI 를 원래 스킴 URL 로 되돌린다', () => {
    expect(resolveIntentUri(ANDROID_INTENT_URL)).toBe(DEEP_LINK_URL);
  });

  it('앱 스킴을 하드코딩하지 않는다 (지도앱 등 다른 intent 링크도 복원)', () => {
    expect(
      resolveIntentUri('intent://route/public?a=1#Intent;scheme=nmap;end;'),
    ).toBe('nmap://route/public?a=1');
  });

  it('intent:// 가 아니면 null', () => {
    expect(resolveIntentUri(DEEP_LINK_URL)).toBeNull();
    expect(
      resolveIntentUri('https://link.staircrusher.club/ns539uk'),
    ).toBeNull();
  });

  it('scheme 이 없는 intent URI 는 null', () => {
    expect(resolveIntentUri('intent://foo#Intent;package=x;end;')).toBeNull();
  });
});

// airbridge 가 안드로이드에서 실제로 발사하는 유일한 URL: 딥링크를 스토어 intent 에 실어보낸다.
const ANDROID_STORE_INTENT_WITH_DEEP_LINK =
  'intent://details?id=club.staircrusher&referrer=abc&url=' +
  encodeURIComponent(DEEP_LINK_URL) +
  '#Intent;scheme=market;package=com.android.vending;end;';

describe('스토어 intent 에 실려온 딥링크', () => {
  it('플레이스토어 intent 의 url= 파라미터에서 딥링크를 꺼내 앱에 넘긴다', () => {
    const onAppDeepLink = jest.fn();
    expect(shouldLoad(ANDROID_STORE_INTENT_WITH_DEEP_LINK, onAppDeepLink)).toBe(
      false,
    );
    // 스토어(market://)를 그냥 삼키면 딥링크까지 사라져 "앱으로 이동" 버튼 페이지만 남는다.
    expect(openURL).toHaveBeenCalledWith(`${DEEP_LINK_URL}&asModal=true`);
    expect(onAppDeepLink).toHaveBeenCalled();
  });

  it('딥링크가 실려 있지 않은 스토어 URL 은 그대로 삼킨다', () => {
    expect(
      shouldLoad('market://details?id=club.staircrusher&referrer=abc'),
    ).toBe(false);
    expect(openURL).not.toHaveBeenCalled();
  });

  it('파라미터에 웹 URL 이 실려 있으면 딥링크로 취급하지 않는다', () => {
    expect(
      extractEmbeddedAppDeepLink(
        'market://details?id=x&url=https%3A%2F%2Fweb.staircrusher.club%2Fa',
      ),
    ).toBeNull();
  });

  it('airbridge_deeplink 파라미터도 지원한다', () => {
    expect(
      extractEmbeddedAppDeepLink(
        `market://details?id=x&airbridge_deeplink=${encodeURIComponent(DEEP_LINK_URL)}`,
      ),
    ).toBe(DEEP_LINK_URL);
  });
});

describe('handleWebViewShouldStartLoad — 스토어 fallback', () => {
  it.each([
    'market://details?id=club.staircrusher&referrer=x',
    'itms-apps://apps.apple.com/kr/app/id6444382843',
    'itms-appss://apps.apple.com/kr/app/id6444382843',
    'https://play.google.com/store/apps/details?id=club.staircrusher',
    'https://apps.apple.com/kr/app/id6444382843',
  ])('%s 은 로드하지도, OS 로 넘기지도 않는다', url => {
    expect(shouldLoad(url)).toBe(false);
    expect(openURL).not.toHaveBeenCalled();
  });
});

describe('handleWebViewShouldStartLoad — 앱 딥링크', () => {
  it('stair-crusher:// 는 앱에 넘기고 웹뷰에서는 로드하지 않는다', () => {
    const onAppDeepLink = jest.fn();
    expect(shouldLoad(DEEP_LINK_URL, onAppDeepLink)).toBe(false);
    expect(openURL).toHaveBeenCalledWith(`${DEEP_LINK_URL}&asModal=true`);
    expect(onAppDeepLink).toHaveBeenCalled();
  });

  // 웹뷰는 항상 fullScreenModal 이라, 그 위에 뜨려면 목적지 화면도 모달이어야 한다
  // (asModal 판단은 Navigation.tsx 의 withModalPresentation — 전 화면 공통).
  it('쿼리가 없는 딥링크에도 asModal 을 붙인다', () => {
    expect(shouldLoad('stair-crusher://place-group/x')).toBe(false);
    expect(openURL).toHaveBeenCalledWith(
      'stair-crusher://place-group/x?asModal=true',
    );
  });

  it('이미 asModal 이 있으면 중복으로 붙이지 않는다', () => {
    expect(shouldLoad('stair-crusher://place-group/x?asModal=true')).toBe(
      false,
    );
    expect(openURL).toHaveBeenCalledWith(
      'stair-crusher://place-group/x?asModal=true',
    );
  });

  it('fragment 가 있어도 쿼리 위치를 지킨다', () => {
    expect(shouldLoad('stair-crusher://place/x#section')).toBe(false);
    expect(openURL).toHaveBeenCalledWith(
      'stair-crusher://place/x?asModal=true#section',
    );
  });

  it('안드로이드 intent URI 도 스킴을 복원해서 앱에 넘긴다', () => {
    const onAppDeepLink = jest.fn();
    expect(shouldLoad(ANDROID_INTENT_URL, onAppDeepLink)).toBe(false);
    // intent:// 를 그대로 넘기면 RN Linking 이 처리하지 못해 조용히 실패한다.
    expect(openURL).toHaveBeenCalledWith(`${DEEP_LINK_URL}&asModal=true`);
    expect(onAppDeepLink).toHaveBeenCalled();
  });
});

describe('handleWebViewShouldStartLoad — 웹 목적지', () => {
  it('일반 웹 링크는 그대로 로드한다', () => {
    expect(shouldLoad('https://naver.me/5YSWYw6R')).toBe(true);
    expect(openURL).not.toHaveBeenCalled();
  });

  it('앱 스킴이 아닌 커스텀 스킴은 네이티브로 위임한다', () => {
    expect(shouldLoad('tel:021234567')).toBe(false);
    expect(openURL).toHaveBeenCalledWith('tel:021234567');
  });

  it('대문자 스킴도 웹 링크로 본다 (네이티브로 넘기지 않는다)', () => {
    expect(shouldLoad('HTTPS://naver.me/5YSWYw6R')).toBe(true);
    expect(openURL).not.toHaveBeenCalled();
  });
});

describe('handleWebViewOpenWindow', () => {
  it('웹 링크는 현재 웹뷰에서 연다', () => {
    const {ref, injectJavaScript} = fakeWebViewRef();
    handleWebViewOpenWindow('https://naver.me/5YSWYw6R', {webViewRef: ref});
    expect(injectJavaScript).toHaveBeenCalledWith(
      'window.location.href = "https://naver.me/5YSWYw6R"; true;',
    );
  });

  it('스토어 URL 은 열지 않는다', () => {
    const {ref, injectJavaScript} = fakeWebViewRef();
    handleWebViewOpenWindow('market://details?id=club.staircrusher', {
      webViewRef: ref,
    });
    expect(injectJavaScript).not.toHaveBeenCalled();
    expect(openURL).not.toHaveBeenCalled();
  });

  it('딥링크는 웹뷰에서 열지 않고 앱에 넘긴다', () => {
    const {ref, injectJavaScript} = fakeWebViewRef();
    handleWebViewOpenWindow(ANDROID_INTENT_URL, {webViewRef: ref});
    expect(injectJavaScript).not.toHaveBeenCalled();
    expect(openURL).toHaveBeenCalledWith(`${DEEP_LINK_URL}&asModal=true`);
  });
});

describe('isTrackingLinkUrl', () => {
  it('트래킹/랜딩 호스트만 true', () => {
    expect(isTrackingLinkUrl('https://scc.airbridge.io/place-group/x')).toBe(
      true,
    );
    expect(isTrackingLinkUrl('https://link.staircrusher.club/ns539uk')).toBe(
      true,
    );
    expect(
      isTrackingLinkUrl('https://web.staircrusher.club/bbucle-road/x'),
    ).toBe(false);
  });
});

// 실제 랜딩 페이지(scc.airbridge.io) HTML 의 메타 형태. content 는 HTML escape 되어 온다.
const LANDING_HTML_APP = `<!doctype html><meta property="al:web:should_fallback" content="true">
<meta property="al:ios:app_store_id" content="6444382843">
<meta property="al:ios:url" content="stair-crusher://place-group/bbucle-road-gocheok-skydome?airbridge_referrer=abc&amp;https_deeplink=true">
<meta property="al:android:package" content="club.staircrusher">
<meta property="al:android:url" content="stair-crusher://place-group/bbucle-road-gocheok-skydome?airbridge_referrer=abc&amp;https_deeplink=true">`;

const LANDING_HTML_WEB_ONLY = `<!doctype html><meta property="al:web:should_fallback" content="true">
<meta property="al:web:url" content="https://web.staircrusher.club/articles/x">`;

describe('extractDeclaredAppDeepLink', () => {
  it('랜딩 페이지가 선언한 앱 딥링크를 꺼내고 &amp; 를 되돌린다', () => {
    expect(extractDeclaredAppDeepLink(LANDING_HTML_APP)).toBe(
      'stair-crusher://place-group/bbucle-road-gocheok-skydome?airbridge_referrer=abc&https_deeplink=true',
    );
  });

  it('웹 목적지 트래킹 링크는 null (앱 스킴 선언이 없다)', () => {
    expect(extractDeclaredAppDeepLink(LANDING_HTML_WEB_ONLY)).toBeNull();
  });

  it('메타가 없어도 던지지 않는다', () => {
    expect(extractDeclaredAppDeepLink('<html></html>')).toBeNull();
  });

  it('속성 순서/따옴표 종류/추가 속성에 의존하지 않는다', () => {
    expect(
      extractDeclaredAppDeepLink(
        `<meta content='stair-crusher://place-group/x' data-rh="true" property='al:android:url'>`,
      ),
    ).toBe('stair-crusher://place-group/x');
  });
});

describe('트래킹 링크 목적지 확인', () => {
  const TRACKING_URL = 'https://link.staircrusher.club/ns539uk';

  function mockFetchHtml(html: string): jest.Mock {
    const fetchMock = jest.fn(() =>
      Promise.resolve({text: () => Promise.resolve(html)}),
    );
    (globalThis as {fetch?: unknown}).fetch = fetchMock;
    return fetchMock;
  }

  /** 비동기 확인이 끝나기를 기다린다. */
  const flush = (): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, 0));

  it('트래킹 링크는 웹뷰에 로드하지 않는다 (목적지를 먼저 확인)', () => {
    mockFetchHtml(LANDING_HTML_APP);
    expect(shouldLoad(TRACKING_URL)).toBe(false);
  });

  it('확인이 끝나기 전에 다른 링크로 이동했으면 뒤늦은 결과를 버린다', async () => {
    mockFetchHtml(LANDING_HTML_APP);
    const {ref} = fakeWebViewRef();
    handleWebViewOpenWindow(TRACKING_URL, {webViewRef: ref});
    // 확인이 끝나기 전에 다음 네비게이션이 일어난다.
    handleWebViewShouldStartLoad(
      {url: 'https://naver.me/other'} as unknown as ShouldStartLoadRequest,
      {webViewRef: ref},
    );
    await flush();
    expect(openURL).not.toHaveBeenCalled();
  });

  it('화면이 닫힌 뒤 도착한 결과도 버린다', async () => {
    mockFetchHtml(LANDING_HTML_APP);
    const ref = {
      current: {injectJavaScript: jest.fn()},
    } as unknown as React.RefObject<WebView | null>;
    handleWebViewOpenWindow(TRACKING_URL, {webViewRef: ref});
    (ref as {current: unknown}).current = null; // 화면 unmount
    await flush();
    expect(openURL).not.toHaveBeenCalled();
  });

  it('목적지가 앱 화면이면 그 화면을 띄운다', async () => {
    const fetchMock = mockFetchHtml(LANDING_HTML_APP);
    const onAppDeepLink = jest.fn();
    const {ref} = fakeWebViewRef();
    handleWebViewOpenWindow(TRACKING_URL, {webViewRef: ref, onAppDeepLink});
    await flush();
    // 브라우저 UA 를 안 보내면 airbridge 가 웹 fallback 을 주고 메타가 사라진다.
    expect(fetchMock).toHaveBeenCalledWith(TRACKING_URL, {
      headers: {
        'User-Agent': expect.stringContaining(
          'Mobile Safari',
        ) as unknown as string,
      },
    });
    expect(openURL).toHaveBeenCalledWith(
      'stair-crusher://place-group/bbucle-road-gocheok-skydome?airbridge_referrer=abc&https_deeplink=true&asModal=true',
    );
    expect(onAppDeepLink).toHaveBeenCalled();
  });

  it('목적지가 웹이면 기존대로 웹뷰에서 연다', async () => {
    mockFetchHtml(LANDING_HTML_WEB_ONLY);
    const injectJavaScript = jest.fn();
    const ref = {
      current: {injectJavaScript},
    } as unknown as React.RefObject<WebView | null>;
    handleWebViewOpenWindow(TRACKING_URL, {webViewRef: ref});
    await flush();
    expect(openURL).not.toHaveBeenCalled();
    expect(injectJavaScript).toHaveBeenCalledWith(
      `window.location.href = ${JSON.stringify(TRACKING_URL)}; true;`,
    );
  });

  it('확인이 실패하면 기존 동작(웹뷰 로드)으로 폴백한다', async () => {
    (globalThis as {fetch?: unknown}).fetch = jest.fn(() =>
      Promise.reject(new Error('offline')),
    );
    const injectJavaScript = jest.fn();
    const ref = {
      current: {injectJavaScript},
    } as unknown as React.RefObject<WebView | null>;
    handleWebViewOpenWindow(TRACKING_URL, {webViewRef: ref});
    await flush();
    expect(injectJavaScript).toHaveBeenCalled();
    expect(openURL).not.toHaveBeenCalled();
  });
});
