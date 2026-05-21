import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {getActionFromState, getStateFromPath} from '@react-navigation/native';
import {useAtomValue} from 'jotai';
import React, {useEffect} from 'react';

import {accessTokenAtom} from '@/atoms/Auth';
import {color} from '@/constant/color';
import {
  getDeferredDeepLinkUrl,
  setDeferredDeepLinkUrl,
} from '@/deeplink/DeferredDeepLink';
import {useLogger} from '@/logging/useLogger';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {linkingScreensConfig} from '@/navigation/linkingConfig';
import ToastUtils from '@/utils/ToastUtils';
import {stripPrefix} from '@/utils/deepLinkUtils';
import {useCheckAuth} from '@/utils/checkAuth';

import ChallengeIcon from '../../assets/icon/ic_challenge.svg';
import HomeIcon from '../../assets/icon/ic_home.svg';
import MapIcon from '../../assets/icon/ic_map_detailed.svg';
import MenuIcon from '../../assets/icon/ic_menu.svg';
import ChallengeScreen from '../ChallengeScreen';
import HomeScreenV2 from '../HomeScreenV2';
import MenuScreen from '../MenuScreen';
import SearchScreen from '../SearchScreen';

const Tab = createBottomTabNavigator();

// Move tab bar icon components outside to avoid ESLint warnings
const HomeTabIcon = (props: {color: string}) => (
  <HomeIcon color={props.color} />
);
const MapTabIcon = (props: {color: string}) => <MapIcon color={props.color} />;
const ChallengeTabIcon = (props: {color: string}) => (
  <ChallengeIcon color={props.color} />
);
const MenuTabIcon = (props: {color: string}) => (
  <MenuIcon color={props.color} />
);

export interface MainScreenParams {}

export default function MainScreen({navigation}: ScreenProps<'Main'>) {
  const accessToken = useAtomValue(accessTokenAtom);
  const checkAuth = useCheckAuth();
  const logger = useLogger();

  useEffect(() => {
    const checkIfLoggedIn = async () => {
      if (!accessToken) {
        navigation.replace('Login');
        ToastUtils.show('인증 정보가 유효하지 않습니다.');
      }
    };
    checkIfLoggedIn();
  }, [accessToken, navigation]);

  // Deferred deep link 소비: 로그인 완료 후 저장된 URL을 파싱해서 navigate
  useEffect(() => {
    if (!accessToken) {
      return;
    }
    const url = getDeferredDeepLinkUrl();
    if (!url) {
      return;
    }
    setDeferredDeepLinkUrl(null);
    const path = stripPrefix(url);
    if (!path) {
      return;
    }
    const state = getStateFromPath(path, linkingScreensConfig);
    if (!state) {
      return;
    }
    const action = getActionFromState(state, linkingScreensConfig);
    if (action) {
      navigation.dispatch(action);
    }
  }, [accessToken, navigation]);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: color.gray90,
        tabBarInactiveTintColor: color.gray40,
        tabBarLabelStyle: {fontSize: 10, fontWeight: '700'},
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreenV2}
        listeners={{
          tabPress: () => {
            logger.logElementClick('main_tab_home');
          },
        }}
        options={{
          title: '홈',
          headerShown: false,
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        listeners={{
          tabPress: () => {
            logger.logElementClick('main_tab_search');
          },
        }}
        options={{
          title: '지도',
          headerShown: false,
          tabBarIcon: MapTabIcon,
        }}
      />
      <Tab.Screen
        name="Challenge"
        component={ChallengeScreen}
        listeners={{
          tabPress: () => {
            logger.logElementClick('main_tab_challenge');
          },
        }}
        options={{
          title: '챌린지',
          headerShown: false,
          tabBarIcon: ChallengeTabIcon,
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        listeners={{
          tabPress: e => {
            logger.logElementClick('main_tab_menu');
            checkAuth(
              () => {},
              () => e.preventDefault(),
            );
          },
        }}
        options={{
          title: '메뉴',
          headerShown: false,
          tabBarIcon: MenuTabIcon,
        }}
      />
    </Tab.Navigator>
  );
}
