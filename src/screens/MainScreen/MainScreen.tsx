import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAtomValue} from 'jotai';
import React, {useEffect} from 'react';

import {accessTokenAtom} from '@/atoms/Auth';
import {color} from '@/constant/color';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ToastUtils from '@/utils/ToastUtils';
import {useCheckAuth} from '@/utils/checkAuth';

import ChallengeIcon from '../../assets/icon/ic_challenge.svg';
import HomeIcon from '../../assets/icon/ic_home.svg';
import MenuIcon from '../../assets/icon/ic_menu.svg';
import ChallengeScreen from '../ChallengeScreen';
import HomeScreen from '../HomeScreen';
import MenuScreen from '../MenuScreen';

const Tab = createBottomTabNavigator();

export interface MainScreenParams {}

export default function MainScreen({navigation}: ScreenProps<'Main'>) {
  const accessToken = useAtomValue(accessTokenAtom);
  const checkAuth = useCheckAuth();

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
        component={HomeScreen}
        options={{
          title: '홈',
          headerShown: false,
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Challenge"
        component={ChallengeScreen}
        options={{
          title: '챌린지',
          headerShown: false,
          tabBarIcon: ChallengeIcon,
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        listeners={{
          tabPress: e => {
            e.preventDefault();
            checkAuth(() => navigation.navigate('Menu'));
          },
        }}
        options={{
          title: '메뉴',
          headerShown: false,
          tabBarIcon: MenuIcon,
        }}
      />
    </Tab.Navigator>
  );
}
