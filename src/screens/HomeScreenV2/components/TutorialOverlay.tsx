import React, {useCallback, useState} from 'react';
import {Dimensions, Image} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import {color} from '@/constant/color';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const slides = [
  require('@/assets/img/tutorial_1.png'),
  require('@/assets/img/tutorial_2.png'),
  require('@/assets/img/tutorial_3.png'),
];

interface TutorialOverlayProps {
  onClose: () => void;
}

export default function TutorialOverlay({
  onClose: _onClose,
}: TutorialOverlayProps) {
  const insets = useSafeAreaInsets();
  const [activeSlide, setActiveSlide] = useState(0);

  const renderSlide = useCallback(
    ({item}: {item: (typeof slides)[number]}) => (
      <SlideImage source={item} resizeMode="cover" />
    ),
    [],
  );

  return (
    <Overlay>
      <Carousel
        data={slides}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        loop={false}
        renderItem={renderSlide}
        onProgressChange={(_, i) => setActiveSlide(Math.round(i))}
        onConfigurePanGesture={gestureChain => {
          gestureChain.activeOffsetX([-10, 10]);
        }}
      />
      <IndicatorContainer style={{bottom: insets.bottom + 40}}>
        {slides.map((_, index) => (
          <Dot key={index} active={index === activeSlide} />
        ))}
      </IndicatorContainer>
    </Overlay>
  );
}

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: ${color.black};
`;

const SlideImage = styled(Image)`
  width: ${SCREEN_WIDTH}px;
  height: ${SCREEN_HEIGHT}px;
`;

const IndicatorContainer = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 6px;
`;

const Dot = styled.View<{active: boolean}>`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${({active}) => (active ? color.gray15 : color.gray50v2)};
`;
