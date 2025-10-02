import {color} from '@/constant/color';
import {useEffect, useRef} from 'react';
import {Animated, ViewProps} from 'react-native';
import styled from 'styled-components/native';

export default function Skeleton({style}: ViewProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ]).start(() => animate());
    };

    animate();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [color.gray10, color.gray20],
  });

  return (
    <StyledSkeletonView
      style={[
        {
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

const StyledSkeletonView = styled(Animated.View)``;
