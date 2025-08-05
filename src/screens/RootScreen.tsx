import {getMessaging} from '@react-native-firebase/messaging';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {Linking} from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import {useLogParams} from '@/logging/LogParamsProvider';
import Logger from '@/logging/Logger';
import {Navigation} from '@/navigation';
import {logDebug} from '@/utils/DebugUtils';

const RootScreen = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const routeNameRef = useRef<string>(undefined);
  const navigationRef = useNavigationContainerRef();
  const globalLogParams = useLogParams();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={async () => {
        const currentScreenName =
          navigationRef.current?.getCurrentRoute()?.name;
        logDebug(`App starts at ${currentScreenName}`);
        await Logger.logScreenView({
          currScreenName: currentScreenName,
        });
        routeNameRef.current = currentScreenName;
      }}
      linking={{
        prefixes: [
          'stair-crusher://',
          'https://scc.airbridge.io/',
          'https://app.staircrusher.club/',
        ],
        getInitialURL: async () => {
          const url = await Linking.getInitialURL();
          if (url) {
            return url;
          }
          const message = await getMessaging().getInitialNotification();
          if (message) {
            const data = message.data as {_d: string};
            return data?._d;
          }
          return null;
        },
        config: {
          initialRouteName: 'Main' as any, // for preventing type error
          screens: {
            ProfileEditor: 'profile',
            Setting: 'setting',
            PlaceDetail: {
              path: 'place/:placeInfo',
              parse: {
                placeInfo: (placeId: string) => {
                  return {placeId};
                },
              },
              stringify: {
                placeInfo: (placeInfo: {placeId: string}) => {
                  return placeInfo.placeId;
                },
              },
            },
            ChallengeDetail: {
              path: 'challenge/:challengeId',
            },
            Webview: {
              path: 'webview',
            },
          },
        },
      }}
      onStateChange={async state => {
        const previousScreenName = routeNameRef.current;
        const currentScreenName =
          navigationRef.current?.getCurrentRoute()?.name;
        if (previousScreenName !== currentScreenName) {
          logDebug(`Screen ${previousScreenName} -> ${currentScreenName}`);
          await Logger.logScreenView({
            prevScreenName: previousScreenName,
            currScreenName: currentScreenName,
            extraParams: {
              ...globalLogParams,
              routeParams: state?.routes.at(-1)?.params ?? {},
            },
          });
          routeNameRef.current = currentScreenName;
        }
      }}>
      <Navigation />
    </NavigationContainer>
  );
};

export default RootScreen;
