import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React from 'react';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import CloseIcon from '@/assets/icon/ic_x_black.svg';
import {SccPressable} from '@/components/SccPressable';
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
  onBackPress,
}: {
  navigation: NativeStackNavigationProp<any, any>;
  title: string;
  variant?: 'back' | 'close';
  onBackPress?: () => void;
}) => {
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <S.Container edges={['top']}>
      {variant === 'back' ? (
        <S.ContentsContainer>
          <SccPressable
            elementName="navigation_back_button"
            onPress={handleBack}>
            <LeftArrowIcon width={16} height={14} color={color.black} />
          </SccPressable>
          <S.Title ellipsizeMode="tail">{title}</S.Title>
        </S.ContentsContainer>
      ) : (
        <S.ContentsContainer style={{justifyContent: 'space-between'}}>
          <S.Title ellipsizeMode="tail">{title}</S.Title>
          <SccPressable
            elementName="close_button"
            logParams={{screen_name: title}}
            onPress={handleBack}>
            <CloseIcon width={28} height={28} color={color.black} />
          </SccPressable>
        </S.ContentsContainer>
      )}
    </S.Container>
  );
};

export const Navigation = () => {
  return (
    <Stack.Navigator
      initialRouteName="Intro"
      screenOptions={() => ({
        headerShown: false,
        // native-stack screen 컨테이너 기본값이 투명이라, 화면 전환 중/후에
        // GestureHandlerRootView 등 상위 트리의 배경색이 leak된다. 모든 화면을
        // 흰 배경으로 강제해 leak 차단. (특정 화면이 투명 필요시 override)
        contentStyle: {backgroundColor: color.white},
        // eslint-disable-next-line react/no-unstable-nested-components
        header: ({options, navigation}) => {
          const customOptions = options as CustomNavigationOptions;
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
              {...options}
              onBackPress={customOptions.onBackPress}
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
