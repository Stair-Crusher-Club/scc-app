/**
 * @format
 */
import {getMessaging} from '@react-native-firebase/messaging';
import React from 'react';
import {AppRegistry, Linking} from 'react-native';
// https://github.com/facebook/react-native/issues/23922#issuecomment-648096619
// a polyfill is code that implements a feature on web browsers that do not natively support the feature.
import 'react-native-url-polyfill/auto';

import App from './App';
import {name as appName} from './app.json';
import {logDebug} from '@/utils/DebugUtils';
import Logger from '@/logging/Logger';
import {getStorageValue} from '@/atoms/atomForLocal';

// 앱 오픈 ~ useMe hook 사이에 날라가는 GA event도 있다.
// 이 이벤트에 정상적으로 userId가 담길 수 있도록, 앱 오픈 시 명시적으로 userId를 한 번 셋업해주도록 한다.
// 따라서 명시적으로 셋업해주도록 한다.
const userId = getStorageValue('userInfo')?.id;
if (userId) {
  Logger.setUserId(userId)
}

// getInitialNotification은 RootScreen.tsx의 getInitialURL에서 처리됨
// 여기서 호출하면 중복 호출로 인해 null을 반환함

// 푸시 알림 처리는 RootScreen.tsx에서 통합 관리됨

// Check if app was launched in the background and conditionally render null if so
function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  // Render the app component on foreground launch
  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
