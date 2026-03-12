import {useBackHandler} from '@react-native-community/hooks';
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
import {hasShownHomeTutorialAtom} from '@/atoms/User';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {useSetAtom} from 'jotai';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;
const SLIDE_COUNT = 3;

export const tutorialSlides = [
  require('@/assets/img/tutorial_1.webp'),
  require('@/assets/img/tutorial_2.webp'),
  require('@/assets/img/tutorial_3.webp'),
];

export default function TutorialScreen({navigation}: ScreenProps<'Tutorial'>) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const setHasShownHomeTutorial = useSetAtom(hasShownHomeTutorialAtom);

  // Android 하드웨어 백버튼 차단
  useBackHandler(() => true, []);

  const isFirst = activeSlide === 0;
  const isLast = activeSlide === SLIDE_COUNT - 1;

  const scaledHeight = useMemo(() => {
    const source = Image.resolveAssetSource(tutorialSlides[0]);
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

  const handleStart = useCallback(() => {
    setHasShownHomeTutorial(true);
    navigation.goBack();
  }, [navigation, setHasShownHomeTutorial]);

  return (
    <Container>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}>
        {tutorialSlides.map((source, index) => (
          <SlideContainer key={index}>
            <Image
              source={source}
              style={{width: SCREEN_WIDTH, height: scaledHeight}}
            />
          </SlideContainer>
        ))}
      </ScrollView>
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
              {tutorialSlides.map((_, index) => (
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
