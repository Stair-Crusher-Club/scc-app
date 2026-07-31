import React, {useEffect, useMemo, useRef, useState} from 'react';

import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {LogView} from '@/logging/LogView';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;
// 시트 상단 중 이 높이(px) 안에서 시작된 아래 방향 드래그만 "핸들을 잡고 끈다"로 인정한다.
// 자체 handle/grabber 가 없는 시트(FilterModal 등)는 이 영역이 스크롤 가능 영역과 겹칠 수 있다 —
// ScrollView 뷰포트 상단 44px 안에서 시작하는 드래그에 한해서만 발생하는 알려진 트레이드오프.
const DRAG_HANDLE_HEIGHT = 44;
const CLOSE_DRAG_RATIO = 0.25;
const CLOSE_VELOCITY_THRESHOLD = 0.5;
const SLIDE_DOWN_DURATION_MS = 280;

type Props = React.PropsWithChildren<{
  isVisible: boolean;
  onPressBackground?: () => void;
}>;
export default function BottomSheet({
  isVisible,
  onPressBackground,
  children,
}: Props) {
  // https://github.com/facebook/react-native/issues/47140
  // android 에서 translucent status bar 를 키면, keyboard 가 한 번 올라갔다 내려가면 translucent 영역만큼 뷰가 위로 올라간 채로 남는
  // 오류가 존재한다. 이를 해결하기 위해 인셋만큼 offset 을 주되, 키보드가 올라갔을 때는 정상적으로 보일 수 있도록 isKeyboardVisible 을 사용하여 패딩을 추가하는 식으로 처리한다.
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const keyboardVerticalOffset =
    Platform.OS === 'android' ? -insets.bottom - insets.top : 0;
  const temporalContainerPaddingBottom =
    isKeyboardVisible && Platform.OS === 'android'
      ? insets.bottom + insets.top
      : 0;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      },
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // ── 슬라이드업 등장 / 슬라이드다운 퇴장 / 드래그로 닫기 ──────────────
  // translateY 는 0(완전히 펼쳐짐) ~ sheetHeight(화면 밖으로 내려감) 사이를 움직인다.
  // dim 투명도는 translateY 에서 interpolate 로 파생시켜 등장/퇴장/드래그를 한 값으로 통일한다.
  const [isRendered, setIsRendered] = useState(isVisible);
  const [sheetHeight, setSheetHeight] = useState(SCREEN_HEIGHT);
  const sheetHeightRef = useRef(SCREEN_HEIGHT);
  const translateY = useRef(
    new Animated.Value(isVisible ? 0 : SCREEN_HEIGHT),
  ).current;
  const translateYValueRef = useRef(isVisible ? 0 : SCREEN_HEIGHT);
  const dragStartRef = useRef(0);
  const topMarkerRef = useRef<View>(null);
  const containerTopRef = useRef<number | null>(null);

  const remeasureContainerTop = () => {
    topMarkerRef.current?.measureInWindow((_x, y) => {
      containerTopRef.current = y;
    });
  };

  useEffect(() => {
    const id = translateY.addListener(({value}) => {
      translateYValueRef.current = value;
    });
    return () => translateY.removeListener(id);
  }, [translateY]);

  useEffect(() => {
    if (isVisible) {
      setIsRendered(true);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isRendered) {
      return;
    }
    translateY.stopAnimation();
    if (isVisible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 14,
      }).start(({finished}) => {
        if (finished) {
          remeasureContainerTop();
        }
      });
    } else {
      Animated.timing(translateY, {
        toValue: sheetHeightRef.current,
        duration: SLIDE_DOWN_DURATION_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({finished}) => {
        if (finished) {
          setIsRendered(false);
        }
      });
    }
  }, [isVisible, isRendered]);

  const dimOpacity = useMemo(
    () =>
      translateY.interpolate({
        inputRange: [0, sheetHeight],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      }),
    [translateY, sheetHeight],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      // Capture 단계에서 먼저 확인해야 children(ScrollView/SccPressable 등)이 터치를 선점하기 전에
      // 시트 핸들 드래그를 가로챌 수 있다 (MainBannerSection.tsx 의 스와이프 캡처와 동일한 이유).
      onMoveShouldSetPanResponderCapture: (_evt, gestureState) => {
        const top = containerTopRef.current;
        if (top == null) {
          return false;
        }
        const startedInHandleArea = gestureState.y0 - top <= DRAG_HANDLE_HEIGHT;
        return (
          startedInHandleArea &&
          gestureState.dy > 6 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onPanResponderGrant: () => {
        dragStartRef.current = translateYValueRef.current;
      },
      onPanResponderMove: (_evt, gestureState) => {
        const next = Math.max(0, dragStartRef.current + gestureState.dy);
        translateY.setValue(next);
      },
      onPanResponderRelease: (_evt, gestureState) => {
        const threshold = sheetHeightRef.current * CLOSE_DRAG_RATIO;
        const shouldClose =
          gestureState.dy > threshold ||
          gestureState.vy > CLOSE_VELOCITY_THRESHOLD;
        if (shouldClose) {
          Keyboard.dismiss();
          onPressBackground?.();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
            speed: 14,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
          speed: 14,
        }).start();
      },
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  const modalContent = (
    <Modal
      visible={isRendered}
      transparent
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={() => {
        onPressBackground?.();
      }}>
      <SafeAreaProvider>
        <KeyboardAvoidingView
          behavior={'padding'}
          style={{flexGrow: 1}}
          keyboardVerticalOffset={keyboardVerticalOffset}
          onLayout={remeasureContainerTop}>
          <DimmedBackground>
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                {backgroundColor: color.blacka50, opacity: dimOpacity},
              ]}
            />
            <SccTouchableOpacity
              elementName="bottom_sheet_background"
              activeOpacity={1}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
              }}
              onPress={() => {
                Keyboard.dismiss();
                onPressBackground?.();
              }}
            />
            <Animated.View
              onLayout={e => {
                const height = e.nativeEvent.layout.height;
                setSheetHeight(height);
                sheetHeightRef.current = height;
                remeasureContainerTop();
              }}
              style={{
                transform: [{translateY}],
              }}
              {...panResponder.panHandlers}>
              <Container
                style={{
                  paddingBottom: temporalContainerPaddingBottom,
                }}>
                <View
                  ref={topMarkerRef}
                  style={{height: 0}}
                  onLayout={remeasureContainerTop}
                />
                <SafeAreaView edges={['bottom']}>{children}</SafeAreaView>
              </Container>
            </Animated.View>
          </DimmedBackground>
        </KeyboardAvoidingView>
      </SafeAreaProvider>
    </Modal>
  );

  // LogView는 Modal이 실제로 보일 때만 렌더링 (퇴장 애니메이션 중에도 보이므로 isRendered 기준)
  if (isRendered) {
    return <LogView elementName="bottom_sheet">{modalContent}</LogView>;
  }

  return modalContent;
}

const DimmedBackground = styled(View)({
  flex: 1,
  flexDirection: 'column-reverse',
  backgroundColor: 'transparent',
});

const Container = styled(View)({
  flexDirection: 'column',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  backgroundColor: color.white,
  overflow: 'visible',
});
