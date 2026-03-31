import {Linking} from 'react-native';
import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

/**
 * WebView의 onShouldStartLoadWithRequest 공통 핸들러.
 * http/https URL은 WebView에서 로드하고, 커스텀 스킴(intent://, stair-crusher:// 등)은
 * 네이티브 Linking으로 위임한다.
 *
 * WebViewScreen과 PlaceDetailV2Screen의 BbucleRoad WebView 분기에서 공유한다.
 */
export function handleWebViewShouldStartLoad(
  request: ShouldStartLoadRequest,
): boolean {
  const reqUrl = request.url;
  if (reqUrl.startsWith('http://') || reqUrl.startsWith('https://')) {
    return true;
  }
  Linking.openURL(reqUrl).catch(() => {});
  return false;
}
