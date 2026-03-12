import {useBackHandler} from '@react-native-community/hooks';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Dimensions, Image} from 'react-native';
import Carousel, {ICarouselInstance} from 'react-native-reanimated-carousel';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import ChevronRight from '@/assets/icon/ic_chevron_right.svg';
import {hasShownHomeTutorialAtom} from '@/atoms/User';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {useSetAtom} from 'jotai';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;
const SLIDE_COUNT = 3;

const slides = [
  require('@/assets/img/tutorial_1.png'),
  require('@/assets/img/tutorial_2.png'),
  require('@/assets/img/tutorial_3.png'),
];

export default function TutorialScreen({navigation}: ScreenProps<'Tutorial'>) {
  const insets = useSafeAreaInsets();
  const carouselRef = useRef<ICarouselInstance>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const setHasShownHomeTutorial = useSetAtom(hasShownHomeTutorialAtom);

  // Android 하드웨어 백버튼 차단
  useBackHandler(() => true, []);

  const isFirst = activeSlide === 0;
  const isLast = activeSlide === SLIDE_COUNT - 1;

  const scaledHeight = useMemo(() => {
    const source = Image.resolveAssetSource(slides[0]);
    return SCREEN_WIDTH * (source.height / source.width);
  }, []);

  const handlePrev = useCallback(() => {
    carouselRef.current?.prev();
  }, []);

  const handleNext = useCallback(() => {
    carouselRef.current?.next();
  }, []);

  const handleStart = useCallback(() => {
    setHasShownHomeTutorial(true);
    navigation.goBack();
  }, [navigation, setHasShownHomeTutorial]);

  const renderSlide = useCallback(
    ({item}: {item: (typeof slides)[number]}) => (
      <SlideContainer>
        <Image
          source={item}
          style={{width: SCREEN_WIDTH, height: scaledHeight}}
        />
      </SlideContainer>
    ),
    [scaledHeight],
  );

  return (
    <Container>
      {/* Carousel 초기화 전 검은 화면 방지: 첫 이미지를 배경으로 즉시 렌더 */}
      <FirstSlideBackground>
        <Image
          source={slides[0]}
          style={{width: SCREEN_WIDTH, height: scaledHeight}}
        />
      </FirstSlideBackground>
      <Carousel
        ref={carouselRef}
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
      <BottomBar style={{paddingBottom: insets.bottom + 20}}>
        {isLast ? (
          <StartButton
            onPress={handleStart}
            elementName="tutorial_start_button">
            <StartButtonText>시작하기</StartButtonText>
          </StartButton>
        ) : (
          <NavRow>
            <SccPressable
              onPress={handlePrev}
              disabled={isFirst}
              elementName="tutorial_prev"
              disableLogging={isFirst}
              style={{opacity: isFirst ? 0 : 1}}>
              <NavButtonInner>
                <ChevronLeft width={24} height={24} color={color.white} />
                <NavText>이전</NavText>
              </NavButtonInner>
            </SccPressable>
            <DotsContainer>
              {slides.map((_, index) => (
                <Dot key={index} active={index === activeSlide} />
              ))}
            </DotsContainer>
            <SccPressable onPress={handleNext} elementName="tutorial_next">
              <NavButtonInner>
                <NavText>다음</NavText>
                <ChevronRight width={24} height={24} color={color.white} />
              </NavButtonInner>
            </SccPressable>
          </NavRow>
        )}
      </BottomBar>
    </Container>
  );
}

// chevron left = chevron right 180도 회전
const ChevronLeft = styled(ChevronRight)`
  transform: rotate(180deg);
`;

const Container = styled.View`
  flex: 1;
  background-color: ${color.black};
`;

const FirstSlideBackground = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: ${SCREEN_WIDTH}px;
  height: ${SCREEN_HEIGHT}px;
  overflow: hidden;
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

const StartButton = styled(SccPressable)`
  background-color: ${color.brand40};
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  padding-horizontal: 28px;
  padding-vertical: 12px;
`;

const StartButtonText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.white};
`;
