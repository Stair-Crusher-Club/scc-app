import React, {useEffect, useRef} from 'react';
import {Animated, View} from 'react-native';

import GoalIcon from '@/assets/icon/ic_signup_goal.svg';
import MoveIcon from '@/assets/icon/ic_signup_move.svg';

export default function ProgressViewer({progress}: {progress: number}) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const animatedWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View className="h-[49px] pr-[18.5px]">
      {/* Background Bar */}
      <View className="h-[6px] w-full absolute top-[33px] bg-gray-20 rounded-[5px]">
        {/* Progress Fill */}
        <Animated.View
          className="h-[6px] bg-blue-50 rounded-[5px]"
          style={{
            width: animatedWidth,
          }}
        />
      </View>

      {/* Seeker Icon (Astronaut) */}
      <Animated.View
        className="absolute w-[49px] h-[49px] z-[100]"
        style={{
          left: animatedWidth,
          top: 33 - 35, // Progress bar top - icon offset
          marginLeft: -36, // Center the icon horizontally (approx)
        }}>
        <MoveIcon width={49} height={49} />
      </Animated.View>

      {/* Goal Icon (Flag) */}
      <GoalIcon width={28} height={35} className="absolute right-0 top-[8px]" />
    </View>
  );
}
