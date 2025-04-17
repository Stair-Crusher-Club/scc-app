import {atom, useAtomValue} from 'jotai';
import Lottie from 'lottie-react-native';
import React, {useCallback, useEffect, useRef} from 'react';
import {Animated, BackHandler, Dimensions} from 'react-native';

import {color} from '@/constant/color';

// Create a map atom to store loading states
export const loadingState = atom<Map<string, boolean>>(new Map());

// Create a derived atom to check if any loading is active
export const isLoadingVisibleState = atom(get => {
  const state = get(loadingState);
  // every(true) 로 선언하면 빈배열은 무조건 true. 그래서 every(false) 조건을 사용했다.
  return ![...state.values()].every(l => l === false);
});

interface LoadingViewProps {}

export const LoadingView = ({}: LoadingViewProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  const fadeIn = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [fadeAnim]);

  const fadeOut = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [fadeAnim]);

  const hardwardBackPressBlock = useCallback(() => true, []);

  const isLoadingVisible = useAtomValue(isLoadingVisibleState);

  useEffect(() => {
    if (isLoadingVisible) {
      BackHandler.addEventListener('hardwareBackPress', hardwardBackPressBlock);
      fadeIn();
      loadingLottie.current?.play();
    } else {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        hardwardBackPressBlock,
      );
      fadeOut();
      loadingLottie.current?.pause();
    }

    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        hardwardBackPressBlock,
      );
    };
  }, [isLoadingVisible, fadeIn, fadeOut, hardwardBackPressBlock]);

  const loadingLottie = useRef<Lottie>(null);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: color.blacka30,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
        height: height,
        opacity: fadeAnim,
      }}
      pointerEvents={isLoadingVisible ? 'auto' : 'none'}>
      <Lottie
        ref={loadingLottie}
        style={{
          width: 90,
          height: 90,
        }}
        source={require('@/assets/animations/congal.json')}
        loop
      />
    </Animated.View>
  );
};
