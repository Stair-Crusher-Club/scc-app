import {color} from '@/constant/color';
import {useEffect, useRef} from 'react';
import {Animated, ViewProps} from 'react-native';

export default function Skeleton({style}: ViewProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;
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
      ]).start(() => {
        if (isMounted) {
          animate();
        }
      });
    };

    animate();

    return () => {
      isMounted = false;
      animatedValue.stopAnimation();
    };
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [color.gray10, color.gray20],
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor,
        },
        style,
      ]}
    />
  );
}
