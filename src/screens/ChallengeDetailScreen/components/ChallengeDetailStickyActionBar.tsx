import {SccButton} from '@/components/atoms';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {useEffect, useRef, useState} from 'react';
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
  const translateY = useRef(new Animated.Value(BAR_HEIGHT)).current;
  const [display, setDisplay] = useState<'flex' | 'none'>(
    visible ? 'flex' : 'none',
  );

  useEffect(() => {
    if (visible) {
      setDisplay('flex');
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: BAR_HEIGHT,
        duration: 180,
        useNativeDriver: true,
      }).start(({finished}) => {
        if (finished) setDisplay('none');
      });
    }
  }, [visible, translateY]);

  const animatedStyle = {
    transform: [{translateY}],
    opacity: translateY.interpolate({
      inputRange: [0, BAR_HEIGHT],
      outputRange: [1, 0],
    }),
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
