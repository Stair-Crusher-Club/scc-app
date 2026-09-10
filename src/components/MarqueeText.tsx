import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, Text, View} from 'react-native';

/** 초당 이동 거리(dp). 닉네임을 눈으로 따라 읽을 수 있는 속도. */
const SPEED_DP_PER_SEC = 30;
/** 시작 전 / 끝에 닿은 뒤 멈춰 있는 시간(ms) — 멈춤이 없으면 읽기 전에 넘어간다. */
const EDGE_PAUSE_MS = 1200;
/** 측정용 사본 컨테이너 폭. 어떤 닉네임(최대 32자)도 말줄임 없이 담을 만큼 넓게. */
const MEASURE_WIDTH = 9999;

interface MarqueeTextProps {
  children: string;
  className?: string;
  /** 넘치지 않아 애니메이션이 없을 때도 유지할 접근성 라벨(기본: children) */
  accessibilityLabel?: string;
}

/**
 * 컨테이너보다 긴 텍스트를 왼쪽에서 오른쪽 끝까지 흘려 전체를 읽게 한다.
 * 끝에 닿으면 잠깐 멈춘 뒤 되돌아가는 모습 없이 처음으로 점프해 다시 흐른다.
 * 넘치지 않으면 애니메이션 없이 그대로 그린다.
 *
 * reduce-motion 은 존중하지 않는다: RN Android 의 `isReduceMotionEnabled()` 는
 * `Settings.Global.ANIMATOR_DURATION_SCALE` 을 읽는데 이 row 가 없는 기기(에뮬레이터
 * 기본값, 개발자 옵션을 건드리지 않은 기기)에서 true 를 돌려줘 마퀴가 조용히 죽는다.
 * (실측: scale row 삭제 → STATIC, `put 1.0` → MOVING, reduceMotion 무시 → null 에서도 MOVING)
 * 스크린리더는 마퀴와 무관하게 accessibilityLabel 로 전체 텍스트를 읽는다.
 */
const MarqueeText = ({
  children,
  className,
  accessibilityLabel,
}: MarqueeTextProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const overflow = getMarqueeOverflow(textWidth, containerWidth);

  useEffect(() => {
    if (overflow <= 0) {
      translateX.setValue(0);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(EDGE_PAUSE_MS),
        Animated.timing(translateX, {
          toValue: -overflow,
          duration: (overflow / SPEED_DP_PER_SEC) * 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(EDGE_PAUSE_MS),
        // duration 0 — 오른쪽 끝에서 되돌아가는 모습 없이 처음으로 점프한다.
        Animated.timing(translateX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => {
      animation.stop();
      translateX.setValue(0);
    };
  }, [overflow, translateX]);

  return (
    <View
      className="overflow-hidden"
      onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
      {/* 측정 전용 사본. `numberOfLines={1}` Text 는 부모 폭에서 말줄임되고 측정
          폭도 부모 폭으로 잡히기 때문에, 넉넉한 폭의 숨은 컨테이너에 한 번 더
          그려 '자연 폭'을 얻는다. 이 값이 없으면 overflow 가 항상 0 이 되어
          애니메이션이 시작되지 않는다. */}
      <View
        style={{position: 'absolute', opacity: 0, width: MEASURE_WIDTH}}
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden>
        <Text
          numberOfLines={1}
          style={{alignSelf: 'flex-start'}}
          onLayout={e => setTextWidth(e.nativeEvent.layout.width)}
          className={className}>
          {children}
        </Text>
      </View>
      <Animated.View
        // ponytail: transform 은 런타임 측정값에 걸린 애니메이션 값이라 정적
        // className 으로 표현 불가 (Shadow 예외와 같은 성격).
        style={{flexDirection: 'row', transform: [{translateX}]}}>
        <Text
          numberOfLines={1}
          accessibilityLabel={accessibilityLabel ?? children}
          // 자연 폭을 명시해야 부모 폭에서 말줄임되지 않고 넘쳐서 흐를 수 있다.
          style={{flexShrink: 0, width: textWidth > 0 ? textWidth : undefined}}
          className={className}>
          {children}
        </Text>
      </Animated.View>
    </View>
  );
};

/**
 * 흘려야 하는 거리. 측정 전(0)이거나 넘치지 않으면 0.
 * 소수점 1px 미만 차이는 렌더 반올림 노이즈라 무시한다 — 안 그러면 넘치지 않는
 * 텍스트가 미세하게 떠는 애니메이션을 얻는다.
 */
export function getMarqueeOverflow(
  textWidth: number,
  containerWidth: number,
): number {
  if (textWidth <= 0 || containerWidth <= 0) {
    return 0;
  }
  const diff = textWidth - containerWidth;
  return diff >= 1 ? diff : 0;
}

export default MarqueeText;
