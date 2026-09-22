import React from 'react';
import {
  Animated,
  StyleProp,
  useWindowDimensions,
  ViewStyle,
} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

const TAIL_WIDTH = 10;
const TAIL_HEIGHT = 6;
// 말풍선과 겹쳐 이음새를 없애는 여유분
const TAIL_OVERLAP = 1;
// 좁은 화면·시스템 글꼴 확대에서 말풍선이 화면 밖으로 나가지 않도록 남겨두는 여백
const EDGE_MARGIN = 12;

/**
 * 말풍선 + 아래쪽 꼬리. Figma(113:5103 / 113:5149 / 113:5259 tooltip 컴포넌트) 기준:
 * textbox radius 8 / fill #0E64D3 / padding 6·18 / 텍스트 12·500·lh16,
 * 꼬리 10x6 삼각형, 그림자 radius 4 · #000000 25% · offset(2,4).
 *
 * - `tailPosition`: 꼬리 중심의 x 좌표(말풍선 왼쪽 기준). 'center' 면 가운데.
 * - `bubbleLeft`: 말풍선 자체를 부모 왼쪽에서 얼마나 띄울지. 지정하면 말풍선이
 *   내용 너비만큼만 차지하며 그 위치에 놓인다(Figma 는 변형마다 이 값이 다르다).
 * - `bubbleColor`: 말풍선 + 꼬리 배경색. 기본값은 브랜드 컬러(기존 동작 무변경) —
 *   홈 CTPL 툴팁(166:7622)처럼 검정 계열(gray-v2-90)이 필요한 곳만 지정한다.
 * - `offset`: 앵커(부모) 상단과 툴팁 하단 사이 간격. 음수면 그만큼 앵커 위로
 *   겹친다. 위치를 조정하는 창구는 이 prop 하나다 — `style` 로 positioning 을
 *   다시 정의하지 말 것.
 */
export default function Tooltip({
  style,
  text,
  tailPosition = 'center',
  bubbleLeft,
  bubbleColor = color.brandColor,
  offset = 0,
}: {
  /** 시각 스타일 전용(opacity 등). positioning 은 컴포넌트가 소유한다. */
  style?: StyleProp<ViewStyle>;
  text: string;
  tailPosition?: 'center' | number;
  bubbleLeft?: number;
  bubbleColor?: string;
  offset?: number;
}) {
  const isCenter = tailPosition === 'center';
  const {width: windowWidth} = useWindowDimensions();
  // 내용 기반 폭이라 상한이 없으면 오른쪽으로 넘친다. RN 기본 flexShrink 는 0 이므로
  // 줄어들지도 않는다 — maxWidth 로 잘라서 텍스트가 감기게 한다.
  const maxWidth = windowWidth - (bubbleLeft ?? 0) - EDGE_MARGIN;
  return (
    <Wrapper
      isCenter={isCenter}
      offset={offset}
      pointerEvents="none"
      style={style}>
      <Bubble
        bubbleLeft={bubbleLeft}
        maxWidth={maxWidth}
        bubbleColor={bubbleColor}>
        <BubbleText>{text}</BubbleText>
        <Tail
          tailOffset={isCenter ? undefined : (tailPosition as number)}
          bubbleColor={bubbleColor}
        />
      </Bubble>
    </Wrapper>
  );
}

// 툴팁은 레이아웃에 영향을 주지 않고 형제 위에 뜬다 — 부모(앵커) 상단에 자기
// 하단을 맞춰 absolute 로 얹는다. 그래서 호출처는 감싸는 View 하나만 두면 되고
// 툴팁이 나타나거나 사라져도 아래 요소가 밀리지 않는다.
// - bottom: '100%' 은 높이를 하드코딩하지 않으므로 1줄/2줄, 시스템 글꼴 확대에도
//   겹침 폭이 유지된다.
// - zIndex(iOS) 와 elevation(Android) 을 함께 준다. 형제 draw order 를 정하는
//   속성이 플랫폼별로 다르고, 없으면 나중에 선언된 형제가 꼬리를 덮는다.
//   같은 부모 안 형제끼리만 비교되므로 조상의 elevation 과는 경쟁하지 않는다.
// - Animated.View 인 이유: 호출처가 opacity 애니메이션을 style 로 넘긴다.
const Wrapper = styled(Animated.View)<{isCenter: boolean; offset: number}>(
  ({isCenter, offset}) => ({
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '100%',
    marginBottom: offset,
    flexDirection: 'column',
    alignItems: isCenter ? 'center' : 'flex-start',
    zIndex: 10,
    elevation: 10,
  }),
);

const Bubble = styled.View<{
  bubbleLeft?: number;
  maxWidth: number;
  bubbleColor: string;
}>(({bubbleLeft, maxWidth, bubbleColor}) => ({
  marginLeft: bubbleLeft,
  maxWidth,
  backgroundColor: bubbleColor,
  borderRadius: 8,
  paddingVertical: 6,
  paddingHorizontal: 18,
  // Figma: DROP_SHADOW radius 4 / #000000 0.25 / offset(2,4)
  shadowColor: '#000000',
  shadowOpacity: 0.25,
  shadowRadius: 4,
  shadowOffset: {width: 2, height: 4},
  elevation: 4,
}));

const BubbleText = styled.Text({
  fontSize: 12,
  lineHeight: 16,
  fontFamily: font.pretendardMedium,
  color: color.white,
  textAlign: 'center',
});

// 아래를 향하는 10x6 삼각형. border 트릭이라 width/height 는 0 이다.
// 삼각형을 1px 더 높게 만들고 그만큼 위로 겹친다 — 말풍선 하단과 삼각형 상단이
// 정확히 같은 y 에 맞닿으면 안드로이드 밀도 스케일링에서 1px 이음새가 보인다.
// 겹치는 1px 은 말풍선에 가려지므로 노출되는 꼬리 높이는 Figma 그대로 6 이다.
const Tail = styled.View<{
  tailOffset: number | undefined;
  bubbleColor: string;
}>(({tailOffset, bubbleColor}) => ({
  position: 'absolute',
  bottom: -TAIL_HEIGHT,
  // absolute 자식은 alignItems 에 기대지 않고 좌표로 확정한다.
  ...(tailOffset === undefined
    ? {left: '50%' as const, marginLeft: -TAIL_WIDTH / 2}
    : {left: tailOffset - TAIL_WIDTH / 2}),
  width: 0,
  height: 0,
  borderLeftWidth: TAIL_WIDTH / 2,
  borderRightWidth: TAIL_WIDTH / 2,
  borderTopWidth: TAIL_HEIGHT + TAIL_OVERLAP,
  borderLeftColor: 'transparent',
  borderRightColor: 'transparent',
  borderTopColor: bubbleColor,
}));
