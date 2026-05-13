import React from 'react';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import {font} from '@/constant/font';

interface CollectedGradientTitleProps {
  /** 타이틀 텍스트. e.g. "미션 완료", "히든템 수집 완료!". */
  text: string;
  /** SVG canvas width. 텍스트 길이에 맞춰 호출 측에서 지정한다. */
  width: number;
  /** SVG canvas height. */
  height?: number;
}

/**
 * 외출템/히든템 수집 완료 팝업의 그라디언트 타이틀.
 *
 * Figma 1648:38680, 1648:40810 그라디언트 (#67C4FF → #D5F42E).
 *
 * TODO: Figma에서 3x PNG로 export한 이미지 에셋으로 교체. 현재는 RN에서
 *   background-clip: text를 직접 지원하지 않아 react-native-svg로 그린다.
 *   디자인 변형이 끝나면 통짜 이미지로 추출하여 SVG 의존성을 제거할 것.
 */
export default function CollectedGradientTitle({
  text,
  width,
  height = 64,
}: CollectedGradientTitleProps) {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <SvgLinearGradient id="collectedGradient" x1="0" y1="0" x2="1" y2="0.3">
          <Stop offset="0" stopColor="#67C4FF" />
          <Stop offset="1" stopColor="#D5F42E" />
        </SvgLinearGradient>
      </Defs>
      <SvgText
        x={width / 2}
        y="48"
        textAnchor="middle"
        fontFamily={font.pretendardExtraBold}
        fontSize="44"
        fontWeight="800"
        fill="url(#collectedGradient)">
        {text}
      </SvgText>
    </Svg>
  );
}
