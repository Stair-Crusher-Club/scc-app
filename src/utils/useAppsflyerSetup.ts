import {useEffect} from 'react';
import {Linking} from 'react-native';
import appsFlyer from 'react-native-appsflyer';
import Config from 'react-native-config';

export function useAppsflyerSetup() {
  useEffect(() => {
    const listener = appsFlyer.onDeepLink(res => {
      if (res?.deepLinkStatus !== 'NOT_FOUND' && res?.data?.deep_link_value) {
        Linking.openURL(res.data.deep_link_value);
      }
    });
    appsFlyer.initSdk(
      {
        devKey: Config.APPSFLYER_DEV_KEY ?? '',
        appId: Config.APPSFLYER_APP_ID,
        onDeepLinkListener: true,
        isDebug: __DEV__,
      },
      () => {},
      (error?: Error) => {
        console.error(error);
      },
    );
    return () => {
      listener();
    };
  }, []);
}
