/**
 * @format
 */
import messaging from '@react-native-firebase/messaging';
import React from 'react';
import {AppRegistry, Linking} from 'react-native';
// https://github.com/facebook/react-native/issues/23922#issuecomment-648096619
// a polyfill is code that implements a feature on web browsers that do not natively support the feature.
import 'react-native-url-polyfill/auto';

import App from './App';
import {name as appName} from './app.json';

messaging().onNotificationOpenedApp(async remoteMessage => {
  if (remoteMessage?.data?._d) {
    Linking.openURL(remoteMessage?.data?._d);
  }
});

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
