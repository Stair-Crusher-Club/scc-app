import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import styled from 'styled-components/native';

import GoalIcon from '@/assets/icon/ic_signup_goal.svg';
import MoveIcon from '@/assets/icon/ic_signup_move.svg';
import {color} from '@/constant/color';

export default function ProgressViewer({progress}: {progress: number}) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const animatedWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Wrapper>
      <ProgressBar>
        <Animated.View
          style={{
            height: 6,
            backgroundColor: color.blue50,
            borderRadius: 5,
            width: animatedWidth,
          }}
        />
        <MoveIcon
          width={49}
          height={49}
          style={{marginTop: -25, marginLeft: -25}}
        />
      </ProgressBar>
      <GoalIcon
        width={28}
        height={35}
        style={{position: 'absolute', right: 0, top: 8}}
      />
    </Wrapper>
  );
}

const Wrapper = styled.View`
  height: 49px;
  padding-right: 18.5px;
  align-items: center;
  justify-content: space-between;
`;

const ProgressBar = styled.View`
  flex-direction: row;
  height: 6px;
  width: 100%;
  top: 33px;
  background-color: ${color.gray20};
  border-radius: 5px;
`;
