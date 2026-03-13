import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import ChevronRight from '@/assets/icon/ic_chevron_right.svg';
import {SccButton} from '@/components/atoms';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

const slides = [
  require('@/assets/img/tutorial_1.png'),
  require('@/assets/img/tutorial_2.png'),
  require('@/assets/img/tutorial_3.png'),
];

interface TutorialOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export default function TutorialOverlay({
  visible,
  onClose,
}: TutorialOverlayProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const isFirst = activeSlide === 0;
  const isLast = activeSlide === slides.length - 1;

  const scaledHeight = useMemo(() => {
    const source = Image.resolveAssetSource(slides[0]);
    return SCREEN_WIDTH * (source.height / source.width);
  }, []);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setActiveSlide(page);
    },
    [],
  );

  const handlePrev = useCallback(() => {
    scrollRef.current?.scrollTo({
      x: (activeSlide - 1) * SCREEN_WIDTH,
      animated: true,
    });
  }, [activeSlide]);

  const handleNext = useCallback(() => {
    scrollRef.current?.scrollTo({
      x: (activeSlide + 1) * SCREEN_WIDTH,
      animated: true,
    });
  }, [activeSlide]);

  // 항상 이미지를 렌더 (디코딩), visible일 때만 위로 올림
  return (
    <Overlay style={{zIndex: visible ? 9999 : -1}}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEnabled={visible}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}>
        {slides.map((source, index) => (
          <SlideContainer key={index}>
            <Image
              source={source}
              style={{width: SCREEN_WIDTH, height: scaledHeight}}
            />
          </SlideContainer>
        ))}
      </ScrollView>
      {visible && (
        <>
          {/* 좌측 반: 이전, 우측 반: 다음 터치 영역 */}
          {!isLast && (
            <TouchAreaRow>
              <TouchAreaLeft
                onPress={isFirst ? undefined : handlePrev}
                elementName="tutorial_touch_prev"
                disableLogging={isFirst}
              />
              <TouchAreaRight
                onPress={handleNext}
                elementName="tutorial_touch_next"
              />
            </TouchAreaRow>
          )}
          <BottomBar style={{paddingBottom: insets.bottom + 20}}>
            {isLast ? (
              <SccButton
                text="시작하기"
                onPress={onClose}
                fontSize={18}
                fontFamily={font.pretendardSemibold}
                buttonColor="brand40"
                elementName="tutorial_start_button"
                style={{borderRadius: 8}}
              />
            ) : (
              <NavRow>
                <NavButtonInner style={{opacity: isFirst ? 0 : 1}}>
                  <ChevronLeft width={24} height={24} color={color.white} />
                  <NavText>이전</NavText>
                </NavButtonInner>
                <DotsContainer>
                  {slides.map((_, index) => (
                    <Dot key={index} active={index === activeSlide} />
                  ))}
                </DotsContainer>
                <NavButtonInner>
                  <NavText>다음</NavText>
                  <ChevronRight width={24} height={24} color={color.white} />
                </NavButtonInner>
              </NavRow>
            )}
          </BottomBar>
        </>
      )}
    </Overlay>
  );
}

const ChevronLeft = styled(ChevronRight)`
  transform: rotate(180deg);
`;

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: ${SCREEN_WIDTH}px;
  height: ${SCREEN_HEIGHT}px;
  background-color: ${color.black};
`;

const SlideContainer = styled.View`
  width: ${SCREEN_WIDTH}px;
  height: ${SCREEN_HEIGHT}px;
  overflow: hidden;
`;

const BottomBar = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding-horizontal: 20px;
`;

const NavRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const NavButtonInner = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding-horizontal: 20px;
  padding-vertical: 12px;
  gap: 2px;
`;

const NavText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  line-height: 24px;
  height: 24px;
  letter-spacing: -0.32px;
  color: ${color.white};
`;

const DotsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const Dot = styled.View<{active: boolean}>`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${({active}) => (active ? color.gray20v2 : color.gray50v2)};
`;

const TouchAreaRow = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  flex-direction: row;
`;

const TouchAreaLeft = styled(SccPressable)`
  flex: 1;
`;

const TouchAreaRight = styled(SccPressable)`
  flex: 1;
`;

