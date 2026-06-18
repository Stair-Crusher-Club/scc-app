import {
  getActionFromState,
  getStateFromPath,
  NavigationProp,
} from '@react-navigation/native';
import {Linking, Platform} from 'react-native';

import {ScreenParams} from '@/navigation/Navigation.screens';
import {webLinkingScreensConfig} from '@/navigation/linkingConfig';
import {stripPrefix} from '@/utils/deepLinkUtils';

// getStateFromPath/getActionFromState 의 Options 타입은 중첩 screens(Main 탭)를
// 좁게 추론해 literal config 와 안 맞는다. 런타임은 동일 config 로 NavigationContainer
// linking 이 정상 동작하므로 호출 경계에서만 캐스팅한다.
type LinkingConfigArg = Parameters<typeof getStateFromPath>[1];

/**
 * 앱 내부 딥링크(stair-crusher://...)를 연다.
 *
 * - 네이티브: OS 딥링크 핸들러로 위임(Linking.openURL → RootScreen 가 처리).
 * - 웹: 브라우저는 stair-crusher:// 커스텀 스킴을 열 수 없으므로, 경로를 파싱해
 *   react-navigation 으로 직접 이동한다. (홈 배너/추천콘텐츠/퀵메뉴 등에서
 *   stair-crusher://place-list/{id} 같은 링크 클릭 시 웹에서도 동작하도록.)
 *
 * 호출 전 isAppDeepLink(url) 로 앱 딥링크인지 확인하고 사용한다(외부 http URL 은
 * 각 호출처가 Webview/새 탭으로 처리).
 */
export function openAppDeepLink(
  url: string,
  navigation: NavigationProp<ScreenParams>,
): void {
  if (Platform.OS !== 'web') {
    Linking.openURL(url).catch(() => {});
    return;
  }
  const path = stripPrefix(url);
  if (!path) {
    return;
  }
  const config = webLinkingScreensConfig as unknown as LinkingConfigArg;
  const state = getStateFromPath(path, config);
  if (!state) {
    return;
  }
  const action = getActionFromState(state, config);
  if (action !== undefined) {
    navigation.dispatch(action);
  }
}
