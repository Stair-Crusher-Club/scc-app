import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React from 'react';
import {Pressable} from 'react-native';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import {color} from '@/constant/color';

import {MainNavigationScreens, ScreenParams} from './Navigation.screens';
import * as S from './Navigation.style';

const Stack = createNativeStackNavigator<ScreenParams>();

type NavigationHeaderProps = {
  navigation:
    | NativeStackNavigationProp<ScreenParams, keyof ScreenParams>
    | undefined;
  title: string;
};

export const NavigationHeader = ({
  navigation,
  title,
}: NavigationHeaderProps) => {
  return (
    <S.Container edges={['top']}>
      <S.ContentsContainer>
        <Pressable onPress={() => navigation?.goBack()}>
          <LeftArrowIcon width={24} height={24} color={color.black} />
        </Pressable>
        <S.Title>{title}</S.Title>
      </S.ContentsContainer>
    </S.Container>
  );
};

export const Navigation = () => {
  return (
    <Stack.Navigator
      initialRouteName="Intro"
      screenOptions={({navigation}) => ({
        headerShown: false,
        // eslint-disable-next-line react/no-unstable-nested-components
        header: ({options}) => {
          if (options.headerTitle === '장소 검색') {
            return null;
          }
          const title =
            typeof options.headerTitle === 'string' ? options.headerTitle : '';
          if (!(typeof options.headerTitle === 'string')) {
            console.warn('Currently non-string headerTitle is not supported.');
          }
          return <NavigationHeader title={title} navigation={navigation} />;
        },
      })}>
      {MainNavigationScreens.map(screen => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options}
        />
      ))}
    </Stack.Navigator>
  );
};
