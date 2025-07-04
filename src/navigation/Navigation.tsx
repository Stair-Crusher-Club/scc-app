import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React from 'react';
import {Pressable} from 'react-native';

import CloseIcon from '@/assets/icon/close.svg';
import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import {color} from '@/constant/color';

import {
  CustomNavigationOptions,
  MainNavigationScreens,
  ScreenParams,
} from './Navigation.screens';
import * as S from './Navigation.style';

const Stack = createNativeStackNavigator<ScreenParams>();

export const NavigationHeader = ({
  navigation,
  title,
  variant = 'back',
}: {
  navigation: NativeStackNavigationProp<any, any>;
  title: string;
  variant?: 'back' | 'close';
}) => {
  return (
    <S.Container edges={['top']}>
      {variant === 'back' ? (
        <S.ContentsContainer>
          <Pressable onPress={() => navigation.goBack()}>
            <LeftArrowIcon width={24} height={24} color={color.black} />
          </Pressable>
          <S.Title>{title}</S.Title>
        </S.ContentsContainer>
      ) : (
        <S.ContentsContainer style={{justifyContent: 'space-between'}}>
          <S.Title>{title}</S.Title>
          <Pressable onPress={() => navigation.goBack()}>
            <CloseIcon width={28} height={28} color={color.black} />
          </Pressable>
        </S.ContentsContainer>
      )}
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
          const customOptions = options as CustomNavigationOptions;
          if (options.headerTitle === '장소 검색') {
            return null;
          }
          const title =
            typeof options.headerTitle === 'string' ? options.headerTitle : '';
          if (!(typeof options.headerTitle === 'string')) {
            console.warn('Currently non-string headerTitle is not supported.');
          }
          const variant =
            typeof customOptions.variant === 'string'
              ? customOptions.variant
              : undefined;
          return (
            <NavigationHeader
              title={title}
              navigation={navigation}
              variant={variant}
            />
          );
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
