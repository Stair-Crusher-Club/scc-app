import React from 'react';
import {StyleProp, useWindowDimensions, ViewStyle} from 'react-native';
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
 */
export default function Tooltip({
  style,
  text,
  tailPosition = 'center',
  bubbleLeft,
}: {
  style?: StyleProp<ViewStyle>;
  text: string;
  tailPosition?: 'center' | number;
  bubbleLeft?: number;
}) {
  const isCenter = tailPosition === 'center';
  const {width: windowWidth} = useWindowDimensions();
  // 내용 기반 폭이라 상한이 없으면 오른쪽으로 넘친다. RN 기본 flexShrink 는 0 이므로
  // 줄어들지도 않는다 — maxWidth 로 잘라서 텍스트가 감기게 한다.
  const maxWidth = windowWidth - (bubbleLeft ?? 0) - EDGE_MARGIN;
  return (
    <Wrapper isCenter={isCenter} style={style}>
      <Bubble bubbleLeft={bubbleLeft} maxWidth={maxWidth}>
        <BubbleText>{text}</BubbleText>
        <Tail tailOffset={isCenter ? undefined : (tailPosition as number)} />
      </Bubble>
    </Wrapper>
  );
}

const Wrapper = styled.View<{isCenter: boolean}>(({isCenter}) => ({
  width: '100%',
  flexDirection: 'column',
  alignItems: isCenter ? 'center' : 'flex-start',
}));

const Bubble = styled.View<{bubbleLeft?: number; maxWidth: number}>(
  ({bubbleLeft, maxWidth}) => ({
    marginLeft: bubbleLeft,
    maxWidth,
    backgroundColor: color.brandColor,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 18,
    // Figma: DROP_SHADOW radius 4 / #000000 0.25 / offset(2,4)
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 4},
    elevation: 4,
  }),
);

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
const Tail = styled.View<{tailOffset: number | undefined}>(({tailOffset}) => ({
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
  borderTopColor: color.brandColor,
}));
