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
import {webOnlyScreens} from './webScreens';
import * as S from './Navigation.style';

const AllNavigationScreens = [...MainNavigationScreens, ...webOnlyScreens];

const Stack = createNativeStackNavigator<ScreenParams>();

type ScreenOptions = (typeof AllNavigationScreens)[number]['options'];

/**
 * `asModal` 파라미터로 진입한 화면은 **어떤 화면이든** 네이티브 모달로 띄운다.
 *
 * Webview 는 `presentation: 'fullScreenModal'` 이라, 그 위에 기본 push 로 화면을 올리면
 * iOS 에서 네이티브 모달이 위에 남아 새 화면이 가려진다 → 유저에겐 "눌러도 무반응" 이고,
 * 그 상태에서 X 를 누르면 가려진 화면이 먼저 pop 돼 **닫기를 두 번** 눌러야 한다.
 *
 * 웹뷰 안 링크(딥링크/트래킹 링크)가 띄울 수 있는 화면은 linkingConfig 에 있는 전부이므로
 * 화면마다 옵션을 붙이지 않고 등록 지점에서 일괄 처리한다 — 새 화면이 추가돼도 자동 적용된다.
 */
function withModalPresentation(options: ScreenOptions) {
  return (props: {route: any; navigation: any}): CustomNavigationOptions => {
    const resolved = typeof options === 'function' ? options(props) : options;
    if (!props.route.params?.asModal) {
      return resolved ?? {};
    }
    return {...resolved, presentation: 'fullScreenModal'};
  };
}

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
            hitSlop={15}
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
            hitSlop={8}
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
      {AllNavigationScreens.map(screen => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={withModalPresentation(screen.options)}
        />
      ))}
    </Stack.Navigator>
  );
};
