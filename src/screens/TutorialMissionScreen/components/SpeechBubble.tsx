import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Image, ImageSourcePropType} from 'react-native';

/**
 * 박원 디자이너 2026-05-27 시안의 hero 말풍선.
 *
 * 박원 figma 의 visual frame(390×512) 안에서 bubble frame 의 절대 좌표를 그대로
 * 사용한다. bubble 별 가로/세로/위치가 다르므로, 하나의 컴포넌트 안에서 variant 마다
 * 다른 이미지 + 다른 좌표/크기를 처리한다.
 *
 * 폰트 "Kyobo Handwriting 2019" 가 앱 번들에 없어 텍스트를 RN <Text> 로 재현하면
 * 디자인이 달라지므로, 박원이 만든 bubble frame 자체를 3x PNG 로 export 해서 그대로
 * 띄운다. ("어려우면 걍 이미지로 넣고" 사용자 지시.)
 *
 * float=true 면 위아래 ±5px 둥실 애니메이션. hero 전체가 아니라 bubble 만 움직인다.
 */
export type BubbleVariant =
  | 'v1_seek_item'
  | 'v2_seek_map'
  | 'v3_seek_detail'
  | 'v4_all_items_collected'
  | 'v5_seek_hidden'
  | 'v6_all_complete';

interface VariantSpec {
  // figma bubble frame 의 hero-local 좌표/크기 (390×512 design 기준 dp).
  x: number;
  y: number;
  w: number;
  h: number;
  source: ImageSourcePropType;
}

// figma 메타데이터에서 추출한 bubble frame 의 절대 좌표 (hero-local x,y,w,h).
const VARIANT_SPECS: Record<BubbleVariant, VariantSpec> = {
  v1_seek_item: {
    x: 156,
    y: 250,
    w: 194,
    h: 52.5,
    source: require('@/assets/img/tutorial/bubble_v1_seek_item.png'),
  },
  v2_seek_map: {
    x: 129,
    y: 240,
    w: 221,
    h: 52.5,
    source: require('@/assets/img/tutorial/bubble_v2_seek_map.png'),
  },
  v3_seek_detail: {
    x: 112,
    y: 240,
    w: 238,
    h: 52,
    source: require('@/assets/img/tutorial/bubble_v3_seek_detail.png'),
  },
  v4_all_items_collected: {
    x: 160,
    y: 242,
    w: 150,
    h: 52.5,
    source: require('@/assets/img/tutorial/bubble_v4_all_items_collected.png'),
  },
  v5_seek_hidden: {
    x: 155,
    y: 235,
    w: 185,
    h: 52.5,
    source: require('@/assets/img/tutorial/bubble_v5_seek_hidden.png'),
  },
  v6_all_complete: {
    x: 141,
    y: 230,
    w: 194,
    h: 52.5,
    source: require('@/assets/img/tutorial/bubble_v6_all_complete.png'),
  },
};

const FLOAT_AMPLITUDE = 5;
const FLOAT_DURATION_MS = 1500;

interface SpeechBubbleProps {
  variant: BubbleVariant;
  /** hero 가로 폭(px). 박원 design 390 기준 비율로 bubble 좌표/크기를 스케일링한다. */
  heroWidth: number;
  /** float=true → 위아래 둥실. false → 정지. variant 4/6 은 보통 false. */
  float: boolean;
}

export default function SpeechBubble({
  variant,
  heroWidth,
  float,
}: SpeechBubbleProps) {
  const spec = VARIANT_SPECS[variant];
  const scale = heroWidth / 390;
  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!float) {
      floatY.stopAnimation();
      floatY.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -FLOAT_AMPLITUDE,
          duration: FLOAT_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: FLOAT_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float, floatY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: spec.x * scale,
        top: spec.y * scale,
        width: spec.w * scale,
        height: spec.h * scale,
        transform: [{translateY: floatY}],
      }}>
      <Image
        source={spec.source}
        style={{width: '100%', height: '100%'}}
        resizeMode="contain"
      />
    </Animated.View>
  );
}
