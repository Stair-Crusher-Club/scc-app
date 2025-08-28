import {ChallengeQuestCompleteStampTypeDto} from '@/generated-sources/openapi';
import React, {useEffect, useRef} from 'react';
import {Animated, Image, ImageProps} from 'react-native';
import styled from 'styled-components/native';

const stampImage: Record<
  ChallengeQuestCompleteStampTypeDto,
  {
    backgroundStamp: ImageProps['source'];
    animatedStamp: ImageProps['source'];
  }
> = {
  FLAG: {
    backgroundStamp: require('@/assets/img/stamp/stamp_flag_bg.png'),
    animatedStamp: require('@/assets/img/stamp/stamp_flag_animated.png'),
  },
  CAFE: {
    backgroundStamp: require('@/assets/img/stamp/stamp_cafe_bg.png'),
    animatedStamp: require('@/assets/img/stamp/stamp_cafe_animated.png'),
  },
  THUMBS_UP: {
    backgroundStamp: require('@/assets/img/stamp/stamp_good_bg.png'),
    animatedStamp: require('@/assets/img/stamp/stamp_good_animated.png'),
  },
  POTION: {
    backgroundStamp: require('@/assets/img/stamp/stamp_potion_bg.png'),
    animatedStamp: require('@/assets/img/stamp/stamp_potion_animated.png'),
  },
  RESTAURANT: {
    backgroundStamp: require('@/assets/img/stamp/stamp_restaurant_bg.png'),
    animatedStamp: require('@/assets/img/stamp/stamp_restaurant_animated.png'),
  },
  REVIEW: {
    backgroundStamp: require('@/assets/img/stamp/stamp_review_bg.png'),
    animatedStamp: require('@/assets/img/stamp/stamp_review_animated.png'),
  },
};

interface QuestClearStampProps {
  type?: ChallengeQuestCompleteStampTypeDto;
  autoPlay?: boolean;
  duration?: number;
}

export default function QuestClearStamp({
  type = 'CAFE',
  autoPlay = true,
  duration = 600,
}: QuestClearStampProps) {
  const scaleValue = useRef(new Animated.Value(1.5)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  const startStampAnimation = () => {
    scaleValue.setValue(1.8);
    opacityValue.setValue(0);

    Animated.parallel([
      Animated.timing(opacityValue, {
        toValue: 1.0,
        duration: duration * 0.15,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.9,
          duration: duration * 0.15,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1.0,
          duration: duration * 0.75,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(() => {
        startStampAnimation();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay]);

  return (
    <Container>
      <BackgroundStamp source={stampImage[type].backgroundStamp} />

      <AnimatedStampContainer
        style={{
          transform: [{scale: scaleValue}],
          opacity: opacityValue,
        }}>
        <AnimatedStamp source={stampImage[type].animatedStamp} />
      </AnimatedStampContainer>
    </Container>
  );
}

const Container = styled.View`
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 300px;
  height: 300px;
  position: relative;
`;

const BackgroundStamp = styled(Image)`
  width: 150px;
  height: 150px;
  position: absolute;
`;

const AnimatedStampContainer = styled(Animated.View)`
  position: absolute;
  justify-content: center;
  align-items: center;
`;

const AnimatedStamp = styled(Image)`
  width: 150px;
  height: 150px;
`;
