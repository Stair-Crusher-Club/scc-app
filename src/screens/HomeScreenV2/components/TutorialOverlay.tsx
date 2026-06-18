import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  GestureResponderEvent,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import ChevronRight from '@/assets/icon/ic_chevron_right.svg';
import {SccPressable} from '@/components/SccPressable';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;
const isWeb = Platform.OS === 'web';

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
    const target = Math.max(0, activeSlide - 1);
    // setActiveSlide 직접 갱신: rn-web 에서는 onMomentumScrollEnd 가 발화하지 않아
    // scrollTo 만으로는 activeSlide(점·버튼 상태)가 갱신되지 않는다.
    setActiveSlide(target);
    scrollRef.current?.scrollTo({x: target * SCREEN_WIDTH, animated: true});
  }, [activeSlide]);

  const handleNext = useCallback(() => {
    const target = Math.min(slides.length - 1, activeSlide + 1);
    setActiveSlide(target);
    scrollRef.current?.scrollTo({x: target * SCREEN_WIDTH, animated: true});
  }, [activeSlide]);

  // 탭 위치로 이전/다음 판단 (스와이프는 ScrollView가 처리)
  const touchStartRef = useRef({x: 0, y: 0});
  const handleTouchStart = useCallback((e: GestureResponderEvent) => {
    touchStartRef.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
    };
  }, []);
  const handleTouchEnd = useCallback(
    (e: GestureResponderEvent) => {
      const dx = Math.abs(e.nativeEvent.pageX - touchStartRef.current.x);
      const dy = Math.abs(e.nativeEvent.pageY - touchStartRef.current.y);
      // 스와이프가 아닌 탭인 경우만 처리
      if (dx > 10 || dy > 10) {
        return;
      }
      const isLeftHalf = e.nativeEvent.pageX < SCREEN_WIDTH / 2;
      if (isLeftHalf) {
        if (!isFirst) {
          handlePrev();
        }
      } else {
        if (!isLast) {
          handleNext();
        }
      }
    },
    [isFirst, isLast, handlePrev, handleNext],
  );

  // Modal 로 변환: statusBarTranslucent 로 dim 이 status bar 까지 덮음. BottomBar 는
  // useSafeAreaInsets().bottom + 20 padding 으로 home indicator / nav bar 위로 올라온다.
  // (이전: HomeScreenV2 안 absolute view 라 부모 SafeArea 안에서만 absolute, Android nav bar
  // 영역에서 버튼이 겹치는 문제.)
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Backdrop>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onMomentumScrollEnd={handleScroll}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          scrollEventThrottle={16}>
          {slides.map((source, index) => (
            <SlideContainer key={index}>
              <Image
                source={source}
                // 웹: resolveAssetSource 가 실제 치수를 모르므로 scaledHeight 가
                // 부정확하다. contain 으로 프레임 안에 이미지를 온전히 맞춘다.
                style={
                  isWeb
                    ? {
                        width: SCREEN_WIDTH,
                        height: '100%',
                        resizeMode: 'contain',
                      }
                    : {width: SCREEN_WIDTH, height: scaledHeight}
                }
              />
            </SlideContainer>
          ))}
        </ScrollView>
        <BottomBar
          style={{paddingBottom: insets.bottom + 20}}
          pointerEvents="box-none">
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
            <NavRow pointerEvents="box-none">
              <SccPressable
                elementName="tutorial_prev_button"
                onPress={isFirst ? undefined : handlePrev}
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
              <SccPressable
                elementName="tutorial_next_button"
                onPress={handleNext}>
                <NavButtonInner>
                  <NavText>다음</NavText>
                  <ChevronRight width={24} height={24} color={color.white} />
                </NavButtonInner>
              </SccPressable>
            </NavRow>
          )}
        </BottomBar>
      </Backdrop>
    </Modal>
  );
}

const ChevronLeft = styled(ChevronRight)`
  transform: rotate(180deg);
`;

const Backdrop = styled.View`
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
