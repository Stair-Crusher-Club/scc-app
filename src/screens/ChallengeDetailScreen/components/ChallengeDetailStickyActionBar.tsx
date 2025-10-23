import {SccButton} from '@/components/atoms';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleProp, ViewStyle} from 'react-native';
import styled from 'styled-components/native';

interface Props {
  visible?: boolean;
  onGoConquer: () => void;
  style?: StyleProp<ViewStyle>;
}

const BAR_HEIGHT = 96;

export default function ChallengeDetailStickyActionBar({
  visible = false,
  onGoConquer,
  style,
}: Props) {
  const progress = useRef(new Animated.Value(0)).current; // 0=hidden, 1=visible
  const [display, setDisplay] = useState<'flex' | 'none'>(
    visible ? 'flex' : 'none',
  );

  useEffect(() => {
    if (visible) {
      setDisplay('flex');
      Animated.timing(progress, {
        toValue: 1,
        duration: 180,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }).start(({finished}) => {
        if (finished) setDisplay('none');
      });
    }
  }, [visible, progress]);

  const animatedStyle = {
    height: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, BAR_HEIGHT],
    }),
    opacity: progress,
    overflow: 'hidden' as const,
  };

  return (
    <ButtonContainer
      style={[
        {display},
        {
          boxShadow: [
            {
              offsetX: 4,
              offsetY: 0,
              blurRadius: 9,
              spreadDistance: 0,
              color: 'rgba(0, 0, 0, 0.13)',
            },
          ],
        },
        animatedStyle,
        style,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}>
      <SafeAreaWrapper edges={['bottom']}>
        <SccButton
          text="장소 정복하러 가기"
          textColor="white"
          buttonColor="brandColor"
          fontFamily={font.pretendardBold}
          onPress={onGoConquer}
          elementName="challenge_detail_go_conquer"
        />
      </SafeAreaWrapper>
    </ButtonContainer>
  );
}

const ButtonContainer = styled(Animated.View)({
  backgroundColor: color.white,
  padding: '20px 20px 12px',
});
