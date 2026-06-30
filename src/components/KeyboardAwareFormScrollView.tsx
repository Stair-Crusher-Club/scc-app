import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  ScrollViewProps,
  TextInput,
  View,
} from 'react-native';

import {SccTouchableWithoutFeedback} from '@/components/SccTouchableWithoutFeedback';

type Measurable = {
  measureInWindow: (
    cb: (x: number, y: number, w: number, h: number) => void,
  ) => void;
};

/**
 * 래퍼 내부의 input이 포커스될 때 스크롤 보정을 트리거하기 위한 context.
 * SignupBoxInput 등 입력 컴포넌트가 onFocus에서 notifyInputFocus()를 호출한다.
 */
const KeyboardAwareFocusContext = createContext<{notifyInputFocus: () => void}>(
  {notifyInputFocus: () => {}},
);

export function useKeyboardAwareFocus() {
  return useContext(KeyboardAwareFocusContext);
}

export interface KeyboardAwareFormScrollViewRef {
  scrollToTop: () => void;
}

interface Props extends Omit<ScrollViewProps, 'keyboardShouldPersistTaps'> {
  children: React.ReactNode;
  /** 포커스된 input 하단과 뷰포트(키보드) 사이에 확보할 여백 px */
  focusBottomGap?: number;
}

/**
 * 폼 화면용 키보드 친화 ScrollView. 다음을 한 번에 제공한다.
 * - 키보드가 떠 있어도 버튼/input 첫 탭이 즉시 동작(keyboardShouldPersistTaps="always").
 *   (안드로이드는 'handled'로는 첫 탭이 씹혀 'always'가 불가피)
 * - 빈 영역을 탭-릴리즈하면 키보드 닫힘. 스크롤(드래그) 중에는 닫히지 않음.
 * - 포커스된 input의 하단+여백이 뷰포트 밖일 때'만', 부족한 만큼'만' 스크롤.
 *   래퍼 안의 SignupBoxInput이 context로 자동 트리거하므로 input별 배선 불필요.
 *
 * 키보드 위 도킹 푸터가 필요하면 상위에서 KeyboardAvoidingView로 이 컴포넌트와
 * 푸터를 함께 감싼다(이 컴포넌트는 키보드 좌표를 직접 계산하지 않고 줄어든
 * 뷰포트 높이만으로 판정한다).
 */
const KeyboardAwareFormScrollView = forwardRef<
  KeyboardAwareFormScrollViewRef,
  Props
>(
  (
    {children, focusBottomGap = 60, contentContainerStyle, onScroll, ...rest},
    ref,
  ) => {
    const scrollRef = useRef<ScrollView>(null);
    const offsetRef = useRef(0);

    useImperativeHandle(ref, () => ({
      scrollToTop: () => scrollRef.current?.scrollTo({y: 0, animated: false}),
    }));

    const ensureFocusedInputVisible = useCallback(() => {
      // 다음 프레임으로 미뤄 포커스 전환(TextInput.State 갱신)이 끝난 뒤 측정한다.
      // 즉시 읽으면 키보드가 떠 있는 상태에서 input을 바꿀 때 직전 input이 잡힌다.
      requestAnimationFrame(() => {
        const scrollNode = (
          scrollRef.current as unknown as {
            getNativeScrollRef?: () => Measurable | null;
          } | null
        )?.getNativeScrollRef?.();
        const input =
          TextInput.State.currentlyFocusedInput() as Measurable | null;
        if (!scrollNode || !input) return;
        scrollNode.measureInWindow((_sx, sy, _sw, sh) => {
          input.measureInWindow((_ix, iy, _iw, ih) => {
            const topRel = iy - sy;
            const bottomRel = iy + ih - sy;
            let delta = 0;
            if (bottomRel + focusBottomGap > sh) {
              delta = bottomRel + focusBottomGap - sh; // 아래로 부족한 만큼만 내림
            } else if (topRel < 0) {
              delta = topRel; // 위로 가려졌으면 그만큼만 올림
            }
            if (Math.abs(delta) > 1) {
              scrollRef.current?.scrollTo({
                y: Math.max(0, offsetRef.current + delta),
                animated: true,
              });
            }
          });
        });
      });
    }, [focusBottomGap]);

    // 키보드가 완전히 올라온 뒤(레이아웃 안정) 한 번 보정.
    useEffect(() => {
      const sub = Keyboard.addListener(
        'keyboardDidShow',
        ensureFocusedInputVisible,
      );
      return () => sub.remove();
    }, [ensureFocusedInputVisible]);

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      offsetRef.current = e.nativeEvent.contentOffset.y;
      onScroll?.(e);
    };

    return (
      <KeyboardAwareFocusContext.Provider
        value={{notifyInputFocus: ensureFocusedInputVisible}}>
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="always"
          scrollEventThrottle={16}
          // flexGrow: 콘텐츠가 짧아도 래퍼가 뷰포트를 가득 채워 빈 영역 어디를
          // 탭해도 키보드가 닫히도록.
          contentContainerStyle={[{flexGrow: 1}, contentContainerStyle]}
          onScroll={handleScroll}
          {...rest}>
          <SccTouchableWithoutFeedback
            elementName="keyboard_dismiss_background"
            disableLogging
            accessible={false}>
            <View style={{flexGrow: 1}}>{children}</View>
          </SccTouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAwareFocusContext.Provider>
    );
  },
);

KeyboardAwareFormScrollView.displayName = 'KeyboardAwareFormScrollView';

export default KeyboardAwareFormScrollView;
