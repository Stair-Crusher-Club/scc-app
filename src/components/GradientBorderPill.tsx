import React from 'react';
import {View, ViewStyle} from 'react-native';
import {Defs, LinearGradient, Rect, Stop, Svg} from 'react-native-svg';

/**
 * 수평 그라데이션 보더 pill 래퍼 (#4AAB84 → #3596F7).
 * RN에서 네이티브 gradient-border가 없으므로 react-native-svg로 구현.
 *
 * 레이어 구조 (바깥 → 안쪽):
 *  outerWrapper  — drop-shadow 담당 (overflow 없음, 클리핑 안 됨)
 *   innerWrapper — overflow:'hidden', borderRadius 적용
 *     <Svg>      — 그라데이션으로 배경 채우기
 *     contentView — margin=borderWidth 로 인셋, white bg, innerBorderRadius
 *
 * @param borderWidth  칩 1.5, 태그 1
 * @param children     내부 콘텐츠 (아이콘 + 텍스트 등)
 * @param outerStyle   outerWrapper에 적용할 추가 스타일 (drop-shadow 등)
 * @param contentStyle contentView에 적용할 추가 스타일 (padding 등)
 * @param gradientId   SVG LinearGradient id — chip/tag 간 충돌 방지용 (고유 문자열)
 */

const GRADIENT_START = '#4AAB84';
const GRADIENT_END = '#3596F7';
const BORDER_RADIUS = 100;

interface GradientBorderPillProps {
  borderWidth: number;
  children: React.ReactNode;
  outerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  gradientId: string;
}

export default function GradientBorderPill({
  borderWidth,
  children,
  outerStyle,
  contentStyle,
  gradientId,
}: GradientBorderPillProps) {
  const innerBorderRadius = BORDER_RADIUS - borderWidth;

  return (
    // 바깥 wrapper에 white bg + borderRadius를 줘야 Android elevation이 pill 모양 그림자를
    // 그린다(투명 배경이면 elevation 그림자가 렌더되지 않음). 위에 동일 크기 그라데이션 pill이
    // 덮으므로 흰색은 보이지 않고 그림자만 바깥으로 새어 나온다.
    <View
      style={[
        {
          alignSelf: 'flex-start',
          backgroundColor: 'white',
          borderRadius: BORDER_RADIUS,
        },
        outerStyle,
      ]}>
      {/* innerWrapper: overflow hidden + borderRadius → 그라데이션 SVG가 pill 모양으로 잘림 */}
      <View
        style={{
          borderRadius: BORDER_RADIUS,
          overflow: 'hidden',
        }}>
        {/* 그라데이션 보더 레이어 — absoluteFill */}
        <Svg
          style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
          width="100%"
          height="100%">
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={GRADIENT_START} stopOpacity="1" />
              <Stop offset="1" stopColor={GRADIENT_END} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={`url(#${gradientId})`}
          />
        </Svg>
        {/* 콘텐츠 View — 보더 두께만큼 margin 줘서 안으로 들여쓰기 */}
        <View
          style={[
            {
              margin: borderWidth,
              backgroundColor: 'white',
              borderRadius: innerBorderRadius,
              flexDirection: 'row',
              alignItems: 'center',
            },
            contentStyle,
          ]}>
          {children}
        </View>
      </View>
    </View>
  );
}
