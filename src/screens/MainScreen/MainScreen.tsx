import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAtomValue} from 'jotai';
import React, {useEffect} from 'react';

import {accessTokenAtom, featureFlagAtom} from '@/atoms/Auth';
import {color} from '@/constant/color';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ToastUtils from '@/utils/ToastUtils';
import {useCheckAuth} from '@/utils/checkAuth';

import ChallengeIcon from '../../assets/icon/ic_challenge.svg';
import HomeIcon from '../../assets/icon/ic_home.svg';
import MenuIcon from '../../assets/icon/ic_menu.svg';
import ChallengeScreen from '../ChallengeScreen';
import HomeScreen from '../HomeScreen';
import HomeScreenV2 from '../HomeScreenV2';
import MenuScreen from '../MenuScreen';

const Tab = createBottomTabNavigator();

// Move tab bar icon components outside to avoid ESLint warnings
const HomeTabIcon = (props: {color: string}) => (
  <HomeIcon color={props.color} />
);
const ChallengeTabIcon = (props: {color: string}) => (
  <ChallengeIcon color={props.color} />
);
const MenuTabIcon = (props: {color: string}) => (
  <MenuIcon color={props.color} />
);

export interface MainScreenParams {}

export default function MainScreen({navigation}: ScreenProps<'Main'>) {
  const accessToken = useAtomValue(accessTokenAtom);
  const featureFlag = useAtomValue(featureFlagAtom);
  const checkAuth = useCheckAuth();

  // TODO: 디버깅용 강제 활성화 - 작업 완료 후 원복
  const isHomeScreenV2 = true;

  useEffect(() => {
    const checkIfLoggedIn = async () => {
      if (!accessToken) {
        navigation.replace('Login');
        ToastUtils.show('인증 정보가 유효하지 않습니다.');
      }
    };
    checkIfLoggedIn();
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
        component={isHomeScreenV2 ? HomeScreenV2 : HomeScreen}
        options={{
          title: '홈',
          headerShown: false,
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name="Challenge"
        component={ChallengeScreen}
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
