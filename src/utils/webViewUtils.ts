import type {RefObject} from 'react';
import {Linking} from 'react-native';
import type WebView from 'react-native-webview';
import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

import {resolveTemplatedExternalUrl} from './externalUrlTemplating';

/**
 * WebView의 onShouldStartLoadWithRequest 공통 핸들러.
 * http/https URL은 WebView에서 로드하고, 커스텀 스킴(intent://, stair-crusher:// 등)은
 * 네이티브 Linking으로 위임한다.
 *
 * `opts.userId` 와 `opts.webViewRef` 가 함께 전달되고, URL 이 화이트리스트 폼 도메인의
 * `{userId}` placeholder 를 포함하면 치환된 URL 로 webview 를 재진입시킨다.
 *
 * WebViewScreen과 PlaceDetailV2Screen의 BbucleRoad WebView 분기에서 공유한다.
 */
export function handleWebViewShouldStartLoad(
  request: ShouldStartLoadRequest,
  opts?: {
    userId?: string;
    webViewRef?: RefObject<WebView | null>;
  },
): boolean {
  const reqUrl = request.url;
  if (reqUrl.startsWith('http://') || reqUrl.startsWith('https://')) {
    const resolved = resolveTemplatedExternalUrl(reqUrl, {
      userId: opts?.userId,
    });
    if (resolved !== reqUrl && opts?.webViewRef?.current) {
      opts.webViewRef.current.injectJavaScript(
        `window.location.href = ${JSON.stringify(resolved)}; true;`,
      );
      return false;
    }
    return true;
  }
  try {
    Linking.openURL(reqUrl).catch(() => {});
  } catch (_e) {
    // URL을 열 수 없는 경우 무시
  }
  return false;
}
