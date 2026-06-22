import React, {useEffect} from 'react';
import {ActivityIndicator, View} from 'react-native';

import {useMe} from '@/atoms/Auth';
import {color} from '@/constant/color';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {openAppDeepLink} from '@/utils/appLinkNavigation';
import {isAppDeepLink} from '@/utils/deepLinkUtils';
import {resolveTemplatedExternalUrl} from '@/utils/externalUrlTemplating';

// Web has no in-app WebView. Open external links in a new tab; for same-origin
// (web.staircrusher.club) links, navigate in place. The native WebViewScreen's
// floating-bar / OG-extraction features are app-only and intentionally dropped.
const WEB_ORIGIN = 'https://web.staircrusher.club';

const WebViewScreen = ({route, navigation}: ScreenProps<'Webview'>) => {
  const {url} = route.params;
  const {userInfo} = useMe();

  useEffect(() => {
    const resolved = resolveTemplatedExternalUrl(url, {userId: userInfo?.id});
    if (isAppDeepLink(resolved)) {
      openAppDeepLink(resolved, navigation);
      return;
    }
    if (resolved.startsWith(WEB_ORIGIN)) {
      // 같은 origin → 그대로 이동(리다이렉트). 현재 origin이 web.staircrusher.club이면
      // 동일 출처 내 경로 이동이 된다. replace 로 /webview 히스토리 엔트리를 덮어써
      // 목적지에서 뒤로 가기 시 /webview 로 돌아와 effect 가 재실행(무한 로딩)되는 걸 막는다.
      window.location.replace(resolved);
      return;
    }
    // 외부 링크 → 새 탭. 그 후 빈 Webview 라우트에 머무르지 않도록 뒤로.
    window.open(resolved, '_blank', 'noopener,noreferrer');
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color.white,
      }}>
      <ActivityIndicator size="large" color={color.brand50} />
    </View>
  );
};

export default WebViewScreen;
